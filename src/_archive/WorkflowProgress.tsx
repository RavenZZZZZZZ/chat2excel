// ==============================================================================
// WorkflowProgress.tsx - 工作流进度指示器组件
// ==============================================================================
//
// 本组件显示当前工作流的进度步骤:
// - 显示三个步骤: 上传 → 识别 → 结果
// - 使用圆形指示器和连接线
// - 应用 Claude 极简设计系统
// - 响应式设计 (移动端隐藏文字)
//
// 核心功能:
// - 步骤状态可视化 (pending/active/completed)
// - 流畅的状态切换动画
// - 移动端优化 (隐藏步骤标签)
//
// ==============================================================================

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 步骤状态
 */
export type StepStatus = 'pending' | 'active' | 'completed';

/**
 * 单个步骤定义
 */
export interface Step {
  label: string;
  status: StepStatus;
}

/**
 * WorkflowProgress 组件属性
 */
export interface WorkflowProgressProps {
  /** 当前步骤索引 (0, 1, 2) */
  currentStep: number;
  /** 步骤列表 */
  steps: Step[];
  /** 自定义类名 */
  className?: string;
}

/**
 * 工作流进度指示器组件
 *
 * 显示三个步骤的进度:
 * - 圆形指示器 (数字或勾选图标)
 * - 步骤标签 (移动端隐藏)
 * - 连接线 (桌面端显示)
 *
 * @param props - 组件属性
 * @returns JSX 元素
 */
export function WorkflowProgress({ currentStep, steps, className }: WorkflowProgressProps) {
  return (
    <div className={cn("flex items-center gap-2 sm:gap-4", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step Circle + Label */}
          <div className="flex items-center gap-2">
            {/* 圆形指示器 */}
            <div
              className={cn(
                "w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center" +
                " transition-all duration-200",
                step.status === 'completed' &&
                  "bg-[#0E0E0E] dark:bg-[#D4A27F] " +
                  "border-[#0E0E0E] dark:border-[#D4A27F]",
                step.status === 'active' &&
                  "bg-[#0E0E0E] dark:bg-[#D4A27F] " +
                  "border-[#0E0E0E] dark:border-[#D4A27F]",
                step.status === 'pending' &&
                  "bg-transparent border-gray-300 dark:border-gray-700"
              )}
            >
              {step.status === 'completed' ? (
                // 完成状态: 显示勾选图标
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-[#09090B]"
                     fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd" />
                </svg>
              ) : (
                // 进行中或待处理: 显示步骤编号
                <span className={cn(
                  "text-xs font-semibold",
                  step.status === 'active' ? "text-white dark:text-[#09090B]" : "text-gray-400"
                )}>
                  {index + 1}
                </span>
              )}
            </div>

            {/* 步骤标签 (移动端隐藏) */}
            <span className={cn(
              "text-xs sm:text-sm font-medium hidden sm:inline",
              step.status === 'active'
                ? "text-[#0E0E0E] dark:text-[#FDFDF7]"
                : "text-gray-400"
            )}>
              {step.label}
            </span>
          </div>

          {/* Connector Line (桌面端显示) */}
          {index < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 transition-colors duration-200 hidden sm:block",
              index < currentStep
                ? "bg-[#0E0E0E] dark:bg-[#D4A27F]"
                : "bg-gray-300 dark:bg-gray-700"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
