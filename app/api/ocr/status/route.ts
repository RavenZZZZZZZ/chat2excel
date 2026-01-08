// 简化的 status 端点
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');

  const DOC2X_API_KEY = process.env.DOC2X_API_KEY;
  const DOC2X_URL = 'https://v2.doc2x.noedgeai.com/api/v2/async/parse/status';

  console.log('[OCR Status] Request for uid:', uid);
  console.log('[OCR Status] DOC2X_API_KEY exists:', !!DOC2X_API_KEY);

  try {
    if (!uid) {
      return NextResponse.json({
        code: 'error',
        error: 'Missing uid parameter'
      }, { status: 400 });
    }

    const response = await fetch(`${DOC2X_URL}?uid=${uid}`, {
      headers: {
        'Authorization': `Bearer ${DOC2X_API_KEY}`,
      },
    });

    const data = await response.json();
    console.log('[OCR Status] Response:', { uid, status: response.status });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[OCR Status] Error:', error.message, error.stack);
    return NextResponse.json({
      code: 'error',
      error: error.message
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
