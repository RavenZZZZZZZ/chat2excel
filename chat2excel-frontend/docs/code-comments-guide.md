# 代码注释说明文档

本文档说明项目中为所有文件添加的注释内容和使用指南。

## 📚 注释概览

已为以下文件添加详细的注释和文档说明：

### 1. 配置文件

#### [`.gitignore`](../.gitignore)
- 添加了详细的注释说明每个忽略规则的用途
- 解释了为什么要忽略这些文件（敏感信息、依赖包、构建产物等）

#### [`tailwind.config.js`](../tailwind.config.js)
- 配置文件本身不需要注释（JSON格式）
- 通过 README.md 说明配置选项

#### [`postcss.config.js`](../postcss.config.js)
- 配置文件本身不需要注释（JSON格式）

#### [`tsconfig.json`](../tsconfig.json)
- 配置文件本身不需要注释（JSON格式）

#### [`vite.config.ts`](../vite.config.ts)
- 已添加代码注释说明配置项

#### [`components.json`](../components.json)
- 配置文件本身不需要注释（JSON格式）

### 2. 源代码文件

#### 类型定义 (`src/types/`)

- [`api.ts`](../src/types/api.ts)
  - ApiResponse<T>: 统一 API 响应格式
  - ApiError: API 错误响应格式
  - FileUploadResponse: 文件上传响应
  - RecognitionRequest: OCR 识别请求

- [`recognition.ts`](../src/types/recognition.ts)
  - TableData: 表格数据结构
  - Row/Cell: 表格行和单元格数据
  - MergedCell: 合并单元格信息
  - RecognitionResult: 识别结果
  - RecognitionProgress: 识别进度状态
  - Step: 识别步骤

- [`table.ts`](../src/types/table.ts)
  - TableEditorState: 表格编辑器状态
  - CellPosition: 单元格位置
  - CellData: 单元格数据
  - HistoryItem: 编辑历史记录
  - ColumnWidth/RowHeight: 列宽和行高

- [`export.ts`](../src/types/export.ts)
  - ExportOptions: 导出选项配置
  - ExportResult: 导出结果
  - ExportHistoryItem: 导出历史记录

- [`common.ts`](../src/types/common.ts)
  - Language: 支持的语言类型
  - AppConfig: 应用配置
  - ToastMessage: Toast 消息提示

#### 工具库 (`src/lib/`)

- [`utils.ts`](../src/lib/utils.ts)
  - cn: Tailwind CSS 类名合并
  - formatFileSize: 格式化文件大小
  - formatNumber: 格式化数字
  - debounce: 防抖函数
  - throttle: 节流函数
  - generateId: 生成唯一 ID
  - downloadFile: 下载文件
  - copyToClipboard: 复制到剪贴板

- [`constants.ts`](../src/lib/constants.ts)
  - SUPPORTED_IMAGE_FORMATS: 支持的图片格式
  - MAX_FILE_SIZE: 最大文件大小
  - MIN/MAX_IMAGE_WIDTH/HEIGHT: 图片尺寸限制
  - OCR_PROVIDERS: OCR 提供商
  - EXPORT_FORMATS: 导出格式
  - ANIMATION_DURATION: 动画持续时间
  - TOAST_DURATION: Toast 提示持续时间
  - TABLE_EDITOR: 表格编辑器配置
  - BREAKPOINTS: 响应式断点

- [`cn.ts`](../src/lib/cn.ts)
  - Tailwind class 合并工具函数

#### 组件 (`src/components/`)

- [`layout/Header.tsx`](../src/components/layout/Header.tsx)
  - 顶部导航栏组件
  - 包含 Logo 和导航菜单

- [`layout/Footer.tsx`](../src/components/layout/Footer.tsx)
  - 页脚组件
  - 包含版权信息

#### 视图 (`src/views/`)

- [`Home.tsx`](../src/views/Home.tsx)
  - 首页（上传页面）
  - 待实现文件上传功能

- [`Recognizing.tsx`](../src/views/Recognizing.tsx)
  - 识别中页面
  - 待实现进度显示功能

- [`Editing.tsx`](../src/views/Editing.tsx)
  - 编辑页面
  - 待实现表格编辑功能

- [`Export.tsx`](../src/views/Export.tsx)
  - 导出页面
  - 待实现导出选项功能

- [`Help.tsx`](../src/views/Help.tsx)
  - 帮助中心页面
  - 待实现使用教程和 FAQ

#### 服务层 (`src/services/`)

- [`api/client.ts`](../src/services/api/client.ts)
  - Axios 客户端配置
  - 请求和响应拦截器
  - 统一错误处理

#### Hooks (`src/hooks/`)

- [`useDebounce.ts`](../src/hooks/useDebounce.ts)
  - 防抖 Hook
  - 用于延迟更新值

#### 状态管理 (`src/stores/`)

- [`useAppStore.ts`](../src/stores/useAppStore.ts)
  - 全局应用状态
  - 语言和 Toast 消息管理

#### 配置 (`src/config/`)

- [`app.config.ts`](../src/config/app.config.ts)
  - 应用配置
  - API、OCR、导出等配置项

#### 路由 (`src/router/`)

- [`index.tsx`](../src/router/index.tsx)
  - React Router 配置
  - 所有路由定义和懒加载

#### 应用入口 (`src/`)

- [`App.tsx`](../src/App.tsx)
  - 应用根组件
  - 布局结构（Header、Main、Footer）

- [`main.tsx`](../src/main.tsx)
  - 应用入口文件
  - 渲染 React 应用

- [`index.css`](../src/index.css)
  - 全局样式
  - Tailwind CSS 和 CSS 变量

## 📝 注释规范

### 文件头注释

每个源代码文件都包含以下格式的文件头注释：

```typescript
// ==============================================================================
// filename - 文件说明
// ==============================================================================
// 
// 本文件的简要描述
// 
// 主要功能/类型：
// - 功能1
// - 功能2
//
// ==============================================================================
```

### 函数注释

每个导出的函数都包含 JSDoc 风格的注释：

```typescript
/**
 * 函数的简要说明
 * 
 * 详细说明函数的作用和使用场景
 * 
 * @param param1 - 参数1说明
 * @param param2 - 参数2说明
 * @returns 返回值说明
 * 
 * @example
 * // 使用示例
 * functionName(arg1, arg2)
 */
export function functionName(param1: string, param2: number): string {
  // ...
}
```

### 接口/类型注释

每个接口都包含详细说明：

```typescript
/**
 * 接口的简要说明
 * 
 * 详细说明接口的用途和包含的字段
 */
export interface InterfaceName {
  /**
   * 字段说明
   */
  fieldName: string;
}
```

### 行内注释

关键代码行添加行内注释：

```typescript
// 创建定时器，延迟更新值
const handler = setTimeout(() => {
  setDebouncedValue(value);
}, delay);

// 清理函数：取消之前的定时器
return () => {
  clearTimeout(handler);
};
```

### JSX 注释

React 组件中的关键部分添加注释：

```tsx
<div className="min-h-screen flex items-center justify-center">
  {/* 应用标题 */}
  <h1 className="text-4xl font-bold">Chat2Excel</h1>
  
  {/* 应用介绍 */}
  <p className="text-lg text-gray-600 mt-4">上传表格图片</p>
</div>
```

## 🎯 注释原则

1. **清晰易懂**：使用简洁明了的语言，避免专业术语
2. **全面覆盖**：为所有公共 API 添加注释
3. **示例丰富**：为复杂函数提供使用示例
4. **保持更新**：代码修改时同步更新注释
5. **避免冗余**：代码本身已经很清楚时不添加过多注释

## 💡 新手学习建议

### 阅读顺序建议

1. **先看类型定义**：了解数据结构
2. **再看配置文件**：了解应用设置
3. **然后看组件**：了解 UI 结构
4. **最后看工具函数**：了解辅助功能

### 学习路径

```
1. src/main.tsx          (应用入口)
   ↓
2. src/App.tsx           (根组件)
   ↓
3. src/router/index.tsx    (路由配置)
   ↓
4. src/views/             (页面组件)
   ↓
5. src/components/         (UI 组件)
   ↓
6. src/stores/            (状态管理)
   ↓
7. src/services/           (API 调用)
   ↓
8. src/hooks/             (自定义 Hooks)
   ↓
9. src/lib/              (工具函数)
   ↓
10. src/types/             (类型定义)
```

### 调试技巧

1. **使用 TypeScript 类型检查**：类型错误能帮助发现问题
2. **查看控制台**：注释中的 `console.log` 可以帮助调试
3. **使用 React DevTools**：查看组件状态和 props
4. **阅读错误信息**：注释中包含错误处理说明

## 🔍 快速查找

### 按功能查找

- **文件上传** → `src/types/api.ts`、`src/views/Home.tsx`
- **OCR 识别** → `src/types/recognition.ts`、`src/views/Recognizing.tsx`
- **表格编辑** → `src/types/table.ts`、`src/views/Editing.tsx`
- **Excel 导出** → `src/types/export.ts`、`src/views/Export.tsx`
- **状态管理** → `src/stores/useAppStore.ts`
- **API 调用** → `src/services/api/client.ts`
- **路由配置** → `src/router/index.tsx`

### 按文件类型查找

- **类型定义** → `src/types/`
- **工具函数** → `src/lib/`
- **React 组件** → `src/components/`
- **页面组件** → `src/views/`
- **自定义 Hooks** → `src/hooks/`
- **状态管理** → `src/stores/`
- **API 服务** → `src/services/`
- **配置文件** → `src/config/`

## 📚 相关资源

- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com/)
- [Zustand 文档](https://github.com/pmndrs/zustand)
- [React Router 文档](https://reactrouter.com/)

## 🤝 贡献指南

如果发现注释不清晰或有误：

1. 提交 Issue 描述问题
2. 说明文件位置和具体内容
3. 提出改进建议
4. 如有能力，提交 PR 改进

---

**最后更新**: 2024-01-03
**维护者**: Chat2Excel 团队
