# 待办事项清单

## ✅ 已完成 (2026-01-09)
- [x] 修复 OCR 结果渲染 TypeError (v.data.slice is not a function)
  - 问题: 数据格式不匹配 (TableData 对象 vs 二维数组)
  - 解决: 在 OCRWorkflow 中添加数据转换逻辑
  - 相关: docs/DEVELOPMENT_LOG.md - 2026-01-09 条目
- [x] 实现自动开始识别功能
  - 上传文件后自动触发 OCR,无需手动点击
  - 使用 setTimeout 确保 state 更新完成
- [x] 增强错误日志和调试工具
  - 新增 /api/debug/env-check 环境变量检查 API
  - 增强 OCR API 错误日志详情
- [x] 清理项目结构和文档
  - 删除 docs/archive/ 目录 (16 个文件)
  - 删除临时诊断文档 (7 个文件)
  - 删除调试 API (3 个路由)
  - 删除脚本备份 (6 个文件)
  - 总计: 删除 10,503 行冗余代码

## 🚀 待开发功能
- [ ] 添加批量上传功能 (优先级: 中)
- [ ] 实现工具搜索和命令面板 (Cmd+K) (优先级: 中)
  - 利用已创建的工具注册系统
  - 相关: docs/PHASE2_ARCHITECTURE.md
- [ ] 创建工具首页展示 (优先级: 低)
  - 工具卡片展示
  - 分类浏览
  - 搜索功能
- [ ] 开发更多 AI 工具 (优先级: 中)
  - 图片压缩工具
  - PDF 转 Excel 工具
  - 图片格式转换工具
  - 相关: 移除侧边栏的"敬请期待"状态

## 🐛 待修复问题
- [x] ~~修复 Storage 上传 500 错误~~ (已完成 - 2026-01-09)
  - 问题：next.config.mjs 中的假环境变量覆盖 Vercel 环境变量
  - 解决：移除 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 假值
- [x] ~~修复 OCR 结果渲染错误~~ (已完成 - 2026-01-09)
  - 问题: TypeError - v.data.slice is not a function
  - 解决: 数据格式转换 + 防御性检查
- [x] ~~修复 OCR 进度条卡在 0%~~ (已完成 - 2026-01-10)
  - 问题: OCRTask 和 ProcessingTask 类型不匹配
  - 解决: 重写 updateOcrTask 函数，正确映射类型
- [ ] 修复移动端显示问题

## 🔧 待优化项
- [ ] 优化大文件上传体验
- [ ] 添加上传进度条
- [ ] 添加 Storage 上传文件的定期清理机制（避免存储费用过高）
- [ ] 实现上传文件的压缩和格式转换（减少存储空间）
- [ ] 添加上传速率限制（防止滥用）
- [ ] 实现文件去重功能（相同图片不重复上传）
- [ ] **性能优化**：考虑迁移到阿里云函数计算 (优先级: 高)
  - 当前 Vercel 在国内访问较慢（2-5秒首屏）
  - 迁移到国内可将 API 响应从 5-7秒降到 0.5-1秒
  - 需要重构 Next.js API Routes 为阿里云函数

## 📚 待完善文档
- [ ] 补充 API 使用示例
- [ ] 更新 CDN 配置文档说明（标记为已废弃）
- [ ] 补充 Storage 错误码说明文档
- [ ] 添加 Vercel 部署故障排查指南
- [ ] 编写环境变量配置最佳实践文档
- [ ] 补充工具开发指南
  - 如何注册新工具
  - 如何添加工具配置
  - 工具组件开发规范

## 🧪 待补充测试
- [x] 添加 WebP 格式测试 (已完成 - scripts/test-webp.sh)
- [ ] 添加大文件（接近 7MB）上传测试
- [ ] 添加并发上传压力测试
- [ ] 测试各种图片格式（JPG/PNG/WebP）的边界情况

## 💡 临时想法
- [ ] 考虑添加图片裁剪功能
- [x] 支持更多图片格式 (已完成 WebP，GIF/BMP 可考虑后续添加)
- [ ] 清理阿里云 CDN 配置（已验证不兼容，可删除避免费用）
- [ ] 考虑添加 CDN 加速 Supabase Storage 图片访问
- [ ] 实现图片缩略图生成功能
- [ ] 添加上传进度显示（前端 UX 优化）
- [x] 安装 Claude Code Frontend Design Skill (已完成 - 2026-01-09)
  - 提升前端设计质量，避免通用 AI 美学
  - 位置：`.claude/skills/frontend-design/SKILL.md`
- [x] 配置 Claude Code 默认语言为中文 (已完成 - 2026-01-09)
  - 配置文件：`~/.claude/settings.json`
  - 设置：`"language": "chinese"`
  - 优化中文用户体验
- [ ] 使用 Frontend Design Skill 重新设计上传界面
- [ ] 使用 Frontend Design Skill 优化表格展示组件
- [ ] 探索更多官方 Claude Code Skills
  - 参考：https://github.com/anthropics/skills
  - 参考：https://github.com/travisvn/awesome-claude-skills

## 🎯 短期计划 (优先级排序)
1. **测试和优化当前 OCR 功能** (优先级: 高)
   - 测试各种图片格式
   - 优化识别准确率
   - 改进错误提示

2. **添加更多工具到注册系统** (优先级: 中)
   - 图片压缩工具
   - PDF 转 Excel 工具
   - 图片格式转换工具

3. **性能优化** (优先级: 中)
   - 考虑国内部署方案
   - 优化 API 响应时间
   - 添加缓存机制

---
最后更新：2026-01-10 10:30
