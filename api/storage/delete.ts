// ==============================================================================
// api/storage/delete.ts - 删除 Supabase Storage 中的图片
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../shared/api-modules/lib/supabase.mjs';
import { cors } from '../../shared/api-modules/middleware/cors.mjs';
import { success, error } from '../../shared/api-modules/lib/response.mjs';
import { ValidationError } from '../../shared/api-modules/lib/error.mjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 CORS
  if (cors(req, res)) return;

  // 只允许 DELETE 请求
  if (req.method !== 'DELETE') {
    return error(res, 'METHOD_NOT_ALLOWED', 'Method not allowed', null, 405);
  }

  try {
    // 从查询参数获取路径
    const { path } = req.query;

    if (!path || typeof path !== 'string') {
      throw new ValidationError('File path is required');
    }

    console.log(`[Storage Delete] Deleting file: ${path}`);

    // 从 Supabase Storage 删除
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'ocr-images';

    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (deleteError) {
      console.error('[Storage Delete] Delete failed:', deleteError);
      throw new Error('Failed to delete file from storage');
    }

    console.log(`[Storage Delete] Delete successful: ${path}`);

    return success(res, { path }, 'File deleted successfully');

  } catch (err: any) {
    console.error('[Storage Delete] Error:', err);

    if (err.code === 'VALIDATION_ERROR') {
      return error(res, err.code, err.message, err.details, 400);
    }

    return error(res, 'DELETE_FAILED', err.message || 'Failed to delete file', null, 500);
  }
}
