# Supabase 集成配置指南

本文档介绍如何配置 Supabase 以支持 OCR 项目的数据持久化。

## 功能说明

集成 Supabase 后，系统会自动：
1. 将用户上传的图片保存到 Supabase Storage
2. 将 OCR 解析结果（HTML 文本）保存到数据库
3. 保存文件元数据（大小、尺寸、类型等）
4. 记录 OCR 状态和耗时信息

## 配置步骤

### 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project"
4. 填写项目信息：
   - **Project Name**: 例如 "ocr-project"
   - **Database Password**: 设置强密码并保存
   - **Region**: 选择离用户最近的区域（推荐 Singapore 或 Tokyo）
5. 等待项目创建完成（约 2 分钟）

### 2. 获取 API 凭据

1. 进入项目 Dashboard
2. 左侧菜单点击 **Settings** > **API**
3. 复制以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public**: 类似 `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 运行数据库迁移

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 "New Query"
3. 复制项目中的迁移脚本：`supabase/migrations/001_initial_schema.sql`
4. 粘贴到编辑器
5. 点击 "Run" 或按 `Ctrl+Enter` 执行

迁移脚本会自动创建：
- `ocr_tasks` 表（存储 OCR 结果）
- `ocr_items` 表（预留，未来使用）
- `ocr-images` 存储桶（存储图片文件）
- 行级安全策略（公开访问）

### 4. 配置环境变量

编辑项目根目录的 `.env.local` 文件：

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_BUCKET_NAME=ocr-images
VITE_SUPABASE_STORAGE_PATH=uploads
```

**重要提示**：
- 将 `your-project.supabase.co` 替换为你的 Project URL
- 将 `your-anon-key-here` 替换为你的 anon public key
- 不要提交 `.env.local` 到 Git 仓库

### 5. 验证配置

启动开发服务器：

```bash
cd chat2excel-frontend
npm run dev
```

在浏览器控制台应该看到：

```
[SupabaseStorageService] Supabase 已连接
```

### 6. 测试功能

1. 上传一张测试图片
2. 等待 OCR 完成
3. 检查控制台日志：
   ```
   [SupabaseStorageService] 开始上传图片: test.png -> uploads/xxx_xxx_test.png
   [SupabaseStorageService] 图片上传成功: https://xxx.supabase.co/storage/v1/object/public/ocr-images/uploads/...
   [SupabaseStorageService] 任务保存成功: xxx-xxx-xxx
   ```
4. 打开 Supabase Dashboard：
   - **Table Editor** > `ocr_tasks`：查看数据库记录
   - **Storage** > `ocr-images`：查看上传的图片

## 验证清单

- [ ] Supabase 项目已创建
- [ ] 环境变量已配置
- [ ] 数据库迁移已执行
- [ ] Storage 桶已创建（ocr-images）
- [ ] 上传图片成功保存到 Storage
- [ ] OCR 结果成功保存到数据库
- [ ] 控制台日志显示保存成功

## 故障排查

### Supabase 未配置警告

**错误信息**：
```
[SupabaseStorageService] Supabase 未配置，跳过图片上传
```

**解决方案**：
1. 检查 `.env.local` 是否存在
2. 确认 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已填写
3. 重启开发服务器

### 图片上传失败

**错误信息**：
```
[SupabaseStorageService] 图片上传失败: Error: Bucket not found
```

**解决方案**：
1. 检查 Storage 桶是否创建
2. 运行迁移脚本创建存储桶
3. 确认桶名为 `ocr-images`

### 数据库保存失败

**错误信息**：
```
[SupabaseStorageService] 保存任务失败: Error: relation "ocr_tasks" does not exist
```

**解决方案**：
1. 确认数据库迁移脚本已执行
2. 在 Supabase Dashboard 检查表是否存在
3. 重新运行迁移脚本

## 安全建议

### 当前配置（开发环境）
- 使用 `anon public` key，任何人都可以读写数据
- 适合本地开发和测试
- **不推荐用于生产环境**

### 生产环境配置
建议实施以下安全措施：

1. **启用用户认证**
   ```sql
   -- 移除公开访问策略
   DROP POLICY "Allow public access to ocr_tasks" ON ocr_tasks;

   -- 添加仅认证用户访问策略
   CREATE POLICY "Users can view own tasks"
     ON ocr_tasks FOR SELECT
     TO authenticated
     USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can insert own tasks"
     ON ocr_tasks FOR INSERT
     TO authenticated
     WITH CHECK (auth.uid()::text = user_id);
   ```

2. **实现速率限制**
   - 在 Supabase Dashboard 设置 API 速率限制
   - 防止恶意用户滥用

3. **数据验证**
   - 添加文件大小限制
   - 验证 MIME 类型
   - 过滤敏感信息

4. **定期清理**
   ```sql
   -- 删除 30 天前的数据
   DELETE FROM ocr_tasks
   WHERE created_at < NOW() - INTERVAL '30 days';
   ```

## 进阶功能

### 查看历史记录

如果想添加历史记录查看页面，可以查询数据库：

```typescript
const { data } = await supabase
  .from('ocr_tasks')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20);
```

### 导出数据到数据库

将解析后的表格数据也保存到数据库：

```typescript
// 保存解析结果
await supabase.from('parsed_tables').insert({
  ocr_task_id: taskId,
  table_json: tableData,
  row_count: tableData.rows.length,
  col_count: tableData.headers.length,
});
```

### 添加备份功能

```typescript
// 导出所有数据
const { data } = await supabase
  .from('ocr_tasks')
  .select('*')
  .order('created_at', { ascending: false });

// 下载为 JSON
const blob = new Blob([JSON.stringify(data, null, 2)], {
  type: 'application/json',
});
```

## 相关文件

- **迁移脚本**: `supabase/migrations/001_initial_schema.sql`
- **存储服务**: `src/services/storage/supabaseStorageService.ts`
- **类型定义**: `src/lib/supabase.ts`
- **集成代码**: `src/views/Recognizing.tsx`

## 支持

如遇问题，请检查：
1. Supabase Dashboard 的 Logs
2. 浏览器控制台错误
3. 网络请求（Network Tab）
4. 环境变量配置

更多信息请参考：
- [Supabase 官方文档](https://supabase.com/docs)
- [Storage 指南](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
