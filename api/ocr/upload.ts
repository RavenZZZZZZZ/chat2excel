// ==============================================================================
// api/ocr/upload.ts - 上传图片到 Doc2X API
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import { cors } from '../api-modules/middleware/cors';
import { DOC2X_UPLOAD_ENDPOINT, DOC2X_API_KEY } from '../api-modules/lib/doc2x';
import { ValidationError } from '../api-modules/lib/error';

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
    return res.status(405).json({ code: 'error', error: 'Method not allowed' });
  }

  try {
    console.log('[OCR Upload] Received upload request');

    // 验证 API Key
    if (!DOC2X_API_KEY) {
      console.error('[OCR Upload] DOC2X_API_KEY is not configured');
      return res.status(500).json({ code: 'error', error: 'API configuration error' });
    }

    // 解析 FormData
    const form = formidable({
      maxFileSize: 7 * 1024 * 1024, // 7MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    // 验证文件存在
    if (!file) {
      console.error('[OCR Upload] No file uploaded');
      return res.status(400).json({ code: 'error', error: 'No file uploaded' });
    }

    console.log('[OCR Upload] File received:', {
      name: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
    });

    // 验证文件大小
    if (file.size > 7 * 1024 * 1024) {
      console.error('[OCR Upload] File size exceeds 7MB limit');
      return res.status(400).json({ code: 'error', error: '文件大小超过 7MB 限制' });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      console.error('[OCR Upload] Unsupported file type:', file.mimetype);
      return res.status(400).json({
        code: 'error',
        error: `不支持的文件类型: ${file.mimetype}。仅支持 JPEG、PNG、WEBP、GIF`
      });
    }

    // 读取文件内容
    const buffer = fs.readFileSync(file.filepath);

    console.log('[OCR Upload] Forwarding to Doc2X API:', {
      url: DOC2X_UPLOAD_ENDPOINT,
      bufferSize: buffer.length,
    });

    // 转发到 Doc2X API
    let response;
    try {
      response = await axios.post(
        DOC2X_UPLOAD_ENDPOINT,
        buffer,
        {
          headers: {
            'Authorization': `Bearer ${DOC2X_API_KEY}`,
            'Content-Type': file.mimetype,
          },
          timeout: 60000,
          maxBodyLength: 7 * 1024 * 1024,
          maxContentLength: 7 * 1024 * 1024,
        }
      );
    } catch (axiosError: any) {
      console.error('[OCR Upload] Doc2X API call failed:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
      });
      throw axiosError;
    }

    console.log('[OCR Upload] Doc2X response:', {
      status: response.status,
      code: response.data?.code,
      uid: response.data?.data?.uid,
    });

    // 清理临时文件
    fs.unlinkSync(file.filepath);

    return res.status(200).json(response.data);

  } catch (error: any) {
    console.error('[OCR Upload] Upload failed:', error.message);

    // 处理 Axios 错误响应
    if (error.response) {
      console.error('[OCR Upload] API error response:', error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }

    // 通用错误响应
    return res.status(500).json({
      code: 'error',
      error: error.message || 'Upload failed'
    });
  }
}
