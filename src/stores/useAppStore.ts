// ==============================================================================
// useAppStore.ts - 全局应用状态管理
// ==============================================================================
// 
// 本文件使用 Zustand 创建全局应用状态 Store。
// 
// 管理的状态：
// - language: 应用语言设置
// - toasts: Toast 消息队列
// 
// Zustand 优势：
// 1. 轻量级（体积小）
// 2. API 简单（易于使用）
// 3. 无需 Provider 包裹
// 4. 支持 TypeScript
//
// ==============================================================================

import { create } from 'zustand';
import type { Language, ToastMessage } from '@/types';

/**
 * 应用状态接口
 * 
 * 定义全局应用状态的结构和方法
 */
interface AppState {
  language: Language;
  toasts: ToastMessage[];
  setLanguage: (language: Language) => void;
  addToast: (toast: ToastMessage) => void;
  removeToast: (id: string) => void;
}

/**
 * 创建全局应用状态 Store
 * 
 * 使用 Zustand 的 create 函数创建状态管理器
 * - 初始语言：zh-CN（中文）
 * - 初始 Toast 队列：空数组
 */
export const useAppStore = create<AppState>((set) => ({
  language: 'zh-CN',
  toasts: [],
  
  /**
   * 设置应用语言
   * 
   * @param language - 语言代码
   */
  setLanguage: (language) => set({ language }),
  
  /**
   * 添加 Toast 消息
   * 
   * @param toast - Toast 消息对象
   */
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, toast]
  })),
  
  /**
   * 移除 Toast 消息
   * 
   * @param id - Toast 消息 ID
   */
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
}));
