# 快速开始：获取 Supabase 配置

## 🚀 3 步获取配置

### 步骤 1：登录 Supabase
访问：https://supabase.com/dashboard

### 步骤 2：进入项目设置
1. 选择你的项目
2. 点击左侧菜单 ⚙️ **Settings**
3. 点击 **API**

### 步骤 3：复制配置信息

在 API 设置页面，你会看到：

```
Project URL
┌─────────────────────────────────────────┐
│ https://xxxxxx.supabase.co             │ ← 复制这个 (SUPABASE_URL)
└─────────────────────────────────────────┘

Project API keys
┌─────────────────────────────────────────┐
│ anon public                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ service_role secret    [👁️] [📋]        │ ← 点击眼睛 👁️ 显示，然后复制 (SUPABASE_SERVICE_ROLE_KEY)
└─────────────────────────────────────────┘
```

## ⚠️ 重要提示

**SERVICE_ROLE vs ANON KEY**：

| 类型 | 使用场景 | 权限 | 是否可暴露给前端 |
|------|---------|------|----------------|
| `anon` | 前端直接访问 | 受限 | ✅ 是 |
| `service_role` | **后端服务器** | **完全权限** | ❌ **否** |

**本项目必须使用 `service_role`**，因为：
- 后端需要创建 Storage bucket
- 后端需要绕过 RLS 限制
- 前端不应该有任何 Supabase 密钥

## 📋 在 Vercel 配置

进入：Vercel Dashboard → 你的项目 → Settings → Environment Variables

添加以下变量：

```bash
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET_NAME=ocr-images
DOC2X_API_KEY=sk-your-doc2x-key
DOC2X_API_BASE_URL=https://v2.doc2x.noedgeai.com
ALLOWED_ORIGINS=https://chat2excel.vercel.app
MAX_FILE_SIZE=7242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif
```

## ✅ 验证配置

部署后，访问健康检查端点：

```bash
curl https://your-project.vercel.app/api/health
```

应该返回：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": 1704700800000,
    "checks": {
      "supabase": true,
      "doc2x": true
    }
  }
}
```

## 🎯 完成！

配置完成后，你的应用就可以：
- ✅ 上传图片到 Supabase Storage
- ✅ 保存 OCR 任务到数据库
- ✅ 查询和管理任务
- ✅ 完全的前后端分离

---

**详细文档**: 查看 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 获取更多细节。
