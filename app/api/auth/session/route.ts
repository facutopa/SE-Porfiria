import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener el token de las cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'default_secret') as { userId: string };

    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hospital: true,
        license: true,
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error en sesión:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de sesión' },
      { status: 500 }
    );
  }
}
