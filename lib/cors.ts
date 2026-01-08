// @ts-check
// ==============================================================================
// lib/cors.ts - CORS 工具函数
// ==============================================================================

import { NextResponse } from 'next/server';

export function corsHeaders(request: Request): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin || '')) {
    headers['Access-Control-Allow-Origin'] = origin || '*';
  }

  return headers;
}

export function handleCors(request: Request): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(request),
    });
  }
  return null;
}
