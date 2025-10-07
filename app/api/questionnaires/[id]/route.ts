import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { evaluateWithDrools } from '@/lib/drools-client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Obtener el cuestionario
    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        id: params.id
      },
      include: {
        patient: true,
        doctor: {
          select: {
            name: true,
            email: true
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (!questionnaire) {
      return NextResponse.json(
        { error: 'Cuestionario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos: el doctor que creó el cuestionario, un admin, o personal CIPYP puede verlo
    if (user.role !== 'ADMIN' && user.role !== 'CIPYP' && questionnaire.doctorId !== decoded.userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver este cuestionario' },
        { status: 403 }
      );
    }

    // Transformar las respuestas para que sean más fáciles de usar
    const transformedAnswers = questionnaire.answers.reduce((acc, answer) => {
      acc[answer.questionId] = answer.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      questionnaire: {
        ...questionnaire,
        answers: transformedAnswers
      }
    });
  } catch (error) {
    console.error('Error al obtener cuestionario:', error);
    return NextResponse.json(
      { error: 'Error al obtener el cuestionario' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Obtener el cuestionario existente
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { id: params.id },
      include: { patient: true }
    });

    if (!existingQuestionnaire) {
      return NextResponse.json(
        { error: 'Cuestionario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos: el doctor que creó el cuestionario, un admin, o personal CIPYP puede editarlo
    if (user.role !== 'ADMIN' && user.role !== 'CIPYP' && existingQuestionnaire.doctorId !== decoded.userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este cuestionario' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { answers } = data;

    if (!answers) {
      return NextResponse.json(
        { error: 'Faltan las respuestas' },
        { status: 400 }
      );
    }

    // Re-evaluar con Drools usando las nuevas respuestas
    const patientData = {
      id: existingQuestionnaire.patient.id,
      firstName: existingQuestionnaire.patient.firstName,
      lastName: existingQuestionnaire.patient.lastName,
      dni: existingQuestionnaire.patient.dni,
      age: new Date().getFullYear() - new Date(existingQuestionnaire.patient.birthDate).getFullYear(),
      gender: existingQuestionnaire.patient.gender as 'M' | 'F',
      familyHistory: answers['familiares'] === 'SI',
      medications: [], // Asumimos que no se editan aquí
      alcoholConsumption: answers['consumeAlcohol'] === 'SI',
      fastingStatus: false // Asumimos que no se edita aquí
    };

    const responses = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer: answer as string,
      patientId: existingQuestionnaire.patient.id,
      timestamp: new Date()
    }));

    const droolsResult = await evaluateWithDrools(patientData, responses);

    if (!droolsResult.success) {
      console.error('Error en re-evaluación Drools:', droolsResult.error);
      return NextResponse.json(
        { error: 'Error al re-evaluar el cuestionario con el motor de reglas' },
        { status: 500 }
      );
    }

    // Actualizar el cuestionario y sus respuestas en una transacción
    const updatedQuestionnaire = await prisma.$transaction(async (tx) => {
      // 1. Eliminar respuestas existentes
      await tx.answer.deleteMany({
        where: { questionnaireId: params.id }
      });

      // 2. Crear nuevas respuestas
      const answerPromises = Object.entries(answers).map(([questionId, value]) => 
        tx.answer.create({
          data: {
            questionnaireId: params.id,
            questionId,
            value: value as string
          }
        })
      );

      await Promise.all(answerPromises);

      // 3. Actualizar el cuestionario con la nueva recomendación
      const questionnaire = await tx.questionnaire.update({
        where: { id: params.id },
        data: {
          completedAt: new Date(), // Actualizar la fecha de completado
          testRecommendation: droolsResult.recommendation?.testType || null,
          notes: droolsResult.recommendation?.message || null,
          // Actualizar toda la información de la recomendación
          recommendationData: JSON.stringify(droolsResult.recommendation),
          estudiosRecomendados: JSON.stringify(droolsResult.recommendation?.estudiosRecomendados || []),
          medicamentosContraproducentes: JSON.stringify(droolsResult.recommendation?.medicamentosContraproducentes || []),
          confidence: droolsResult.recommendation?.confidence || null,
          score: droolsResult.recommendation?.score || null,
          tipoPorfiria: droolsResult.recommendation?.tipoPorfiria || null,
          updatedAt: new Date()
        }
      });

      return questionnaire;
    });

    return NextResponse.json(updatedQuestionnaire);
  } catch (error) {
    console.error('Error al actualizar cuestionario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el cuestionario' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Solo CIPYP puede eliminar cuestionarios
    if (user.role !== 'CIPYP') {
      return NextResponse.json(
        { error: 'Solo el personal de CIPYP puede eliminar cuestionarios' },
        { status: 403 }
      );
    }

    // Verificar que el cuestionario existe
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: params.id },
      include: {
        answers: true
      }
    });

    if (!questionnaire) {
      return NextResponse.json(
        { error: 'Cuestionario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar cuestionario y sus respuestas en una transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar respuestas
      await tx.answer.deleteMany({
        where: {
          questionnaireId: params.id
        }
      });

      // Eliminar cuestionario
      await tx.questionnaire.delete({
        where: { id: params.id }
      });
    });

    return NextResponse.json({ 
      message: 'Cuestionario eliminado exitosamente',
      deletedAnswers: questionnaire.answers.length
    });
  } catch (error) {
    console.error('Error al eliminar cuestionario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el cuestionario' },
      { status: 500 }
    );
  }
}