# Vercel 环境变量配置指南

## 问题诊断

当前 **500 Internal Server Error** 是因为 Vercel 环境变量未正确配置。

## 需要配置的环境变量

在 Vercel Dashboard 中配置以下环境变量:

### 1. Doc2X API (必需)
```
DOC2X_API_KEY=sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq
DOC2X_API_BASE_URL=https://v2.doc2x.noedgeai.com
```

### 2. Supabase (可选)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_BUCKET_NAME=ocr-images
```

## 配置步骤

### 方法 1: 通过 Vercel Dashboard (推荐)

1. 访问 https://vercel.com/ravencrest791s-projects/chat2excel-full/settings/environment-variables
2. 点击 "Add New"
3. 添加上述环境变量
4. 选择环境: Production, Preview, Development
5. 点击 "Save"
6. **重新部署**: 配置后必须重新部署才能生效!

### 方法 2: 通过 Vercel CLI

```bash
# 添加 DOC2X_API_KEY
vercel env add DOC2X_API_KEY production

# 添加其他变量
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 重新部署
vercel --prod
```

## 验证配置

### 1. 检查环境变量是否配置
访问: https://yiruoai.com/api/debug/env-check

预期响应:
```json
{
  "status": "ok",
  "environment": {
    "DOC2X_API_KEY": true,  // 必须是 true
    "DOC2X_API_KEY_PREFIX": "sk-otgzt9q...",
    "NODE_ENV": "production"
  }
}
```

### 2. 测试 OCR API
使用 Postman 或 curl 测试:

```bash
curl -X POST https://yiruoai.com/api/ocr/upload \
  -F "file=@test.jpg" \
  -H "Content-Type: multipart/form-data"
```

## 常见问题

### Q: 配置后还是 500 错误?
A: 必须重新部署才能生效。在 Vercel Dashboard 点击 "Redeploy" 或运行 `vercel --prod`

### Q: 如何查看实际环境变量值?
A: 访问 /api/debug/env-check 只显示是否配置,不显示真实值(安全考虑)

### Q: 本地正常,生产环境 500?
A: 检查 Vercel 环境变量,最常见原因是 `DOC2X_API_KEY` 未配置

## 下一步

1. ✅ 在 Vercel Dashboard 配置环境变量
2. ✅ 重新部署应用
3. ✅ 访问 /api/debug/env-check 验证配置
4. ✅ 测试上传图片功能

---

**当前状态**: 等待环境变量配置完成
