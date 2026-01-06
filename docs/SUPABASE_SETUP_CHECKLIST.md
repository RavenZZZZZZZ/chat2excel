# Supabase 数据库设置前置任务清单

**项目**: Chat2Excel - 表格OCR识别
**数据库**: Supabase (PostgreSQL + 实时订阅 + 身份验证)
**日期**: 2026-01-03

---

## 📋 注册与账号设置

### 任务 1: 注册 Supabase 账号

**步骤**:
1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 选择注册方式：
   - ✅ 推荐：使用 GitHub 账号登录（便于后续 CI/CD 集成）
   - 或者使用邮箱注册

**需要的信息**:
- GitHub 账号或邮箱地址
- 密码

**完成后提供**:
- ✅ Supabase 项目 URL（格式：`https://xxxxxxxx.supabase.co`）
- ✅ `anon` public key（公开密钥）
- ✅ `service_role` key（服务端密钥，**保密！**）

---

## 🏗️ 任务 2: 创建项目

### 步骤：
1. 登录后点击 "New Project"
2. 填写项目信息：
   - **Name**: `chat2excel` 或 `chat2excel-db`
   - **Database Password**: ⚠️ **请生成强密码并保存**，以后无法查看
   - **Region**: 选择距离用户最近的区域
     - 中国用户推荐：`Singapore (ap-southeast-1)`
     - 或 `Tokyo (ap-northeast-1)`
   - **Pricing Plan**: 选择 `Free`（免费套餐）

### 免费套餐限制：
- 500 MB 数据库存储
- 1 GB 文件存储（适合存储上传的图片）
- 50 MB 每月出站流量
- 2 个并发请求
- 50,000 每月活跃用户

**完成后提供**:
- ✅ 项目创建确认
- ✅ 数据库密码（用于后续本地开发连接）

---

## 🔑 任务 3: 获取 API 密钥

### 步骤：
1. 进入项目 Dashboard
2. 左侧菜单点击 `Settings` → `API`
3. 复制以下信息：

**需要复制**:
```
Project URL: https://xxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 重要提示**:
- `anon` key: 可以在前端使用（有 RLS 限制）
- `service_role` key: **仅在服务端使用**，绕过所有安全限制
- 不要将 `service_role` key 提交到 Git 仓库！

---

## 🗄️ 任务 4: 确认数据库信息

在 `Settings` → `Database` 页面确认：

**连接信息**:
```
Host: db.xxxxxx.supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: <你设置的密码>
Connection string: postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:5432/postgres
```

**完成后提供**:
- ✅ 数据库连接字符串（可选，用于本地开发工具）

---

## 📧 任务 5: 配置电子邮件（可选但推荐）

### 用途：
- 用户注册验证
- 密码重置
- 通知邮件

### 步骤：
1. 进入 `Settings` → `Authentication`
2. 在 `Site URL` 填入：`http://localhost:5173`（开发环境）
3. 配置 SMTP（可选）：
   - 免费套餐使用 Supabase 默认邮件服务
   - 每小时限制：3 封邮件/小时
   - 生产环境建议配置自定义 SMTP（如 Sendgrid, AWS SES）

**临时方案**：
- 开发阶段可以禁用邮件验证
- 使用开发者模式接受任意邮箱

---

## 🎯 任务 6: 安装本地开发工具（可选）

### 选项 A: Supabase CLI（推荐用于本地开发）

```bash
# macOS
brew install supabase/tap/supabase

# 或使用 npm
npm install -g supabase
```

**优点**：
- 本地运行数据库
- 离线开发
- 快速迭代

### 选项 B: 直接使用云端数据库

**优点**：
- 无需安装
- 团队协作方便
- 数据实时同步

---

## 📝 任务 7: 准备环境变量文件

### 创建 `.env.local` 文件

在前端项目根目录创建 `.env.local` 文件：

```env
# Supabase 配置
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 可选：服务端配置（如果使用 Next.js 等服务端框架）
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 更新 `.gitignore`

确保 `.gitignore` 包含：
```gitignore
# 环境变量
.env.local
.env.*.local

# Supabase
.supabase
```

---

## 🏁 完成确认清单

请完成以下任务并提供信息：

- [ ] **任务 1**: 注册 Supabase 账号
  - 账号邮箱/GitHub: _________________

- [ ] **任务 2**: 创建项目 `chat2excel`
  - 项目 URL: `https://______.supabase.co`
  - 数据库区域: _________________

- [ ] **任务 3**: 获取 API 密钥
  - `anon` key: `eyJhbGc...`（前20个字符即可）
  - `service_role` key: `eyJhbGc...`（前20个字符即可）

- [ ] **任务 4**: 确认数据库信息
  - Host: `db.______.supabase.co`
  - Database name: `postgres` / `______`
  - Port: `5432`

- [ ] **任务 5**: 配置邮件（可选）
  - 是否配置邮件：是 / 否
  - Site URL: _________________

- [ ] **任务 6**: 安装本地工具（可选）
  - 是否安装 Supabase CLI：是 / 否

- [ ] **任务 7**: 创建环境变量文件
  - `.env.local` 文件：已创建 / 待创建

---

## 🚀 下一步计划

完成上述任务后，我将帮你：

1. **安装 Supabase 客户端库**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **配置 Supabase 客户端**
   - 创建 `src/lib/supabase.ts`
   - 配置类型定义

3. **设计数据库表结构**
   ```sql
   -- 用户表（使用 Supabase Auth）
   -- 图片上传记录表
   -- OCR 识别任务表
   -- 识别结果表
   ```

4. **配置 Row Level Security (RLS)**
   - 用户只能访问自己的数据
   - 匿名用户限制

5. **创建 Storage Buckets**
   - `uploads` - 存储用户上传的图片
   - 配置访问策略

6. **实现后端 API**
   - 文件上传接口
   - OCR 任务创建
   - 结果查询

---

## 📚 参考资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage 配置指南](https://supabase.com/docs/guides/storage)

---

## ⚠️ 安全提示

1. **永远不要**将 `service_role` key 暴露在前端代码
2. **永远不要**将 `.env.local` 提交到 Git
3. **使用** Row Level Security (RLS) 保护数据
4. **验证**所有用户输入
5. **限制**匿名用户的操作权限

---

**创建日期**: 2026-01-03
**准备就绪**: 等待完成注册任务 ⏳
