// ==============================================================================
// useUploadStore.ts - 文件上传和 OCR 状态管理
// ==============================================================================
//
// 本文件使用 Zustand 创建全局文件上传和 OCR 状态 Store。
//
// 管理的状态：
// - uploadedFiles: 已上传的文件列表
// - ocrTasks: OCR 任务列表
// - parsedResults: 表格解析结果
//
// ==============================================================================

import { create } from 'zustand';
import type { OCRTask } from '@/types/ocr';
import type { TableParseResult } from '@/types/table';

/**
 * 文件接口
 */
export interface UploadFile {
  file: File;
  preview: string;
  id: string;
  uploadedPath?: string;
  uploadedUrl?: string;
  recordId?: string;
}

/**
 * 上传和 OCR 状态接口
 */
interface UploadState {
  // 已上传的文件
  uploadedFiles: UploadFile[];

  // OCR 任务
  ocrTasks: OCRTask[];

  // 表格解析结果
  parsedResults: TableParseResult[];

  // Actions
  setUploadedFiles: (files: UploadFile[]) => void;
  addUploadedFiles: (files: UploadFile[]) => void;
  removeUploadedFile: (id: string) => void;
  clearUploadedFiles: () => void;

  setOcrTasks: (tasks: OCRTask[]) => void;
  updateOcrTask: (task: OCRTask) => void;
  clearOcrTasks: () => void;

  setParsedResults: (results: TableParseResult[]) => void;
  clearParsedResults: () => void;

  // 清理所有状态（用于页面切换时）
  resetAll: () => void;
}

/**
 * 创建上传和 OCR 状态 Store
 */
export const useUploadStore = create<UploadState>((set) => ({
  // 初始状态
  uploadedFiles: [],
  ocrTasks: [],
  parsedResults: [],

  /**
   * 设置已上传的文件列表
   */
  setUploadedFiles: (files) => set({ uploadedFiles: files }),

  /**
   * 添加文件到已上传列表
   */
  addUploadedFiles: (files) => set((state) => ({
    uploadedFiles: [...state.uploadedFiles, ...files]
  })),

  /**
   * 删除单个文件
   */
  removeUploadedFile: (id) => set((state) => {
    const fileToRemove = state.uploadedFiles.find(f => f.id === id);

    // 释放 blob URL
    if (fileToRemove?.preview.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    return {
      uploadedFiles: state.uploadedFiles.filter((f) => f.id !== id)
    };
  }),

  /**
   * 清空所有已上传文件
   */
  clearUploadedFiles: () => set((state) => {
    // 释放所有 blob URLs
    state.uploadedFiles.forEach(file => {
      if (file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });

    return { uploadedFiles: [] };
  }),

  /**
   * 设置 OCR 任务列表
   */
  setOcrTasks: (tasks) => set({ ocrTasks: tasks }),

  /**
   * 更新单个 OCR 任务
   */
  updateOcrTask: (task) => set((state) => {
    const existingIndex = state.ocrTasks.findIndex((t) => t.id === task.id);

    if (existingIndex >= 0) {
      const newTasks = [...state.ocrTasks];
      newTasks[existingIndex] = task;
      return { ocrTasks: newTasks };
    } else {
      return { ocrTasks: [...state.ocrTasks, task] };
    }
  }),

  /**
   * 清空 OCR 任务
   */
  clearOcrTasks: () => set({ ocrTasks: [] }),

  /**
   * 设置表格解析结果
   */
  setParsedResults: (results) => set({ parsedResults: results }),

  /**
   * 清空表格解析结果
   */
  clearParsedResults: () => set({ parsedResults: [] }),

  /**
   * 重置所有状态
   */
  resetAll: () => set((state) => {
    // 释放所有 blob URLs
    state.uploadedFiles.forEach(file => {
      if (file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
    });

    return {
      uploadedFiles: [],
      ocrTasks: [],
      parsedResults: []
    };
  }),
}));
