import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Eliminar la cookie de autenticación
    cookies().delete('auth_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
