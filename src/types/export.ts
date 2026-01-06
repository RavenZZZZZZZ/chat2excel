// ==============================================================================
// export.ts - Excel 导出相关类型定义
// ==============================================================================
// 
// 本文件定义了与 Excel 导出功能相关的 TypeScript 类型。
// 
// 主要类型：
// - ExportOptions: 导出选项配置
// - ExportResult: 导出结果
// - ExportHistoryItem: 导出历史记录
//
// ==============================================================================

/**
 * 导出选项配置
 * 
 * 用户导出 Excel 时可以选择的配置项
 */
export interface ExportOptions {
  format: 'xlsx' | 'xls' | 'csv';
  fileName: string;
  options: {
    includeFormat: boolean;
    includeHeader: boolean;
    includeMergedCells: boolean;
  };
}

/**
 * 导出结果
 * 
 * 导出完成后返回的下载信息
 */
export interface ExportResult {
  downloadUrl: string;
  filename: string;
  size: number;
  expiresAt: string;
}

/**
 * 导出历史记录项
 * 
 * 记录用户的导出历史，方便重新下载
 */
export interface ExportHistoryItem {
  id: string;
  filename: string;
  size: number;
  format: string;
  createdAt: string;
  url: string;
}
