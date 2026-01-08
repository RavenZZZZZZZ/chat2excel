# Supabase MCP 测试指南

## MCP 已配置成功！

### 配置信息
- **Access Token**: ✅ 已配置
- **Project URL**: https://hlurjwzhsmieikygrlrs.supabase.co
- **配置文件**: ~/.config/claude-code/mcp_settings.json

---

## 测试 MCP 功能

### 方法 1：直接询问 Claude

重启 VSCode 后，尝试这些指令：

#### 1️⃣ 查询数据库
```
查询 ocr_tasks 表中的所有记录，显示前 5 条
```

#### 2️⃣ 统计数据
```
统计 ocr_tasks 表中有多少条记录
```

#### 3️⃣ 查看最新记录
```
查看最近上传的 3 个 OCR 任务
```

#### 4️⃣ 执行自定义查询
```
执行 SQL: SELECT file_name, ocr_status, created_at FROM ocr_tasks ORDER BY created_at DESC LIMIT 5
```

---

### 方法 2：使用 MCP 工具（如果可用）

如果 MCP 服务器正确加载，你可以使用这些工具：

#### 🗄️ 数据库操作
- `list_tables` - 列出所有表
- `execute_sql` - 执行 SQL 查询
- `describe_table` - 查看表结构

#### 📁 存储操作
- `list_buckets` - 列出存储桶
- `list_objects` - 列出文件
- `upload_file` - 上传文件
- `delete_file` - 删除文件

---

### 预期结果

如果 MCP 工作正常，你应该能看到：

✅ Claude 能直接查询 Supabase 数据库
✅ Claude 能执行 SQL 语句
✅ Claude 能访问存储桶信息
✅ 返回的结果来自真实的 Supabase 数据

---

### 如果 MCP 没有工作

#### 症状：
- Claude 说无法访问 Supabase
- 查询返回错误
- 看不到 MCP 相关的工具

#### 解决方案：

1. **检查配置文件**
   ```bash
   cat ~/.config/claude-code/mcp_settings.json
   ```
   确认 token 和 URL 正确

2. **完全重启 VSCode**
   - 不只是重新加载窗口
   - 要完全退出 `Cmd+Q` 再打开

3. **查看 Claude Code 日志**
   - 打开 View > Output
   - 选择 "Claude Code" 频道
   - 查看是否有 MCP 相关错误

4. **验证 Token 是否有效**
   - 访问：https://supabase.com/dashboard/account/tokens
   - 确认 token 没有过期

---

## 高级用法示例

### 示例 1：数据分析
```
分析 ocr_tasks 表的数据：
1. 总共有多少条记录？
2. 成功率是多少？
3. 平均处理时间是多少？
4. 最常见的文件类型是什么？
```

### 示例 2：清理数据
```
删除 ocr_tasks 表中所有状态为 'failed' 的记录
```

### 示例 3：导出数据
```
将 ocr_tasks 表中的数据导出为 JSON 格式
```

### 示例 4：存储管理
```
列出 ocr-images 存储桶中所有文件，按上传时间排序
```

---

## 备选方案：使用 Supabase CLI

如果 MCP 暂时不可用，你还可以使用 Supabase CLI：

### 查询数据
```bash
supabase db --db-url "postgresql://postgres.hlurjwzhsmieikygrlrs:5ourGgPM9iil4YQQ@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" query "SELECT * FROM ocr_tasks LIMIT 5;"
```

### 列出存储文件
```bash
supabase storage ls --project-ref hlurjwzhsmieikygrlrs --bucket-id ocr-images
```

---

## 获取帮助

如果遇到问题：
1. 查看 Claude Code 的 Output 面板
2. 检查 MCP 配置文件语法
3. 确认网络连接正常
4. 验证 Supabase token 有效

---

## 相关链接

- Supabase Dashboard: https://supabase.com/dashboard/project/hlurjwzhsmieikygrlrs
- MCP 文档: https://github.com/supabase/supabase-mcp-server
- 项目目录: /Users/ravenz/chat2excel
