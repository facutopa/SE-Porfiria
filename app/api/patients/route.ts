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