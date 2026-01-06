// ==============================================================================
// api/health.ts - 健康检查 Serverless Function
// ==============================================================================
//
// 返回系统健康状态，用于监控和负载均衡器健康检查
//
// ==============================================================================

import { NextResponse } from 'next/server';

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler() {
  const health = {
    status: 'ok',
    message: 'Chat2Excel API is running',
    timestamp: Date.now(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
    checks: {
      doc2x: !!process.env.DOC2X_API_KEY,
      sentry: !!process.env.SENTRY_DSN,
    }
  };

  return NextResponse.json(health, {
    headers: corsHeaders
  });
}
