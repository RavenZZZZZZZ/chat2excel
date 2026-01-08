# 📊 Vercel 日志查看完整指南

## 方法 1：通过 Dashboard 查看 Functions 日志

### 步骤 1：打开项目
1. 访问 https://vercel.com/dashboard
2. 找到并点击项目 **chat2excel-full**

### 步骤 2：查看部署日志（推荐）

#### 方式 A：查看最新部署的实时日志
1. 点击顶部 **Deployments** 标签
2. 找到最新的部署（最上面一行）
3. 点击部署 ID 或查看详情
4. 找到 **Functions** 标签页
5. 你会看到所有 Serverless Functions 的列表：
   ```
   api/proxy/parse/pdf
   api/proxy/parse/status
   api/health
   ```
6. 点击 `api/proxy/parse/pdf` 查看日志

#### 方式 B：查看实时日志（Live Logs）
1. 在项目主页，点击 **Logs** 标签（可能在顶部或侧边）
2. 确保选择 **Realtime** 或 **Live** 模式
3. 让同学上传图片
4. 实时查看日志输出

---

## 方法 2：通过 Vercel CLI 查看（更详细）

### 安装 Vercel CLI（如果还没安装）
```bash
npm i -g vercel
```

### 登录
```bash
vercel login
```

### 查看实时日志
```bash
# 查看所有函数的实时日志
vercel logs

# 或者只查看特定函数
vercel logs --filter="api/proxy/parse/pdf"
```

### 查看过去的日志
```bash
# 查看最近 100 条日志
vercel logs -n 100

# 查看特定部署的日志
vercel logs <deployment-url>
```

---

## 方法 3：使用 vercel inspect 命令

### 查看特定部署的详细信息
```bash
# 获取最新部署的 URL
vercel ls

# 检查部署
vercel inspect https://chat2excel-full-xxx.vercel.app --logs
```

---

## 🔍 你应该看到的日志格式

### 正常请求的日志示例：
```json
{
  "message": "📥 收到请求: {...}",
  "level": "info",
  "timestamp": "2025-01-07T..."
}

{
  "message": "🔑 环境变量检查: {...}",
  "level": "info"
}

{
  "message": "📤 收到文件上传请求: {...}",
  "level": "info"
}

{
  "message": "✅ Doc2X 上传响应: {...}",
  "level": "info"
}
```

### 错误请求的日志示例：
```json
{
  "message": "❌ Doc2X API 调用失败: {...}",
  "level": "error",
  "error": {
    "status": 403,
    "statusText": "Forbidden"
  }
}
```

---

## 🎯 关键诊断信息

在日志中查找以下内容：

### 1. 检查 API Key 是否存在
```javascript
// 查找这行日志：
🔑 环境变量检查: {
  "hasApiKey": true,  // ← 如果是 false，说明环境变量问题
  "apiKeyPrefix": "sk-otgz...",
  "apiBase": "https://v2.doc2x.noedgeai.com"
}
```

### 2. 检查客户端 IP
```javascript
// 查找这行日志：
📥 收到请求: {
  "headers": {
    "x-forwarded-for": "x.x.x.x",  // ← 用户的真实 IP
    "x-vercel-forwarded-for": "x.x.x.x"
  }
}
```

### 3. 检查 Doc2X API 响应
```javascript
// 查找这行日志：
✅ Doc2X 上传响应: {
  "status": 200,  // ← 如果是 403，说明 Doc2X 限制
  "code": "success"
}

// 或者：
❌ Doc2X API 调用失败: {
  "status": 403,  // ← Doc2X 返回的 403
  "statusText": "Forbidden"
}
```

---

## 📱 如果找不到 Functions 标签

### 可能的原因：

1. **Vercel 界面更新了**
   - 尝试查找 **"Logs"**、**"Runtime Logs"** 或 **"Function Logs"**

2. **没有请求到达函数**
   - 让同学再次尝试上传图片
   - 确保请求真的发出了（查看浏览器 Network 标签）

3. **部署还在构建中**
   - 等待部署完成（状态显示 "Ready"）

---

## 🔧 替代方案：查看部署构建日志

如果找不到运行时日志，可以先看构建日志：

1. **Deployments** → 点击最新部署
2. 查看 **Build Logs**
3. 搜索关键词：
   - `DOC2X_API_KEY`
   - `api/proxy/parse/pdf`
   - `error`

---

## 📸 需要截图的内容

如果还是找不到，请截图以下内容：

1. ✅ Vercel 项目主页（显示项目名称）
2. ✅ Deployments 页面（显示最新部署）
3. ✅ 点击最新部署后的页面
4. ✅ 侧边栏的所有标签选项

---

## 🚨 快速测试方法

### 让同学同时测试，你观察日志：

1. 打开 Vercel Dashboard → 你的项目 → **Logs**
2. 让同学准备好上传图片
3. 你在浏览器中刷新日志页面
4. 让同学点击上传
5. 立即刷新日志，应该能看到新的日志条目

---

## 💡 提示

- **实时日志**：Vercel 的实时日志可能有几秒延迟
- **日志保留**：免费版只保留最近的日志
- **过滤日志**：使用搜索框过滤 `api/proxy/parse/pdf`
- **下载日志**：某些情况下可以下载完整日志文件

---

## 🎯 最简单的方法

如果以上都不行，最简单的方法是：

**使用 Vercel CLI：**
```bash
# 1. 安装并登录
npm i -g vercel
vercel login

# 2. 查看实时日志
vercel logs

# 3. 让同学上传图片，你观察控制台输出
```

这样你可以在本地终端实时看到所有日志。

---

**文档更新时间：** 2025-01-07
**适用版本：** Vercel CLI 50.x / Vercel Dashboard 最新版
