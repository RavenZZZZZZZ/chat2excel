// ==============================================================================
// cors.ts - CORS 中间件
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * CORS 中间件
 * 处理跨域请求和 OPTIONS 预检请求
 */
export function cors(req: VercelRequest, res: VercelResponse): boolean {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

  // 设置 CORS 头
  if (allowedOrigins.length === 0 || allowedOrigins.includes(req.headers.origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // 表示已处理 OPTIONS 请求
  }

  return false; // 继续处理其他请求
}
