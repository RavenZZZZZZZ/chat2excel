# 图片上传功能详细实现方案

**范围**: 仅针对图片上传相关功能
**日期**: 2026-01-03

---

## 📋 功能清单

### 核心功能
1. ✅ 图片上传到 Supabase Storage
2. ✅ 上传记录保存到数据库 `image_uploads` 表
3. ✅ 上传进度显示
4. ✅ 错误处理和用户提示
5. ✅ 集成到现有 ImageUpload 组件

---

## 🎯 功能 1: 图片上传到 Supabase Storage

### 1.1 文件结构

```
src/
├── services/
│   ├── upload/
│   │   ├── index.ts                    # 导出
│   │   ├── uploadService.ts             # 上传服务
│   │   └── types.ts                     # 类型定义
│   └── supabaseClient.ts               # Supabase 客户端
├── components/
│   └── upload/
│       ├── ImageUpload.tsx             # 已存在，需要修改
│       └── UploadProgress.tsx          # 新增：进度条组件
└── types/
    └── upload.ts                        # 上传相关类型
```

---

### 1.2 类型定义

**文件**: `src/types/upload.ts`

```typescript
/**
 * 上传文件状态
 */
export type UploadStatus =
  | 'idle'          // 空闲
  | 'uploading'     // 上传中
  | 'success'       // 成功
  | 'error'         // 错误
  | 'cancelled';    // 已取消

/**
 * 上传任务信息
 */
export interface UploadTask {
  id: string;                    // 任务 ID
  file: File;                    // 原始文件
  status: UploadStatus;          // 状态
  progress: number;              // 进度 0-100
  error?: string;                // 错误信息
  preview?: string;              // 本地预览 URL
  uploadedPath?: string;         // 上传后的路径
  uploadedUrl?: string;          // 上传后的 URL
  recordId?: string;             // 数据库记录 ID
}

/**
 * 上传结果
 */
export interface UploadResult {
  success: boolean;
  tasks: UploadTask[];
  errors: string[];
}

/**
 * 上传配置
 */
export interface UploadConfig {
  maxSize: number;               // 最大文件大小（字节）
  allowedTypes: string[];        // 允许的 MIME 类型
  bucketName: string;            // Storage bucket 名称
  path: string;                  // 上传路径（可以是函数）
}

/**
 * 上传进度回调
 */
export type ProgressCallback = (task: UploadTask) => void;

/**
 * 上传完成回调
 */
export type CompleteCallback = (result: UploadResult) => void;
```

---

### 1.3 上传服务实现

**文件**: `src/services/upload/uploadService.ts`

```typescript
import { supabase } from '@/lib/supabase';
import type { UploadTask, UploadConfig, ProgressCallback } from '@/types/upload';

/**
 * 上传服务类
 */
export class UploadService {
  private config: UploadConfig;

  constructor(config: UploadConfig) {
    this.config = config;
  }

  /**
   * 生成文件路径
   * 格式: uploads/{user_id}/{timestamp}_{random}_{filename}
   */
  private generatePath(userId: string, filename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${this.config.path}/${userId}/${timestamp}_${random}_${sanitizedName}`;
  }

  /**
   * 上传单个文件
   */
  async uploadFile(
    file: File,
    userId: string,
    onProgress?: ProgressCallback
  ): Promise<UploadTask> {
    const taskId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 创建任务对象
    const task: UploadTask = {
      id: taskId,
      file,
      status: 'uploading',
      progress: 0,
      preview: URL.createObjectURL(file),
    };

    try {
      // 1. 验证文件
      this.validateFile(file);

      // 2. 生成路径
      const filePath = this.generatePath(userId, file.name);

      // 3. 上传到 Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.config.bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            task.progress = Math.round(percentage);
            task.status = 'uploading';
            onProgress?.({ ...task });
          },
        });

      if (error) throw error;

      // 4. 获取公开 URL
      const { data: urlData } = supabase.storage
        .from(this.config.bucketName)
        .getPublicUrl(filePath);

      // 5. 更新任务状态
      task.status = 'success';
      task.progress = 100;
      task.uploadedPath = data.path;
      task.uploadedUrl = urlData.publicUrl;

      return task;

    } catch (error) {
      // 6. 处理错误
      task.status = 'error';
      task.error = this.handleError(error);
      return task;
    }
  }

  /**
   * 批量上传文件
   */
  async uploadFiles(
    files: File[],
    userId: string,
    onProgress?: ProgressCallback
  ): Promise<UploadTask[]> {
    const tasks: UploadTask[] = [];

    for (const file of files) {
      const task = await this.uploadFile(file, userId, onProgress);
      tasks.push(task);
    }

    return tasks;
  }

  /**
   * 验证文件
   */
  private validateFile(file: File): void {
    // 检查文件大小
    if (file.size > this.config.maxSize) {
      throw new Error(
        `文件大小超过限制 (${this.formatSize(this.config.maxSize)})`
      );
    }

    // 检查文件类型
    if (!this.config.allowedTypes.includes(file.type)) {
      throw new Error(
        `不支持的文件类型: ${file.type}`
      );
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(this.config.bucketName)
        .remove([path]);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * 处理错误信息
   */
  private handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const err = error as { message?: string; error?: string };
      return err.message || err.error || '上传失败';
    }

    return '未知错误';
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

/**
 * 创建默认上传服务实例
 */
export const uploadService = new UploadService({
  maxSize: 10 * 1024 * 1024,        // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  bucketName: 'uploads',
  path: 'uploads',
});
```

---

## 🎯 功能 2: 保存上传记录到数据库

### 2.1 数据库服务

**文件**: `src/services/upload/databaseService.ts`

```typescript
import { supabase } from '@/lib/supabase';
import type { UploadTask } from '@/types/upload';

/**
 * 图片上传记录
 */
export interface ImageUploadRecord {
  id?: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_path: string;
  file_url: string;
  mime_type: string;
  ocr_task_id?: string;
  width?: number;
  height?: number;
}

/**
 * 数据库服务类
 */
export class DatabaseService {
  /**
   * 保存上传记录
   */
  async saveUploadRecord(
    task: UploadTask,
    userId: string
  ): Promise<string | null> {
    try {
      // 获取图片尺寸
      const { width, height } = await this.getImageDimensions(task.file);

      // 构造记录
      const record: ImageUploadRecord = {
        user_id: userId,
        file_name: task.file.name,
        file_size: task.file.size,
        file_path: task.uploadedPath!,
        file_url: task.uploadedUrl!,
        mime_type: task.file.type,
        width,
        height,
      };

      // 插入数据库
      const { data, error } = await supabase
        .from('image_uploads')
        .insert(record)
        .select('id')
        .single();

      if (error) throw error;

      return data.id;

    } catch (error) {
      console.error('保存记录失败:', error);
      return null;
    }
  }

  /**
   * 批量保存上传记录
   */
  async saveUploadRecords(
    tasks: UploadTask[],
    userId: string
  ): Promise<Map<string, string>> {
    const recordIds = new Map<string, string>();

    for (const task of tasks) {
      if (task.status === 'success' && task.uploadedPath) {
        const recordId = await this.saveUploadRecord(task, userId);
        if (recordId) {
          recordIds.set(task.id, recordId);
        }
      }
    }

    return recordIds;
  }

  /**
   * 删除上传记录
   */
  async deleteUploadRecord(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('image_uploads')
        .delete()
        .eq('id', id);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * 获取图片尺寸
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };

      img.src = url;
    });
  }
}

export const databaseService = new DatabaseService();
```

---

## 🎯 功能 3: 上传进度显示

### 3.1 进度条组件

**文件**: `src/components/upload/UploadProgress.tsx`

```typescript
import { UploadTask } from '@/types/upload';

interface UploadProgressProps {
  tasks: UploadTask[];
  onCancel?: (taskId: string) => void;
}

/**
 * 上传进度组件
 */
export function UploadProgress({ tasks, onCancel }: UploadProgressProps) {
  // 计算总体进度
  const totalProgress = tasks.length > 0
    ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length
    : 0;

  // 统计状态
  const stats = {
    total: tasks.length,
    uploading: tasks.filter(t => t.status === 'uploading').length,
    success: tasks.filter(t => t.status === 'success').length,
    error: tasks.filter(t => t.status === 'error').length,
  };

  return (
    <div className="space-y-4">
      {/* 总体进度 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            上传进度
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(totalProgress)}%
          </span>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* 统计信息 */}
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>总计: {stats.total}</span>
          <span className="text-blue-600">上传中: {stats.uploading}</span>
          <span className="text-green-600">成功: {stats.success}</span>
          {stats.error > 0 && (
            <span className="text-red-600">失败: {stats.error}</span>
          )}
        </div>
      </div>

      {/* 单个文件进度 */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <UploadTaskItem
            key={task.id}
            task={task}
            onCancel={onCancel}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 单个任务进度项
 */
function UploadTaskItem({
  task,
  onCancel
}: {
  task: UploadTask
  onCancel?: (taskId: string) => void
}) {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'uploading':
        return (
          <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md flex items-center gap-3">
      {/* 状态图标 */}
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>

      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {task.file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {task.status === 'uploading' && `上传中... ${task.progress}%`}
          {task.status === 'success' && '上传成功'}
          {task.status === 'error' && task.error}
        </p>

        {/* 进度条 */}
        {task.status === 'uploading' && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-200"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* 取消按钮 */}
      {task.status === 'uploading' && onCancel && (
        <button
          onClick={() => onCancel(task.id)}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="取消上传"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
```

---

## 🎯 功能 4: 集成到现有组件

### 4.1 修改 ImageUpload 组件

**文件**: `src/components/upload/ImageUpload.tsx` (修改已存在的文件)

```typescript
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadService } from '@/services/upload/uploadService';
import { databaseService } from '@/services/upload/databaseService';
import { UploadProgress } from './UploadProgress';
import type { UploadTask } from '@/types/upload';

export function ImageUpload({
  value,
  onChange,
  maxSize = 10 * 1024 * 1024,
  multiple = true,
}: ImageUploadProps) {
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * 处理文件上传
   */
  const handleUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadTasks([]);

    try {
      // 1. 创建任务列表
      const tasks: UploadTask[] = files.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        status: 'idle' as const,
        progress: 0,
        preview: URL.createObjectURL(file),
      }));

      setUploadTasks(tasks);

      // 2. 获取用户 ID（临时使用匿名用户 ID）
      const userId = await getOrCreateUserId();

      // 3. 上传文件到 Storage
      const uploadResults = await uploadService.uploadFiles(
        files,
        userId,
        (updatedTask) => {
          // 更新任务进度
          setUploadTasks(prev =>
            prev.map(t => t.id === updatedTask.id ? updatedTask : t)
          );
        }
      );

      // 4. 保存记录到数据库
      const recordIds = await databaseService.saveUploadRecords(
        uploadResults,
        userId
      );

      // 5. 更新任务状态（添加记录 ID）
      const finalTasks = uploadResults.map(task => ({
        ...task,
        recordId: recordIds.get(task.id),
      }));

      setUploadTasks(finalTasks);

      // 6. 通知父组件
      const successfulUploads = finalTasks.filter(t => t.status === 'success');
      if (successfulUploads.length > 0) {
        onChange?.([...value, ...successfulUploads]);
      }

    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setIsUploading(false);
    }
  }, [value, onChange]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleUpload(acceptedFiles);
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    maxSize,
    multiple,
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      {/* 拖拽上传区域 */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {/* 上传提示 */}
        {isUploading ? (
          <p className="text-lg text-gray-600">正在上传...</p>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? '释放鼠标上传' : '拖拽图片或点击选择'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              支持 JPG、PNG、WEBP、GIF，最大 {maxSize / 1024 / 1024}MB
            </p>
          </>
        )}
      </div>

      {/* 上传进度 */}
      {uploadTasks.length > 0 && (
        <UploadProgress
          tasks={uploadTasks}
          onCancel={(taskId) => {
            // TODO: 实现取消上传
            console.log('取消上传:', taskId);
          }}
        />
      )}
    </div>
  );
}

/**
 * 获取或创建用户 ID（临时方案）
 * TODO: 后续替换为真实的用户认证
 */
async function getOrCreateUserId(): Promise<string> {
  let userId = localStorage.getItem('anonymous_user_id');

  if (!userId) {
    userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_user_id', userId);
  }

  return userId;
}
```

---

## 🎯 功能 5: 错误处理

### 5.1 错误类型定义

**文件**: `src/types/upload.ts` (添加)

```typescript
/**
 * 上传错误类型
 */
export type UploadErrorCode =
  | 'FILE_TOO_LARGE'          // 文件过大
  | 'INVALID_FILE_TYPE'       // 文件类型无效
  | 'NETWORK_ERROR'           // 网络错误
  | 'STORAGE_ERROR'           // Storage 错误
  | 'DATABASE_ERROR'          // 数据库错误
  | 'UNKNOWN_ERROR';          // 未知错误

/**
 * 上传错误
 */
export interface UploadError {
  code: UploadErrorCode;
  message: string;
  details?: any;
}

/**
 * 错误信息映射
 */
export const ERROR_MESSAGES: Record<UploadErrorCode, string> = {
  FILE_TOO_LARGE: '文件大小超过限制（最大 10MB）',
  INVALID_FILE_TYPE: '不支持的文件格式，请上传 JPG、PNG、WEBP 或 GIF 图片',
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  STORAGE_ERROR: '文件上传失败，请稍后重试',
  DATABASE_ERROR: '保存记录失败，请稍后重试',
  UNKNOWN_ERROR: '未知错误，请稍后重试',
};
```

### 5.2 错误处理工具

**文件**: `src/services/upload/errorHandler.ts`

```typescript
import { UploadError, UploadErrorCode, ERROR_MESSAGES } from '@/types/upload';

/**
 * 错误处理类
 */
export class UploadErrorHandler {
  /**
   * 解析错误
   */
  static parseError(error: unknown): UploadError {
    // Supabase Storage 错误
    if (this.isSupabaseError(error)) {
      return this.parseSupabaseError(error);
    }

    // 文件大小错误
    if (error instanceof Error && error.message.includes('File too large')) {
      return {
        code: 'FILE_TOO_LARGE',
        message: ERROR_MESSAGES.FILE_TOO_LARGE,
        details: error,
      };
    }

    // 默认错误
    return {
      code: 'UNKNOWN_ERROR',
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
      details: error,
    };
  }

  /**
   * 判断是否为 Supabase 错误
   */
  private static isSupabaseError(error: unknown): error is { message: string; statusCode?: number } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    );
  }

  /**
   * 解析 Supabase 错误
   */
  private static parseSupabaseError(error: { message: string; statusCode?: number }): UploadError {
    const { message, statusCode } = error;

    // MIME type 错误
    if (message.includes('mime type')) {
      return {
        code: 'INVALID_FILE_TYPE',
        message: ERROR_MESSAGES.INVALID_FILE_TYPE,
        details: error,
      };
    }

    // 权限错误
    if (statusCode === 403 || message.includes('permission')) {
      return {
        code: 'STORAGE_ERROR',
        message: '没有上传权限，请检查登录状态',
        details: error,
      };
    }

    // Storage 配额错误
    if (message.includes('quota') || message.includes('limit')) {
      return {
        code: 'STORAGE_ERROR',
        message: '存储空间不足',
        details: error,
      };
    }

    // 网络/连接错误
    if (statusCode === 0 || statusCode === 503) {
      return {
        code: 'NETWORK_ERROR',
        message: ERROR_MESSAGES.NETWORK_ERROR,
        details: error,
      };
    }

    return {
      code: 'STORAGE_ERROR',
      message: ERROR_MESSAGES.STORAGE_ERROR,
      details: error,
    };
  }

  /**
   * 获取用户友好的错误提示
   */
  static getUserMessage(error: UploadError): string {
    return error.message;
  }

  /**
   * 获取错误详情（用于调试）
   */
  static getErrorDetails(error: UploadError): string {
    if (error.details) {
      if (error.details instanceof Error) {
        return error.details.stack || error.details.message;
      }
      return JSON.stringify(error.details, null, 2);
    }
    return '';
  }
}
```

---

## 📊 实现流程图

```
用户选择文件
    ↓
验证文件（大小、类型）
    ↓
创建上传任务
    ↓
上传到 Supabase Storage
    ↓ (实时更新进度)
获取公开 URL
    ↓
保存记录到数据库
    ↓
更新任务状态（成功）
    ↓
通知父组件（更新 value）
```

---

## 🧪 测试要点

### 单元测试

```typescript
describe('UploadService', () => {
  it('应该正确验证文件大小');
  it('应该正确验证文件类型');
  it('应该成功上传文件');
  it('应该正确处理上传错误');
});

describe('DatabaseService', () => {
  it('应该正确保存上传记录');
  it('应该正确获取图片尺寸');
  it('应该正确删除记录');
});
```

### 集成测试

```typescript
describe('ImageUpload 组件集成', () => {
  it('应该完整地上传文件流程');
  it('应该正确显示上传进度');
  it('应该正确处理上传错误');
});
```

---

## 📝 使用示例

```typescript
// 在父组件中使用
function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadTask[]>([]);

  return (
    <ImageUpload
      value={uploadedFiles}
      onChange={setUploadedFiles}
      multiple={true}
      maxSize={10 * 1024 * 1024}
    />
  );
}
```

---

## 🎯 实现优先级

| 功能 | 优先级 | 预计时间 |
|------|--------|---------|
| 类型定义 | P0 | 15分钟 |
| uploadService | P0 | 45分钟 |
| databaseService | P0 | 30分钟 |
| UploadProgress 组件 | P1 | 30分钟 |
| 集成到 ImageUpload | P0 | 30分钟 |
| 错误处理 | P0 | 30分钟 |
| 测试 | P1 | 30分钟 |

**总计**: 约 3 小时

---

**创建日期**: 2026-01-03
**版本**: 1.0 - 详细设计版
