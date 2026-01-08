// ==============================================================================
// api/health.ts - 健康检查
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import { cors } from '../middleware/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 CORS
  if (cors(req, res)) return;

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 检查必需的环境变量
  const checks = {
    supabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    doc2x: !!process.env.DOC2X_API_KEY,
  };

  const healthy = Object.values(checks).every(check => check);

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    message: healthy ? 'Chat2Excel API is running' : 'Some services are degraded',
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
  });
}
