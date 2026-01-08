// 简化的 status 端点
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid');

  const DOC2X_API_KEY = process.env.DOC2X_API_KEY;

  console.log('[OCR Status] Request for uid:', uid);

  try {
    if (!uid) {
      return NextResponse.json({
        code: 'error',
        error: 'Missing uid parameter'
      }, { status: 400 });
    }

    // 使用 URL 参数而不是查询字符串
    const url = new URL('https://v2.doc2x.noedgeai.com/api/v2/async/parse/status');
    url.searchParams.set('uid', uid);

    console.log('[OCR Status] Fetching from Doc2X:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DOC2X_API_KEY}`,
        'Accept': 'application/json',
      },
    });

    console.log('[OCR Status] Doc2X response status:', response.status);

    const text = await response.text();
    console.log('[OCR Status] Doc2X response length:', text.length);
    console.log('[OCR Status] Doc2X response (first 200 chars):', text.substring(0, 200));

    // 如果 Doc2X 返回空响应，返回处理中状态
    if (!text || text.trim().length === 0) {
      console.log('[OCR Status] Empty response from Doc2X, returning processing status');
      return NextResponse.json({
        code: 'success',
        data: {
          uid: uid,
          status: 'processing',
          progress: 0
        }
      });
    }

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
