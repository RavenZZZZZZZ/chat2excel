// 简化版 status 端点用于测试
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');

  return NextResponse.json({
    message: 'Simple status endpoint',
    uid: uid || 'no uid',
    timestamp: new Date().toISOString(),
  });
}

export const dynamic = 'force-dynamic';
