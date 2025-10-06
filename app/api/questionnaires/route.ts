import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { evaluateWithDrools } from '@/lib/drools-client';

const prisma = new PrismaClient();

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

    // Obtener datos del paciente
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    console.log('🧠 [DEBUG] Iniciando evaluación con Drools en API...');
    console.log('👤 [DEBUG] Paciente desde BD:', patient);
    console.log('📋 [DEBUG] Respuestas recibidas:', answers);
    
    // Evaluar con Drools
    const patientData = {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dni: patient.dni,
      age: new Date().getFullYear() - new Date(patient.birthDate).getFullYear(),
      gender: patient.gender as 'M' | 'F',
      familyHistory: answers['familiares'] === 'SI',
      medications: [],
      alcoholConsumption: answers['consumeAlcohol'] === 'SI',
      fastingStatus: false
    };

    console.log('👤 [DEBUG] Datos del paciente preparados:', patientData);

    const responses = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
      patientId: patient.id,
      timestamp: new Date()
    }));

    console.log('📝 [DEBUG] Respuestas formateadas:', responses);
    console.log('🔗 [DEBUG] Llamando a evaluateWithDrools...');

    // Evaluar con KIE server
    const kieResult = await evaluateWithDrools(patientData, responses);
    
    console.log('🎯 [DEBUG] Resultado de KIE server en API:', kieResult);

    if (!kieResult.success) {
      console.error('❌ [DEBUG] Error en evaluación KIE server:', kieResult.error);
      return NextResponse.json(
        { error: 'Error al evaluar el cuestionario con el motor de reglas' },
        { status: 500 }
      );
    }

    console.log('✅ [DEBUG] Evaluación KIE server exitosa, guardando en BD...');
    console.log('💾 [DEBUG] Resultado KIE a guardar:', kieResult.raw);

    // Crear el cuestionario y sus respuestas en una transacción
    const questionnaire = await prisma.$transaction(async (tx) => {
      // 1. Crear el cuestionario con datos del KIE server
      const newQuestionnaire = await tx.questionnaire.create({
        data: {
          patientId,
          doctorId: decoded.userId, // Usar el ID del usuario autenticado
          isCompleted: true,
          completedAt: new Date(),
          // Guardar toda la respuesta del KIE server
          recommendationData: JSON.stringify(kieResult.raw),
          // Extraer datos específicos para campos existentes
          testRecommendation: kieResult.raw?.ordenes?.estudios ? 'PBG_URINE_TEST' : 'NO_TEST_NEEDED',
          notes: `Diagnóstico: cutánea=${kieResult.raw?.diagnostico?.sintomaCutanea ? 'SI' : 'NO'}, aguda=${kieResult.raw?.diagnostico?.sintomaAguda ? 'SI' : 'NO'}`,
          estudiosRecomendados: JSON.stringify(kieResult.raw?.ordenes?.estudios ? ['PBG'] : []),
          medicamentosContraproducentes: JSON.stringify(kieResult.raw?.medicamentos?.medicamentos ? ['Revisar medicación'] : []),
          confidence: 'medium', // Valor por defecto
          score: kieResult.raw?.cuadroClinico?.anamnesis || null,
          criticalSymptoms: kieResult.raw?.cuadroClinico?.sintomasAguda || null,
          tipoPorfiria: null // No disponible en la respuesta KIE
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

    console.log('✅ [DEBUG] Cuestionario guardado exitosamente:', questionnaire);
    return NextResponse.json(questionnaire);
  } catch (error) {
    console.error('Error al crear cuestionario:', error);
    
    // Manejar errores específicos
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un cuestionario para este paciente' },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Error de referencia: El paciente o doctor no existe.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al crear el cuestionario' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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
        answers: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true
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

    return NextResponse.json({ questionnaire });
  } catch (error) {
    console.error('Error al obtener cuestionario:', error);
    return NextResponse.json(
      { error: 'Error al obtener el cuestionario' },
      { status: 500 }
    );
  }
}
