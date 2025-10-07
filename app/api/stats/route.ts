import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

export async function GET() {
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

    // Obtener estadísticas basadas en el rol del usuario
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

    // Consultas base
    let whereClause = {};
    
    // Si es médico, solo ver sus propios pacientes
    if (user.role === 'MEDICO') {
      whereClause = { doctorId: decoded.userId };
    }

    // Obtener total de pacientes
    const totalPatients = await prisma.patient.count({
      where: whereClause
    });

    // Obtener total de cuestionarios completados
    const questionnairesCompleted = await prisma.questionnaire.count({
      where: {
        ...whereClause,
        isCompleted: true
      }
    });

    // Obtener total de tests recomendados
    const testsRecommended = await prisma.questionnaire.count({
      where: {
        ...whereClause,
        testRecommendation: 'PBG_URINE_TEST'
      }
    });

    // Obtener total de seguimientos pendientes
    const pendingFollowUps = await prisma.questionnaire.count({
      where: {
        ...whereClause,
        testRecommendation: 'FOLLOW_UP_REQUIRED'
      }
    });

    return NextResponse.json({
      totalPatients,
      questionnairesCompleted,
      testsRecommended,
      pendingFollowUps
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
