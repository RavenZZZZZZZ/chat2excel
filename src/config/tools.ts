// ==============================================================================
// tools.ts - 工具配置文件
// ==============================================================================
//
// 本文件定义应用中所有可用的 AI 工具配置
// - 注册工具分类
// - 注册工具实例
// - 配置工具参数和行为
//
// 核心功能:
// - 集中管理所有工具配置
// - 为未来扩展提供模板
// - 支持动态添加新工具
//
// ==============================================================================

import { toolRegistry, registerCategories, registerTools } from '@/lib/tool-registry';
import {
  FileText,
  Scan,
  Image as ImageIcon,
  Video,
  Music,
  FileEdit,
  Languages,
  Code,
  FileSearch,
  Wand2,
} from 'lucide-react';
import { OCRWorkflow } from '@/components/workflow/tools/OCRWorkflow';

// =============================================================================
// 1. 注册工具分类
// ==============================================================================

/**
 * 注册所有工具分类
 *
 * 分类说明:
 * - OCR 识别: 图片和文档识别工具
 * - 图像处理: 图片编辑和处理工具
 * - 视频处理: 视频编辑和处理工具 (未来)
 * - 音频处理: 音频处理工具 (未来)
 * - 文档处理: 文档转换和编辑工具 (未来)
 */
registerCategories(
  {
    id: 'ocr',
    name: 'OCR 识别',
    icon: Scan,
    description: '图片和文档识别工具',
    order: 1,
  },
  {
    id: 'image',
    name: '图像处理',
    icon: ImageIcon,
    description: '图片编辑和处理工具',
    order: 2,
  },
  {
    id: 'video',
    name: '视频处理',
    icon: Video,
    description: '视频编辑和处理工具',
    order: 3,
  },
  {
    id: 'audio',
    name: '音频处理',
    icon: Music,
    description: '音频处理工具',
    order: 4,
  },
  {
    id: 'document',
    name: '文档处理',
    icon: FileEdit,
    description: '文档转换和编辑工具',
    order: 5,
  }
);

// 获取已注册的分类 (用于工具配置)
const categories = toolRegistry.getCategories();

// =============================================================================
// 2. 注册工具
// ==============================================================================

/**
 * 注册所有工具
 *
 * 当前已注册工具:
 * - 表格 OCR: 识别图片中的表格并导出为 Excel
 *
 * 计划中工具:
 * - 文字 OCR: 提取图片中的纯文本
 * - 图片压缩: 智能压缩图片大小
 * - 图片格式转换: 转换图片格式
 * - 视频字幕提取: 提取视频中的字幕
 * - 文档翻译: AI 翻译文档
 */
registerTools(
  // ============= OCR 识别工具 =============

  {
    id: 'ocr-table',
    name: '表格 OCR',
    description: '识别图片中的表格并导出为 Excel',
    detailedDescription:
      '使用先进的 AI OCR 技术,快速识别图片中的表格数据并导出为 Excel 文件。' +
      '支持多种图片格式,识别准确率高达 98%。',
    category: categories.find(c => c.id === 'ocr')!,
    icon: FileText,
    path: '/tools/ocr-table',
    component: OCRWorkflow,
    layout: 'vertical',
    showProgress: true,

    // 工具设置
    settings: {
      maxFiles: 10,
      maxFileSize: 7 * 1024 * 1024, // 7MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      layout: 'vertical',
      showProgress: true,
      enableBatch: true,
      enablePreview: true,
      enableExport: true,
      exportFormats: ['xlsx', 'csv'],
    },

    // 功能开关
    enableBatch: true,
    enablePreview: true,

    // 元数据
    tags: ['ocr', '表格', 'excel', '识别', 'pdf'],
    isFeatured: true,
    isNew: false,
    order: 1,
  },

  // ============= 未来工具 (示例配置) =============

  // {
  //   id: 'ocr-text',
  //   name: '文字 OCR',
  //   description: '提取图片中的纯文本',
  //   detailedDescription: '使用 AI 技术提取图片中的文本内容,支持多语言识别',
  //   category: categories.find(c => c.id === 'ocr')!,
  //   icon: Languages,
  //   path: '/tools/ocr-text',
  //   component: TextOCRWorkflow,
  //   settings: {
  //     maxFiles: 20,
  //     maxFileSize: 10 * 1024 * 1024,
  //     allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  //     enableExport: true,
  //     exportFormats: ['txt', 'docx'],
  //   },
  //   tags: ['ocr', '文字', '提取', '翻译'],
  //   isFeatured: true,
  //   isNew: true,
  //   order: 2,
  // },

  // {
  //   id: 'image-compress',
  //   name: '图片压缩',
  //   description: '智能压缩图片大小',
  //   detailedDescription: '使用 AI 算法智能压缩图片,在保持画质的同时减小文件大小',
  //   category: categories.find(c => c.id === 'image')!,
  //   icon: ImageIcon,
  //   path: '/tools/image-compress',
  //   component: ImageCompressWorkflow,
  //   settings: {
  //     maxFiles: 50,
  //     maxFileSize: 50 * 1024 * 1024,
  //     allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  //     enableBatch: true,
  //     enablePreview: true,
  //     enableExport: true,
  //     exportFormats: ['jpg', 'png', 'webp'],
  //   },
  //   tags: ['图片', '压缩', '优化', 'web'],
  //   isFeatured: false,
  //   isNew: true,
  //   order: 10,
  // },

  // {
  //   id: 'document-translate',
  //   name: '文档翻译',
  //   description: 'AI 翻译文档内容',
  //   detailedDescription: '使用先进的 AI 翻译技术,保持文档格式的同时翻译内容',
  //   category: categories.find(c => c.id === 'document')!,
  //   icon: Languages,
  //   path: '/tools/document-translate',
  //   component: DocumentTranslateWorkflow,
  //   settings: {
  //     maxFiles: 5,
  //     maxFileSize: 20 * 1024 * 1024,
  //     allowedTypes: [
  //       'application/pdf',
  //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //       'application/msword',
  //       'text/plain',
  //     ],
  //     enableBatch: false,
  //     enableExport: true,
  //     exportFormats: ['pdf', 'docx'],
  //   },
  //   tags: ['翻译', '文档', 'pdf', 'word', '多语言'],
  //   isFeatured: true,
  //   isNew: true,
  //   order: 20,
  // },
);

// =============================================================================
// 3. 导出工具列表
// ==============================================================================

/**
 * 获取所有已注册的工具
 * 用于路由生成、导航菜单等
 */
export const getAllTools = () => toolRegistry.getAll();

/**
 * 获取所有分类
 * 用于侧边栏导航、分类筛选等
 */
export const getAllCategories = () => toolRegistry.getCategories();

/**
 * 获取工具统计信息
 * 用于仪表板、首页统计等
 */
export const getToolStats = () => toolRegistry.getStats();

// =============================================================================
// 4. 初始化日志
// ==============================================================================

console.log('[Tools] 工具配置初始化完成', {
  工具数量: toolRegistry.getAll().length,
  分类数量: toolRegistry.getCategories().length,
  统计信息: toolRegistry.getStats(),
});
