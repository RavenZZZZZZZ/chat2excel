// ==============================================================================
// ocr.ts - OCR 相关类型定义
// ==============================================================================

/**
 * OCR 识别状态
 */
export type OCRStatus =
  | 'idle'       // 空闲
  | 'loading'    // 加载语言包
  | 'recognizing' // 识别中
  | 'completed'  // 完成
  | 'failed';    // 失败

/**
 * OCR 识别项（单个文本块）
 */
export interface OCRItem {
  /** 文本内容 */
  text: string;
  /** 置信度 0-1 */
  confidence: number;
  /** 边界框 */
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

/**
 * OCR 识别结果
 */
export interface OCRResult {
  /** 完整文本（所有文本块合并） */
  text: string;
  /** 单个文本块列表 */
  items: OCRItem[];
  /** 识别状态 */
  status: OCRStatus;
  /** 错误信息（如果失败） */
  error?: string;
  /** 识别耗时（毫秒） */
  duration: number;
}

/**
 * OCR 任务
 */
export interface OCRTask {
  /** 任务 ID */
  id: string;
  /** 图片文件 */
  file: File;
  /** 图片预览 URL */
  preview: string;
  /** 识别状态 */
  status: OCRStatus;
  /** 进度 0-100 */
  progress: number;
  /** 识别结果 */
  result?: OCRResult;
  /** 错误信息 */
  error?: string;
  /** 创建时间 */
  createdAt: number;

  // Supabase 集成字段
  /** Supabase 数据库记录 ID */
  supabaseTaskId?: string;
  /** Supabase Storage 路径 */
  imagePath?: string;
  /** Supabase Storage 公开 URL */
  imageUrl?: string;
  /** 是否已保存到 Supabase */
  savedToSupabase?: boolean;
}

/**
 * OCR 提供商
 */
export type OCRProvider = 'tesseract' | 'doc2x';

/**
 * OCR 配置选项
 */
export interface OCROptions {
  /** OCR 提供商 */
  provider?: OCRProvider;
  /** 语言代码（chi_sim=简体中文, eng=英文） */
  language?: string | string[];
  /** 是否使用 Web Worker */
  useWorker?: boolean;
  /** 识别引擎路径 */
  workerPath?: string;
  /** 语言包路径 */
  langPath?: string;
}

/**
 * OCR 进度回调
 */
export type OCRProgressCallback = (task: OCRTask) => void;
