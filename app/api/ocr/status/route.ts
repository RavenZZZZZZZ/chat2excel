// ==============================================================================
// app/api/ocr/status/route.ts - 查询 Doc2X OCR 处理状态
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DOC2X_STATUS_ENDPOINT = process.env.DOC2X_API_BASE_URL || 'https://v2.doc2x.noedgeai.com';
const DOC2X_STATUS_PATH = '/api/v2/async/parse/status';
const DOC2X_API_KEY = process.env.DOC2X_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({
        code: 'error',
        error: 'Missing uid parameter'
      }, { status: 400 });
    }

    const response = await axios.get(
      `${DOC2X_STATUS_ENDPOINT}${DOC2X_STATUS_PATH}`,
      {
        params: { uid },
        headers: {
          'Authorization': `Bearer ${DOC2X_API_KEY}`
        },
        timeout: 10000
      }
    );

    return NextResponse.json(response.data);

  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status
      });
    }

    return NextResponse.json({
      code: 'error',
      error: error.message || 'Status check failed'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
