# Chat2Excel Documentation

Welcome to the Chat2Excel documentation. This directory contains all project documentation organized by topic.

## 📚 Documentation Index

### 🚀 Getting Started
- [主 README](../README.md) - 项目概述和快速开始
- [API.md](./API.md) - 完整的 API 端点文档和示例

### 🏗️ Architecture & Design
- [DATABASE_SCHEMA_DESIGN.md](./DATABASE_SCHEMA_DESIGN.md) - 数据库架构和结构
- [PHASE2_ARCHITECTURE.md](./PHASE2_ARCHITECTURE.md) - 可扩展工具架构设计
- [WORKFLOW_V3_TEST.md](./WORKFLOW_V3_TEST.md) - v3 工作流测试指南

### 🚢 Deployment
- [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) - Vercel 部署测试清单
- [GLOBAL_LATENCY_REPORT.md](./GLOBAL_LATENCY_REPORT.md) - 全球延迟测试报告
- [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md) - 性能测试报告

### 📝 Development
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) - 开发日志和问题记录
- [TODOLIST.md](../TODOLIST.md) - 待办事项清单

### 📦 Archive
The [archive/](./archive/) directory contains old documentation and code that has been superseded. Kept for historical reference.

## 🔍 Quick Links

- **新项目？** 查看主项目 [README.md](../README.md)
- **需要部署？** 查看部署章节或 [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)
- **理解架构？** 阅读 [PHASE2_ARCHITECTURE.md](./PHASE2_ARCHITECTURE.md)
- **API 开发？** 参考 [API.md](./API.md)
- **测试新功能？** 查看 [WORKFLOW_V3_TEST.md](./WORKFLOW_V3_TEST.md)

## 📂 Project Documentation Structure

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
│   ├── WORKFLOW_V3_TEST.md      # 测试指南
│   ├── VERCEL_DEPLOYMENT_CHECKLIST.md # 部署清单
│   └── archive/                 # 归档文档
└── src/
    ├── _archive/                # 归档的旧代码
    └── ...
```

## 📝 Document Format

所有文档使用 Markdown 格式，包含：
- 清晰的结构和标题
- 适用的代码示例
- 分步说明
- 故障排查部分

## 🤝 Contributing

更新文档时：
1. 使用清晰简洁的语言
2. 包含代码示例
3. 添加故障排查步骤
4. 需要时更新本索引
