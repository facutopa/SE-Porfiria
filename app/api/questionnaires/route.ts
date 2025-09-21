import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { patientId, answers } = data;

    // Validar datos requeridos
    if (!patientId || !answers) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un cuestionario para este paciente
    const existingQuestionnaire = await prisma.questionnaire.findFirst({
      where: {
        patientId: patientId,
        isCompleted: true
      }
    });

    if (existingQuestionnaire) {
      return NextResponse.json(
        { error: 'Ya existe un cuestionario completado para este paciente' },
        { status: 400 }
      );
    }

    // Crear el cuestionario y sus respuestas en una transacción
    const questionnaire = await prisma.$transaction(async (tx) => {
      // 1. Crear el cuestionario
      const newQuestionnaire = await tx.questionnaire.create({
        data: {
          patientId,
          doctorId: 'default-doctor-id', // Temporal, deberías obtener esto del usuario autenticado
          isCompleted: true,
          completedAt: new Date(),
          testRecommendation: data.recommendation?.testType || null,
          notes: data.recommendation?.message || null
        }
      });

      // 2. Crear las respuestas
      const answerPromises = Object.entries(answers).map(([questionId, value]) => 
        tx.answer.create({
          data: {
            questionnaireId: newQuestionnaire.id,
            questionId,
            value: value as string
          }
        })
      );

      await Promise.all(answerPromises);

      return newQuestionnaire;
    });

    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error('Error al crear cuestionario:', error);
    return NextResponse.json(
      { error: 'Error al crear el cuestionario' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del paciente' },
        { status: 400 }
      );
    }

    const questionnaire = await prisma.questionnaire.findFirst({
      where: {
        patientId: patientId,
        isCompleted: true
      },
      include: {
        answers: true
      }
    });

    return NextResponse.json({ questionnaire });
  } catch (error) {
    console.error('Error al obtener cuestionario:', error);
    return NextResponse.json(
      { error: 'Error al obtener el cuestionario' },
      { status: 500 }
    );
  }
}
