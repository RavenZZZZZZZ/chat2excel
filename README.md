# Chat2Excel - 表格 OCR 识别工具

> 🌍 **Bilingual Support**: 中文 | [English](#english) |
> 🎯 **Status**: Production Ready | 🚀 **Deployment**: Vercel + Aliyun CDN

一个全栈 Web 应用，使用 Doc2X API 将图片中的表格数据转换为 Excel 文件。支持**中英文双语**，采用**完全的前后端分离架构**。

---

## ✨ 主要特性

- 🖼️ **智能 OCR 识别** - 支持拖拽上传，自动识别表格
- 📊 **Excel 导出** - 一键导出识别结果为 Excel 文件
- 🌍 **多语言支持** - 中文/英文双语界面
- 🔒 **安全可靠** - 完全的前后端分离，API 密钥不暴露
- 📱 **响应式设计** - 支持桌面和移动设备
- ⚡ **快速部署** - 一键部署到 Vercel

---

## 🏗️ 项目架构

### 技术栈

**前端**:
- React 18 + TypeScript
- Vite (构建工具)
- Tailwind CSS (样式)
- React Router (路由)
- Zustand (状态管理)
- React i18next (国际化)

**后端**:
- Next.js 16.1.1 (API Routes)
- Supabase (数据库 + 存储)
- Doc2X API (OCR 服务)

### 项目结构

```
chat2excel/
├── app/                      # Next.js App Router
│   └── api/                 # API 路由
│       ├── health/          # 健康检查
│       ├── tasks/           # 任务管理
│       ├── storage/         # 文件存储
│       └── ocr/             # OCR 识别
├── lib/                      # 共享库
│   ├── supabase.ts         # Supabase 客户端
│   ├── doc2x.ts            # Doc2X API 配置
│   ├── errors.ts           # 自定义错误
│   └── cors.ts             # CORS 处理
├── src/                      # React 前端源代码 (Vite)
│   ├── components/          # React 组件
│   ├── locales/             # 国际化翻译文件
│   ├── services/            # API 服务
│   ├── stores/              # 状态管理
│   ├── types/               # TypeScript 类型
│   └── views/               # 页面组件
├── docs/                     # 项目文档
├── public/                   # 静态资源
├── next.config.mjs           # Next.js 配置
└── package.json              # 项目依赖
```

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号
- Doc2X API Key

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd chat2excel
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# API 基础地址（开发环境）
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`

---

## 📦 部署

### Vercel 部署（推荐）

1. **配置环境变量**

   在 Vercel Dashboard → Settings → Environment Variables 添加：

   ```bash
   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_BUCKET_NAME=ocr-images

   # Doc2X API
   DOC2X_API_KEY=sk-your-doc2x-api-key
   DOC2X_API_BASE_URL=https://v2.doc2x.noedgeai.com

   # 配置
   ALLOWED_ORIGINS=https://your-domain.vercel.app
   MAX_FILE_SIZE=7242880
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif
   ```

2. **推送代码到 GitHub**

   ```bash
   git add .
   git commit -m "feat: Initial deployment"
   git push origin main
   ```

3. **在 Vercel 导入项目**

   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - Vercel 自动检测配置并部署

4. **完成！** 🎉

详细配置指南：[docs/VERCEL_ENV_SETUP.md](docs/VERCEL_ENV_SETUP.md)

### 获取配置帮助

- **快速指南**: [docs/QUICK_START.md](docs/QUICK_START.md) - 3 步获取 API 密钥
- **详细配置**: [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) - 完整的 Supabase 配置

---

## 🌐 国际化

项目使用 `react-i18next` 实现中英文双语：

- **语言切换**: 点击导航栏的语言切换按钮
- **持久化**: 语言偏好自动保存到 localStorage
- **自动检测**: 首次访问自动检测浏览器语言

### 翻译文件

- [src/locales/zh-CN.ts](src/locales/zh-CN.ts) - 简体中文
- [src/locales/en-US.ts](src/locales/en-US.ts) - 英文

---

## 📚 文档

完整文档请查看 [docs/](docs/) 目录：

### 🚀 Getting Started
- [QUICK_START.md](docs/QUICK_START.md) - 快速开始指南
- [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) - Supabase 完整配置

### 🏗️ Architecture
- [DATABASE_SCHEMA_DESIGN.md](docs/DATABASE_SCHEMA_DESIGN.md) - 数据库设计
- [UPLOAD_FEATURE_SPEC.md](docs/UPLOAD_FEATURE_SPEC.md) - 上传功能规格

### 🚢 Deployment
- [CDN_SETUP.md](docs/CDN_SETUP.md) - CDN 配置总览
- [ALIYUN_CDN_QUICKSTART.md](docs/ALIYUN_CDN_QUICKSTART.md) - 阿里云 CDN 快速开始
- [VERCEL_ENV_SETUP.md](docs/VERCEL_ENV_SETUP.md) - Vercel 环境变量配置

### 🔧 Troubleshooting
- [DIAGNOSE_403_ERROR.md](docs/DIAGNOSE_403_ERROR.md) - 调试 403 错误
- [EXPORT_TROUBLESHOOTING.md](docs/EXPORT_TROUBLESHOOTING.md) - Excel 导出问题
- [VERCEL_LOGS_GUIDE.md](docs/VERCEL_LOGS_GUIDE.md) - Vercel 日志查看

---

## 🔒 安全性

### 完全的前后端分离

- ✅ 前端不包含任何数据库密钥
- ✅ 所有 API 调用通过后端
- ✅ Service Role Key 仅在后端使用
- ✅ CORS 配置保护 API

### 数据验证

- 文件类型验证（JPEG/PNG/WEBP/GIF）
- 文件大小限制（7MB）
- 请求体大小限制
- 输入清理和验证

---

## 💰 成本估算

### Vercel 免费套餐

- 带宽: 100GB/月
- Serverless 执行: 1000小时/月
- 函数调用: 100,000次/月

### 预期使用（< 100 用户/天）

- 月请求: ~9,000 次
- 月带宽: ~15GB
- **总成本**: **$0/月** ✅

### 可选：阿里云 CDN

- 月成本: ¥50-100
- 中国大陆延迟降低 50-80%
- 适合中国用户优化

---

## 🧪 开发指南

### 本地运行后端（可选）

如需本地测试后端 API：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 启动本地开发服务器
vercel dev

# 访问 http://localhost:3000/api/health
```

### 运行测试

```bash
# 运行单元测试
npm test

# 运行构建
npm run build

# 预览生产构建
npm run preview
```

### 代码规范

```bash
# ESLint 检查
npm run lint

# Prettier 格式化
npm run format
```

---

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [Doc2X](https://doc2x.noedgeai.com) - 提供强大的 OCR API
- [Supabase](https://supabase.com) - 提供数据库和存储服务
- [Vercel](https://vercel.com) - 提供部署平台
- [React](https://react.dev) - UI 框架

---

## 📞 支持

如有问题或建议：

1. 查看 [文档](docs/)
2. 提交 [Issue](../../issues)
3. 联系维护者

---

## 🌟 Star History

如果这个项目对你有帮助，请给它一个 ⭐️！

---

<div align="center">

**Made with ❤️ by the Chat2Excel Team**

[🏠 返回首页](https://chat2excel.vercel.app) •
[📚 查看文档](docs/) •
[🐛 报告问题](../../issues)

</div>
