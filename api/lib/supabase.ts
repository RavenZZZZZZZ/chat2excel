// ==============================================================================
// supabase.ts - Supabase 客户端配置
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase URL
 */
const supabaseUrl = process.env.SUPABASE_URL;

/**
 * Supabase Service Role Key (仅服务端使用，权限更高)
 */
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Supabase 客户端实例
 * 使用 Service Role Key，具有完整权限
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * 获取图片尺寸
 */
export async function getImageDimensions(
  file: File | Buffer
): Promise<{ width: number; height: number }> {
  // 如果是前端上传的 File 对象，需要特殊处理
  // 这里暂时返回默认值，实际应该从 Supabase Storage metadata 读取
  return { width: 0, height: 0 };
}
