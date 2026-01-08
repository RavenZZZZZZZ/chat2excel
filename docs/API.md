# Chat2Excel API 文档

本文档描述了 Chat2Excel 项目的所有 API 端点。

## 基础信息

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **响应格式**: JSON

## 目录

- [健康检查](#健康检查)
- [任务管理](#任务管理)
- [文件存储](#文件存储)
- [OCR 识别](#ocr-识别)

---

## 健康检查

### GET /api/health

检查 API 服务状态。

**请求示例**:

```bash
curl https://your-domain.vercel.app/api/health
```

**响应示例**:

```json
{
  "status": "ok",
  "timestamp": "2025-01-08T12:00:00Z",
  "service": "chat2excel-api"
}
```

**状态码**:
- `200 OK` - 服务正常

---

## 任务管理

### GET /api/tasks

获取任务列表，支持分页。

**查询参数**:

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| limit | number | 否 | 10 | 每页数量 |
| status | string | 否 | - | 过滤状态 (pending/processing/completed/failed) |

**请求示例**:

```bash
curl "https://your-domain.vercel.app/api/tasks?page=1&limit=10&status=completed"
```

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "image_url": "https://...",
      "status": "completed",
      "excel_url": "https://...",
      "created_at": "2025-01-08T12:00:00Z",
      "updated_at": "2025-01-08T12:05:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**状态码**:
- `200 OK` - 成功获取
- `500 Internal Server Error` - 服务器错误

---

### POST /api/tasks

创建新任务。

**请求体**:

```json
{
  "image_url": "https://example.com/table.png",
  "status": "pending"
}
```

**请求示例**:

```bash
curl -X POST https://your-domain.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/table.png",
    "status": "pending"
  }'
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "image_url": "https://example.com/table.png",
    "status": "pending",
    "created_at": "2025-01-08T12:00:00Z",
    "updated_at": "2025-01-08T12:00:00Z"
  }
}
```

**状态码**:
- `201 Created` - 创建成功
- `400 Bad Request` - 请求参数错误
- `500 Internal Server Error` - 服务器错误

---

### GET /api/tasks/[id]

获取单个任务详情。

**路径参数**:

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| id | string | 是 | 任务 UUID |

**请求示例**:

```bash
curl https://your-domain.vercel.app/api/tasks/uuid-here
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "image_url": "https://...",
    "status": "completed",
    "excel_url": "https://...",
    "created_at": "2025-01-08T12:00:00Z",
    "updated_at": "2025-01-08T12:05:00Z"
  }
}
```

**状态码**:
- `200 OK` - 成功获取
- `404 Not Found` - 任务不存在
- `500 Internal Server Error` - 服务器错误

---

### PUT /api/tasks/[id]

更新任务状态或 Excel URL。

**路径参数**:

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| id | string | 是 | 任务 UUID |

**请求体**:

```json
{
  "status": "completed",
  "excel_url": "https://example.com/result.xlsx"
}
```

**请求示例**:

```bash
curl -X PUT https://your-domain.vercel.app/api/tasks/uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "excel_url": "https://example.com/result.xlsx"
  }'
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "image_url": "https://...",
    "status": "completed",
    "excel_url": "https://example.com/result.xlsx",
    "created_at": "2025-01-08T12:00:00Z",
    "updated_at": "2025-01-08T12:05:00Z"
  }
}
```

**状态码**:
- `200 OK` - 更新成功
- `404 Not Found` - 任务不存在
- `400 Bad Request` - 请求参数错误
- `500 Internal Server Error` - 服务器错误

---

### DELETE /api/tasks/[id]

删除任务。

**路径参数**:

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| id | string | 是 | 任务 UUID |

**请求示例**:

```bash
curl -X DELETE https://your-domain.vercel.app/api/tasks/uuid-here
```

**响应示例**:

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**状态码**:
- `200 OK` - 删除成功
- `404 Not Found` - 任务不存在
- `500 Internal Server Error` - 服务器错误

---

### GET /api/tasks/exists

检查任务是否存在。

**查询参数**:

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| id | string | 是 | 任务 UUID |

**请求示例**:

```bash
curl "https://your-domain.vercel.app/api/tasks/exists?id=uuid-here"
```

**响应示例**:

```json
{
  "exists": true
}
```

**状态码**:
- `200 OK` - 检查完成
- `400 Bad Request` - 缺少 id 参数

---

## 文件存储

### POST /api/storage/upload

上传文件到 Supabase Storage。

**请求类型**: `multipart/form-data`

**表单字段**:

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| file | File | 是 | 图片文件 (JPEG/PNG/WEBP/GIF) |

**限制**:
- 最大文件大小: 7MB
- 允许的类型: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**请求示例**:

```bash
curl -X POST https://your-domain.vercel.app/api/storage/upload \
  -F "file=@table.png"
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "path": "uploads/uuid-filename.png",
    "url": "https://supabase.storage.url/...",
    "size": 12345
  }
}
```

**状态码**:
- `200 OK` - 上传成功
- `400 Bad Request` - 没有文件或文件类型不支持
- `500 Internal Server Error` - 上传失败

---

### DELETE /api/storage/delete

从 Supabase Storage 删除文件。

**查询参数**:

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| path | string | 是 | 文件路径 |

**请求示例**:

```bash curl -X DELETE "https://your-domain.vercel.app/api/storage/delete?path=uploads/uuid-filename.png"
```

**响应示例**:

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**状态码**:
- `200 OK` - 删除成功
- `400 Bad Request` - 缺少 path 参数
- `500 Internal Server Error` - 删除失败

---

## OCR 识别

### POST /api/ocr/upload

上传图片到 Doc2X API 进行识别。

**请求类型**: `multipart/form-data`

**表单字段**:

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| file | File | 是 | 图片文件 |

**限制**:
- 最大文件大小: 7MB
- 允许的类型: `image/jpeg`, `image/png`, `image/webp`, `image/gif`

**请求示例**:

```bash
curl -X POST https://your-domain.vercel.app/api/ocr/upload \
  -F "file=@table.png"
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "uid": "doc2x-uuid",
    "status": "processing"
  }
}
```

**状态码**:
- `200 OK` - 上传成功
- `400 Bad Request` - 没有文件
- `500 Internal Server Error` - Doc2X API 错误

---

### GET /api/ocr/status

查询 OCR 处理状态。

**查询参数**:

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| uid | string | 是 | Doc2X 任务 UID |

**请求示例**:

```bash
curl "https://your-domain.vercel.app/api/ocr/status?uid=doc2x-uuid"
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "uid": "doc2x-uuid",
    "status": "succeeded",
    "result": {
      "excel_url": "https://doc2x.result.url/...",
      "sheets": 1
    }
  }
}
```

**状态值**:
- `processing` - 处理中
- `succeeded` - 成功
- `failed` - 失败

**状态码**:
- `200 OK` - 查询成功
- `400 Bad Request` - 缺少 uid 参数
- `500 Internal Server Error` - Doc2X API 错误

---

## 错误响应格式

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message description"
  }
}
```

**常见错误码**:

| 错误码 | HTTP 状态 | 描述 |
|--------|----------|------|
| VALIDATION_ERROR | 400 | 请求参数验证失败 |
| NOT_FOUND | 404 | 资源不存在 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
| SUPABASE_ERROR | 500 | Supabase 操作失败 |
| DOC2X_ERROR | 500 | Doc2X API 失败 |

---

## CORS 配置

API 支持跨域请求，配置如下：

**允许的来源**:
- 生产环境: 从环境变量 `ALLOWED_ORIGINS` 读取
- 开发环境: `http://localhost:5173`

**允许的方法**:
- GET, POST, PUT, DELETE, OPTIONS

**允许的头部**:
- Content-Type, Authorization

---

## 速率限制

目前没有实施速率限制，但建议在生产环境中添加：
- 每个用户每分钟最多 60 次请求
- 文件上传每分钟最多 10 次

---

## 使用示例

### 完整工作流程

```bash
# 1. 上传图片到 Supabase
curl -X POST https://your-domain.vercel.app/api/storage/upload \
  -F "file=@table.png" \
  | jq

# 响应: { "success": true, "data": { "url": "https://...", "path": "..." } }

# 2. 创建任务
curl -X POST https://your-domain.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://supabase.storage.url/...",
    "status": "pending"
  }' \
  | jq

# 响应: { "success": true, "data": { "id": "uuid", ... } }

# 3. 上传到 Doc2X 进行识别
curl -X POST https://your-domain.vercel.app/api/ocr/upload \
  -F "file=@table.png" \
  | jq

# 响应: { "success": true, "data": { "uid": "doc2x-uuid" } }

# 4. 轮询检查 OCR 状态
curl "https://your-domain.vercel.app/api/ocr/status?uid=doc2x-uuid" | jq

# 响应: { "success": true, "data": { "status": "succeeded", "result": {...} } }

# 5. 更新任务状态
curl -X PUT https://your-domain.vercel.app/api/tasks/uuid \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "excel_url": "https://doc2x.result.url/..."
  }' | jq

# 6. 获取任务列表
curl "https://your-domain.vercel.app/api/tasks?page=1&limit=10" | jq
```

---

## 技术细节

### Next.js API Routes

所有 API 使用 Next.js 16 App Router 实现：
- 文件位置: `app/api/*/route.ts`
- 动态路由: `app/api/tasks/[id]/route.ts`
- 配置: `export const dynamic = 'force-dynamic'`

### 数据库

- **表名**: `tasks`
- **连接**: Supabase Client
- **库文件**: [lib/supabase.ts](../lib/supabase.ts)

### 外部 API

- **Doc2X**: 表格识别服务
- **配置**: [lib/doc2x.ts](../lib/doc2x.ts)

---

## 更新日志

- **2025-01-08**: 迁移到 Next.js API Routes
- **初始版本**: Vercel Serverless Functions

---

## 支持

如有问题，请查看：
- [故障排查](./VERCEL_LOGS_GUIDE.md)
- [环境变量配置](./VERCEL_ENV_SETUP.md)
- [提交 Issue](https://github.com/RavenZZZZZZZ/chat2excel/issues)
