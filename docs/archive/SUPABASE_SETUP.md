# Supabase 配置指南

本文档详细说明如何从 Supabase 获取部署所需的配置信息。

## 步骤 1：登录 Supabase

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击右上角 **"Sign In"** 登录（或 **"Start your project"** 注册）
3. 登录后进入 Dashboard

## 步骤 2：选择或创建项目

### 如果已有项目：
- 在 Dashboard 中找到你的 Chat2Excel 项目
- 点击进入项目

### 如果需要创建新项目：
1. 点击 **"New Project"**
2. 填写项目信息：
   - **Name**: `chat2excel` (或其他名称)
   - **Database Password**: 设置一个强密码（请保存好！）
   - **Region**: 选择靠近你用户的区域（推荐：`Singapore` 或 `Tokyo`）
3. 点击 **"Create new project"**，等待项目创建完成（约 2-3 分钟）

## 步骤 3：获取 SUPABASE_URL

1. 在项目左侧菜单，点击 **Settings** (齿轮图标)
2. 选择 **API**
3. 在 **Project API keys** 部分，找到 **Project URL**
4. 复制这个 URL，格式如：
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
5. 这就是你的 `SUPABASE_URL`

## 步骤 4：获取 SUPABASE_SERVICE_ROLE_KEY

⚠️ **重要**：必须使用 `service_role` key，而不是 `anon` key！

1. 在同一页面（Settings → API）
2. 在 **Project API keys** 部分，找到 **`service_role` secret**
3. 点击右侧的眼睛图标👁️查看密钥
4. 点击 **"Copy"** 按钮
5. 这个密钥格式如：
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
   ```
6. 这就是你的 `SUPABASE_SERVICE_ROLE_KEY`

### 🔐 安全提示

**SERVICE_ROLE_KEY 的权限**：
- ✅ 可以绕过 Row Level Security (RLS)
- ✅ 拥有对数据库和 Storage 的完全访问权限
- ⚠️ **绝不能暴露给前端**
- ⚠️ **只能在服务器端使用**
- ⚠️ **不要提交到 Git**

**为什么不能用 ANON_KEY**：
- ❌ `anon` key 是给前端用的，权限受限
- ❌ 无法执行某些管理操作（如创建 Storage bucket）
- ✅ `service_role` key 拥有完整权限，适合后端使用

## 步骤 5：创建 Storage Bucket（可选）

如果你的 Supabase 项目还没有创建 Storage bucket：

1. 在项目左侧菜单，点击 **Storage**
2. 点击 **"Create a new bucket"**
3. 填写信息：
   - **Name**: `ocr-images` (或你想要的名字)
   - **Public bucket**: 打开开关（设置为公开）
4. 点击 **"Create bucket"**
5. 记下 bucket 名称，这就是 `SUPABASE_BUCKET_NAME`

### 配置 Bucket 权限（重要）

1. 在 Storage 页面，找到你创建的 bucket
2. 点击 bucket 名称进入
3. 点击 **"Policies"** 标签
4. 添加以下策略：

#### 公开读取策略
点击 **"New policy"** → **"Get started quickly"**：

**Policy Name**: `Public Read`

**Allowed Operation**: `SELECT`

**Target**: `Using custom logic`

```sql
-- 允许所有人公开读取
bucket_id = 'ocr-images'
```

点击 **"Review"** → **"Save policy"**

#### 上传策略（可选，用于测试）

如果你想让用户能够直接上传（不推荐，建议通过后端）：

**Policy Name**: `Authenticated Upload`

**Allowed Operation**: `INSERT`

**Target**: `Using custom logic`

```sql
-- 仅允许认证用户上传
bucket_id = 'ocr-images' AND auth.role() = 'authenticated'
```

## 步骤 6：验证配置

在本地创建一个测试文件验证配置是否正确：

```bash
# 创建测试文件
cat > test-supabase.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = '你的_SUPABASE_URL';
const supabaseKey = '你的_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试连接
async function testConnection() {
  try {
    // 测试数据库连接
    const { data, error } = await supabase
      .from('ocr_tasks')
      .select('count')
      .limit(1);

    if (error) throw error;

    console.log('✅ Supabase 连接成功！');

    // 测试 Storage 连接
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    if (bucketError) throw bucketError;

    console.log('✅ Storage 连接成功！');
    console.log('可用的 buckets:', buckets.map(b => b.name));

  } catch (error) {
    console.error('❌ 连接失败:', error.message);
  }
}

testConnection();
EOF

# 安装依赖（如果还没有）
npm install @supabase/supabase-js

# 运行测试
node test-supabase.js
```

如果看到 `✅ Supabase 连接成功！`，说明配置正确。

## 步骤 7：在 Vercel 配置环境变量

获取到配置后，在 Vercel 中配置：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

### 环境变量列表

| Key | Value | Environment |
|-----|-------|-------------|
| `SUPABASE_URL` | 你复制的 Project URL | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | 你复制的 service_role key | Production, Preview, Development |
| `SUPABASE_BUCKET_NAME` | `ocr-images` (或你的 bucket 名) | Production, Preview, Development |
| `DOC2X_API_KEY` | 你的 Doc2X API Key | Production, Preview, Development |
| `DOC2X_API_BASE_URL` | `https://v2.doc2x.noedgeai.com` | Production, Preview, Development |
| `ALLOWED_ORIGINS` | `https://chat2excel.vercel.app` (你的域名) | Production |
| `MAX_FILE_SIZE` | `7242880` (7MB) | All |
| `ALLOWED_FILE_TYPES` | `image/jpeg,image/png,image/webp,image/gif` | All |

5. 为每个变量选择环境（Production/Preview/Development）
6. 点击 **"Save"** 保存

## 步骤 8：重新部署

配置环境变量后，需要重新部署项目：

1. 在 Vercel Dashboard，进入 **Deployments**
2. 找到最新的部署
3. 点击 **"Redeploy"** 按钮
4. 或者推送新代码到 GitHub 触发自动部署

## 常见问题

### Q1: 找不到 service_role key？
**A**: 确保你在项目设置中（Project Settings → API），而不是组织设置。

### Q2: service_role key 显示为 "hidden"？
**A**: 点击右侧的眼睛图标👁️显示密钥。

### Q3: 没有 Storage 菜单？
**A**: 确保你的 Supabase 项目已启用 Storage 功能：
- 进入 **Project Settings** → **API**
- 在 **Features** 部分，确保 **Storage** 已启用

### Q4: 上传文件时提示权限不足？
**A**:
1. 确认使用的是 `service_role` key，不是 `anon` key
2. 检查 Storage bucket 的 Policies 配置
3. 确认后端 API 正确传递了 Authorization header

### Q5: 环境变量配置后仍然不工作？
**A**:
1. 确认在 Vercel 配置后重新部署了项目
2. 检查变量名是否正确（区分大小写）
3. 查看 Vercel 部署日志中的错误信息

## 下一步

配置完成后：

1. ✅ 测试后端 API：访问 `https://your-project.vercel.app/api/health`
2. ✅ 测试文件上传：在前端上传一张图片
3. ✅ 测试 OCR 识别：完成完整的识别流程
4. ✅ 测试数据库保存：检查 Supabase 中的 `ocr_tasks` 表

## 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [本项目部署文档](./VERCEL_DEPLOYMENT.md)

## 需要帮助？

如果遇到问题：

1. 查看 Supabase 的 [故障排除指南](https://supabase.com/docs/guides/troubleshooting)
2. 检查 Vercel 部署日志
3. 在项目 Issues 中提问
