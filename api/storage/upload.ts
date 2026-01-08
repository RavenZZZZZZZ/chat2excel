// ==============================================================================
// api/storage/upload.ts - 上传图片到 Supabase Storage
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import { supabase } from '../lib/supabase.js';
import { cors } from '../middleware/cors.js';
import { success, error } from '../lib/response.js';
import { ValidationError } from '../lib/error.js';

export const config = {
  api: {
    bodyParser: false, // 禁用 Vercel 的 body parser，使用 formidable
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 CORS
  if (cors(req, res)) return;

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return error(res, 'METHOD_NOT_ALLOWED', 'Method not allowed', null, 405);
  }

  try {
    // 解析表单数据
    const form = formidable({
      maxFileSize: 7 * 1024 * 1024, // 7MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

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
    if (!allowedTypes.includes(file.mimetype || '')) {
      throw new ValidationError(`Unsupported file type: ${file.mimetype}`);
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedName = file.originalFilename?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'upload';
    const fileName = `${timestamp}_${random}_${sanitizedName}`;
    const filePath = `uploads/${fileName}`;

    console.log(`[Storage Upload] Uploading file: ${file.name} -> ${filePath}`);

    // 读取文件内容
    const fs = require('fs');
    const buffer = fs.readFileSync(file.filepath);

    // 上传到 Supabase Storage
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'ocr-images';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.mimetype,
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

    // 返回结果
    return success(res, {
      path: filePath,
      url: publicUrl,
    }, 'File uploaded successfully');

  } catch (err: any) {
    console.error('[Storage Upload] Error:', err);

    if (err.code === 'VALIDATION_ERROR') {
      return error(res, err.code, err.message, err.details, 400);
    }

    return error(res, 'UPLOAD_FAILED', err.message || 'Failed to upload file', null, 500);
  }
}
