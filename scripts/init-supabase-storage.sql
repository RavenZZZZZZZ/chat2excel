-- ==============================================================================
-- Supabase Storage Bucket 初始化脚本
-- ==============================================================================
--
-- 用途：创建 Supabase Storage bucket 和必要的表结构
-- 执行位置：Supabase Dashboard → SQL Editor
--
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. 创建 Storage Bucket
-- ------------------------------------------------------------------------------

-- 创建 ocr-images bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('ocr-images', 'ocr-images', true)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. 创建数据库表
-- ------------------------------------------------------------------------------

-- 创建 ocr_tasks 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.ocr_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 任务基本信息
  task_id TEXT UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,

  -- 图片信息
  file_path TEXT,
  file_url TEXT,
  mime_type TEXT,
  image_width INTEGER,
  image_height INTEGER,

  -- OCR 结果
  ocr_text TEXT,
  ocr_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  ocr_duration INTEGER DEFAULT 0,
  ocr_error TEXT,

  -- 表格解析结果
  parse_success BOOLEAN DEFAULT false,
  parse_confidence FLOAT,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. 创建索引
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_ocr_tasks_task_id ON public.ocr_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_ocr_tasks_status ON public.ocr_tasks(ocr_status);
CREATE INDEX IF NOT EXISTS idx_ocr_tasks_created_at ON public.ocr_tasks(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. 启用 Row Level Security (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE public.ocr_tasks ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5. 创建 RLS 策略
-- ------------------------------------------------------------------------------

-- 允许所有操作（因为后端使用 service_role key，可以绕过 RLS）
CREATE POLICY "Allow all access for service_role"
ON public.ocr_tasks FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. 创建 Storage 策略
-- ------------------------------------------------------------------------------

-- 允许公开读取 bucket 内容
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ocr-images');

-- 允许 service_role 上传和删除
CREATE POLICY "Allow service_role upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'ocr-images');

CREATE POLICY "Allow service_role delete"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'ocr-images');

-- ------------------------------------------------------------------------------
-- 7. 创建自动更新 updated_at 的触发器
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ocr_tasks_updated_at
  BEFORE UPDATE ON public.ocr_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 8. 验证安装
-- ------------------------------------------------------------------------------

-- 查看创建的 bucket
SELECT id, name, public
FROM storage.buckets
WHERE id = 'ocr-images';

-- 查看表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ocr_tasks'
ORDER BY ordinal_position;

-- ------------------------------------------------------------------------------
-- 完成！
-- ------------------------------------------------------------------------------

-- 如果执行成功，你应该看到：
-- 1. ocr-images bucket 已创建
-- 2. ocr_tasks 表已创建，包含所有必要的字段
-- 3. 索引和 RLS 策略已配置
-- 4. 触发器已设置
