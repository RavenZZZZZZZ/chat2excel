# Chat2Excel 数据库表结构设计

**项目**: Chat2Excel - 表格OCR识别
**数据库**: Supabase (PostgreSQL)
**日期**: 2026-01-03

---

## 📊 数据库表设计

### 1. 用户表 (使用 Supabase Auth)

**表名**: `auth.users` (Supabase 自动管理)

不需要手动创建，使用 Supabase Auth 服务：
- 用户注册/登录
- 邮箱验证
- 密码重置
- 第三方登录（Google, GitHub 等）

**用户配置表** (可选):
```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2. 图片上传记录表

**表名**: `image_uploads`

```sql
CREATE TABLE public.image_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 图片信息
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL,           -- Supabase Storage 路径
  file_url TEXT NOT NULL,            -- 完整访问 URL
  mime_type TEXT NOT NULL,

  -- OCR 任务关联
  ocr_task_id UUID REFERENCES ocr_tasks(id) ON DELETE SET NULL,

  -- 元数据
  width INTEGER,
  height INTEGER,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_image_uploads_user_id ON public.image_uploads(user_id);
CREATE INDEX idx_image_uploads_ocr_task_id ON public.image_uploads(ocr_task_id);
CREATE INDEX idx_image_uploads_created_at ON public.image_uploads(created_at DESC);
```

---

### 3. OCR 任务表

**表名**: `ocr_tasks`

```sql
CREATE TABLE public.ocr_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 任务信息
  status TEXT NOT NULL DEFAULT 'pending',
  -- 状态: pending, processing, completed, failed

  -- 任务配置
  language TEXT DEFAULT 'chi_sim+eng',  -- 识别语言
  output_format TEXT DEFAULT 'xlsx',     -- 输出格式: xlsx, csv, json

  -- 进度
  progress INTEGER DEFAULT 0,            -- 0-100
  error_message TEXT,

  -- 统计
  total_images INTEGER DEFAULT 0,
  processed_images INTEGER DEFAULT 0,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 索引
CREATE INDEX idx_ocr_tasks_user_id ON public.ocr_tasks(user_id);
CREATE INDEX idx_ocr_tasks_status ON public.ocr_tasks(status);
CREATE INDEX idx_ocr_tasks_created_at ON public.ocr_tasks(created_at DESC);
```

---

### 4. OCR 识别结果表

**表名**: `ocr_results`

```sql
CREATE TABLE public.ocr_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES ocr_tasks(id) ON DELETE CASCADE,
  image_upload_id UUID REFERENCES image_uploads(id) ON DELETE CASCADE,

  -- 识别结果
  raw_text TEXT,                        -- 原始识别文本
  structured_data JSONB,                -- 结构化数据（表格）
  confidence FLOAT,                     -- 置信度 0-1

  -- 表格信息
  table_data JSONB,                     -- 表格数据
  rows INTEGER,
  columns INTEGER,

  -- 调试信息
  processing_time_ms INTEGER,
  engine_version TEXT,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_ocr_results_task_id ON public.ocr_results(task_id);
CREATE INDEX idx_ocr_results_image_upload_id ON public.ocr_results(image_upload_id);
```

---

### 5. 导出记录表

**表名**: `export_records`

```sql
CREATE TABLE public.export_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES ocr_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 导出信息
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,              -- Supabase Storage 路径
  file_url TEXT NOT NULL,
  file_format TEXT NOT NULL,            -- xlsx, csv, json
  file_size BIGINT,

  -- 下载统计
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,

  -- 过期时间（免费套餐存储有限，可设置自动删除）
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_export_records_task_id ON public.export_records(task_id);
CREATE INDEX idx_export_records_user_id ON public.export_records(user_id);
CREATE INDEX idx_export_records_expires_at ON public.export_records(expires_at);
```

---

## 📁 Storage Buckets

### 1. uploads (上传的图片)

```sql
-- 创建 bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false);

-- 存储策略：允许认证用户上传
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- 存储策略：用户只能访问自己的文件
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[0]);

-- 存储策略：用户可以删除自己的文件
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[0]);
```

**文件路径规则**:
```
uploads/
  └── {user_id}/
      ├── {image_id}/original.jpg
      ├── {image_id}/thumbnail.jpg
      └── ...
```

### 2. exports (导出的文件)

```sql
-- 创建 bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false);

-- 类似的 RLS 策略
CREATE POLICY "Authenticated users can download exports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[0]);
```

**文件路径规则**:
```
exports/
  └── {user_id}/
      └── {task_id}/
          └── result.xlsx
```

---

## 🔐 Row Level Security (RLS) 策略

### 启用 RLS
```sql
-- 对所有表启用 RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_records ENABLE ROW LEVEL SECURITY;
```

### RLS 策略示例

#### image_uploads 表
```sql
-- 用户只能查看自己的图片
CREATE POLICY "Users can view own uploads"
ON public.image_uploads FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 用户可以上传图片
CREATE POLICY "Users can create uploads"
ON public.image_uploads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的图片
CREATE POLICY "Users can delete own uploads"
ON public.image_uploads FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 用户可以更新自己的图片
CREATE POLICY "Users can update own uploads"
ON public.image_uploads FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

#### ocr_tasks 表
```sql
CREATE POLICY "Users can manage own tasks"
ON public.ocr_tasks FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## 📊 数据库视图

### 活跃任务统计视图
```sql
CREATE OR REPLACE VIEW public.active_tasks_stats AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE status = 'processing') AS processing_count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_count
FROM public.ocr_tasks
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id;
```

---

## 🔄 触发器

### 自动更新 updated_at 字段
```sql
-- 创建函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为各表添加触发器
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_image_uploads_updated_at
  BEFORE UPDATE ON public.image_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ocr_tasks_updated_at
  BEFORE UPDATE ON public.ocr_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 📝 初始 SQL 脚本

完整的数据库初始化脚本：[DATABASE_SCHEMA_DESIGN.md](./DATABASE_SCHEMA_DESIGN.md)

---

## 🎯 下一步

1. 在 Supabase Dashboard SQL Editor 中执行上述 SQL
2. 配置 Storage Buckets 和 RLS 策略
3. 安装 Supabase CLI 并生成类型定义
4. 实现前端 API 调用

---

**创建日期**: 2026-01-03
**状态**: 设计完成，待实施 ⏳
