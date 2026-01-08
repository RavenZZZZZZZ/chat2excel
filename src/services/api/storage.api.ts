// ==============================================================================
// storage.api.ts - 文件存储 API
// ==============================================================================
//
// 本服务提供与后端 API 交互的文件存储功能
// - 上传图片到后端，后端再上传到 Supabase Storage
// - 删除 Supabase Storage 中的图片
// - 检查任务存在性
// - 删除 OCR 任务和关联图片
//
// 这个文件替代了原来的 supabaseStorageService.ts
// 前端不再直接访问 Supabase，所有操作都通过后端 API
//
// ==============================================================================

import apiClient, { type ApiResponse } from './client';
import type { OCRTask } from '@/types/ocr';

/**
 * 上传图片到服务器
 *
 * @param file - 要上传的文件
 * @returns 文件路径和公开 URL，失败返回 null
 */
export async function uploadImage(file: File): Promise<{ path: string; url: string } | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response: ApiResponse<{ path: string; url: string }> = await apiClient.post(
      '/storage/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('[Storage API] 上传图片失败:', error);
    return null;
  }
}

/**
 * 删除 Supabase Storage 中的图片
 *
 * @param path - 图片路径
 * @returns 是否删除成功
 */
export async function deleteImage(path: string): Promise<boolean> {
  try {
    const response: ApiResponse<never> = await apiClient.delete('/storage/delete', {
      params: { path },
    });

    return response.success;
  } catch (error) {
    console.error('[Storage API] 删除图片失败:', error);
    return false;
  }
}

/**
 * 保存 OCR 任务到数据库
 *
 * @param task - OCR 任务对象
 * @param imagePath - Supabase Storage 路径（可选）
 * @param imageUrl - 公开 URL（可选）
 * @returns 数据库记录 ID，失败返回 null
 */
export async function saveOCRTask(
  task: OCRTask,
  imagePath?: string,
  imageUrl?: string
): Promise<string | null> {
  try {
    const response: ApiResponse<{ id: string }> = await apiClient.post('/tasks', {
      taskId: task.id,
      fileName: task.file.name,
      fileSize: task.file.size,
      imagePath,
      imageUrl,
      ocrText: task.result?.text || '',
      ocrStatus: task.status,
      ocrDuration: task.result?.duration || 0,
      ocrError: task.error || null,
      mimeType: task.file.type,
    });

    if (response.success && response.data) {
      return response.data.id;
    }
    return null;
  } catch (error) {
    console.error('[Storage API] 保存任务失败:', error);
    return null;
  }
}

/**
 * 上传图片并保存 OCR 任务（组合操作）
 *
 * 这个函数保持与原 supabaseStorageService.saveOCRResult 相同的签名
 * 以最小化前端代码改动
 *
 * @param file - 图片文件
 * @param task - OCR 任务对象
 * @returns 包含图片路径、URL 和任务 ID 的对象，失败返回 null
 */
export async function saveOCRResult(
  file: File,
  task: OCRTask
): Promise<{ taskId: string; imagePath: string; imageUrl: string } | null> {
  try {
    // 1. 上传图片
    const uploadResult = await uploadImage(file);
    if (!uploadResult) {
      console.error('[Storage API] 图片上传失败');
      return null;
    }

    // 2. 保存任务
    const taskId = await saveOCRTask(task, uploadResult.path, uploadResult.url);
    if (!taskId) {
      console.error('[Storage API] 任务保存失败（图片已上传）');
      return null;
    }

    return {
      taskId,
      imagePath: uploadResult.path,
      imageUrl: uploadResult.url,
    };
  } catch (error) {
    console.error('[Storage API] 保存 OCR 结果失败:', error);
    return null;
  }
}

/**
 * 检查任务是否已保存
 *
 * @param taskId - 任务 ID
 * @returns 任务是否存在
 */
export async function taskExists(taskId: string): Promise<boolean> {
  try {
    const response: ApiResponse<{ exists: boolean }> = await apiClient.get(`/tasks/exists`, {
      params: { taskId },
    });

    return response.data?.exists || false;
  } catch (error) {
    console.error('[Storage API] 检查任务存在性失败:', error);
    return false;
  }
}

/**
 * 删除 OCR 任务和关联图片
 *
 * 这个函数保持与原 supabaseStorageService.deleteOCRTask 相同的签名
 * 以最小化前端代码改动
 *
 * @param taskId - 任务 ID
 * @param imagePath - 图片路径（可选）
 * @returns 是否删除成功
 */
export async function deleteOCRTask(taskId: string, imagePath?: string): Promise<boolean> {
  try {
    const response: ApiResponse<never> = await apiClient.delete(`/tasks/${taskId}`, {
      data: { imagePath },
    });

    return response.success;
  } catch (error) {
    console.error('[Storage API] 删除任务失败:', error);
    return false;
  }
}

/**
 * 上传图片（带重试）
 *
 * @param file - 要上传的文件
 * @param maxRetries - 最大重试次数（默认 3）
 * @returns 文件路径和公开 URL，失败返回 null
 */
export async function uploadImageWithRetry(
  file: File,
  maxRetries: number = 3
): Promise<{ path: string; url: string } | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await uploadImage(file);
      if (result) {
        return result;
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // 指数退避: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.warn(`[Storage API] 上传失败，${delay}ms 后重试 (${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return null;
}
