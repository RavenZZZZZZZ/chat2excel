// ==============================================================================
// api/proxy/parse/pdf.ts - 文件上传处理 Serverless Function
// ==============================================================================
//
// 接收前端上传的图片文件，验证后转发到 Doc2X API 进行 OCR 处理
//
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 记录请求信息（用于调试）
  console.log('📥 收到请求:', {
    method: req.method,
    url: req.url,
    headers: {
      'user-agent': req.headers['user-agent'],
      'referer': req.headers['referer'],
      'origin': req.headers['origin'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-vercel-forwarded-for': req.headers['x-vercel-forwarded-for'],
    },
    timestamp: new Date().toISOString(),
  });

  // 检查环境变量
  console.log('🔑 环境变量检查:', {
    hasApiKey: !!DOC2X_API_KEY,
    apiKeyPrefix: DOC2X_API_KEY ? `${DOC2X_API_KEY.substring(0, 7)}...` : 'undefined',
    apiBase: DOC2X_API_BASE,
  });

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*').send('');
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ code: 'error', error: 'Method not allowed' });
  }

  try {
    // 解析 FormData
    const form = formidable({
      maxFileSize: MAX_FILE_SIZE,
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    // 验证文件存在
    if (!file) {
      console.error('❌ 错误: 未上传文件');
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ code: 'error', error: 'No file uploaded' });
    }

    console.log('📤 收到文件上传请求:', {
      name: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype
    });

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ 错误: 文件大小超过限制');
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ code: 'error', error: '文件大小超过 7MB 限制' });
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.mimetype || '')) {
      console.error('❌ 错误: 不支持的文件类型');
      return res.status(400)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ code: 'error', error: `不支持的文件类型: ${file.mimetype}。仅支持 JPEG/PNG` });
    }

    // 读取文件内容
    const buffer = fs.readFileSync(file.filepath);

    console.log('📤 准备转发到 Doc2X API:', {
      url: `${DOC2X_API_BASE}/api/v2/async/parse/img/layout`,
      bufferSize: buffer.length,
      contentType: file.mimetype,
      hasApiKey: !!DOC2X_API_KEY,
    });

    // 转发到 Doc2X API
    let response;
    try {
      response = await axios.post(
        `${DOC2X_API_BASE}/api/v2/async/parse/img/layout`,
        buffer,
        {
          headers: {
            'Authorization': `Bearer ${DOC2X_API_KEY}`,
            'Content-Type': file.mimetype,
          },
          timeout: 60000,
          maxBodyLength: MAX_FILE_SIZE,
          maxContentLength: MAX_FILE_SIZE,
        }
      );
    } catch (axiosError: any) {
      console.error('❌ Doc2X API 调用失败:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          headers: {
            authorization: axiosError.config?.headers?.authorization ? `Bearer ${DOC2X_API_KEY?.substring(0, 7)}...` : 'missing',
          },
        },
      });
      throw axiosError;
    }

    console.log('✅ Doc2X 上传响应:', {
      status: response.status,
      code: response.data?.code,
      hasData: !!response.data?.data,
      uid: response.data?.data?.uid,
    });

    // 清理临时文件
    fs.unlinkSync(file.filepath);

    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json(response.data);

  } catch (error: any) {
    console.error('❌ 上传文件失败:', error.message);

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
      .json({ code: 'error', error: error.message || 'Upload failed' });
  }
}
