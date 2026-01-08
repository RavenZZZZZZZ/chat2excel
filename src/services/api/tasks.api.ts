// ==============================================================================
// tasks.api.ts - 任务管理 API
// ==============================================================================
//
// 本服务提供与后端 API 交互的任务管理功能
// - 获取任务列表（分页）
// - 获取单个任务详情
// - 更新任务状态
// - 删除任务
//
// ==============================================================================

import apiClient, { type ApiResponse } from './client';
import type { OCRTask } from '@/types/ocr';

/**
 * 任务查询参数
 */
export interface TaskQuery {
  page?: number;
  pageSize?: number;
  status?: string;
}

/**
 * 任务列表响应
 */
export interface TaskListResponse {
  items: OCRTask[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 获取任务列表
 *
 * @param query - 查询参数（分页、状态筛选）
 * @returns 任务列表和分页信息
 */
export async function getTasks(query?: TaskQuery): Promise<TaskListResponse> {
  try {
    const response: ApiResponse<TaskListResponse> = await apiClient.get('/tasks', {
      params: query,
    });

    if (response.success && response.data) {
      return response.data;
    }

    // 返回空列表
    return {
      items: [],
      pagination: {
        page: query?.page || 1,
        pageSize: query?.pageSize || 20,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error) {
    console.error('[Tasks API] 获取任务列表失败:', error);
    throw error;
  }
}

/**
 * 获取任务详情
 *
 * @param id - 任务 ID
 * @returns 任务详情
 */
export async function getTask(id: string): Promise<OCRTask> {
  try {
    const response: ApiResponse<OCRTask> = await apiClient.get(`/tasks/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to get task');
  } catch (error) {
    console.error('[Tasks API] 获取任务详情失败:', error);
    throw error;
  }
}

/**
 * 更新任务
 *
 * @param id - 任务 ID
 * @param updates - 要更新的字段
 * @returns 更新后的任务
 */
export async function updateTask(
  id: string,
  updates: Partial<{
    ocrStatus: string;
    ocrText: string;
    ocrDuration: number;
    ocrError: string | null;
    parseSuccess: boolean;
    parseConfidence: number | null;
  }>
): Promise<OCRTask> {
  try {
    const response: ApiResponse<OCRTask> = await apiClient.put(`/tasks/${id}`, updates);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Failed to update task');
  } catch (error) {
    console.error('[Tasks API] 更新任务失败:', error);
    throw error;
  }
}

/**
 * 删除任务
 *
 * @param id - 任务 ID
 * @returns 是否删除成功
 */
export async function deleteTask(id: string): Promise<boolean> {
  try {
    const response: ApiResponse<never> = await apiClient.delete(`/tasks/${id}`);

    return response.success;
  } catch (error) {
    console.error('[Tasks API] 删除任务失败:', error);
    return false;
  }
}
