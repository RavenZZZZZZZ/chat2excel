// ==============================================================================
// 临时调试端点 - 列出所有可用的 API 路由
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const routes = {
    available: [
      '/api/health',
      '/api/ocr/upload',
      '/api/ocr/status',
      '/api/storage/upload',
      '/api/storage/delete',
      '/api/tasks',
      '/api/tasks/[id]',
      '/api/tasks/exists',
    ],
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(routes);
}

export const dynamic = 'force-dynamic';
