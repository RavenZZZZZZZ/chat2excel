// ==============================================================================
// tableParser.ts - 表格结构解析服务
// ==============================================================================
//
// 本服务实现基于 OCR 结果的表格结构解析算法。
//
// 主要功能：
// - 从 OCR 文字块中检测表格行列结构
// - 使用聚类算法识别行和列
// - 重建表格单元格数据
// - 支持调试模式可视化
//
// ==============================================================================

import type { OCRItem } from '@/types/ocr';
import type { TableData, Cell, Row } from '@/types/recognition';
import type { TableParseOptions, TableParseResult } from '@/types/table';

/**
 * 默认解析配置
 */
const DEFAULT_OPTIONS: Required<Omit<TableParseOptions, 'debug'>> = {
  columnTolerance: 20,
  rowTolerance: 15,
  minConfidence: 0.3,
  detectHeader: true,
};

/**
 * 表格解析器类
 */
export class TableParser {
  private options: Required<TableParseOptions>;

  constructor(options: TableParseOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      debug: options.debug || false,
    };
  }

  /**
   * 解析 OCR 结果为表格结构
   *
   * @param items - OCR 识别的文字块列表
   * @returns 解析结果
   */
  parse(items: OCRItem[]): TableParseResult {
    try {
      // 1. 过滤低置信度文字块
      const filteredItems = items.filter(
        (item) => item.confidence >= this.options.minConfidence
      );

      if (filteredItems.length === 0) {
        return {
          success: false,
          error: '没有找到有效的文字块',
        };
      }

      // 2. 检测行和列
      const rows = this.detectRows(filteredItems);
      const columns = this.detectColumns(filteredItems);

      if (rows.length === 0 || columns.length === 0) {
        return {
          success: false,
          error: '无法检测到表格结构',
        };
      }

      // 3. 将文字块分配到单元格
      const cellGrid = this.assignItemsToCells(filteredItems, rows, columns);

      // 4. 构建 TableData
      const tableData = this.buildTableData(cellGrid, rows.length, columns.length);

      // 5. 计算整体置信度
      const confidence = this.calculateConfidence(filteredItems);

      const result: TableParseResult = {
        success: true,
        data: tableData,
        confidence,
      };

      // 6. 调试信息
      if (this.options.debug) {
        result.debug = {
          originalItems: filteredItems,
          detectedRows: rows,
          detectedColumns: columns,
          clusteredItems: this.buildClusteredDebugInfo(filteredItems, rows, columns),
        };
      }

      return result;
    } catch (error) {
      console.error('表格解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 检测行位置
   *
   * 使用聚类算法将相近的 y 坐标归为同一行
   */
  private detectRows(items: OCRItem[]): number[] {
    // 收集所有文字块的 y 坐标（使用 bbox 的中心点）
    const yCoordinates = items.map((item) => (item.bbox.y0 + item.bbox.y1) / 2);

    // 排序
    yCoordinates.sort((a, b) => a - b);

    // 聚类：将相近的 y 坐标归为同一行
    const rows: number[] = [];
    for (const y of yCoordinates) {
      // 查找是否已经存在相近的行
      const existingRow = rows.find(
        (rowY) => Math.abs(rowY - y) <= this.options.rowTolerance
      );

      if (existingRow !== undefined) {
        // 更新行的 y 坐标为平均值
        const index = rows.indexOf(existingRow);
        rows[index] = (existingRow + y) / 2;
      } else {
        // 创建新行
        rows.push(y);
      }
    }

    // 重新排序
    return rows.sort((a, b) => a - b);
  }

  /**
   * 检测列位置
   *
   * 使用聚类算法将相近的 x 坐标归为同一列
   */
  private detectColumns(items: OCRItem[]): number[] {
    // 收集所有文字块的 x 坐标（使用 bbox 的中心点）
    const xCoordinates = items.map((item) => (item.bbox.x0 + item.bbox.x1) / 2);

    // 排序
    xCoordinates.sort((a, b) => a - b);

    // 聚类：将相近的 x 坐标归为同一列
    const columns: number[] = [];
    for (const x of xCoordinates) {
      // 查找是否已经存在相近的列
      const existingColumn = columns.find(
        (colX) => Math.abs(colX - x) <= this.options.columnTolerance
      );

      if (existingColumn !== undefined) {
        // 更新列的 x 坐标为平均值
        const index = columns.indexOf(existingColumn);
        columns[index] = (existingColumn + x) / 2;
      } else {
        // 创建新列
        columns.push(x);
      }
    }

    // 重新排序
    return columns.sort((a, b) => a - b);
  }

  /**
   * 将文字块分配到单元格
   *
   * 根据 bbox 坐标判断每个文字块属于哪个单元格
   */
  private assignItemsToCells(
    items: OCRItem[],
    rows: number[],
    columns: number[]
  ): Map<string, OCRItem[]> {
    const cellMap = new Map<string, OCRItem[]>();

    for (const item of items) {
      // 计算文字块中心点
      const centerX = (item.bbox.x0 + item.bbox.x1) / 2;
      const centerY = (item.bbox.y0 + item.bbox.y1) / 2;

      // 找到对应的行和列
      let rowIndex = -1;
      let colIndex = -1;

      // 查找行
      for (let i = 0; i < rows.length; i++) {
        if (Math.abs(rows[i] - centerY) <= this.options.rowTolerance) {
          rowIndex = i;
          break;
        }
      }

      // 查找列
      for (let j = 0; j < columns.length; j++) {
        if (Math.abs(columns[j] - centerX) <= this.options.columnTolerance) {
          colIndex = j;
          break;
        }
      }

      // 如果找到了对应的行和列，添加到单元格
      if (rowIndex >= 0 && colIndex >= 0) {
        const key = `${rowIndex}-${colIndex}`;
        if (!cellMap.has(key)) {
          cellMap.set(key, []);
        }
        cellMap.get(key)!.push(item);
      }
    }

    return cellMap;
  }

  /**
   * 构建 TableData
   *
   * 根据单元格网格构建最终的表格数据结构
   */
  private buildTableData(
    cellGrid: Map<string, OCRItem[]>,
    rowCount: number,
    colCount: number
  ): TableData {
    const rows: Row[] = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const cells: Cell[] = [];

      for (let colIndex = 0; colIndex < colCount; colIndex++) {
        const key = `${rowIndex}-${colIndex}`;
        const items = cellGrid.get(key);

        if (items && items.length > 0) {
          // 合并同一单元格中的多个文字块
          const text = items.map((item) => item.text).join(' ');
          const confidence = items.reduce((sum, item) => sum + item.confidence, 0) / items.length;

          cells.push({
            value: text.trim(),
            confidence,
          });
        } else {
          // 空单元格
          cells.push({
            value: '',
          });
        }
      }

      rows.push({ cells });
    }

    return { rows };
  }

  /**
   * 计算整体置信度
   */
  private calculateConfidence(items: OCRItem[]): number {
    if (items.length === 0) return 0;
    const totalConfidence = items.reduce((sum, item) => sum + item.confidence, 0);
    return totalConfidence / items.length;
  }

  /**
   * 构建调试信息
   */
  private buildClusteredDebugInfo(
    items: OCRItem[],
    rows: number[],
    columns: number[]
  ) {
    const clustered: Array<{
      rowIndex: number;
      colIndex: number;
      item: OCRItem;
    }> = [];

    for (const item of items) {
      const centerX = (item.bbox.x0 + item.bbox.x1) / 2;
      const centerY = (item.bbox.y0 + item.bbox.y1) / 2;

      let rowIndex = -1;
      let colIndex = -1;

      for (let i = 0; i < rows.length; i++) {
        if (Math.abs(rows[i] - centerY) <= this.options.rowTolerance) {
          rowIndex = i;
          break;
        }
      }

      for (let j = 0; j < columns.length; j++) {
        if (Math.abs(columns[j] - centerX) <= this.options.columnTolerance) {
          colIndex = j;
          break;
        }
      }

      if (rowIndex >= 0 && colIndex >= 0) {
        clustered.push({ rowIndex, colIndex, item });
      }
    }

    return clustered;
  }
}

/**
 * 导出单例实例
 */
export const tableParser = new TableParser();
