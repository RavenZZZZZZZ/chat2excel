// ==============================================================================
// app/api/ocr/upload/route.ts - 上传图片到 Doc2X API
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { corsHeaders } from '@/lib/cors';
import { DOC2X_UPLOAD_ENDPOINT, DOC2X_API_KEY } from '@/lib/doc2x';

export async function POST(request: NextRequest) {
  try {
    console.log('[OCR Upload] Received upload request');

    if (!DOC2X_API_KEY) {
      console.error('[OCR Upload] DOC2X_API_KEY is not configured');
      return NextResponse.json({
        code: 'error',
        error: 'API configuration error'
      }, { status: 500, headers: corsHeaders(request) });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('[OCR Upload] No file uploaded');
      return NextResponse.json({
        code: 'error',
        error: 'No file uploaded'
      }, { status: 400, headers: corsHeaders(request) });
    }

    console.log('[OCR Upload] File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // 验证文件大小
    if (file.size > 7 * 1024 * 1024) {
      console.error('[OCR Upload] File size exceeds 7MB limit');
      return NextResponse.json({
        code: 'error',
        error: '文件大小超过 7MB 限制'
      }, { status: 400, headers: corsHeaders(request) });
    }

    // 验证文件类型 (支持 Doc2X API 兼容的格式)
    // 实际测试表明 Doc2X 支持: JPG/JPEG, PNG, WebP
    // 注意: 浏览器对 .jpg/.jpeg 文件统一返回 'image/jpeg' (标准 MIME 类型)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('[OCR Upload] Unsupported file type:', file.type);
      return NextResponse.json({
        code: 'error',
        error: `不支持的文件类型: ${file.type}。仅支持 JPG、JPEG、PNG、WebP 格式`
      }, { status: 400, headers: corsHeaders(request) });
    }

    // 读取文件内容
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log('[OCR Upload] Forwarding to Doc2X API:', {
      url: DOC2X_UPLOAD_ENDPOINT,
      bufferSize: buffer.length,
      fileName: file.name,
      mimeType: file.type,
    });

    // 转发到 Doc2X API
    // 注意: Doc2X API 期望直接接收二进制数据,而不是 FormData
    const response = await axios.post(
      DOC2X_UPLOAD_ENDPOINT,
      buffer, // 直接发送 buffer
      {
        headers: {
          'Authorization': `Bearer ${DOC2X_API_KEY}`,
          'Content-Type': file.type, // 使用文件的 MIME 类型
        },
        timeout: 60000,
        maxBodyLength: 7 * 1024 * 1024,
        maxContentLength: 7 * 1024 * 1024,
      }
    );

    console.log('[OCR Upload] Doc2X response:', {
      status: response.status,
      code: response.data?.code,
      uid: response.data?.data?.uid,
    });

    return NextResponse.json(response.data, { headers: corsHeaders(request) });

  } catch (error: any) {
    console.error('[OCR Upload] Upload failed:', error.message);
    console.error('[OCR Upload] Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response) {
      console.error('[OCR Upload] API error response:', error.response.data);
      return NextResponse.json(error.response.data, {
        status: error.response.status,
        headers: corsHeaders(request)
      });
    }

    return NextResponse.json({
      code: 'error',
      error: error.message || 'Upload failed',
      details: {
        message: error.message,
        code: error.code,
      }
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export const dynamic = 'force-dynamic';
