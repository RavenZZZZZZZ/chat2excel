# Chat2Excel - OCR 图片转 Excel

一个全栈 Web 应用，使用 Doc2X API 将图片中的表格数据转换为 Excel 文件。

## 项目结构

```
chat2excel/
├── chat2excel-frontend/     # React 前端应用
│   ├── src/                 # 源代码
│   ├── api/                 # Vercel Serverless Functions
│   ├── public/              # 静态资源
│   └── package.json         # 前端依赖
├── server.ts                # Express 代理服务器（已弃用）
└── README.md               # 本文件
```

## 技术栈

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Zustand** - 状态管理
- **React Query** - 数据获取

### 后端（Serverless）
- **Vercel Serverless Functions** - API 端点
- **Doc2X API** - OCR 服务

### 监控
- **Sentry** - 错误追踪（可选）
- **Vercel Analytics** - 访问统计

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Doc2X API Key

### 本地开发

1. **克隆仓库**
   ```bash
   git clone <your-repo-url>
   cd chat2excel/chat2excel-frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   复制 `.env.example` 到 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local` 并添加：
   ```env
   VITE_DOC2X_API_KEY=your-api-key-here
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问 `http://localhost:5173`

## 部署

### 部署到 Vercel

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd chat2excel-frontend
   vercel
   ```

4. **配置环境变量**
   
   在 Vercel Dashboard 中设置：
   - `DOC2X_API_KEY` = 你的 Doc2X API 密钥

5. **生产部署**
   ```bash
   vercel --prod
   ```

### 环境变量

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| `DOC2X_API_KEY` | Doc2X API 密钥 | ✅ | - |
| `DOC2X_API_BASE_URL` | Doc2X API 地址 | ❌ | `https://v2.doc2x.noedgeai.com` |
| `SENTRY_DSN` | Sentry DSN | ❌ | - |
| `SENTRY_ENVIRONMENT` | 环境标识 | ❌ | `production` |

## API 端点

### 健康检查
```
GET /api/health
```

### 上传文件进行 OCR
```
POST /api/proxy/parse/pdf
Content-Type: multipart/form-data

Body: file (图片文件，最大 7MB，支持 JPEG/PNG)
```

### 查询 OCR 状态
```
GET /api/proxy/parse/status?uid={task-uid}
```

## 功能特性

- ✅ 图片上传（拖拽或点击）
- ✅ OCR 表格识别
- ✅ 实时状态跟踪
- ✅ Excel 文件导出
- ✅ 响应式设计
- ✅ 错误处理和用户反馈
- ✅ 健康检查端点

## 安全性

- 文件类型验证（仅 JPEG/PNG）
- 文件大小限制（7MB）
- CORS 配置
- 环境变量保护
- 安全头设置

## 监控和日志

- **Sentry**: 错误追踪和性能监控
- **Vercel Analytics**: 用户行为分析
- **Console Log**: 结构化日志记录

## 成本估算

### Vercel 免费套餐
- 带宽: 100GB/月
- Serverless 执行: 100GB-hrs/月
- 函数调用: 无限次

### 预期使用（<100 用户/天）
- 月请求: ~9,000 次
- 月带宽: ~18GB
- **总成本**: $0/月

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

## 支持

如有问题，请提交 Issue 或联系维护者。

---

**部署平台**: [Vercel](https://vercel.com)  
**OCR 服务**: [Doc2X](https://doc2x.noedgeai.com)
