// ==============================================================================
// recognition.ts - OCR 识别相关类型定义
// ==============================================================================
// 
// 本文件定义了与表格 OCR 识别相关的 TypeScript 类型。
// 
// 主要类型：
// - TableData: 识别出的表格数据结构
// - Row/Cell: 表格行和单元格数据
// - MergedCell: 合并单元格信息
// - RecognitionResult: 识别结果
// - RecognitionProgress: 识别进度状态
//
// ==============================================================================

/**
 * 表格数据结构
 * 
 * 表示从图片中识别出的完整表格数据
 */
export interface TableData {
  rows: Row[];
  mergedCells?: MergedCell[];
}

/**
 * 表格行数据
 * 
 * 包含该行所有单元格的数据
 */
export interface Row {
  cells: Cell[];
}

/**
 * 表格单元格数据
 * 
 * 表示表格中的单个单元格
 */
export interface Cell {
  value: string;
  rowSpan?: number;
  colSpan?: number;
  confidence?: number;
  isModified?: boolean;
  originalValue?: string;
}

/**
 * 合并单元格信息
 * 
 * 记录表格中的合并单元格位置和范围
 */
export interface MergedCell {
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
}

/**
 * 识别结果
 * 
 * OCR 识别完成后返回的完整结果
 */
export interface RecognitionResult {
  resultId: string;
  fileId: string;
  tableData: TableData;
  structure: {
    rows: number;
    cols: number;
    mergedCells: MergedCell[];
  };
  confidence: number;
  processingTime: number;
  ocrProvider: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 识别进度状态
 * 
 * 用于跟踪 OCR 识别的当前状态和进度
 */
export interface RecognitionProgress {
  status: 'idle' | 'uploading' | 'recognizing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  steps: Step[];
}

/**
 * 识别步骤
 * 
 * 识别过程中的单个步骤信息
 */
export interface Step {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed';
}
