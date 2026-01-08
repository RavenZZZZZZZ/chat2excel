// ==============================================================================
// app/api/ocr/status/route.ts - 查询 Doc2X OCR 处理状态
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { corsHeaders } from '@/lib/cors';
import { DOC2X_STATUS_ENDPOINT, DOC2X_API_KEY } from '@/lib/doc2x';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      console.error('[OCR Status] Missing uid parameter');
      return NextResponse.json({
        code: 'error',
        error: 'Missing uid parameter'
      }, { status: 400, headers: corsHeaders(request) });
    }

    console.log('[OCR Status] Checking status:', uid);

    const response = await axios.get(
      `${DOC2X_STATUS_ENDPOINT}`,
      {
        params: { uid },
        headers: {
          'Authorization': `Bearer ${DOC2X_API_KEY}`
        },
        timeout: 10000
      }
    );

    console.log('[OCR Status] Status response:', {
      uid,
      code: response.data.code,
      status: response.data.data?.status
    });

    return NextResponse.json(response.data, { headers: corsHeaders(request) });

  } catch (error: any) {
    console.error('[OCR Status] Status check failed:', error.message);

    if (error.response) {
      console.error('[OCR Status] API error response:', error.response.data);
      return NextResponse.json(error.response.data, {
        status: error.response.status,
        headers: corsHeaders(request)
      });
    }

    return NextResponse.json({
      code: 'error',
      error: error.message || 'Status check failed'
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export const dynamic = 'force-dynamic';
