// ==============================================================================
// api/proxy/parse/status.ts - OCR 状态查询 Serverless Function
// ==============================================================================
//
// 查询 Doc2X API 的 OCR 处理状态
//
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 配置
const DOC2X_API_BASE = process.env.DOC2X_API_BASE_URL || 'https://v2.doc2x.noedgeai.com';
const DOC2X_API_KEY = process.env.DOC2X_API_KEY;

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: NextRequest) {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return NextResponse.json(
      { code: 'error', error: 'Method not allowed' },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // 获取查询参数
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    // 验证 uid 参数
    if (!uid) {
      console.error('❌ 错误: 缺少 uid 参数');
      return NextResponse.json(
        { code: 'error', error: 'Missing uid parameter' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🔍 查询状态:', uid);

    // 转发到 Doc2X API
    const response = await axios.get(
      `${DOC2X_API_BASE}/api/v2/parse/img/layout/status`,
      {
        params: { uid },
        headers: {
          'Authorization': `Bearer ${DOC2X_API_KEY}`
        },
        timeout: 10000
      }
    );

    console.log('📊 状态响应:', {
      uid,
      code: response.data.code,
      status: response.data.data?.status
    });

    return NextResponse.json(response.data, {
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('❌ 查询状态失败:', error.message);

    // 处理 Axios 错误响应
    if (error.response) {
      console.error('❌ API 错误响应:', error.response.data);
      return NextResponse.json(error.response.data, {
        status: error.response.status,
        headers: corsHeaders
      });
    }

    // 通用错误响应
    return NextResponse.json(
      { code: 'error', error: error.message || 'Status check failed' },
      { status: 500, headers: corsHeaders }
    );
  }
}
