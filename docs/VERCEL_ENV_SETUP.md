# Vercel 环境变量配置指南

## 问题说明

朋友访问网站时报错"没有权限使用 API"，是因为 Vercel 环境变量未正确配置。

## 解决方案

### 1. 在 Vercel Dashboard 配置环境变量

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 `chat2excel-full`
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

| 名称 | 值 | 环境 |
|------|-----|------|
| `DOC2X_API_KEY` | `sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq` | Production, Preview, Development |
| `DOC2X_API_BASE_URL` | `https://v2.doc2x.noedgeai.com` | Production, Preview, Development (可选) |

**重要**：确保所有三个环境（Production, Preview, Development）都配置了这些变量！

### 2. 重新部署项目

配置环境变量后，需要重新部署项目：

```bash
# 方式1：通过 CLI 重新部署
vercel --prod

# 方式2：在 Vercel Dashboard 点击 "Redeploy"
```

### 3. 验证配置

部署完成后，访问你的网站并测试：

1. 打开浏览器开发者工具（F12）
2. 上传一张图片测试 OCR 功能
3. 查看网络请求，确保调用的是 `/api/proxy/parse/pdf`
4. 检查控制台是否有错误

## 架构说明

### 修复前（有问题）
```
用户浏览器 → 直接调用 Doc2X API（需要暴露 API Key）
```

### 修复后（正确）
```
用户浏览器 → Vercel API Proxy (/api/proxy) → Doc2X API
                              ↑
                         API Key 在这里
```

## 代码改动

### 1. 修改了 `src/config/doc2x.config.ts`
- 移除了前端对 `VITE_DOC2X_API_KEY` 的依赖
- API Key 现在只在服务端使用
- 前端只需要知道 `/api/proxy` 的地址

### 2. 清理了 `.env.local`
- 移除了 `VITE_DOC2X_API_KEY`（前端不需要）
- 保留了 `DOC2X_API_KEY`（服务端需要）

## 安全提示

✅ **正确做法**：API Key 存储在 Vercel 环境变量，只在服务端使用
❌ **错误做法**：API Key 存储在前端环境变量（VITE_*），会暴露给所有用户

## 故障排查

### 问题：朋友访问仍然报错

1. **检查环境变量是否生效**
   ```bash
   vercel env ls
   ```

2. **查看 Vercel 函数日志**
   - 访问 Vercel Dashboard → 你的项目 → Functions
   - 查找 `/api/proxy/parse/pdf` 的日志
   - 确认是否成功读取到 `DOC2X_API_KEY`

3. **测试 API 端点**
   ```bash
   curl -X POST https://你的域名.com/api/proxy/parse/pdf \
     -F "file=@test.jpg" \
     -H "Content-Type: multipart/form-data"
   ```

### 问题：本地开发失败

本地开发时，确保 `.env` 文件包含：
```env
DOC2X_API_KEY=sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq
```

## 下一步

1. ✅ 在 Vercel 配置环境变量
2. ✅ 重新部署项目
3. ✅ 测试朋友访问是否正常
4. ✅ 监控 Vercel 函数日志
