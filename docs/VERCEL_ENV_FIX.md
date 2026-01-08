# 🔴 紧急修复：403 错误解决方案

## 问题现象

同学访问网站时报错：
```
Failed to load resource: the server responded with a status of 403 ()
❌ 文件上传失败
❌ 没有权限访问 API
```

## 问题原因

**Vercel 环境变量未配置**，导致 Serverless Function 无法调用 Doc2X API。

---

## ✅ 立即修复步骤

### 步骤 1：打开 Vercel Dashboard

1. 访问 https://vercel.com/dashboard
2. 登录你的账号
3. 找到并点击项目 **chat2excel-full**

### 步骤 2：进入环境变量配置

1. 点击顶部标签 **Settings**
2. 在左侧菜单中找到并点击 **Environment Variables**

### 步骤 3：添加环境变量

点击 **Add New** 按钮，添加以下变量：

#### 变量 1: DOC2X_API_KEY
- **Name**: `DOC2X_API_KEY`
- **Value**: `sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq`
- **Environments**:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

#### 变量 2: DOC2X_API_BASE_URL（可选）
- **Name**: `DOC2X_API_BASE_URL`
- **Value**: `https://v2.doc2x.noedgeai.com`
- **Environments**:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**⚠️ 重要：必须勾选所有三个环境！**

### 步骤 4：重新部署

添加环境变量后，**必须重新部署**才能生效：

#### 方式 A：通过 Dashboard
1. 回到 **Deployments** 标签
2. 找到最新的部署记录
3. 点击右侧的 **...** 菜单
4. 选择 **Redeploy**

#### 方式 B：通过 CLI（如果你本地有 Vercel CLI）
```bash
vercel --prod
```

---

## 🔍 如何验证配置成功？

部署完成后，让同学再次访问网站并测试：

### 成功标志：
- ✅ 上传图片不再报 403 错误
- ✅ 能看到"正在识别中..."进度
- ✅ 识别完成后显示表格内容

### 失败标志：
- ❌ 仍然报 403 错误 → 环境变量未生效，需要重新部署
- ❌ 报其他错误 → 查看具体错误信息

---

## 🧪 测试步骤

1. **让同学刷新页面**（Ctrl+F5 或 Cmd+Shift+R）
2. **上传一张表格图片**
3. **查看浏览器控制台**（F12）：
   - ✅ 应该看到：`📤 开始上传文件`
   - ✅ 应该看到：`✅ 文件上传成功，uid: xxxxx`
   - ❌ 不应该看到：`Failed to load resource: 403`

---

## 📋 故障排查

### 问题 1：配置后仍然报 403

**可能原因**：部署没有使用最新的环境变量

**解决方案**：
1. 在 Vercel Dashboard → Deployments
2. 确认最新部署的时间是在配置环境变量**之后**
3. 如果不是，手动触发重新部署

### 问题 2：环境变量配置后丢失

**可能原因**：只勾选了部分环境

**解决方案**：
1. 重新编辑环境变量
2. 确保 **Production, Preview, Development** 全部勾选
3. 保存后重新部署

### 问题 3：本地开发正常，线上报错

**可能原因**：本地有 `.env` 文件，但 Vercel 没有配置

**解决方案**：
1. 本地的 `.env` 文件不会自动同步到 Vercel
2. 必须手动在 Dashboard 中配置
3. 参考上面的步骤配置

---

## 🔧 技术细节（供开发者参考）

### 代码中的使用位置

#### API Proxy ([api/proxy/parse/pdf.ts](api/proxy/parse/pdf.ts))
```typescript
const DOC2X_API_KEY = process.env.DOC2X_API_KEY;

// 调用 Doc2X API
await axios.post(
  `${DOC2X_API_BASE}/api/v2/async/parse/img/layout`,
  buffer,
  {
    headers: {
      'Authorization': `Bearer ${DOC2X_API_KEY}`,  // ← 这里需要 API Key
      'Content-Type': file.mimetype,
    }
  }
);
```

#### Status API ([api/proxy/parse/status.ts](api/proxy/parse/status.ts))
```typescript
const DOC2X_API_KEY = process.env.DOC2X_API_KEY;

await axios.get(
  `${DOC2X_API_BASE}/api/v2/parse/img/layout/status`,
  {
    params: { uid },
    headers: {
      'Authorization': `Bearer ${DOC2X_API_KEY}`,  // ← 这里也需要 API Key
    }
  }
);
```

### 环境变量命名规则

| 环境变量名 | 用途 | 位置 |
|-----------|------|------|
| `DOC2X_API_KEY` | Doc2X API 密钥 | 服务端（Serverless Functions） |
| `DOC2X_API_BASE_URL` | Doc2X API 地址 | 服务端（Serverless Functions） |
| `VITE_DOC2X_API_KEY` | ❌ 已废弃，不再使用 | 前端（已移除） |
| `VITE_DOC2X_PROXY_URL` | API 代理地址 | 前端（可选，默认 /api/proxy） |

---

## 📞 如果仍然无法解决

请提供以下信息：

1. ✅ Vercel Dashboard → Environment Variables 的截图
   - 确保 `DOC2X_API_KEY` 存在
   - 确保三个环境都勾选了

2. ✅ Vercel Dashboard → Deployments 的截图
   - 确认最新部署时间
   - 确认部署状态是 "Ready"

3. ✅ 浏览器控制台的完整错误信息
   - F12 → Console 标签
   - 从头到尾的所有日志

4. ✅ 访问的完整 URL
   - 是 https://yiruo.chat 吗？
   - 还是其他预览 URL？

---

**文档更新时间：** 2025-01-07
**问题状态：** 🔴 紧急 - 需要立即配置环境变量
