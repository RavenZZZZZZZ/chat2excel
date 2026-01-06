// ==============================================================================
// uploadService.ts - Supabase Storage 上传服务
// ==============================================================================
//
// 本服务提供文件上传到 Supabase Storage 的功能
// - 单文件/批量上传
// - 上传进度追踪
// - 文件验证
// - 错误处理
//
// ==============================================================================

import { supabase, isSupabaseAvailable } from '@/lib/supabase';
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
    // 清理文件名：移除特殊字符，只保留字母、数字、._-
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
    // 检查 Supabase 是否可用
    if (!isSupabaseAvailable()) {
      const task: UploadTask = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        file,
        status: 'error',
        progress: 0,
        preview: URL.createObjectURL(file),
        error: 'Supabase 未配置，无法上传文件',
      };
      return task;
    }

    const taskId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

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
      // 注意：Supabase Storage 在浏览器环境中不支持进度回调
      // 我们使用模拟进度：开始时设置为 50%，成功后设置为 100%
      task.progress = 50;
      task.status = 'uploading';
      onProgress?.({ ...task });

      const { data, error } = await supabase!.storage
        .from(this.config.bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      // 4. 获取公开 URL
      const { data: urlData } = supabase!.storage
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

    // 串行上传（避免并发过多）
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
    if (!isSupabaseAvailable()) {
      return false;
    }

    try {
      const { error } = await supabase!.storage
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
    console.error('UploadService error:', error);

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const err = error as {
        message?: string;
        error?: string;
        statusCode?: number;
      };

      // 提取 Supabase 错误信息
      if (err.error) {
        try {
          // 可能是 JSON 字符串
          const errorObj = typeof err.error === 'string'
            ? JSON.parse(err.error)
            : err.error;

          if (errorObj.message) {
            return errorObj.message;
          }
          if (errorObj.error) {
            return errorObj.error;
          }
        } catch {
          // 不是 JSON，直接返回
          return err.error;
        }
      }

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
