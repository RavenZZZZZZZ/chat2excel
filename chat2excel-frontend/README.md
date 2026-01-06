# Chat2Excel - 表格OCR识别前端项目

基于 React + Vite + shadcn/ui 的表格图片识别与Excel导出工具。

## 📋 项目结构

```
chat2excel-frontend/
├── public/                          # 静态资源目录
├── src/                            # 源代码目录
│   ├── assets/                     # 资源文件
│   │   ├── images/                 # 图片资源 (Logo、图标等)
│   │   ├── icons/                  # 图标资源
│   │   └── styles/                # 全局样式文件
│   ├── components/                 # 可复用组件
│   │   ├── ui/                   # shadcn/ui 组件
│   │   ├── layout/                # 布局组件 (Header、Footer、Sidebar)
│   │   ├── upload/                # 上传相关组件
│   │   ├── recognition/            # 识别相关组件
│   │   ├── editor/                # 编辑相关组件
│   │   ├── export/                # 导出相关组件
│   │   └── common/                # 通用组件
│   ├── views/                      # 页面视图
│   │   ├── Home.tsx              # 首页 (上传页面)
│   │   ├── Recognizing.tsx        # 识别中页面
│   │   ├── Editing.tsx           # 编辑页面
│   │   ├── Export.tsx            # 导出页面
│   │   └── Help.tsx             # 帮助页面
│   ├── stores/                     # 状态管理 (Zustand)
│   │   ├── useAppStore.ts         # 应用全局状态
│   │   ├── useUploadStore.ts      # 上传状态
│   │   ├── useRecognitionStore.ts  # 识别状态
│   │   ├── useEditorStore.ts      # 编辑状态
│   │   └── useExportStore.ts      # 导出状态
│   ├── services/                  # 服务层 (API调用)
│   │   ├── api/                  # API 客户端
│   │   ├── ocr/                  # OCR 服务
│   │   └── export/               # 导出服务
│   ├── hooks/                     # 自定义 Hooks
│   │   ├── useFileUpload.ts        # 文件上传 Hook
│   │   ├── useOCR.ts             # OCR 识别 Hook
│   │   ├── useTableEditor.ts      # 表格编辑 Hook
│   │   ├── useExport.ts          # 导出 Hook
│   │   ├── useDebounce.ts        # 防抖 Hook
│   │   ├── useLocalStorage.ts     # 本地存储 Hook
│   │   └── useKeyboard.ts        # 键盘快捷键 Hook
│   ├── lib/                       # 工具库
│   │   ├── utils.ts              # 通用工具函数
│   │   ├── validators.ts         # 验证函数
│   │   ├── formatters.ts         # 格式化函数
│   │   ├── constants.ts         # 常量定义
│   │   └── cn.ts                # Tailwind class 合并工具
│   ├── types/                     # TypeScript 类型定义
│   │   ├── index.ts              # 导出所有类型
│   │   ├── api.ts               # API 相关类型
│   │   ├── recognition.ts        # 识别相关类型
│   │   ├── table.ts             # 表格相关类型
│   │   ├── export.ts            # 导出相关类型
│   │   └── common.ts            # 通用类型
│   ├── router/                    # 路由配置
│   │   └── index.tsx            # 路由主文件
│   ├── config/                    # 配置文件
│   │   ├── app.config.ts         # 应用配置
│   │   ├── ocr.config.ts         # OCR 配置
│   │   └── export.config.ts      # 导出配置
│   ├── locales/                   # 国际化
│   │   ├── zh-CN.ts             # 中文
│   │   └── en-US.ts             # 英文
│   ├── App.tsx                    # 根组件
│   ├── main.tsx                   # 应用入口
│   └── vite-env.d.ts             # Vite 环境类型
├── tests/                         # 测试文件
│   ├── unit/                     # 单元测试
│   ├── integration/                # 集成测试
│   └── e2e/                      # 端到端测试
├── docs/                          # 文档
├── .vscode/                       # VS Code 配置
├── .github/                       # GitHub 配置
├── .env.example                    # 环境变量示例
├── .gitignore                     # Git 忽略文件
├── .eslintrc.cjs                  # ESLint 配置
├── .prettierrc                    # Prettier 配置
├── tailwind.config.js              # Tailwind 配置
├── postcss.config.js               # PostCSS 配置
├── tsconfig.json                  # TypeScript 配置
├── vite.config.ts                 # Vite 配置
├── package.json                   # 项目配置
├── components.json                # shadcn/ui 配置
└── README.md                     # 项目说明
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 打开

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm run test
```

### 代码格式化

```bash
npm run format
```

### 代码检查

```bash
npm run lint
```

## 📦 主要依赖

### 核心框架
- **React 19** - UI 框架
- **Vite** - 构建工具
- **TypeScript** - 类型安全

### 状态管理
- **Zustand** - 轻量级状态管理
- **React Query** - 数据获取和缓存

### UI 组件
- **Tailwind CSS** - 原子化 CSS
- **shadcn/ui** - 高质量组件库
- **Radix UI** - 无障碍组件原语
- **Lucide React** - 图标库

### 功能库
- **Tesseract.js** - OCR 识别
- **react-dropzone** - 文件拖拽上传
- **xlsx** - Excel 导出
- **file-saver** - 文件下载
- **yet-another-react-lightbox** - 图片预览
- **axios** - HTTP 客户端

## 🎨 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS + shadcn/ui
- **路由管理**: React Router v6
- **状态管理**: Zustand
- **数据请求**: React Query + Axios
- **OCR 引擎**: Tesseract.js
- **表格编辑**: React Table
- **Excel 导出**: XLSX

## 📁 文件夹说明

### `/src/assets`
存放静态资源文件，包括图片、图标、样式等。

### `/src/components`
可复用的 React 组件：
- **ui/** - shadcn/ui 组件，包含基础 UI 组件
- **layout/** - 布局组件，如 Header、Footer
- **upload/** - 上传相关组件，如 UploadZone、FilePreview
- **recognition/** - 识别相关组件，如 Progress、StepList
- **editor/** - 编辑相关组件，如 TableEditor、Toolbar
- **export/** - 导出相关组件，如 ExportDialog
- **common/** - 通用组件，如 LoadingSpinner、EmptyState

### `/src/views`
页面级组件，对应不同的路由：
- **Home** - 首页，提供文件上传功能
- **Recognizing** - 识别中页面，显示识别进度
- **Editing** - 编辑页面，提供表格编辑功能
- **Export** - 导出页面，提供导出选项
- **Help** - 帮助页面，提供使用说明

### `/src/stores`
Zustand 状态管理：
- **useAppStore** - 全局应用状态（语言、Toast 等）
- **useUploadStore** - 文件上传状态
- **useRecognitionStore** - OCR 识别状态
- **useEditorStore** - 表格编辑状态
- **useExportStore** - Excel 导出状态

### `/src/services`
后端 API 交互层：
- **api/** - Axios 客户端配置和 API 调用
- **ocr/** - OCR 服务封装（Tesseract.js）
- **export/** - 导出服务封装（XLSX）

### `/src/hooks`
自定义 React Hooks，封装常用逻辑。

### `/src/lib`
工具函数和常量：
- **utils.ts** - 通用工具函数
- **validators.ts** - 数据验证函数
- **formatters.ts** - 数据格式化函数
- **constants.ts** - 应用常量定义

### `/src/types`
TypeScript 类型定义，提供类型安全。

### `/src/router`
React Router 配置，定义应用路由。

### `/src/config`
应用配置文件，集中管理配置。

### `/src/locales`
国际化文件，支持多语言切换。

### `/tests`
测试文件：
- **unit/** - 单元测试
- **integration/** - 集成测试
- **e2e/** - 端到端测试

## 🔧 配置说明

### 环境变量

复制 `.env.example` 为 `.env.local` 并配置：

```bash
# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# OCR 配置
VITE_OCR_PROVIDER=tesseract
VITE_TESSERACT_WORKER_PATH=/tesseract.js
VITE_TESSERACT_LANG_PATH=/lang/

# 导出配置
VITE_EXPORT_MAX_SIZE_MB=10

# 功能开关
VITE_ENABLE_BETA_FEATURES=false
VITE_ENABLE_ANALYTICS=false

# 环境
VITE_APP_ENV=development
```

### Tailwind 配置

在 `tailwind.config.js` 中自定义主题颜色、字体等。

### shadcn/ui 配置

在 `components.json` 中配置组件生成选项。

## 📝 开发规范

### 代码风格
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 TypeScript 严格模式

### 组件命名
- 组件文件使用 PascalCase（如 `Header.tsx`）
- 工具函数使用 camelCase（如 `formatFileSize`）
- 常量使用 UPPER_SNAKE_CASE（如 `MAX_FILE_SIZE`）

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 🚢 部署

### Vercel（推荐）

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# 将 dist 目录上传到 Netlify
```

### Docker

```bash
docker build -t chat2excel-frontend .
docker run -p 5173:5173 chat2excel-frontend
```

## 📚 参考资料

- [React 文档](https://react.dev/)
- [Vite 文档](https://vite.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 📄 许可证

MIT License
