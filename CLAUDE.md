# Claude 开发笔记 - Chat2Excel 项目

本文档记录项目开发过程中遇到的问题、解决方案和关键知识点,便于后续快速排查类似问题。

---

## 2026-01-09 - 413 错误:文件上传大小限制问题

### 问题描述
用户上传大图片时返回 **413 Payload Too Large** 错误:
```
POST /api/ocr/upload 413 (Payload Too Large)
```

**用户反馈**: 朋友测试时上传图片失败,返回413错误

### 根本原因

**Next.js 默认 body 大小限制过小**:
- Next.js 默认限制: **1MB**
- Doc2X API 限制: **7MB**
- 前端组件限制: **10MB** (不一致!)

导致问题:
1. 前端允许上传 10MB 的图片
2. Next.js 在 1MB 时拦截,返回 413
3. 后端代码虽然验证了 7MB,但请求根本没到达

### 解决方案

#### 1. 增加 Next.js API body 大小限制

**next.config.mjs**:
```javascript
export default {
  // ...其他配置
  // 增加 API body 大小限制,支持上传大图片 (最大 7MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '7mb',
    },
  },
  // API 路由配置
  api: {
    bodySizeLimit: '7mb',
    responseLimit: '8mb',
  },
}
```

#### 2. 统一前后端文件大小限制

**src/components/upload/ImageUpload.tsx**:
```typescript
// 修改前
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;  // ❌ 10MB

// 修改后
const DEFAULT_MAX_SIZE = 7 * 1024 * 1024;   // ✅ 7MB
```

**src/types/upload.ts**:
```typescript
export const ERROR_MESSAGES: Record<UploadErrorCode, string> = {
  FILE_TOO_LARGE: '文件大小超过限制（最大 7MB）',  // ✅ 统一为 7MB
  // ...
};
```

#### 3. 后端验证

**app/api/ocr/upload/route.ts** (已存在):
```typescript
// 验证文件大小
if (file.size > 7 * 1024 * 1024) {
  return NextResponse.json({
    code: 'error',
    error: '文件大小超过 7MB 限制'
  }, { status: 400 });
}
```

### Doc2X API 限制

根据 Doc2X API 文档:
- **请求体格式**: img(jpg/png) 的二进制
- **最大大小**: 7M

### 测试验证

```bash
# 1. 上传小于 7MB 的图片 - 应该成功
curl -X POST http://localhost:3000/api/ocr/upload \
  -F "file=@test-image-5mb.jpg"

# 2. 上传大于 7MB 的图片 - 应该返回 400 错误
curl -X POST http://localhost:3000/api/ocr/upload \
  -F "file=@test-image-8mb.jpg"

# 前端验证
# 尝试上传 8MB 图片,应该在点击时提示: "文件大小超过限制(最大 7MB)"
```

### 经验教训

1. **三层验证确保一致性**:
   - 前端: 用户友好的错误提示
   - Next.js: Body 大小限制
   - 后端: 业务逻辑验证

2. **统一配置,避免不一致**:
   - 所有地方使用相同的限制值
   - 参考第三方 API 的限制文档

3. **错误码 413 的含义**:
   - HTTP 413 = Payload Too Large
   - 通常是服务器配置限制
   - 需要调整服务器配置,而不仅仅是业务代码

---

## 2026-01-09 - 前端资源文件名硬编码问题修复

### 问题描述
`app/page.tsx` 中硬编码了 Vite 构建产生的 JS/CSS 文件名:
```typescript
<script src="/assets/index-BWKsTMP9.js"></script>
<link href="/assets/index-8U-2jKh2.css"></link>
```

**问题原因**:
- Vite 每次构建会生成不同的 hash (如 `index-BWKsTMP9.js`, `index-Cvyrb-KI.js`)
- 当前 `public/assets/` 目录中累积了多个不同 hash 的文件
- `app/page.tsx` 引用的是旧文件,导致浏览器加载过期代码

### 解决方案

**方案**: 在构建流程中自动更新资源引用

实现步骤:
1. 创建 `scripts/update-assets.js` 自动更新脚本
2. 修改 `scripts/build-all.sh` 集成更新流程
3. 每次构建自动提取正确的文件名并更新 `app/page.tsx`

### 核心代码

**scripts/update-assets.js**:
```javascript
// 读取 Vite 构建生成的 index.html
const distHtml = fs.readFileSync('dist/index.html', 'utf-8');

// 提取 JS 和 CSS 文件名
const jsMatch = distHtml.match(/src="\/assets\/(index-[^"]+\.js)"/);
const cssMatch = distHtml.match(/href="\/assets\/(index-[^"]+\.css)"/);

// 使用正则表达式精确替换 app/page.tsx
pageTsx = pageTsx.replace(
  /(<script[^>]*src=")\/assets\/index-[^"]+\.js("/g,
  `$1/assets/${jsFilename}$2`
);
```

**scripts/build-all.sh**:
```bash
# 2.5. 自动更新 Next.js 页面中的资源引用
echo "📝 步骤 2.5: 更新 Next.js 页面资源引用..."
node scripts/update-assets.js
```

### 测试验证
```bash
# 完整构建流程
npm run build:all

# 检查 app/page.tsx 是否更新
grep "assets/index" app/page.tsx

# 验证文件存在
ls -lh public/assets/index-*
```

### 经验教训

1. **自动化优于手动**: 硬编码文件名容易出错,自动化更新更可靠
2. **正则表达式精确匹配**: 使用精确的正则表达式避免误替换
3. **构建流程集成**: 将更新步骤集成到构建流程,确保每次构建都执行

---

## 2026-01-08 - Doc2X API 集成问题排查

### 问题描述
Doc2X OCR 识别功能在部署后无法正常工作:
- ✅ 图片上传成功,获得 UID
- ❌ 状态查询一直返回空响应或 404
- ❌ 前端轮询 60 次后超时,始终无法获取识别结果

### 关键症状
```javascript
// Vercel 日志显示:
[OCR Status] Doc2X response length: 0
[OCR Status] Empty response from Doc2X, returning processing status
// 重复 60+ 次
```

### 根本原因
**Doc2X 状态查询 API 端点 URL 错误**

- ❌ **错误 URL**: `/api/v2/async/parse/status`
- ✅ **正确 URL**: `/api/v2/parse/img/layout/status`

### 问题发现过程

1. **查看历史文档**
   - 在 `docs/archive/技术栈文档.md` 中找到了正确的 API 端点
   - 发现旧文档中使用的是不同的 URL 格式

2. **测试验证**
   ```bash
   # 测试错误端点
   curl "https://v2.doc2x.noedgeai.com/api/v2/async/parse/status?uid=XXX"
   # 返回: 404 Not Found

   # 测试正确端点
   curl "https://v2.doc2x.noedgeai.com/api/v2/parse/img/layout/status?uid=XXX"
   # 返回: 200 OK {"code":"success","data":{"status":"success","result":{...}}}
   ```

3. **确认工作流程**
   - 第 1 次查询: 返回 `{"status": "processing"}`
   - 等待 3 秒后第 2 次查询: 返回 `{"status": "success", "result": {...}}`

### 解决方案

修改文件: `app/api/ocr/status/route.ts`

```typescript
// 修改前
const url = new URL('https://v2.doc2x.noedgeai.com/api/v2/async/parse/status');

// 修改后
const url = new URL('https://v2.doc2x.noedgeai.com/api/v2/parse/img/layout/status');
```

### Doc2X API 正确使用方式

#### 1. 上传图片
```bash
POST https://v2.doc2x.noedgeai.com/api/v2/async/parse/img/layout
Headers:
  - Authorization: Bearer {API_KEY}
  - Content-Type: image/jpeg

Response:
{
  "code": "success",
  "data": {
    "uid": "019b9e55-b335-7b67-876b-7ba6635a43ea"
  }
}
```

#### 2. 查询状态
```bash
GET https://v2.doc2x.noedgeai.com/api/v2/parse/img/layout/status?uid={uid}
Headers:
  - Authorization: Bearer {API_KEY}

Response (处理中):
{
  "code": "success",
  "data": {
    "status": "processing"
  }
}

Response (完成):
{
  "code": "success",
  "data": {
    "status": "success",
    "result": {
      "pages": [{
        "md": "<table>...</table>"
      }]
    }
  }
}
```

#### 3. 轮询策略
- **间隔**: 2-3 秒
- **超时**: 最多轮询 60 次 (约 2 分钟)
- **典型完成时间**: 1-2 次轮询 (3-6 秒)

### 经验教训

1. **API 文档很重要**
   - 旧文档中可能包含关键信息
   - 不要假设 "v2" API 的所有端点都在 `/api/v2/` 路径下

2. **测试脚本的必要性**
   - 创建 `scripts/debug/test-doc2x-immediate.sh` 进行独立测试
   - 排除了前端、网络、环境变量等其他因素

3. **日志记录的价值**
   - 在 `app/api/ocr/status/route.ts` 中添加详细日志
   - 记录请求 URL、响应状态、响应长度等

4. **网络问题的可能性**
   - 虽然怀疑过 Doc2X (中国大陆) 与 Vercel (海外) 之间的网络问题
   - 但实际是 API 端点 URL 错误,不是网络问题

---

## 2026-01-08 - Next.js 部署配置问题

### 问题 1: Vercel Framework Preset 错误

**症状**: 所有路由返回 404,包括根路径 `/`

**原因**: Vercel 项目配置中 Framework Preset 被设置为 "Vite" 而非 "Next.js"

**解决**:
1. 进入 Vercel Dashboard
2. Project Settings → General
3. Framework Preset: `Vite` → `Next.js`
4. Redeploy

### 问题 2: 环境变量被覆盖

**症状**:
```
[OCR Upload] Error: Request failed with status code 401
```

**原因**: `next.config.mjs` 中设置了假的环境变量值,覆盖了 Vercel 的真实环境变量

```javascript
// ❌ 错误配置
env: {
  DOC2X_API_KEY: 'fake-key',  // 这会覆盖 Vercel 的真实环境变量!
}
```

**解决**:
```javascript
// ✅ 正确配置
env: {
  SUPABASE_URL: 'https://fake.supabase.co',  // 仅用于构建时
  SUPABASE_SERVICE_ROLE_KEY: 'fake-key',
  // DOC2X_API_KEY 移除,让 Vercel 环境变量生效
}
```

**关键理解**:
- `next.config.mjs` 中的 `env` 用于**构建时**变量
- **运行时**变量应该直接从 Vercel Environment Variables 读取
- 不要在 `next.config.mjs` 中设置敏感的运行时环境变量

### 问题 3: 前端静态资源缓存

**症状**: 修改代码后,浏览器仍加载旧的 JS 文件

**原因**:
1. `app/page.tsx` 中硬编码了旧的 JS 文件名
2. Vite 每次构建生成不同的 hash
3. 浏览器缓存了旧的资源

**临时解决**:
```javascript
// next.config.mjs
export default {
  generateEtags: false,  // 禁用 ETag 以便快速测试
}
```

**长期解决**: 需要实现自动更新机制,避免硬编码文件名

---

## Next.js App Router 架构说明

### 目录结构
```
app/
├── api/                    # API Routes (服务端)
│   ├── ocr/
│   │   ├── upload/         # POST /api/ocr/upload
│   │   └── status/         # GET /api/ocr/status?uid=xxx
│   └── storage/
│       └── upload/         # POST /api/storage/upload
├── page.tsx                # 根页面 (/)
└── layout.tsx              # 根布局
```

### API Route 创建规则

每个文件夹对应一个路由:
```
app/api/ocr/status/route.ts  →  GET/POST /api/ocr/status
```

**文件命名**: 必须命名为 `route.ts`

**导出方法**:
```typescript
export async function GET(request: NextRequest) {
  return NextResponse.json({ ... });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ ... });
}
```

**动态配置**:
```typescript
// 禁用缓存,确保每次请求都执行
export const dynamic = 'force-dynamic';
```

---

## 环境变量配置

### Vercel 环境变量 (运行时)

在 Vercel Dashboard 中配置:
- `DOC2X_API_KEY` (必需) - Doc2X API 密钥
- `SUPABASE_URL` (可选) - Supabase 项目 URL
- `SUPABASE_SERVICE_ROLE_KEY` (可选) - Supabase 服务密钥
- `SUPABASE_BUCKET_NAME` (可选,默认: ocr-images) - Storage bucket 名称

### 构建时变量

在 `next.config.mjs` 中配置:
```javascript
env: {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  // 仅用于构建时验证,不影响运行时的变量
}
```

### 前端访问环境变量

只有以 `NEXT_PUBLIC_` 开头的变量才能在前端访问:
```javascript
// ✅ 前端可访问
const apiBase = import.meta.env.NEXT_PUBLIC_API_BASE_URL;

// ❌ 前端不可访问
const apiKey = import.meta.env.DOC2X_API_KEY;  // undefined
```

---

## 调试技巧

### 1. 使用测试脚本隔离问题

创建独立的测试脚本 (`scripts/debug/`):
```bash
#!/bin/bash
# 测试 Doc2X API
DOC2X_API_KEY="sk-xxx"
curl -X POST "https://v2.doc2x.noedgeai.com/api/v2/async/parse/img/layout" \
  -H "Authorization: Bearer $DOC2X_API_KEY" \
  --data-binary "@test.jpg"
```

### 2. 查看 Vercel 日志

```bash
# 使用 Vercel CLI
vercel logs --follow

# 或在 Vercel Dashboard 查看
Deployment → Functions → [function-name] → Logs
```

### 3. 本地测试 API

```bash
# 启动本地开发服务器
npm run dev

# 测试端点
curl http://localhost:3000/api/ocr/status?uid=xxx
```

### 4. 添加详细日志

```typescript
console.log('[API Name] Detailed info:', {
  url: request.url,
  params: Object.fromEntries(request.nextUrl.searchParams),
  timestamp: new Date().toISOString(),
});
```

---

## 常见错误及解决方案

### 404 错误

**可能原因**:
1. Framework Preset 错误
2. 路由文件不存在或命名错误
3. 路由文件导出方法不匹配 (GET/POST)

**排查步骤**:
```bash
# 检查构建输出
cat .next/server/app/api/ocr/status/route.ts

# 检查路由是否存在
ls app/api/ocr/status/route.ts
```

### 401/403 错误

**可能原因**:
1. API Key 无效或过期
2. 环境变量被 `next.config.mjs` 覆盖
3. API Key 权限不足

**排查步骤**:
```typescript
// 在 API route 中检查
console.log('API Key present:', !!process.env.DOC2X_API_KEY);
console.log('API Key length:', process.env.DOC2X_API_KEY?.length);
```

### 空响应问题

**可能原因**:
1. API 端点 URL 错误
2. API 返回非 JSON 格式
3. 网络超时

**排查步骤**:
```typescript
const response = await fetch(url);
const text = await response.text();
console.log('Response length:', text.length);
console.log('Response preview:', text.substring(0, 200));
```

---

## 项目架构总结

### 前端 (Vite + React)
- **位置**: `src/`
- **构建输出**: `public/assets/`
- **入口**: `src/main.tsx`

### 后端 (Next.js API Routes)
- **位置**: `app/api/`
- **运行环境**: Vercel Serverless Functions
- **路由模式**: App Router

### 部署架构
```
用户浏览器
    ↓
Vercel Edge Network
    ↓
Next.js App (app/page.tsx) → 前端静态文件
    ↓
Next.js API Routes (app/api/*/route.ts) → 后端逻辑
    ↓
外部 API (Doc2X, Supabase)
```

---

## 文件清理记录

### 已删除的废弃文件
- `app/api/ocr/check-status/` - 错误的状态查询端点
- `app/api/ocr/status-simple/` - 临时简化版本

### 测试脚本归档
移动到 `scripts/debug/`:
- `test-doc2x-endpoints.sh` - 测试不同的 API 端点
- `test-doc2x-immediate.sh` - 连续轮询测试
- `test-doc2x-key.sh` - API Key 验证
- `test-doc2x-response.sh` - 响应格式测试

### 保留的实用脚本
- `scripts/build-all.sh` - 完整构建流程
- `scripts/check-deployment.sh` - 部署检查

---

## 快速参考

### 修改 API 后部署
```bash
# 1. 提交代码
git add .
git commit -m "fix: 修复 XXX 问题"
git push

# 2. Vercel 自动部署
# 等待 GitHub 触发 Vercel 部署

# 3. 查看部署状态
vercel ls
vercel inspect [deployment-url]
```

### 查看 Vercel 环境变量
```bash
vercel env ls
```

### 本地测试完整流程
```bash
# 1. 构建前端
npm run build:frontend

# 2. 启动开发服务器
npm run dev

# 3. 测试 API
curl http://localhost:3000/api/ocr/upload
```

---

## 最后更新
- **日期**: 2026-01-09
- **主要内容**: Doc2X API 端点修复、Next.js 部署配置、环境变量管理
- **维护者**: Claude Sonnet 4.5 + RavenZ
