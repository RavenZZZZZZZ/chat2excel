// ==============================================================================
// excelExporter.ts - Excel 导出服务
// ==============================================================================
//
// 本服务实现表格数据导出为 Excel 文件的功能。
//
// 主要功能：
// - 将 TableData 导出为 Excel 文件
// - 支持设置单元格样式
// - 支持合并单元格
// - 自动调整列宽
// - 触发浏览器下载
//
// ==============================================================================

import ExcelJS from 'exceljs';
import type { TableData } from '@/types/recognition';

/**
 * Excel 导出配置
 */
export interface ExcelExportOptions {
  /**
   * 文件名（不含扩展名）
   * 默认: 'table-export'
   */
  fileName?: string;

  /**
   * 工作表名称
   * 默认: 'Sheet1'
   */
  sheetName?: string;

  /**
   * 是否添加边框
   * 默认: true
   */
  addBorders?: boolean;

  /**
   * 表头字体大小
   * 默认: 12
   */
  headerFontSize?: number;

  /**
   * 数据字体大小
   * 默认: 11
   */
  dataFontSize?: number;

  /**
   * 是否自动调整列宽
   * 默认: true
   */
  autoFitColumns?: boolean;

  /**
   * 最小列宽（字符数）
   * 默认: 10
   */
  minColumnWidth?: number;

  /**
   * 最大列宽（字符数）
   * 默认: 50
   */
  maxColumnWidth?: number;
}

/**
 * Excel 导出器类
 */
export class ExcelExporter {
  private defaultOptions: Required<Omit<ExcelExportOptions, 'fileName' | 'sheetName'>> = {
    addBorders: true,
    headerFontSize: 12,
    dataFontSize: 11,
    autoFitColumns: true,
    minColumnWidth: 10,
    maxColumnWidth: 50,
  };

  /**
   * 导出表格数据为 Excel 文件
   *
   * @param tableData - 表格数据
   * @param options - 导出配置
   */
  async export(tableData: TableData, options: ExcelExportOptions = {}): Promise<void> {
    console.log('📊 开始导出 Excel, options:', options);

    // 验证输入数据
    if (!tableData) {
      throw new Error('表格数据为空');
    }

    if (!tableData.rows || !Array.isArray(tableData.rows) || tableData.rows.length === 0) {
      throw new Error('表格数据格式错误：rows 为空或不是数组');
    }

    console.log(`📊 表格数据验证通过，共 ${tableData.rows.length} 行`);

    const mergedOptions = { ...this.defaultOptions, ...options };
    const fileName = options.fileName || 'table-export';
    const sheetName = options.sheetName || 'Sheet1';

    try {
      // 创建工作簿
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      console.log('📝 开始填充工作表数据...');
      // 添加数据到工作表
      // @ts-ignore - Type compatibility issue
      this.populateWorksheet(worksheet, tableData, mergedOptions);

      // 自动调整列宽
      if (mergedOptions.autoFitColumns) {
        console.log('📏 自动调整列宽...');
        this.autoFitWorksheetColumns(worksheet, mergedOptions.minColumnWidth, mergedOptions.maxColumnWidth);
      }

      console.log('💾 生成 Excel 文件...');
      // 生成文件并触发下载
      const buffer = await workbook.xlsx.writeBuffer();

      if (!buffer || buffer.byteLength === 0) {
        throw new Error('生成的 Excel 文件为空');
      }

      console.log(`✅ Excel 文件生成成功，大小: ${buffer.byteLength} bytes`);
      console.log(`📥 触发下载: ${fileName}.xlsx`);

      this.downloadFile(buffer, `${fileName}.xlsx`);
      console.log('✅ 导出完成');
    } catch (error) {
      console.error('❌ Excel 导出过程出错:', error);
      throw error;
    }
  }

  /**
   * 填充工作表数据
   */
  private populateWorksheet(
    worksheet: ExcelJS.Worksheet,
    tableData: TableData,
    options: Required<ExcelExportOptions>
  ): void {
    // 定义边框样式
    const borderStyle = {
      style: 'thin' as const,
      color: { argb: 'FF000000' },
    };

    // 定义表头样式
    const headerStyle = {
      font: { bold: true, size: options.headerFontSize },
      alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
      ...(options.addBorders && {
        border: {
          top: borderStyle,
          left: borderStyle,
          bottom: borderStyle,
          right: borderStyle,
        },
      }),
    };

    // 定义数据单元格样式
    const dataCellStyle = {
      font: { size: options.dataFontSize },
      alignment: { vertical: 'middle' as const, horizontal: 'left' as const },
      ...(options.addBorders && {
        border: {
          top: borderStyle,
          left: borderStyle,
          bottom: borderStyle,
          right: borderStyle,
        },
      }),
    };

    // 遍历行
    tableData.rows.forEach((row, rowIndex) => {
      const excelRow = worksheet.addRow(row.cells.map((cell) => cell.value || ''));

      // 应用样式
      excelRow.eachCell((cell, colNumber) => {
        // 第一行作为表头
        if (rowIndex === 0) {
          Object.assign(cell, headerStyle);
          // 设置表头背景色
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' }, // 淡紫色背景
          };
        } else {
          Object.assign(cell, dataCellStyle);
        }

        // 处理合并单元格
        const tableCell = row.cells[colNumber - 1];
        if (tableCell.rowSpan && tableCell.rowSpan > 1) {
          worksheet.mergeCells(rowIndex + 1, colNumber, rowIndex + tableCell.rowSpan, colNumber);
        }
        if (tableCell.colSpan && tableCell.colSpan > 1) {
          worksheet.mergeCells(rowIndex + 1, colNumber, rowIndex + 1, colNumber + tableCell.colSpan - 1);
        }
      });
    });
  }

  /**
   * 自动调整工作表列宽
   */
  private autoFitWorksheetColumns(
    worksheet: ExcelJS.Worksheet,
    minWidth: number,
    maxWidth: number
  ): void {
    worksheet.columns.forEach((column) => {
      let maxLength = 0;

      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? cell.value.toString() : '';
        const cellLength = cellValue.length;

        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });

      // 限制列宽范围
      const adjustedWidth = Math.max(minWidth, Math.min(maxWidth, maxLength + 2));
      column.width = adjustedWidth;
    });
  }

  /**
   * 触发文件下载
   */
  private downloadFile(buffer: ArrayBuffer, fileName: string): void {
    try {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // 检查浏览器是否支持 Blob
      if (!(blob instanceof Blob)) {
        throw new Error('浏览器不支持 Blob API');
      }

      const url = window.URL.createObjectURL(blob);

      if (!url) {
        throw new Error('创建下载链接失败');
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // 某些浏览器需要将链接添加到 DOM 才能触发下载
      document.body.appendChild(link);

      // 尝试触发点击
      try {
        link.click();
        console.log('✅ 下载链接已触发');
      } catch (clickError) {
        console.error('❌ 触发下载失败:', clickError);
        throw new Error('浏览器阻止了下载，请检查弹出窗口设置');
      }

      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('❌ 文件下载失败:', error);
      throw error;
    }
  }
}

/**
 * 导出单例实例
 */
export const excelExporter = new ExcelExporter();
