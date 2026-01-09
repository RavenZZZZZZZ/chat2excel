# 待办事项清单

## 🚀 待开发功能
- [ ] 添加批量上传功能 (优先级: 中)

## 🐛 待修复问题
- [x] ~~修复 Storage 上传 500 错误~~ (已完成 - 2026-01-09)
  - 问题：next.config.mjs 中的假环境变量覆盖 Vercel 环境变量
  - 解决：移除 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 假值
  - 相关：docs/DEVELOPMENT_LOG.md - 2026-01-09 条目
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

---
最后更新：2026-01-09 13:20
