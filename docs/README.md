# Chat2Excel Documentation

欢迎来到 Chat2Excel 项目文档中心。本文档包含项目概述、架构设计、API 文档和开发指南。

## 📚 文档索引

### 🚀 快速开始
- [主 README](../README.md) - 项目概述和快速开始指南
- [API.md](./API.md) - 完整的 API 端点文档和示例

### 🏗️ 架构与设计
- [DATABASE_SCHEMA_DESIGN.md](./DATABASE_SCHEMA_DESIGN.md) - 数据库架构设计
- [PHASE2_ARCHITECTURE.md](./PHASE2_ARCHITECTURE.md) - 可扩展工具系统架构

### 📝 开发记录
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) - 开发日志和问题记录
- [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md) - 项目清理总结

## 🔍 快速链接

- **新项目？** 查看主项目 [README.md](../README.md)
- **理解架构？** 阅读 [PHASE2_ARCHITECTURE.md](./PHASE2_ARCHITECTURE.md)
- **API 开发？** 参考 [API.md](./API.md)

## 📂 项目结构

```
chat2excel/
├── README.md                    # 主项目文档
├── CLAUDE.md                    # Claude Code 配置
├── TODOLIST.md                  # 待办事项
├── docs/                        # 详细文档
│   ├── README.md                # 文档索引（本文件）
│   ├── DEVELOPMENT_LOG.md       # 开发日志
│   ├── API.md                   # API 文档
│   ├── DATABASE_SCHEMA_DESIGN.md # 数据库设计
│   ├── PHASE2_ARCHITECTURE.md   # 工具架构
│   └── CLEANUP_SUMMARY.md       # 清理总结
├── app/                         # Next.js App Router
│   ├── api/                     # API 路由
│   │   ├── debug/               # 调试 API
│   │   ├── ocr/                 # OCR 相关 API
│   │   └── storage/             # 存储相关 API
│   └── page.tsx                 # 入口页面
├── src/                         # 前端源码
│   ├── components/              # React 组件
│   │   ├── workflow/            # 工作流组件
│   │   ├── layout/              # 布局组件
│   │   └── ui/                  # UI 组件
│   ├── config/                  # 配置文件
│   ├── hooks/                   # 自定义 Hooks
│   ├── lib/                     # 工具库
│   ├── services/                # 服务层
│   └── stores/                  # 状态管理
└── scripts/                     # 构建和部署脚本
```

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **状态管理**: Zustand
- **UI 库**: Radix UI + Tailwind CSS
- **动画**: Framer Motion
- **国际化**: react-i18next

### 后端
- **框架**: Next.js 16 (App Router)
- **部署**: Vercel
- **OCR 服务**: Doc2X API

### 核心功能
- ✅ 图片上传 (拖拽/选择)
- ✅ OCR 表格识别
- ✅ 结果预览和编辑
- ✅ Excel 导出
- ✅ 批量处理
- ✅ 自动识别

## 📝 文档规范

所有文档遵循以下规范:
- 使用 Markdown 格式
- 清晰的结构和标题
- 适用的代码示例
- 分步说明和故障排查

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev:all

# 构建生产版本
npm run build:all

# 部署到 Vercel
git push origin main
```

## 🤝 贡献指南

更新文档时:
1. 使用清晰简洁的语言
2. 包含代码示例
3. 添加故障排查步骤
4. 需要时更新本索引

---

**最后更新**: 2026-01-09
**版本**: v2.0
