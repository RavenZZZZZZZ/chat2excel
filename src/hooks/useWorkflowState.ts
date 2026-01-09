// ==============================================================================
// useWorkflowState.ts - 工作流状态管理 Hook
// ==============================================================================
//
// 本 Hook 实现单页三状态工作流的状态管理:
// - UPLOAD: 文件上传状态
// - PROCESSING: OCR 处理状态
// - RESULTS: 结果展示状态
//
// 核心功能:
// - 状态机管理 (UPLOAD → PROCESSING → RESULTS)
// - 状态转换规则验证
// - 与 Zustand store 协作
// - 提供统一的接口访问文件、OCR 任务、解析结果
//
// ==============================================================================

import { useState, useCallback } from 'react';
import { useUploadStore } from '@/stores/useUploadStore';
import { createLogger } from '@/lib/logger';

const log = createLogger('useWorkflowState');

/**
 * 工作流状态类型
 */
export type WorkflowState = 'UPLOAD' | 'PROCESSING' | 'RESULTS';

/**
 * 状态转换规则
 * 定义每个状态允许转换到的下一个状态
 */
const TRANSITION_RULES: Record<WorkflowState, WorkflowState[]> = {
  UPLOAD: ['PROCESSING'],
  PROCESSING: ['RESULTS', 'UPLOAD'],
  RESULTS: ['UPLOAD'],
};

/**
 * 工作流状态管理 Hook
 *
 * @returns 工作流状态和操作方法
 */
export function useWorkflowState() {
  const [state, setState] = useState<WorkflowState>('UPLOAD');
  const store = useUploadStore();

  /**
   * 转换到指定状态
   *
   * @param nextState - 目标状态
   * @throws {Error} 如果状态转换不被允许
   */
  const transitionTo = useCallback((nextState: WorkflowState) => {
    if (!TRANSITION_RULES[state].includes(nextState)) {
      const error = new Error(
        `Invalid state transition: ${state} → ${nextState}. ` +
        `Allowed: ${TRANSITION_RULES[state].join(', ')}`
      );
      console.error('State transition failed:', error.message);
      throw error;
    }

    console.log(`State transition: ${state} → ${nextState}`);
    setState(nextState);
  }, [state]);

  /**
   * 检查是否可以转换到指定状态
   *
   * @param nextState - 目标状态
   * @returns 是否可以转换
   */
  const canTransitionTo = useCallback((nextState: WorkflowState) => {
    return TRANSITION_RULES[state].includes(nextState);
  }, [state]);

  /**
   * 重置工作流状态
   * 清空所有数据并回到 UPLOAD 状态
   */
  const reset = useCallback(() => {
    console.log('Resetting workflow state');
    store.resetAll();
    setState('UPLOAD');
  }, [store]);

  // 直接获取数据,避免返回函数引用
  const files = store.uploadedFiles;
  const ocrTasks = store.ocrTasks;
  const parsedResults = store.parsedResults;

  // 创建包装函数,避免直接返回 store 的方法
  const setFiles = useCallback((files: any[]) => store.setUploadedFiles(files), [store]);
  const addFiles = useCallback((files: any[]) => store.addUploadedFiles(files), [store]);
  const removeFile = useCallback((id: string) => store.removeUploadedFile(id), [store]);
  const updateOcrTask = useCallback((task: any) => store.updateOcrTask(task), [store]);
  const setOcrTasks = useCallback((tasks: any[]) => store.setOcrTasks(tasks), [store]);
  const setParsedResults = useCallback((results: any[]) => store.setParsedResults(results), [store]);

  return {
    // 当前状态
    state,

    // 状态转换方法
    transitionTo,
    canTransitionTo,
    reset,

    // 数据 (直接引用)
    files,
    ocrTasks,
    parsedResults,

    // 方法 (包装后的函数)
    setFiles,
    addFiles,
    removeFile,
    updateOcrTask,
    setOcrTasks,
    setParsedResults,
  };
}
