// ==============================================================================
// databaseService.ts - 数据库记录服务
// ==============================================================================
//
// 本服务提供与 Supabase 数据库交互的功能
// - 保存上传记录到 image_uploads 表
// - 获取图片尺寸
// - 删除记录
//
// ==============================================================================

import { supabase, isSupabaseAvailable } from '@/lib/supabase';
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
   * 保存单个上传记录
   */
  async saveUploadRecord(
    task: UploadTask,
    userId: string
  ): Promise<string | null> {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase 未配置，无法保存记录');
      return null;
    }

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
      const { data, error } = await supabase!
        .from('image_uploads')
        .insert(record)
        .select('id')
        .single();

      if (error) {
        console.error('保存记录失败:', error);
        return null;
      }

      return data.id;

    } catch (error) {
      console.error('保存记录异常:', error);
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
    if (!isSupabaseAvailable()) {
      return false;
    }

    try {
      const { error } = await supabase!
        .from('image_uploads')
        .delete()
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('删除记录失败:', error);
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
        console.warn('无法获取图片尺寸，使用默认值');
        resolve({ width: 0, height: 0 });
      };

      img.src = url;
    });
  }

  /**
   * 根据任务 ID 获取上传记录
   */
  async getRecordsByTaskId(taskId: string): Promise<ImageUploadRecord[]> {
    if (!isSupabaseAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('image_uploads')
        .select('*')
        .eq('ocr_task_id', taskId);

      if (error) {
        console.error('获取记录失败:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('获取记录异常:', error);
      return [];
    }
  }

  /**
   * 获取用户的上传记录
   */
  async getUserRecords(userId: string, limit: number = 50): Promise<ImageUploadRecord[]> {
    if (!isSupabaseAvailable()) {
      return [];
    }

    try {
      const { data, error } = await supabase!
        .from('image_uploads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('获取用户记录失败:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('获取用户记录异常:', error);
      return [];
    }
  }
}

/**
 * 导出数据库服务实例
 */
export const databaseService = new DatabaseService();
