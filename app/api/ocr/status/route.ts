// 简化的 status 端点
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');

  // 直接转发到 Doc2X API
  const DOC2X_API_KEY = process.env.DOC2X_API_KEY;
  const DOC2X_URL = 'https://v2.doc2x.noedgeai.com/api/v2/async/parse/status';

  try {
    const response = await fetch(`${DOC2X_URL}?uid=${uid}`, {
      headers: {
        'Authorization': `Bearer ${DOC2X_API_KEY}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({
      code: 'error',
      error: error.message
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
