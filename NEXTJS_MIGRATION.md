# Next.js 迁移指南

## ✅ 已完成

1. **安装 Next.js**
   ```bash
   npm install next@latest
   ```

2. **创建配置文件**
   - `next.config.js` - Next.js 配置
   - `tsconfig.json` - 已更新，添加了 `@/*` 路径别名

3. **创建共享模块** (`lib/`)
   - `lib/supabase.ts` - Supabase 客户端
   - `lib/doc2x.ts` - Doc2X API 配置
   - `lib/errors.ts` - 自定义错误类
   - `lib/cors.ts` - CORS 工具函数

4. **迁移的 API endpoints**
   - ✅ `app/api/health/route.ts` - 健康检查
   - ✅ `app/api/tasks/route.ts` - 任务列表（GET）& 创建任务（POST）

## 🔨 待完成

### 1. 迁移剩余的 API endpoints

#### tasks/[id] (获取/更新/删除单个任务)
创建文件：`app/api/tasks/[id]/route.ts`

```typescript
// 从 api/tasks/[id].s 转换
// 主要变化：
// - 导入: import { supabase } from '@/lib/supabase'
// - 导入: import { corsHeaders } from '@/lib/cors'
// - 导入: import { ValidationError, NotFoundError } from '@/lib/errors'
// - 参数: 从 req.query.id 改为 params.id
// - 响应: 使用 NextResponse.json() + corsHeaders
```

#### tasks/exists (检查任务是否存在)
创建文件：`app/api/tasks/exists/route.ts`

#### storage/upload (上传图片)
创建文件：`app/api/storage/upload/route.ts`

**注意**: formidable 在 Next.js 中需要替换，使用 `formData()`

#### storage/delete (删除图片)
创建文件：`app/api/storage/delete/route.ts`

#### ocr/upload (上传到 Doc2X)
创建文件：`app/api/ocr/upload/route.ts`

#### ocr/status (查询 OCR 状态)
创建文件：`app/api/ocr/status/route.ts`

### 2. 更新 package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 3. 删除旧文件

```bash
# 删除旧的 API 目录
rm -rf api/

# 删除 vercel.json（Next.js 不需要）
rm vercel.json
```

### 4. 更新前端 API 调用

前端的 API 基础 URL 不需要改变，Next.js 会自动处理：
- 开发环境：`http://localhost:3000/api/*`
- 生产环境：`/api/*`（相对路径）

### 5. 环境变量

在 `.env.local` 中添加：
```env
# Next.js 会自动加载这些变量
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
DOC2X_API_KEY=...
DOC2X_API_BASE_URL=...
```

### 6. 部署到 Vercel

Next.js 会自动被 Vercel 识别，**不需要任何配置**！

只需：
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 完成！

## 📋 API 迁移模板

```typescript
// app/api/your-endpoint/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { supabase } from '@/lib/supabase';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const param = searchParams.get('param');

    // 业务逻辑...

    return NextResponse.json({
      success: true,
      data: result,
    }, { headers: corsHeaders(request) });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: error.message },
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 业务逻辑...

    return NextResponse.json({
      success: true,
      data: result,
    }, { headers: corsHeaders(request) });

  } catch (error) {
    // 错误处理...
  }
}

export const dynamic = 'force-dynamic';
```

## ⚠️ 重要提示

### formidable 替换

在 `storage/upload` 和 `ocr/upload` 中，formidable 需要替换：

```typescript
// 旧代码（Vercel Functions）
const form = formidable({...});
const [fields, files] = await form.parse(req);

// 新代码（Next.js）
const formData = await request.formData();
const file = formData.get('file') as File;
const buffer = Buffer.from(await file.arrayBuffer());
```

## 🎯 完成后的项目结构

```
chat2excel/
├── app/
│   └── api/
│       ├── health/
│       │   └── route.ts
│       ├── tasks/
│       │   ├── route.ts
│       │   ├── exists/
│       │   │   └── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── storage/
│       │   ├── upload/
│       │   │   └── route.ts
│       │   └── delete/
│       │       └── route.ts
│       └── ocr/
│           ├── upload/
│           │   └── route.ts
│           └── status/
│               └── route.ts
├── lib/
│   ├── supabase.ts
│   ├── doc2x.ts
│   ├── errors.ts
│   └── cors.ts
├── src/              # 前端代码（保持不变）
├── next.config.js
├── package.json
└── tsconfig.json
```

## 🚀 开始迁移

1. 使用上面的模板逐个迁移剩余的 API
2. 更新 package.json 的 scripts
3. 删除旧的 api/ 目录
4. 测试：`npm run dev`
5. 构建：`npm run build`
6. 部署到 Vercel

需要帮助迁移具体的 API 吗？告诉我你想从哪个开始！
