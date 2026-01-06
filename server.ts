// ==============================================================================
// server.ts - Doc2X API 代理服务器
// ==============================================================================
//
// 本服务器作为前端和 Doc2X API 之间的代理，解决 CORS 问题。
//
// ==============================================================================

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';

const app = express();
const upload = multer();
const PORT = 3001;

// 日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// CORS 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy server is running' });
});

// Doc2X API 配置
const DOC2X_API_BASE = process.env.DOC2X_API_BASE_URL || 'https://v2.doc2x.noedgeai.com';
const DOC2X_API_KEY = process.env.DOC2X_API_KEY;

// 验证必需的环境变量
if (!DOC2X_API_KEY) {
  console.error('❌ 错误: DOC2X_API_KEY 环境变量未设置');
  console.error('请在 .env 文件中设置 DOC2X_API_KEY，或使用以下命令启动:');
  console.error('  DOC2X_API_KEY=your-actual-api-key npm run dev');
  process.exit(1);
}

// 代理：上传文件
app.post('/api/proxy/parse/pdf', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 收到文件上传请求:', req.file?.originalname);

    if (!req.file) {
      return res.status(400).json({
        code: 'error',
        error: 'No file uploaded'
      });
    }

    console.log('📤 文件信息:', {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // 验证文件大小（最大 7MB）
    if (req.file.size > 7 * 1024 * 1024) {
      return res.status(400).json({
        code: 'error',
        error: '文件大小超过 7MB 限制'
      });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        code: 'error',
        error: `不支持的文件类型: ${req.file.mimetype}。仅支持 JPEG/PNG`
      });
    }

    // 直接发送图片二进制数据到 Doc2X API（不是 FormData！）
    const response = await axios.post(
      `${DOC2X_API_BASE}/api/v2/async/parse/img/layout`,
      req.file.buffer, // 直接发送 buffer
      {
        headers: {
          'Authorization': `Bearer ${DOC2X_API_KEY}`,
          'Content-Type': req.file.mimetype // 使用文件的原始 MIME 类型
        },
        timeout: 60000,
        maxBodyLength: 7 * 1024 * 1024, // 7MB
        maxContentLength: 7 * 1024 * 1024 // 7MB
      }
    );

    console.log('✅ Doc2X 上传响应:', response.data);
    res.json(response.data);

  } catch (error: any) {
    console.error('❌ 上传文件失败:', error.message);

    if (error.response) {
      console.error('❌ API 错误响应:', error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      code: 'error',
      error: error.message || 'Upload failed'
    });
  }
});

// 代理：查询状态
app.get('/api/proxy/parse/status', async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({
        code: 'error',
        error: 'Missing uid parameter'
      });
    }

    console.log('🔍 查询状态:', uid);

    // 转发到 Doc2X API v2
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

    res.json(response.data);

  } catch (error: any) {
    console.error('❌ 查询状态失败:', error.message);

    if (error.response) {
      console.error('❌ API 错误响应:', error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      code: 'error',
      error: error.message || 'Status check failed'
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('==================================');
  console.log(`🚀 Doc2X 代理服务器已启动`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${DOC2X_API_KEY.substring(0, 10)}...`);
  console.log('==================================');
  console.log('');
});
