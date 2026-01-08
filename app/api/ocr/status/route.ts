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

    console.log('[OCR Status] Fetching from Doc2X...');

    const response = await fetch(`${DOC2X_URL}?uid=${uid}`, {
      headers: {
        'Authorization': `Bearer ${DOC2X_API_KEY}`,
      },
    });

    console.log('[OCR Status] Doc2X response status:', response.status);
    console.log('[OCR Status] Doc2X response headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('[OCR Status] Doc2X response body:', text.substring(0, 200));

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('[OCR Status] Failed to parse JSON:', text);
      return NextResponse.json({
        code: 'error',
        error: 'Invalid JSON response from Doc2X',
        raw_response: text.substring(0, 500)
      }, { status: 500 });
    }

    console.log('[OCR Status] Parsed response:', data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[OCR Status] Error:', error.message, error.stack);
    return NextResponse.json({
      code: 'error',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
