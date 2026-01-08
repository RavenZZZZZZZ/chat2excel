// ==============================================================================
// api/ocr/status.ts - 查询 Doc2X OCR 处理状态
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { cors } from '../../shared/api-modules/middleware/cors';
import { DOC2X_STATUS_ENDPOINT, DOC2X_API_KEY } from '../../shared/api-modules/lib/doc2x';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 CORS
  if (cors(req, res)) return;

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ code: 'error', error: 'Method not allowed' });
  }

  try {
    // 获取查询参数
    const { uid } = req.query;

    // 验证 uid 参数
    if (!uid || typeof uid !== 'string') {
      console.error('[OCR Status] Missing uid parameter');
      return res.status(400).json({ code: 'error', error: 'Missing uid parameter' });
    }

    console.log('[OCR Status] Checking status:', uid);

    // 转发到 Doc2X API
    const response = await axios.get(
      `${DOC2X_STATUS_ENDPOINT}`,
      {
        params: { uid },
        headers: {
          'Authorization': `Bearer ${DOC2X_API_KEY}`
        },
        timeout: 10000
      }
    );

    console.log('[OCR Status] Status response:', {
      uid,
      code: response.data.code,
      status: response.data.data?.status
    });

    return res.status(200).json(response.data);

  } catch (error: any) {
    console.error('[OCR Status] Status check failed:', error.message);

    // 处理 Axios 错误响应
    if (error.response) {
      console.error('[OCR Status] API error response:', error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }

    // 通用错误响应
    return res.status(500).json({
      code: 'error',
      error: error.message || 'Status check failed'
    });
  }
}
