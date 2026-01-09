// ==============================================================================
// Debug API - 环境变量检查 (仅供调试使用)
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      // 检查关键环境变量是否配置 (不显示真实值)
      DOC2X_API_KEY: !!process.env.DOC2X_API_KEY,
      DOC2X_API_KEY_PREFIX: process.env.DOC2X_API_KEY?.substring(0, 10) + '...',
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
    }, { headers: corsHeaders(request) });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
