// ==============================================================================
// supabaseStorageService.ts - Supabase Storage 和数据库操作服务
// ==============================================================================
//
// 本服务提供与 Supabase Storage 和数据库的交互功能
// - 上传图片到 Supabase Storage
// - 保存 OCR 任务和解析结果到数据库
// - 支持重试机制和错误处理
// - 提供检查任务存在性和删除功能
//
// ==============================================================================

import { supabase, isSupabaseAvailable } from '@/lib/supabase';
import type { OCRTask } from '@/types/ocr';
import { createLogger } from '@/lib/logger';

const log = createLogger('SupabaseStorageService');

/**
 * Supabase Storage 和数据库操作服务
 */
export class SupabaseStorageService {
  private bucketName: string;
  private storagePath: string;

  constructor() {
    this.bucketName = import.meta.env.VITE_SUPABASE_BUCKET_NAME || 'ocr-images';
    this.storagePath = import.meta.env.VITE_SUPABASE_STORAGE_PATH || 'uploads';
  }

  /**
   * 上传图片到 Supabase Storage
   * @param file - 要上传的文件
   * @returns 文件路径和公开 URL，失败返回 null
   */
  async uploadImage(file: File): Promise<{ path: string; url: string } | null> {
    if (!isSupabaseAvailable()) {
      log.warn('Supabase 未配置，跳过图片上传');
      return null;
    }

    try {
      // 生成唯一文件名: timestamp_random_filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${timestamp}_${random}_${sanitizedName}`;
      const filePath = `${this.storagePath}/${fileName}`;

      log.debug(`开始上传图片: ${file.name} -> ${filePath}`);

      // 上传文件
      const { data, error } = await supabase!
        .storage
        .from(this.bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        log.error('图片上传失败:', error);
        return null;
      }

      // 获取公开 URL
      const { data: { publicUrl } } = supabase!
        .storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      log.info(`图片上传成功: ${publicUrl}`);
      return { path: filePath, url: publicUrl };

    } catch (error) {
      log.error('图片上传异常:', error);
      return null;
    }
  }

  /**
   * 保存 OCR 任务到数据库
   * @param task - OCR 任务对象
   * @param imagePath - Supabase Storage 路径（可选）
   * @param imageUrl - 公开 URL（可选）
   * @returns 数据库记录 ID，失败返回 null
   */
  async saveOCRTask(
    task: OCRTask,
    imagePath?: string,
    imageUrl?: string
  ): Promise<string | null> {
    if (!isSupabaseAvailable()) {
      log.warn('Supabase 未配置，跳过保存任务');
      return null;
    }

    try {
      // 获取图片尺寸
      const { width, height } = await this.getImageDimensions(task.file);

      // 构造数据库记录
      const record = {
        task_id: task.id,
        file_name: task.file.name,
        file_size: task.file.size,
        file_path: imagePath || null,
        file_url: imageUrl || null,
        ocr_text: task.result?.text || '',
        ocr_status: task.status,
        ocr_duration: task.result?.duration || 0,
        ocr_error: task.error || null,
        parse_success: false,  // 后续可以解析 result 更新
        parse_confidence: null,
        mime_type: task.file.type,
        image_width: width,
        image_height: height,
      };

      log.debug(`保存 OCR 任务: ${task.id}`);

      const { data, error } = await supabase!
        .from('ocr_tasks')
        .insert(record)
        .select('id')
        .single();

      if (error) {
        log.error('保存任务失败:', error);
        return null;
      }

      log.info(`任务保存成功: ${data.id}`);
      return data.id;

    } catch (error) {
      log.error('保存任务异常:', error);
      return null;
    }
  }

  /**
   * 上传图片并保存 OCR 任务（组合操作）
   * @param file - 图片文件
   * @param task - OCR 任务对象
   * @returns 包含图片路径、URL 和任务 ID 的对象，失败返回 null
   */
  async saveOCRResult(
    file: File,
    task: OCRTask
  ): Promise<{ imagePath: string; imageUrl: string; taskId: string } | null> {
    if (!isSupabaseAvailable()) {
      log.warn('Supabase 未配置，跳过保存');
      return null;
    }

    try {
      // 1. 上传图片
      const uploadResult = await this.uploadImage(file);
      if (!uploadResult) {
        log.error('图片上传失败，取消保存任务');
        return null;
      }

      // 2. 保存 OCR 任务
      const dbTaskId = await this.saveOCRTask(
        task,
        uploadResult.path,
        uploadResult.url
      );

      if (!dbTaskId) {
        log.error('任务保存失败（图片已上传）');
        // 图片已上传但任务保存失败，可以选择删除图片
        return null;
      }

      return {
        imagePath: uploadResult.path,
        imageUrl: uploadResult.url,
        taskId: dbTaskId,
      };

    } catch (error) {
      log.error('保存 OCR 结果异常:', error);
      return null;
    }
  }

  /**
   * 检查任务是否已保存
   * @param taskId - 任务 ID
   * @returns 任务是否存在
   */
  async taskExists(taskId: string): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      return false;
    }

    try {
      const { data, error } = await supabase!
        .from('ocr_tasks')
        .select('id')
        .eq('task_id', taskId)
        .single();

      return !error && !!data;

    } catch (error) {
      log.error('检查任务存在性失败:', error);
      return false;
    }
  }

  /**
   * 删除 OCR 任务和关联图片
   * @param taskId - 任务 ID
   * @param imagePath - 图片路径（可选）
   * @returns 是否删除成功
   */
  async deleteOCRTask(taskId: string, imagePath?: string): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      return false;
    }

    try {
      // 1. 删除数据库记录
      const { error: dbError } = await supabase!
        .from('ocr_tasks')
        .delete()
        .eq('task_id', taskId);

      if (dbError) {
        log.error('删除任务记录失败:', dbError);
        return false;
      }

      // 2. 删除 Storage 中的图片
      if (imagePath) {
        const { error: storageError } = await supabase!
          .storage
          .from(this.bucketName)
          .remove([imagePath]);

        if (storageError) {
          log.warn('删除图片失败:', storageError);
          // 不返回 false，因为数据库记录已删除
        }
      }

      log.info(`删除任务成功: ${taskId}`);
      return true;

    } catch (error) {
      log.error('删除任务异常:', error);
      return false;
    }
  }

  /**
   * 获取图片尺寸
   * @param file - 图片文件
   * @returns 图片宽高
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
        log.warn('无法获取图片尺寸，使用默认值');
        resolve({ width: 0, height: 0 });
      };

      img.src = url;
    });
  }

  /**
   * 上传图片（带重试）
   * @param file - 要上传的文件
   * @param maxRetries - 最大重试次数（默认 3）
   * @returns 文件路径和公开 URL，失败返回 null
   */
  async uploadImageWithRetry(
    file: File,
    maxRetries: number = 3
  ): Promise<{ path: string; url: string } | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.uploadImage(file);
        if (result) {
          return result;
        }
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // 指数退避: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        log.warn(`上传失败，${delay}ms 后重试 (${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return null;
  }
}

/**
 * 导出服务实例
 */
export const supabaseStorageService = new SupabaseStorageService();
