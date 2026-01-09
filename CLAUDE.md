# Chat2Excel - Claude Code 配置

## 项目概述
全栈 Web 应用，使用 Doc2X API 将图片中的表格数据转换为 Excel 文件。
- 前端: Vite + React + TypeScript
- 后端: Next.js 16.1.1 (App Router)
- 部署: Vercel

## 常用命令

### 开发
```bash
npm run dev:all      # 启动完整开发环境 (前端 5173 + 后端 3000)
npm run dev          # 仅启动 Next.js 后端
npm run dev:vite     # 仅启动 Vite 前端
```

### 构建
```bash
npm run build:all    # 完整构建 (前端 + 后端 + 自动更新资源)
npm run build:vite   # 仅构建前端
npm run build        # 仅构建后端
```

### 测试与检查
```bash
npm run lint         # ESLint 代码检查
npm run format       # Prettier 格式化
npm test             # 运行测试
```

## 代码规范

### TypeScript
- 所有新函数必须有明确的 TypeScript 类型定义
- 优先使用 `interface` 定义对象类型
- 避免使用 `any`，优先使用 `unknown`
- 组件 Props 接口命名为 `ComponentNameProps`

### React
- 仅使用函数式组件 + Hooks
- 组件文件名使用 PascalCase (如 `ImageUpload.tsx`)
- 自定义 Hook 以 `use` 开头 (如 `useOcrTask.ts`)
- 优先使用组件状态，必要时使用 Zustand 全局状态

### 命名规范
- 变量和函数: camelCase (`fileName`, `handleSubmit`)
- 组件和类: PascalCase (`ImageUpload`, `OcrService`)
- 常量: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_BASE_URL`)
- 文件夹: kebab-case (`image-upload`, `ocr-service`)

## 项目架构

### 前后端分离
- 前端通过 HTTP 调用 Next.js API Routes
- 所有敏感操作 (API 密钥、数据库) 在后端完成
- 前端不包含任何 Supabase 或 Doc2X 密钥

### 构建流程 (重要!)
1. Vite 构建前端 → `dist/`
2. 复制到 `public/`
3. **自动更新**: `scripts/update-assets.js` 自动更新 `app/page.tsx` 中的资源引用
4. Next.js 构建 → `.next/`

⚠️ **不要手动修改 `app/page.tsx` 中的资源文件名，构建脚本会自动处理**

### API 设计
- 所有 API 路由位于 `app/api/`
- 必须添加 `export const dynamic = 'force-dynamic'`
- 使用 `lib/cors.ts` 处理 CORS
- 日志使用 `[API Name]` 前缀

### 状态管理
- 组件内部状态: `useState`
- 跨组件状态: Zustand (`stores/ocrTaskStore.ts`)
- 服务器状态: React Query

## 环境变量

### 开发环境 (.env.local)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 生产环境 (Vercel)
```env
DOC2X_API_KEY=sk-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_API_BASE_URL=/api
```

⚠️ **重要**: DOC2X_API_KEY 不能在 `next.config.mjs` 中设置假值，会覆盖 Vercel 环境变量

## 文件限制

### 文件上传
- 最大文件: **7MB** (Doc2X API 限制)
- 支持格式: **JPG/JPEG, PNG, WebP**
- MIME 类型: `image/jpeg`, `image/png`, `image/webp`

### Next.js 配置
`next.config.mjs` 中已配置 body size limit:
```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '7mb',
  },
},
api: {
  bodySizeLimit: '7mb',
  responseLimit: '8mb',
},
```

## 国际化

- 使用 react-i18next
- 新增文本必须添加中英文翻译
- 翻译文件: `src/locales/zh-CN.ts` 和 `src/locales/en-US.ts`
- 使用 `useTranslation` Hook
- 翻译 key 使用点分隔符 (如 `upload.dropZone.text`)

## 开发工作流程

1. 修改代码后运行 `npm run format` 格式化
2. API 开发必须添加详细日志
3. 新功能需要添加对应的类型定义
4. 完成后运行 `npm run build:all` 测试构建
5. 提交前确保所有测试通过

## 常见问题

### 资源文件 404
运行 `npm run build:all` 重新构建

### 413 Payload Too Large
检查 `next.config.mjs` 中的 body size limit 配置

### CORS 错误
检查 `lib/cors.ts` 中的 allowed origins

## 关键文件

- `lib/doc2x.ts` - Doc2X API 配置
- `lib/cors.ts` - CORS 处理
- `services/ocr.ts` - OCR API 服务
- `stores/ocrTaskStore.ts` - OCR 任务状态
- `app/api/ocr/upload/route.ts` - 上传 API 示例

## Claude Code Skills

项目已安装官方 Frontend Design Skill，用于提升前端设计质量：

### Frontend Design Skill
- **位置**: `.claude/skills/frontend-design/SKILL.md`
- **功能**: 创建独特、生产级的前端界面，避免通用 AI 美学
- **使用**: 当你要求创建或修改前端组件时，我会自动使用此 Skill
- **特点**:
  - 避免常见字体（Inter, Roboto, Arial）
  - 避免老套配色（紫色渐变白背景）
  - 选择大胆的美学方向和独特的视觉设计
  - 精心设计的字体、色彩、动画和布局

### 自定义命令
- **`/finish`**: 功能完成收尾命令，自动更新开发日志和待办事项
  - 位置: `.claude/commands/finish.md`
  - 功能: 分析对话内容、更新 DEVELOPMENT_LOG.md、记录待办事项到 TODOLIST.md

### Claude Code 全局配置
- **语言设置**: 已配置为中文 (`language: "chinese"`)
  - 配置文件: `~/.claude/settings.json`
  - 使用 `/config` 命令可在对话中临时修改
  - 默认使用中文响应，优化中文用户体验

## 语言偏好
- 代码注释: 中文
- 变量命名: 英文
- UI 文本: 中英文双语 (需要国际化)
- 错误信息: 中文 (需要国际化)
