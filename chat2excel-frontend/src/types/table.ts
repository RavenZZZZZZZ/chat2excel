// ==============================================================================
// table.ts - 表格相关类型定义
// ==============================================================================
//
// 本文件定义了与表格编辑和解析功能相关的 TypeScript 类型。
//
// 主要类型：
// - TableEditorState: 表格编辑器状态
// - CellPosition: 单元格位置
// - HistoryItem: 编辑历史记录
// - ColumnWidth/RowHeight: 列宽和行高
// - TableParseOptions: 表格解析配置
// - TableParseResult: 表格解析结果
//
// ==============================================================================

import type { TableData } from './recognition';
import type { OCRItem } from './ocr';

/**
 * 表格编辑器状态
 * 
 * 管理表格编辑的完整状态，包括数据、选择、剪贴板和历史记录
 */
export interface TableEditorState {
  tableData: TableData;
  selectedCells: CellPosition[];
  clipboard: CellData[] | null;
  history: HistoryItem[];
  historyIndex: number;
}

/**
 * 单元格位置
 * 
 * 表示表格中某个单元格的行列索引
 */
export interface CellPosition {
  row: number;
  col: number;
}

/**
 * 单元格数据
 * 
 * 表示单元格的值和置信度
 */
export interface CellData {
  value: string;
  confidence?: number;
}

/**
 * 编辑历史记录项
 *
 * 记录用户的编辑操作，支持撤销/重做
 */
export interface HistoryItem {
  type: 'edit' | 'insert' | 'delete' | 'merge' | 'unmerge';
  timestamp: number;
  description: string;
  /**
   * 历史记录数据
   * - edit: { position: CellPosition; oldValue: CellData; newValue: CellData }
   * - insert: { positions: CellPosition[]; values: CellData[] }
   * - delete: { positions: CellPosition[]; values: CellData[] }
   * - merge: { positions: CellPosition[]; mergedValue: CellData }
   * - unmerge: { position: CellPosition; restoredValues: CellData[][] }
   */
  data:
    | { position: CellPosition; oldValue: CellData; newValue: CellData } // edit
    | { positions: CellPosition[]; values: CellData[] } // insert/delete
    | { positions: CellPosition[]; mergedValue: CellData } // merge
    | { position: CellPosition; restoredValues: CellData[][] }; // unmerge
}

/**
 * 列宽设置
 * 
 * 定义表格中某一列的宽度
 */
export interface ColumnWidth {
  col: number;
  width: number;
}

/**
 * 行高设置
 *
 * 定义表格中某一行的高度
 */
export interface RowHeight {
  row: number;
  height: number;
}

/**
 * 表格解析配置
 */
export interface TableParseOptions {
  /**
   * 列聚类容差（像素）
   * 用于判断两个文本块是否在同一列
   * 默认: 20
   */
  columnTolerance?: number;

  /**
   * 行聚类容差（像素）
   * 用于判断两个文本块是否在同一行
   * 默认: 15
   */
  rowTolerance?: number;

  /**
   * 最小置信度阈值
   * 低于此值的文本块将被过滤
   * 默认: 0.3
   */
  minConfidence?: number;

  /**
   * 是否自动检测表头
   * 默认: true
   */
  detectHeader?: boolean;

  /**
   * 调试模式
   * 启用后会保留更多调试信息
   */
  debug?: boolean;
}

/**
 * 表格解析结果
 */
export interface TableParseResult {
  success: boolean;
  data?: TableData;
  error?: string;

  /**
   * 整体置信度（所有单元格平均值）
   */
  confidence?: number;

  /**
   * 调试信息（仅当 options.debug = true 时有值）
   */
  debug?: {
    originalItems: OCRItem[];
    detectedRows: number[];
    detectedColumns: number[];
    clusteredItems: Array<{
      rowIndex: number;
      colIndex: number;
      item: OCRItem;
    }>;
  };
}

