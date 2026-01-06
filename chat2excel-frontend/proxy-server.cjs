// =============================================================================
// proxy-server.js - Doc2X API 代理服务器
// =============================================================================
//
// 本服务器作为前端和 Doc2X API 之间的代理，解决 CORS 问题并保护 API Key
//
// 使用方法：
//   node proxy-server.js
//
// =============================================================================

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');

const app = express();
const upload = multer();

// 配置
const PORT = 3001;
const DOC2X_API_KEY = process.env.DOC2X_API_KEY || 'sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq';
const DOC2X_BASE_URL = 'https://v2.doc2x.noedgeai.com';

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Doc2X 代理服务器运行正常' });
});

/**
 * 上传文件到 Doc2X API
 * POST /api/proxy/parse/pdf
 */
app.post('/api/proxy/parse/pdf', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 收到文件上传请求');
    console.log(`  - 文件名: ${req.file?.originalname}`);
    console.log(`  - 大小: ${req.file?.size} bytes`);
    console.log(`  - 类型: ${req.file?.mimetype}`);

    if (!req.file) {
      console.error('❌ 未找到文件');
      return res.status(400).json({
        code: 'error',
        error: '未找到文件'
      });
    }

    console.log('🔄 开始转发到 Doc2X API...');
    console.log(`  - URL: ${DOC2X_BASE_URL}/api/v2/parse/pdf`);
    console.log(`  - API Key: ${DOC2X_API_KEY.substring(0, 10)}...`);

    // 转发请求到 Doc2X API
    const response = await axios.post(
      `${DOC2X_BASE_URL}/api/v2/parse/pdf`,
      req.file.buffer,
      {
        headers: {
          'Authorization': `Bearer ${DOC2X_API_KEY}`,
          'Content-Type': req.file.mimetype || 'image/png',
        },
        timeout: 60000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    console.log(`✅ Doc2X API 响应成功`);
    console.log(`  - Code: ${response.data.code}`);
    console.log(`  - UID: ${response.data.data?.uid}`);
    res.json(response.data);

  } catch (error) {
    console.error('❌ 文件上传失败');
    console.error(`  - 错误消息: ${error.message}`);
    console.error(`  - 错误代码: ${error.code}`);

    if (error.response) {
      console.error(`  - 响应状态: ${error.response.status}`);
      console.error(`  - 响应数据:`, error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }

    if (error.request) {
      console.error(`  - 请求已发送但未收到响应`);
      return res.status(500).json({
        code: 'error',
        error: '无法连接到 Doc2X API，请检查网络'
      });
    }

    res.status(500).json({
      code: 'error',
      error: error.message || '上传失败'
    });
  }
});

/**
 * 查询识别状态
 * GET /api/proxy/parse/status?uid=xxx
 */
app.get('/api/proxy/parse/status', async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({
        code: 'error',
        error: '缺少 uid 参数'
      });
    }

    // 转发请求到 Doc2X API
    const response = await axios.get(
      `${DOC2X_BASE_URL}/api/v2/parse/status`,
      {
        params: { uid },
        headers: {
          'Authorization': `Bearer ${DOC2X_API_KEY}`,
        },
        timeout: 10000,
      }
    );

    res.json(response.data);

  } catch (error) {
    console.error('❌ 查询状态失败:', error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      code: 'error',
      error: error.message || '查询失败'
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║        🚀 Doc2X API 代理服务器已启动                         ║');
  console.log('║                                                              ║');
  console.log(`║        📍 本地地址: http://localhost:${PORT}                   ║`);
  console.log('║                                                              ║');
  console.log('║        ✨ 功能:                                               ║');
  console.log('║           - 解决 CORS 问题                                    ║');
  console.log('║           - 保护 API Key                                      ║');
  console.log('║           - 转发请求到 Doc2X API                              ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('按 Ctrl+C 停止服务器');
  console.log('');
});
