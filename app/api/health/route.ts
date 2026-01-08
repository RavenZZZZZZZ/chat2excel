// ==============================================================================
// app/api/health/route.ts - 健康检查
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, handleCors } from '@/lib/cors';

export async function GET(request: NextRequest) {
  // Handle CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const checks = {
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    doc2x: !!process.env.DOC2X_API_KEY,
  };

  const healthy = Object.values(checks).every(check => check);

  return NextResponse.json({
    status: healthy ? 'ok' : 'degraded',
    message: healthy ? 'Chat2Excel API is running' : 'Some services are degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
  }, {
    status: healthy ? 200 : 503,
    headers: corsHeaders(request),
  });
}

export const dynamic = 'force-dynamic';
