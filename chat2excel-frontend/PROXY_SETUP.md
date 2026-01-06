# Doc2X 代理服务器设置说明

## 为什么要使用代理服务器？

Doc2X API 不支持从浏览器直接调用，原因有两个：

1. **CORS（跨域资源共享）限制**：浏览器会阻止跨域请求以保护用户安全
2. **API Key 安全**：API Key 不应该暴露在前端代码中

## 解决方案

我们创建了一个本地代理服务器来中转请求。

## 启动方法

### 1. 启动代理服务器

```bash
# 在 chat2excel-frontend 目录下
node proxy-server.js
```

代理服务器将在 `http://localhost:3001` 启动。

### 2. 启动前端开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:5175` 启动。

## 工作流程

```
浏览器 ──> 前端 (localhost:5175) ──> 代理服务器 (localhost:3001) ──> Doc2X API
         │                                                           │
         └───────────────────────────────────────────────────────────┘
                              返回识别结果
```

## 代理服务器功能

- ✅ 解决 CORS 问题
- ✅ 保护 API Key（存储在服务器端）
- ✅ 转发上传请求到 Doc2X API
- ✅ 转发状态查询请求到 Doc2X API
- ✅ 返回识别结果给前端

## 配置说明

### 环境变量（可选）

可以在 `.env.local` 中设置：

```bash
# Doc2X API Key（默认已在 proxy-server.js 中配置）
VITE_DOC2X_API_KEY=sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq

# 代理服务器地址（默认）
VITE_DOC2X_PROXY_URL=http://localhost:3001/api/proxy

# 请求超时时间（毫秒，默认 60000）
VITE_DOC2X_TIMEOUT=60000
```

### API 端点

代理服务器提供以下端点：

1. **健康检查**
   ```
   GET http://localhost:3001/health
   ```

2. **上传文件**
   ```
   POST http://localhost:3001/api/proxy/parse/pdf
   Content-Type: multipart/form-data
   ```

3. **查询状态**
   ```
   GET http://localhost:3001/api/proxy/parse/status?uid=xxx
   ```

## 故障排除

### 问题 1：代理服务器无法启动

**错误**：`Error: Cannot find module 'express'`

**解决**：安装依赖
```bash
npm install express cors multer
```

### 问题 2：前端仍然报 CORS 错误

**检查**：
1. 确认代理服务器正在运行：`curl http://localhost:3001/health`
2. 检查前端配置文件 `src/config/doc2x.config.ts` 中的 baseURL 是否指向代理服务器

### 问题 3：识别失败

**检查**：
1. 查看代理服务器控制台日志
2. 查看 Doc2X API Key 是否有效
3. 查看网络连接是否正常

## 停止服务器

```bash
# 停止代理服务器
# 在运行代理服务器的终端按 Ctrl+C

# 或者查找并杀掉进程
lsof -ti:3001 | xargs kill -9
```

## 安全提示

⚠️ **重要**：
- 代理服务器仅用于开发环境
- 生产环境中应该部署到服务器，并使用环境变量管理 API Key
- 不要将 API Key 提交到版本控制系统
