export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';
import { droolsClient } from '@/lib/drools-client';

export async function GET() {
  try {
    const health = await droolsClient.checkHealth();
    const status = health.ok ? 200 : 503;
    return new NextResponse(health.message, {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  } catch (error) {
    return new NextResponse('KIE server no disponible', {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  }
}


