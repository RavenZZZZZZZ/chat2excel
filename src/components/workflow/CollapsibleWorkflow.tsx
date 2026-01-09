// ==============================================================================
// CollapsibleWorkflow.tsx - 可折叠工作流容器
// ==============================================================================
//
// 本组件实现基于 Accordion 的可折叠工作流界面:
// - 将传统的"3 个状态"改为"3 个可折叠面板"
// - 用户始终看到所有步骤,保留上下文
// - 完成的步骤自动折叠,保持界面简洁
// - 可以随时回到之前的步骤修改
//
// 核心功能:
// - 步骤状态管理 (pending/in-progress/completed/error)
// - 展开/折叠交互
// - 自动折叠逻辑 (完成后自动折叠)
// - 状态图标系统
//
// ==============================================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 工作流步骤状态
 */
export type WorkflowStepStatus = 'pending' | 'in-progress' | 'completed' | 'error';

/**
 * 工作流步骤配置
 */
export interface WorkflowStep {
  /** 步骤唯一标识 */
  id: string;
  /** 步骤标题 */
  title: string;
  /** 步骤描述 */
  description?: string;
  /** 步骤图标 */
  icon: React.ElementType;
  /** 当前状态 */
  status: WorkflowStepStatus;
  /** 是否可以展开/折叠 */
  canExpand: boolean;
  /** 是否展开 */
  isExpanded: boolean;
  /** 步骤内容 */
  children: React.ReactNode;
}

/**
 * 可折叠工作流组件属性
 */
export interface CollapsibleWorkflowProps {
  /** 工作流步骤列表 */
  steps: WorkflowStep[];
  /** 步骤切换回调 */
  onStepToggle?: (stepId: string, isExpanded: boolean) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 可折叠工作流容器组件
 *
 * 使用 Accordion 模式实现多步骤工作流界面
 * - 所有步骤同时可见,保留上下文
 * - 点击步骤标题可以展开/折叠
 * - 完成的步骤自动折叠,保持界面简洁
 * - 清晰的状态指示和图标系统
 *
 * @example
 * ```tsx
 * const [steps, setSteps] = useState([
 *   {
 *     id: 'upload',
 *     title: '上传文件',
 *     description: '选择要处理的图片',
 *     icon: Upload,
 *     status: 'in-progress',
 *     canExpand: true,
 *     isExpanded: true,
 *     children: <UploadContent />
 *   },
 *   // ...
 * ]);
 *
 * return <CollapsibleWorkflow steps={steps} onStepToggle={...} />;
 * ```
 */
export function CollapsibleWorkflow({
  steps,
  onStepToggle,
  className
}: CollapsibleWorkflowProps) {
  return (
    <div className={cn("max-w-4xl mx-auto space-y-4", className)}>
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "bg-white dark:bg-[#0E0E0E]",
            "border-2 border-gray-200 dark:border-gray-800",
            "rounded-xl overflow-hidden",
            "transition-all duration-300"
          )}
        >
          {/* 步骤头部 */}
          <button
            onClick={() => step.canExpand && onStepToggle?.(step.id, !step.isExpanded)}
            className={cn(
              "w-full px-6 py-4",
              "flex items-center justify-between",
              "transition-colors duration-200",
              step.canExpand && "hover:bg-gray-50 dark:hover:bg-gray-800/50",
              !step.canExpand && "cursor-default"
            )}
          >
            <div className="flex items-center gap-4 flex-1">
              {/* 状态图标 */}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                "transition-colors duration-200",
                step.status === 'completed' && "bg-green-100 dark:bg-green-900/20",
                step.status === 'in-progress' && "bg-[#D4A27F]/10",
                step.status === 'error' && "bg-red-100 dark:bg-red-900/20",
                step.status === 'pending' && "bg-gray-100 dark:bg-gray-800"
              )}>
                {step.status === 'completed' && (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                {step.status === 'in-progress' && (
                  <Loader2 className="w-5 h-5 text-[#D4A27F] animate-spin" />
                )}
                {step.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                {step.status === 'pending' && (
                  <step.icon className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* 标题和描述 */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-semibold text-base",
                    step.status !== 'pending' ? "text-[#0E0E0E] dark:text-[#FDFDF7]" : "text-gray-500"
                  )}>
                    {step.title}
                  </h3>

                  {/* 状态标签 */}
                  {step.status === 'in-progress' && (
                    <span className="px-2 py-0.5 text-xs font-semibold
                                   bg-[#D4A27F]/10 text-[#D4A27F] rounded-full">
                      进行中
                    </span>
                  )}
                  {step.status === 'completed' && (
                    <span className="px-2 py-0.5 text-xs font-semibold
                                   bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                      完成
                    </span>
                  )}
                  {step.status === 'error' && (
                    <span className="px-2 py-0.5 text-xs font-semibold
                                   bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">
                      失败
                    </span>
                  )}
                </div>

                {step.description && (
                  <p className={cn(
                    "text-sm mt-0.5",
                    step.status !== 'pending' ? "text-[#6B6B6B] dark:text-[#9CA3AF]" : "text-gray-400"
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* 展开/折叠指示器 */}
            {step.canExpand && (
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                "transition-all duration-200",
                step.isExpanded && "bg-gray-100 dark:bg-gray-800"
              )}>
                {step.isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-[#6B6B6B]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#6B6B6B]" />
                )}
              </div>
            )}
          </button>

          {/* 步骤内容 */}
          <AnimatePresence initial={false} mode="wait">
            {step.isExpanded && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-800">
                  {step.children}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
