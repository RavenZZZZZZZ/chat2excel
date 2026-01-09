// ==============================================================================
// useAutoTransition.ts - 自动状态转换 Hook
// ==============================================================================
//
// 本 Hook 实现工作流的自动状态转换逻辑:
// - 监听文件上传 → 自动转换到 PROCESSING 状态
// - 监听 OCR 完成 → 自动转换到 RESULTS 状态
// - 监听 OCR 失败 → 回到 UPLOAD 状态
//
// 核心功能:
// - 无需用户手动点击,自动触发状态转换
// - 提供流畅的用户体验
// - 处理错误场景
//
// ==============================================================================

import { useEffect } from 'react';
import { useWorkflowState, WorkflowState } from './useWorkflowState';

/**
 * 自动状态转换 Hook
 *
 * 监听工作流状态和相关数据,自动触发状态转换:
 * 1. 上传文件后 → 自动开始 OCR (0.5s 延迟)
 * 2. OCR 完成后 → 自动显示结果 (0.8s 延迟)
 * 3. OCR 全部失败 → 回到上传状态 (1.5s 延迟)
 *
 * @param workflowState - 工作流状态对象 (包含 state, files, ocrTasks, parsedResults, transitionTo)
 */
export function useAutoTransition(workflowState: {
  state: WorkflowState;
  files: any[];
  ocrTasks: any[];
  parsedResults: any[];
  transitionTo: (state: WorkflowState) => void;
}) {
  const { state, files, ocrTasks, parsedResults, transitionTo } = workflowState;

  // 监听文件上传 → 自动开始 OCR
  useEffect(() => {
    if (state === 'UPLOAD' && files.length > 0) {
      const timer = setTimeout(() => {
        console.log('Files uploaded, transitioning to PROCESSING');
        transitionTo('PROCESSING');
      }, 500); // 0.5s 延迟让用户看到上传完成

      return () => clearTimeout(timer);
    }
  }, [state, files.length, transitionTo]);

  // 监听 OCR 完成 → 自动显示结果
  useEffect(() => {
    if (state === 'PROCESSING' && ocrTasks.length > 0) {
      const allCompleted = ocrTasks.every(t =>
        t.status === 'completed' || t.status === 'failed'
      );

      const hasResults = parsedResults.length > 0;

      if (allCompleted && hasResults) {
        const timer = setTimeout(() => {
          console.log('OCR completed, transitioning to RESULTS');
          transitionTo('RESULTS');
        }, 800); // 0.8s 延迟让用户看到完成状态

        return () => clearTimeout(timer);
      }
    }
  }, [state, ocrTasks, parsedResults, transitionTo]);

  // OCR 全部失败 → 回到上传状态
  useEffect(() => {
    if (state === 'PROCESSING' && ocrTasks.length > 0) {
      const allFailed = ocrTasks.every(t => t.status === 'failed');

      if (allFailed) {
        const timer = setTimeout(() => {
          console.error('All OCR tasks failed, returning to UPLOAD');
          transitionTo('UPLOAD');
          // TODO: 显示错误提示
          alert('OCR 识别失败,请重试');
        }, 1500);

        return () => clearTimeout(timer);
      }
    }
  }, [state, ocrTasks, transitionTo]);
}
