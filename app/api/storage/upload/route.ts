// ==============================================================================
// app/api/storage/upload/route.ts - 上传图片到 Supabase Storage
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsHeaders } from '@/lib/cors';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // 验证文件存在
    if (!file) {
      throw new ValidationError('No file uploaded');
    }

    // 验证文件大小
    if (file.size > 7 * 1024 * 1024) {
      throw new ValidationError('File size exceeds 7MB limit');
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError(`Unsupported file type: ${file.type}`);
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'upload';
    const fileName = `${timestamp}_${random}_${sanitizedName}`;
    const filePath = `uploads/${fileName}`;

    console.log(`[Storage Upload] Uploading file: ${file.name} -> ${filePath}`);

    // 读取文件内容
    const buffer = Buffer.from(await file.arrayBuffer());

    // 上传到 Supabase Storage
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'ocr-images';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Storage Upload] Upload failed:', uploadError);
      throw new Error('Failed to upload file to storage');
    }

    // 获取公开 URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log(`[Storage Upload] Upload successful: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      data: {
        path: filePath,
        url: publicUrl,
      },
      message: 'File uploaded successfully',
      timestamp: Date.now(),
    }, { headers: corsHeaders(request) });

  } catch (err: any) {
    console.error('[Storage Upload] Error:', err);

    if (err.code === 'VALIDATION_ERROR') {
      return NextResponse.json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
        timestamp: Date.now(),
      }, { status: 400, headers: corsHeaders(request) });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'UPLOAD_FAILED', message: err.message || 'Failed to upload file' },
      timestamp: Date.now(),
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export const dynamic = 'force-dynamic';
