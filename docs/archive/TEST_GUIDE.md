# 🎉 前后端服务已启动成功！

## 服务状态

### ✅ 后端服务器
- **地址**: http://localhost:3001
- **状态**: 运行中
- **健康检查**: ✅ 正常 (`{"status":"ok","message":"Proxy server is running"}`)

### ✅ 前端服务器
- **地址**: http://localhost:5173
- **状态**: 运行中
- **构建工具**: Vite 6.4.1

---

## 测试指南

### 1. 访问应用

在浏览器中打开: **http://localhost:5173**

### 2. 功能测试清单

#### 📤 文件上传测试
- [ ] 打开首页
- [ ] 拖拽图片到上传区域
- [ ] 点击选择文件上传
- [ ] 验证文件类型（JPG/PNG/WEBP/GIF）
- [ ] 验证文件大小限制（10MB）
- [ ] 查看文件预览
- [ ] 删除已上传的文件

#### 🔍 OCR 识别测试
- [ ] 点击"开始识别"按钮
- [ ] 观察跳转到识别页面
- [ ] 查看识别进度显示
- [ ] 等待识别完成
- [ ] 查看识别结果

#### 📊 数据流测试
- [ ] 检查 Zustand store 状态更新
- [ ] 验证文件正确传递到识别页面
- [ ] 验证 OCR 任务状态更新
- [ ] 检查日志输出（打开浏览器控制台）

#### 🛡️ 错误处理测试
- [ ] 触发错误（上传无效文件）
- [ ] 查看错误边界是否捕获错误
- [ ] 验证错误提示显示

#### 💾 内存管理测试
- [ ] 上传多张大文件
- [ ] 删除部分文件
- [ ] 检查浏览器内存使用情况（开发者工具 → Memory）
- [ ] 验证 blob URLs 被正确释放

---

## 控制台日志查看

### 查看日志

打开浏览器开发者工具（F12）→ Console 标签

你应该看到类似这样的日志：

```
[HH:MM:SS] [DEBUG] [Home] 点击了开始识别按钮
[HH:MM:SS] [DEBUG] [Home] 当前上传的文件数量: 2
[HH:MM:SS] [INFO] [Home] 已保存文件到 store，数量: 2
[HH:MM:SS] [INFO] [Home] 准备跳转到 /recognizing
[HH:MM:SS] [DEBUG] [Recognizing] useEffect 执行，检查文件: 2
[HH:MM:SS] [INFO] [Recognizing] 开始 OCR 识别 2 张图片
```

### 日志级别说明

- **DEBUG**: 详细的调试信息（蓝色）
- **INFO**: 一般信息（绿色）
- **WARN**: 警告信息（黄色）
- **ERROR**: 错误信息（红色）

---

## API 测试

### 后端 API 端点

#### 1. 健康检查
```bash
curl http://localhost:3001/api/health
```

#### 2. 上传文件（测试）
```bash
curl -X POST http://localhost:3001/api/proxy/parse/pdf \
  -F "file=@/path/to/image.jpg" \
  -H "Authorization: Bearer sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq"
```

#### 3. 查询状态（测试）
```bash
curl "http://localhost:3001/api/proxy/parse/status?uid=your-uid-here" \
  -H "Authorization: Bearer sk-otgzt9qpmdqfvy1zkwc0x120ihttmtkq"
```

---

## 改进功能验证

### ✅ 已实现的改进

#### 1. 错误边界
- 触发任何 JavaScript 错误
- 应该看到友好的错误页面而不是白屏
- 点击"重试"或"刷新页面"按钮恢复

#### 2. 统一日志
- 查看控制台，所有日志格式统一
- 带时间戳和日志级别
- 带组件上下文（如 `[Home]`, `[Recognizing]`）

#### 3. 状态管理
- 文件上传后状态正确保存到 Zustand store
- 识别页面正确从 store 读取文件
- 不再使用 `window` 全局变量

#### 4. 内存管理
- 删除文件时自动释放 blob URL
- 组件卸载时清理所有 URLs
- 内存使用应该保持稳定

#### 5. 类型安全
- 所有新增代码都有正确的类型定义
- 不再有 `(window as any)` 使用
- 不再有 `data: any` 类型

---

## 常见问题

### Q: 前端无法连接后端
**A**: 检查后端是否正常运行
```bash
curl http://localhost:3001/api/health
```

### Q: 上传文件后没有反应
**A**:
1. 打开浏览器控制台查看错误
2. 检查后端日志
3. 确认文件格式和大小符合要求

### Q: 识别失败
**A**:
1. 检查网络连接
2. 验证 API Key 是否有效
3. 查看后端日志了解详细错误

### Q: 如何停止服务？
**A**: 在终端按 `Ctrl + C`，或使用以下命令：
```bash
lsof -ti:5173 -ti:3001 | xargs kill -9
```

---

## 性能监控

### 查看内存使用

1. 打开 Chrome DevTools
2. 切换到 **Performance** 或 **Memory** 标签
3. 点击 **Record** 开始录制
4. 执行操作（上传、删除文件）
5. 停止录制
6. 查看内存曲线

### 预期结果

- ✅ 内存使用应该保持稳定
- ✅ 删除文件后内存应该下降
- ✅ 没有明显内存泄漏

---

## 下一步

### 如果一切正常 ✅
1. 完成所有功能测试
2. 验证内存管理
3. 测试错误处理
4. 准备部署

### 如果遇到问题 ❌
1. 查看浏览器控制台
2. 查看后端日志
3. 检查网络请求（DevTools → Network）
4. 参考 [VERIFICATION_REPORT.md](chat2excel-frontend/VERIFICATION_REPORT.md)

---

## 反馈

测试过程中如果发现任何问题，请记录：
- 问题描述
- 复现步骤
- 错误日志
- 浏览器类型和版本

祝测试顺利！🚀

---

服务启动时间: 2026-01-06 17:42
文档: TEST_GUIDE.md
