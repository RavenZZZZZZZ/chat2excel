// ==============================================================================
// api/proxy/parse/status.ts - OCR 状态查询 Serverless Function
// ==============================================================================
//
// 查询 Doc2X API 的 OCR 处理状态
//
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// 配置
const DOC2X_API_BASE = process.env.DOC2X_API_BASE_URL || 'https://v2.doc2x.noedgeai.com';
const DOC2X_API_KEY = process.env.DOC2X_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ code: 'error', error: 'Method not allowed' });
  }

  try {
    // 获取查询参数
    const uid = req.query.uid;

    // 验证 uid 参数
    if (!uid || typeof uid !== 'string') {
      console.error('❌ 错误: 缺少 uid 参数');
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ code: 'error', error: 'Missing uid parameter' });
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

    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json(response.data);

  } catch (error: any) {
    console.error('❌ 查询状态失败:', error.message);

    // 处理 Axios 错误响应
    if (error.response) {
      console.error('❌ API 错误响应:', error.response.data);
      return res.status(error.response.status)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json(error.response.data);
    }

    // 通用错误响应
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ code: 'error', error: error.message || 'Status check failed' });
  }
}
