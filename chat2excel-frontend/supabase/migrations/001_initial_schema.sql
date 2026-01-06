-- ==============================================================================
-- 001_initial_schema.sql - Supabase 初始化数据库架构
-- ==============================================================================
--
-- 本迁移脚本创建 OCR 项目所需的数据库表和存储桶
-- 包括：
--   - ocr_tasks 表：存储 OCR 任务记录和解析结果
--   - ocr_items 表：存储 OCR 文本块（预留，未来使用）
--   - Storage 桶：用于存储上传的图片文件
--   - RLS 策略：公开访问权限（无认证模式）
--
-- ==============================================================================

-- 创建 ocr_tasks 表
CREATE TABLE IF NOT EXISTS ocr_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(255) UNIQUE NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  file_path VARCHAR(1000),
  file_url VARCHAR(1000),
  ocr_text TEXT NOT NULL,
  ocr_status VARCHAR(50) NOT NULL,
  ocr_duration INTEGER NOT NULL,
  ocr_error TEXT,
  parse_success BOOLEAN DEFAULT false,
  parse_confidence DECIMAL(5,4),
  mime_type VARCHAR(100),
  image_width INTEGER,
  image_height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建性能索引
CREATE INDEX IF NOT EXISTS idx_ocr_tasks_task_id ON ocr_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_ocr_tasks_created_at ON ocr_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ocr_tasks_status ON ocr_tasks(ocr_status);

-- 创建 ocr_items 表（可选，预留未来使用）
CREATE TABLE IF NOT EXISTS ocr_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ocr_task_id UUID NOT NULL REFERENCES ocr_tasks(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  bbox_x0 DECIMAL(10,2) NOT NULL,
  bbox_y0 DECIMAL(10,2) NOT NULL,
  bbox_x1 DECIMAL(10,2) NOT NULL,
  bbox_y1 DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocr_items_task_id ON ocr_items(ocr_task_id);

-- 启用行级安全（RLS）
ALTER TABLE ocr_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_items ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略（无认证模式）
DROP POLICY IF EXISTS "Allow public access to ocr_tasks" ON ocr_tasks;
CREATE POLICY "Allow public access to ocr_tasks"
  ON ocr_tasks FOR ALL TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to ocr_items" ON ocr_items;
CREATE POLICY "Allow public access to ocr_items"
  ON ocr_items FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ocr-images',
  'ocr-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- 创建存储访问策略
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'ocr-images');

DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'ocr-images');

DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
CREATE POLICY "Allow public deletes"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'ocr-images');

-- 添加注释
COMMENT ON TABLE ocr_tasks IS 'OCR 任务记录表，存储识别结果和文件信息';
COMMENT ON TABLE ocr_items IS 'OCR 文本块表（预留）';
COMMENT ON COLUMN ocr_tasks.task_id IS '前端生成的任务唯一标识';
COMMENT ON COLUMN ocr_tasks.ocr_text IS 'Doc2X API 返回的 HTML/Markdown 文本';
COMMENT ON COLUMN ocr_tasks.parse_success IS '表格解析是否成功';
COMMENT ON COLUMN ocr_tasks.parse_confidence IS '表格解析置信度 0.0000-1.0000';
