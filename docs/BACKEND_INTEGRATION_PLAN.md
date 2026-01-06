# Chat2Excel 后端集成开发计划

**项目**: Chat2Excel - 表格OCR识别
**日期**: 2026-01-03
**状态**: 规划阶段 ⏳

---

## 📊 当前状态

### ✅ 已完成
1. **前端基础设施**
   - ✅ React + TypeScript + Vite 项目
   - ✅ Tailwind CSS 配置
   - ✅ ImageUpload 组件（拖拽上传）
   - ✅ ImagePreview 组件（预览+灯箱）
   - ✅ Home 页面集成

2. **Supabase 配置**
   - ✅ Supabase 项目创建
   - ✅ 数据库表创建（`image_uploads`, `ocr_tasks`）
   - ✅ Storage bucket `uploads` 创建（仅允许图片）
   - ✅ 环境变量配置
   - ✅ 客户端库安装

3. **测试验证**
   - ✅ 数据库表验证通过
   - ✅ Storage bucket 存在且可访问
   - ✅ 上传权限正常（仅支持图片格式）

---

## 🎯 开发目标

### 核心功能
1. 用户上传图片 → 保存到 Supabase Storage
2. 创建 OCR 任务 → 保存到数据库
3. 查询任务进度 → 实时更新
4. 下载识别结果 → 从 Storage 下载

---

## 📋 详细开发计划

### 阶段 1: 基础类型定义（30分钟）

**文件**: `src/types/supabase.ts`

```typescript
// 数据库表类型定义
export type ImageUpload = {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_path: string;
  file_url: string;
  mime_type: string;
  ocr_task_id?: string;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
};

export type OCRTask = {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  language: string;
  output_format: string;
  progress: number;
  error_message?: string;
  total_images: number;
  processed_images: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
};
```

**输出**:
- ✅ 完整的 TypeScript 类型定义
- ✅ Supabase 生成类型（可选）

---

### 阶段 2: Supabase 服务层（1小时）

**文件**: `src/services/supabase.ts` (新建) 或 `src/lib/supabase.ts` (扩展)

#### 2.1 用户认证服务
```typescript
// 功能：
- signIn() // 登录
- signUp() // 注册
- signOut() // 登出
- getCurrentUser() // 获取当前用户
- onAuthStateChange() // 监听认证状态变化
```

#### 2.2 图片上传服务
```typescript
// 功能：
- uploadImage(file: File) // 上传单个图片到 Storage
- uploadImages(files: File[]) // 批量上传
- deleteImage(path: string) // 删除图片
- getImageUrl(path: string) // 获取图片 URL
```

#### 2.3 OCR 任务服务
```typescript
// 功能：
- createOCRTask(images: ImageUpload[]) // 创建 OCR 任务
- getTaskStatus(taskId: string) // 获取任务状态
- getTaskProgress(taskId: string) // 获取任务进度
- updateTaskProgress(taskId: string, progress: number) // 更新进度
- completeTask(taskId: string, results: any) // 完成任务
- failTask(taskId: string, error: string) // 失败任务
```

#### 2.4 数据库记录服务
```typescript
// 功能：
- saveImageRecord(image: ImageUpload) // 保存图片记录
- getImageRecords(taskId: string) // 获取任务的图片列表
- deleteImageRecord(id: string) // 删除图片记录
- getTaskHistory(userId: string) // 获取用户历史任务
```

**输出**:
- ✅ 完整的服务层 API
- ✅ 错误处理
- ✅ TypeScript 类型安全

---

### 阶段 3: 集成到现有组件（1.5小时）

#### 3.1 更新 ImageUpload 组件

**修改文件**: `src/components/upload/ImageUpload.tsx`

**新增功能**:
```typescript
// 1. 上传到 Supabase Storage
const handleUploadToSupabase = async (files: File[]) => {
  // 显示上传进度
  // 上传到 Storage
  // 保存记录到数据库
  // 返回上传的图片信息
}

// 2. 上传状态管理
interface UploadState {
  uploading: boolean;
  progress: number; // 0-100
  currentFile: string;
  errors: string[];
}

// 3. 进度显示
<UploadProgress value={progress} />
```

**UI 改进**:
- 添加上传进度条
- 显示当前上传的文件名
- 实时错误提示
- 上传成功/失败状态

#### 3.2 创建 UploadProgress 组件

**新建文件**: `src/components/upload/UploadProgress.tsx`

```typescript
// 功能：
- 显示整体上传进度
- 显示当前文件上传状态
- 支持取消上传
- 显示上传速度和剩余时间
```

**输出**:
- ✅ 集成 Supabase 上传
- ✅ 进度显示
- ✅ 错误处理

---

### 阶段 4: 创建 OCR 任务管理（1小时）

#### 4.1 创建 TaskManager 服务

**新建文件**: `src/services/taskManager.ts`

```typescript
// 功能：
- createTask(images: UploadedImage[]) // 创建任务
- startTask(taskId: string) // 开始识别
- pollTaskStatus(taskId: string) // 轮询任务状态
- subscribeToTask(taskId: string) // 订阅实时更新（可选）
```

#### 4.2 创建 TaskContext

**新建文件**: `src/contexts/TaskContext.tsx`

```typescript
// 提供全局任务状态管理
interface TaskContextType {
  currentTask: OCRTask | null;
  createTask: (images: UploadedImage[]) => Promise<string>;
  updateProgress: (progress: number) => void;
  completeTask: (results: any) => void;
  failTask: (error: string) => void;
}
```

**输出**:
- ✅ 任务创建和管理
- ✅ 状态共享
- ✅ 实时更新

---

### 阶段 5: 任务进度页面（1小时）

#### 5.1 更新 Recognizing 页面

**修改文件**: `src/views/Recognizing.tsx`

**功能**:
```typescript
// 显示：
- 任务进度条（0-100%）
- 当前处理的图片
- 预计剩余时间
- 实时状态更新

// 交互：
- 自动跳转到编辑页面（完成后）
- 取消任务按钮
- 重试失败任务
```

#### 5.2 创建 ProgressBar 组件

**新建文件**: `src/components/ui/ProgressBar.tsx`

```typescript
// 功能：
- 动画进度条
- 百分比显示
- 状态指示（处理中/完成/失败）
```

**输出**:
- ✅ 实时进度显示
- ✅ 状态更新
- ✅ 用户体验优化

---

### 阶段 6: OCR 识别实现（2小时）

**注意**: 这是核心功能，需要讨论实现方案

#### 方案 A: 前端 OCR（Tesseract.js）

**文件**: `src/services/ocr.ts`

```typescript
// 功能：
- recognizeImage(image: File) // 识别单张图片
- recognizeBatch(images: File[]) // 批量识别
- parseTableData(rawData: any) // 解析表格数据
- exportToExcel(data: any[]) // 导出 Excel
```

**优点**:
- ✅ 纯前端实现
- ✅ 无需后端服务器
- ✅ 成本低

**缺点**:
- ❌ 性能较差（大图片）
- ❌ 准确率一般
- ❌ 占用客户端资源

#### 方案 B: 后端 OCR（推荐）

**需要**: Edge Functions 或独立后端服务

```typescript
// 前端调用：
const { data } = await supabase.functions.invoke('ocr-recognize', {
  body: { taskId, images }
});

// Edge Function (Supabase):
- 接收图片
- 调用 OCR API（Google Vision、Azure Form Recognizer 等）
- 解析结果
- 保存到数据库
- 返回结果
```

**优点**:
- ✅ 性能好
- ✅ 准确率高
- ✅ 支持大图片
- ✅ 不占用客户端资源

**缺点**:
- ❌ 需要后端服务
- ❌ 可能有 API 费用
- ❌ 复杂度较高

**输出**: 需要讨论选择方案

---

### 阶段 7: 编辑页面（1.5小时）

#### 7.1 更新 Editing 页面

**修改文件**: `src/views/Editing.tsx`

**功能**:
```typescript
// 显示：
- 识别结果表格
- 原始图片对比
- 编辑工具（修改单元格、合并、拆分）

// 交互：
- 实时编辑表格
- 撤销/重做
- 导出不同格式（Excel、CSV、JSON）
```

#### 7.2 创建 TableEditor 组件

**新建文件**: `src/components/editor/TableEditor.tsx`

```typescript
// 功能：
- 表格渲染
- 单元格编辑
- 行/列操作（添加、删除）
- 数据验证
```

**输出**:
- ✅ 表格编辑器
- ✅ 数据绑定
- ✅ 实时保存

---

### 阶段 8: 导出功能（1小时）

#### 8.1 创建导出服务

**新建文件**: `src/services/export.ts`

```typescript
// 功能：
- exportToExcel(data: any[]) // 导出 Excel
- exportToCSV(data: any[]) // 导出 CSV
- exportToJSON(data: any[]) // 导出 JSON
- saveToStorage(file: File, taskId: string) // 保存到 Storage
```

#### 8.2 更新 Export 页面

**修改文件**: `src/views/Export.tsx`

**功能**:
```typescript
// 显示：
- 导出格式选择
- 文件预览
- 下载历史

// 交互：
- 选择格式并导出
- 下载文件
- 分享链接（可选）
```

**输出**:
- ✅ 多格式导出
- ✅ 文件生成
- ✅ 下载功能

---

### 阶段 9: 用户认证（可选，1小时）

**如果需要用户登录功能**：

#### 9.1 创建 Auth 组件

**新建文件**: `src/components/auth/AuthForm.tsx`

```typescript
// 功能：
- 登录表单
- 注册表单
- 密码重置
- 第三方登录（Google、GitHub）
```

#### 9.2 创建 ProtectedRoute

**新建文件**: `src/components/auth/ProtectedRoute.tsx`

```typescript
// 功能：
- 路由保护
- 重定向到登录页
- 加载状态
```

**输出**:
- ✅ 用户认证
- ✅ 路由保护
- ✅ 权限管理

---

### 阶段 10: 测试与优化（1小时）

#### 10.1 单元测试

**文件**: 各组件的 `__tests__` 目录

```typescript
// 测试：
- Supabase 服务 mock
- 上传功能测试
- 任务管理测试
- UI 组件测试
```

#### 10.2 集成测试

**文件**: `tests/integration/`

```typescript
// 测试流程：
- 上传图片 → 创建任务 → 查询进度 → 导出结果
```

#### 10.3 性能优化

```typescript
// 优化：
- 图片压缩（上传前）
- 懒加载
- 缓存策略
- 错误重试
```

**输出**:
- ✅ 测试覆盖率 > 80%
- ✅ 性能优化
- ✅ 错误处理完善

---

## 🤔 需要讨论的问题

### 1. OCR 实现方案

**问题**: 使用前端 OCR 还是后端 OCR？

**选项**:
- A. 前端 OCR（Tesseract.js）
  - 优点：简单、成本低
  - 缺点：性能差、准确率低

- B. 后端 OCR（Edge Functions + API）
  - 优点：性能好、准确率高
  - 缺点：复杂、可能有费用

**建议**: 先用前端 OCR 快速原型，后续可升级到后端

### 2. 用户认证

**问题**: 是否需要用户登录？

**选项**:
- A. 需要登录（推荐）
  - 优点：数据隔离、用户管理、使用统计
  - 缺点：增加开发成本

- B. 匿名使用
  - 优点：简单、降低门槛
  - 缺点：数据不安全、无法管理用户

**建议**: 第一版先支持匿名使用，后续添加登录功能

### 3. 文件存储策略

**问题**: 上传的文件何时删除？

**选项**:
- A. 永久存储
  - 优点：用户可随时访问
  - 缺点：占用存储空间

- B. 定时删除（如7天后）
  - 优点：节省存储
  - 缺点：用户可能需要重新识别

- C. 用户手动删除
  - 优点：灵活
  - 缺点：用户可能忘记删除

**建议**: 永久存储 + 导出后可选删除

### 4. 实时更新方案

**问题**: 如何实时更新任务进度？

**选项**:
- A. 轮询（每秒查询一次）
  - 优点：简单、兼容性好
  - 缺点：延迟、资源占用

- B. Supabase Realtime
  - 优点：实时、低延迟
  - 缺点：需要配置、可能有额外费用

- C. WebSocket（自建）
  - 优点：完全控制
  - 缺点：复杂度高

**建议**: 先用轮询，后续升级到 Realtime

### 5. 开发优先级

**问题**: 哪些功能最重要？

**建议优先级**:
1. ✅ P0（必须有）: 图片上传、OCR识别、结果导出
2. ✅ P1（重要）: 进度显示、任务管理、错误处理
3. ✅ P2（次要）: 用户登录、历史记录、分享功能
4. ✅ P3（可选）: 多语言支持、批量处理、API开放

---

## 📅 开发时间线估算

### 快速原型版（MVP）- 1天

**目标**: 基本功能可用

```
✅ 阶段 1: 类型定义 (30分钟)
✅ 阶段 2: 服务层 (1小时)
✅ 阶段 3: 集成上传 (1.5小时)
✅ 阶段 6: 前端 OCR (2小时)
✅ 阶段 8: 导出功能 (1小时)
```

**功能**:
- 上传图片 → 前端 OCR → 编辑结果 → 导出 Excel
- 简单的进度显示
- 基本的错误处理

### 完整版 - 3-5天

**目标**: 生产就绪

```
Day 1: 上传 + 任务管理
Day 2: OCR 识别 + 进度显示
Day 3: 编辑功能 + 导出
Day 4: 用户认证 + 测试
Day 5: 优化 + 部署
```

---

## 🎯 建议

### 立即开始（最小可行版本）

**第一阶段** (今天完成):
1. ✅ 类型定义
2. ✅ Supabase 服务层（上传功能）
3. ✅ 集成到 ImageUpload 组件
4. ✅ 简单的任务创建

**第二阶段** (明天):
5. ✅ 前端 OCR 实现（Tesseract.js）
6. ✅ 进度显示
7. ✅ 结果导出

**第三阶段** (后续):
8. ✅ 用户认证
9. ✅ 后端 OCR（Edge Functions）
10. ✅ 性能优化

---

## 💬 讨论要点

请告诉我：

1. **OCR 方案**: 选择前端还是后端？
2. **用户认证**: 是否需要登录？
3. **文件策略**: 永久存储还是定时删除？
4. **实时更新**: 轮询还是 Realtime？
5. **开发范围**: 先做 MVP 还是完整版？
6. **时间安排**: 今天的开发目标是什么？

---

**创建日期**: 2026-01-03
**版本**: 1.0 - 规划版
**状态**: 等待讨论确认 ⏳
