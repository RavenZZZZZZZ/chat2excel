// ==============================================================================
// AppWorkflow.tsx - 主工作流容器组件
// ==============================================================================
//
// 本组件是单页三状态应用的主容器,负责:
// - 管理工作流状态 (UPLOAD → PROCESSING → RESULTS)
// - 协调各个状态组件的切换
// - 显示顶部导航栏和进度指示器
// - 应用 Claude 极简设计系统
//
// 核心功能:
// - 集成状态管理和自动转换
// - 懒加载状态组件以优化性能
// - 流畅的状态切换动画 (Framer Motion)
// - 响应式设计 (移动端/桌面端)
//
// ==============================================================================

import { Suspense, lazy, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { useAutoTransition } from '@/hooks/useAutoTransition';
import { WorkflowProgress } from './WorkflowProgress';

// 暂时不使用懒加载,排除问题
import { UploadState } from './UploadState';
import { ProcessingState } from './ProcessingState';
import { ResultsState } from './ResultsState';

// 懒加载状态组件以优化性能
// const UploadState = lazy(() => import('./UploadState'));
// const ProcessingState = lazy(() => import('./ProcessingState'));
// const ResultsState = lazy(() => import('./ResultsState'));

/**
 * 主工作流容器组件
 *
 * 整合所有状态组件,提供统一的工作流体验:
 * - Sticky Header: 显示 Logo 和进度指示器
 * - Main Content: 动态切换当前状态组件
 * - 自动转换: 监听数据变化自动触发状态切换
 */
export function AppWorkflow() {
  const workflowState = useWorkflowState();
  const { state, files, ocrTasks, parsedResults, transitionTo } = workflowState;

  // 启用自动状态转换 (只传递需要的数据)
  useAutoTransition({ state, files, ocrTasks, parsedResults, transitionTo });

  // 步骤定义 (使用 useMemo 稳定引用)
  const steps = useMemo(() => [
    {
      label: '上传',
      status: state === 'UPLOAD' ? ('active' as const) : state !== 'UPLOAD' ? ('completed' as const) : ('pending' as const)
    },
    {
      label: '识别',
      status: state === 'PROCESSING' ? ('active' as const) : state === 'RESULTS' ? ('completed' as const) : ('pending' as const)
    },
    {
      label: '结果',
      status: state === 'RESULTS' ? ('active' as const) : ('pending' as const)
    },
  ], [state]);

  const currentStep = state === 'UPLOAD' ? 0 : state === 'PROCESSING' ? 1 : 2;

  return (
    <div className="min-h-screen bg-[#FDFDF7] dark:bg-[#09090B]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 w-full">
        {/* Backdrop blur layer */}
        <div className="absolute w-full h-full backdrop-blur transition-colors duration-500
                        border-b border-gray-500/5 dark:border-gray-300/[0.06]" />

        <div className="relative px-4 sm:px-6 md:px-8 lg:px-12 h-14 sm:h-16 flex items-center">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white dark:bg-[#0E0E0E]
                          border-2 border-gray-200 dark:border-gray-800
                          flex items-center justify-center rounded-lg">
              <svg className="w-5 h-5 text-[#0E0E0E] dark:text-[#FDFDF7]"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-lg text-[#0E0E0E] dark:text-[#FDFDF7]">
              Chat2Excel
            </span>
          </div>

          {/* Workflow Progress */}
          <div className="flex-1 flex justify-center">
            <WorkflowProgress currentStep={currentStep} steps={steps} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12">
        <AnimatePresence initial={false} mode="wait">
          {state === 'UPLOAD' && <UploadState key="upload" />}
          {state === 'PROCESSING' && <ProcessingState key="processing" />}
          {state === 'RESULTS' && <ResultsState key="results" />}
        </AnimatePresence>
      </main>
    </div>
  );
}
