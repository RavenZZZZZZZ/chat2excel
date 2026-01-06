-- ==============================================================================
-- Supabase Storage 策略配置脚本
-- ==============================================================================
--
-- 用途：允许匿名用户和已认证用户上传文件到 uploads bucket
--
-- 使用方法：
-- 1. 访问 Supabase Dashboard: https://supabase.com/dashboard/project/hlurjwzhsmieikygrlrs/sql
-- 2. 点击 "New Query"
-- 3. 复制并粘贴以下 SQL
-- 4. 点击 "Run" 执行
--
-- ==============================================================================

-- 1. 允许所有人上传（INSERT）到 uploads bucket
-- 这个策略允许匿名用户和已登录用户上传文件
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'uploads');

-- 2. 允许所有人查看/下载（SELECT）uploads bucket 中的文件
-- 这个策略允许任何人访问公开的文件
CREATE POLICY "Allow public select"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'uploads');

-- 3. 允许所有人更新（UPDATE）uploads bucket 中的文件
-- 这个策略允许用户更新自己的文件（如果需要的话）
CREATE POLICY "Allow public update"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- 4. 允许所有人删除（DELETE）uploads bucket 中的文件
-- 这个策略允许用户删除文件（如果需要的话）
CREATE POLICY "Allow public delete"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'uploads');

-- ==============================================================================
-- 验证策略是否创建成功
-- ==============================================================================

-- 查看所有 Storage 策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;

-- ==============================================================================
-- 如果策略已存在，可以先删除再创建
-- ==============================================================================

-- 取消注释以下语句来删除已存在的策略：
-- DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- ==============================================================================
-- 说明
-- ==============================================================================
--
-- TO anon, authenticated:
--   - anon: 匿名用户（未登录）
--   - authenticated: 已登录用户
--   - 两者都包含表示允许所有用户
--
-- USING (bucket_id = 'uploads'):
--   - 限制策略只对 'uploads' bucket 生效
--
-- WITH CHECK (bucket_id = 'uploads'):
--   - 对于 INSERT/UPDATE 操作，检查新行的 bucket_id 是否为 'uploads'
--
-- ==============================================================================
