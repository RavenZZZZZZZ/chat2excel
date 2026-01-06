// ==============================================================================
// api/proxy/parse/pdf.ts - 文件上传处理 Serverless Function
// ==============================================================================
//
// 接收前端上传的图片文件，验证后转发到 Doc2X API 进行 OCR 处理
//
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 配置
const DOC2X_API_BASE = process.env.DOC2X_API_BASE_URL || 'https://v2.doc2x.noedgeai.com';
const DOC2X_API_KEY = process.env.DOC2X_API_KEY;
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS 预检请求
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextRequest) {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return NextResponse.json(
      { code: 'error', error: 'Method not allowed' },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // 解析 FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;

    // 验证文件存在
    if (!file) {
      console.error('❌ 错误: 未上传文件');
      return NextResponse.json(
        { code: 'error', error: 'No file uploaded' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('📤 收到文件上传请求:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ 错误: 文件大小超过限制');
      return NextResponse.json(
        { code: 'error', error: '文件大小超过 7MB 限制' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error('❌ 错误: 不支持的文件类型');
      return NextResponse.json(
        { code: 'error', error: `不支持的文件类型: ${file.type}。仅支持 JPEG/PNG` },
        { status: 400, headers: corsHeaders }
      );
    }

    // 转换 File 对象为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📤 转发到 Doc2X API...');

    // 转发到 Doc2X API
    const response = await axios.post(
      `${DOC2X_API_BASE}/api/v2/async/parse/img/layout`,
      buffer,
      {
        headers: {
          'Authorization': `Bearer ${DOC2X_API_KEY}`,
          'Content-Type': file.type,
        },
        timeout: 60000,
        maxBodyLength: MAX_FILE_SIZE,
        maxContentLength: MAX_FILE_SIZE,
      }
    );

    console.log('✅ Doc2X 上传响应:', response.data);

    return NextResponse.json(response.data, {
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('❌ 上传文件失败:', error.message);

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
      { code: 'error', error: error.message || 'Upload failed' },
      { status: 500, headers: corsHeaders }
    );
  }
}
