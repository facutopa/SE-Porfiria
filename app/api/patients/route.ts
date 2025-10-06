import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener el ID del usuario del token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'default_secret') as { userId: string };

    // Obtener el rol del usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Configurar el filtro según el rol
    const whereClause = user.role === 'MEDICO' ? { doctorId: decoded.userId } : {};

    const patients = await prisma.patient.findMany({
      where: whereClause,
      take: limit,
      include: {
        questionnaires: {
          orderBy: {
            completedAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener lista de pacientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener el ID del usuario del token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'default_secret') as { userId: string };

    // Verificar que el usuario existe y es un médico
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.role !== 'MEDICO') {
      return NextResponse.json(
        { error: 'Solo los médicos pueden crear pacientes' },
        { status: 403 }
      );
    }

    // Obtener los datos del paciente del body
    const patientData = await request.json();

    // Validar datos requeridos
    if (!patientData.firstName || !patientData.lastName || !patientData.dni || !patientData.birthDate || !patientData.gender) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear el paciente
    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        doctorId: decoded.userId,
        birthDate: new Date(patientData.birthDate)
      }
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error al crear paciente:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El DNI ya está registrado en el sistema. Por favor, usa un DNI diferente.' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Error de referencia: El doctor no existe.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al crear el paciente' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener el ID del usuario del token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'default_secret') as { userId: string };

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Solo CIPYP puede eliminar pacientes
    if (user.role !== 'CIPYP') {
      return NextResponse.json(
        { error: 'Solo el personal de CIPYP puede eliminar pacientes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('id');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del paciente' },
        { status: 400 }
      );
    }

    // Verificar que el paciente existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        questionnaires: true
      }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar paciente y todos sus cuestionarios en una transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar respuestas de cuestionarios
      await tx.answer.deleteMany({
        where: {
          questionnaire: {
            patientId: patientId
          }
        }
      });

      // Eliminar cuestionarios
      await tx.questionnaire.deleteMany({
        where: {
          patientId: patientId
        }
      });

      // Eliminar paciente
      await tx.patient.delete({
        where: { id: patientId }
      });
    });

    return NextResponse.json({ 
      message: 'Paciente y cuestionarios eliminados exitosamente',
      deletedQuestionnaires: patient.questionnaires.length
    });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el paciente' },
      { status: 500 }
    );
  }
}