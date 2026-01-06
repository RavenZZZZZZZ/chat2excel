# Supabase Storage 策略配置指南

## 🎯 目标

配置 Supabase Storage `uploads` bucket 的访问策略，允许用户上传文件。

---

## ⚠️ 当前问题

错误信息：`new row violates row-level security policy`

这意味着 Storage 的 RLS（Row Level Security）策略阻止了文件上传。

---

## 📝 解决方案（2 种方法）

### 方法 1：使用 SQL 脚本（推荐，快速）

1. **打开 SQL Editor**

   访问：https://supabase.com/dashboard/project/hlurjwzhsmieikygrlrs/sql

2. **创建新查询**

   点击 "New Query" 按钮

3. **复制并粘贴以下 SQL**

   ```sql
   -- 允许所有人上传文件
   CREATE POLICY "Allow public uploads"
   ON storage.objects
   FOR INSERT
   TO anon, authenticated
   WITH CHECK (bucket_id = 'uploads');

   -- 允许所有人查看文件
   CREATE POLICY "Allow public select"
   ON storage.objects
   FOR SELECT
   TO anon, authenticated
   USING (bucket_id = 'uploads');
   ```

4. **执行 SQL**

   点击 "Run" 按钮（或按 `Cmd+Enter` / `Ctrl+Enter`）

5. **验证成功**

   应该看到 "Success. No rows returned" 消息

6. **测试上传**

   运行测试脚本验证：
   ```bash
   cd chat2excel-frontend
   npx tsx src/utils/test-upload-permission.ts
   ```

---

### 方法 2：使用 Dashboard UI（可视化）

1. **访问 Storage 页面**

   访问：https://supabase.com/dashboard/project/hlurjwzhsmieikygrlrs/storage/uploads

2. **进入 Policies 标签**

   点击右上角的 "Policies" 标签

3. **创建上传策略（INSERT）**

   - 点击 "New Policy" 按钮
   - 选择 "Get started quickly" 或 "For full customization"
   - 如果选择快速模板：
     - 选择 "Allow public uploads" 或类似选项
   - 如果选择自定义：
     - **Policy name**: `Allow public uploads`
     - **Allowed operation**: 选择 `Insert`
     - **Target roles**: 勾选 `anon` 和 `authenticated`
     - **Policy definition**:
       ```
       bucket_id = 'uploads'
       ```
   - 点击 "Review" 然后 "Save policy"

4. **创建查看策略（SELECT）**

   - 再次点击 "New Policy"
   - **Policy name**: `Allow public select`
   - **Allowed operation**: 选择 `Select`
   - **Target roles**: 勾选 `anon` 和 `authenticated`
   - **Policy definition**:
     ```
     bucket_id = 'uploads'
     ```
   - 点击 "Review" 然后 "Save policy"

5. **验证策略**

   在 Policies 列表中应该能看到你创建的策略，状态为 "Enabled"

---

## 🔍 验证配置

### 检查策略是否存在

1. 在 SQL Editor 中运行：

   ```sql
   SELECT
     policyname,
     roles,
     cmd
   FROM pg_policies
   WHERE tablename = 'objects'
     AND schemaname = 'storage'
   ORDER BY policyname;
   ```

2. 应该看到类似结果：

   | policyname | roles | cmd |
   |-----------|-------|-----|
   | Allow public uploads | {anon,authenticated} | INSERT |
   | Allow public select | {anon,authenticated} | SELECT |

### 运行测试脚本

```bash
cd chat2excel-frontend
npx tsx src/utils/test-upload-permission.ts
```

如果看到 ✅ 表示配置成功！

---

## 🎉 配置完成后的效果

- ✅ 匿名用户可以上传文件
- ✅ 已登录用户可以上传文件
- ✅ 所有人可以查看/下载公开文件
- ✅ 上传的文件可以通过公开 URL 访问

---

## 📚 其他有用的策略（可选）

### 允许用户删除自己的文件

```sql
CREATE POLICY "Allow users to delete their files"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'uploads');
```

### 只允许已登录用户上传（更安全）

如果你想要更严格的控制，可以只允许已登录用户上传：

```sql
-- 删除公共上传策略
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;

-- 创建仅限已登录用户的策略
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');
```

---

## ❓ 常见问题

### Q: 为什么需要配置策略？

A: Supabase Storage 默认启用 RLS（Row Level Security），所有操作都需要明确的策略授权。这是为了保护数据安全。

### Q: anon 和 authenticated 角色有什么区别？

A:
- `anon`: 匿名用户，未登录的用户
- `authenticated`: 已登录用户，有有效 session 的用户

### Q: 是否需要所有策略（INSERT, SELECT, UPDATE, DELETE）？

A: 不一定。最少需要：
- **INSERT**: 上传文件
- **SELECT**: 查看文件

UPDATE 和 DELETE 是可选的，看你的需求。

### Q: 如何删除已有的策略？

A:
```sql
DROP POLICY IF EXISTS "policy_name" ON storage.objects;
```

---

## 📞 需要帮助？

如果配置过程中遇到问题：

1. 检查 Supabase Dashboard 中的错误消息
2. 查看 SQL Editor 的执行结果
3. 运行测试脚本查看详细错误
4. 参考 Supabase 官方文档：https://supabase.com/docs/guides/storage

---

**配置完成后，刷新浏览器页面，重新尝试上传图片！**
