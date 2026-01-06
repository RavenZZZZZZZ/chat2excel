// ==============================================================================
// markdownTableParser.ts - HTML/Markdown 表格解析服务
// ==============================================================================
//
// 本服务实现基于 HTML/Markdown 内容的表格结构解析。
//
// 主要功能：
// - 解析 HTML <table> 标签（OCR API 返回格式）
// - 解析纯 Markdown 表格（使用 | 分隔符）
// - 提取合并单元格信息（colspan/rowspan）
// - 转换为 TableData 格式
// - 保留原始 HTML 标签（如 <img>）
//
// ==============================================================================

import type { Cell, Row } from '@/types/recognition';
import type { TableParseOptions, TableParseResult } from '@/types/table';

/**
 * Markdown 表格解析器类
 */
export class MarkdownTableParser {
  // 保留 options 参数以保持接口兼容性，但暂不使用
  constructor(_options: TableParseOptions = {}) {
    // Options can be used later for customization
  }

  /**
   * 解析 HTML/Markdown 内容为表格结构
   *
   * @param html - HTML 或 Markdown 文本（OCR API 返回的 HTML 格式）
   * @returns 解析结果
   */
  parse(html: string): TableParseResult {
    try {
      if (!html || html.trim().length === 0) {
        return {
          success: false,
          error: 'HTML 内容为空',
        };
      }

      // 检测是否包含 HTML 表格（OCR API 返回格式）
      if (html.includes('<table>')) {
        console.log('🔍 检测到 HTML 表格，使用 HTML 解析器');
        return this.parseHTMLTable(html);
      }

      // 检测是否包含 Markdown 表格
      if (this.detectMarkdownTable(html)) {
        console.log('🔍 检测到 Markdown 表格，使用 Markdown 解析器');
        return this.parseMarkdownTable(html);
      }

      return {
        success: false,
        error: '未检测到表格结构（需要 HTML <table> 或 Markdown 表格格式）',
      };
    } catch (error) {
      console.error('❌ HTML 表格解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 检测是否包含 Markdown 表格
   */
  private detectMarkdownTable(markdown: string): boolean {
    // 检测是否包含 Markdown 表格行（包含 | 的行）
    const lines = markdown.split('\n');
    let tableLineCount = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      // Markdown 表格行通常包含 |
      if (trimmedLine.includes('|') && trimmedLine.length > 1) {
        tableLineCount++;
      }
    }

    // 至少需要 2 行包含 | 才可能是表格
    return tableLineCount >= 2;
  }

  /**
   * 解析 HTML 表格
   */
  private parseHTMLTable(html: string): TableParseResult {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = doc.querySelectorAll('table');

      if (tables.length === 0) {
        return {
          success: false,
          error: 'HTML 中未找到 <table> 标签',
        };
      }

      console.log(`📊 找到 ${tables.length} 个表格`);

      // 找到最有用的表格（跳过 UI 元素，选择数据最丰富的表格）
      const bestTable = this.findBestTable(Array.from(tables));

      if (!bestTable) {
        return {
          success: false,
          error: '未找到有效的数据表格',
        };
      }

      const rows: Row[] = [];
      const rowsHTML = bestTable.querySelectorAll('tr');

      console.log(`📊 选择最佳表格，包含 ${rowsHTML.length} 行数据`);

      // 跳过完全空的行（可能是布局问题）
      let validRowCount = 0;

      rowsHTML.forEach((tr, rowIndex) => {
        const cells: Cell[] = [];
        const cellsHTML = tr.querySelectorAll('td, th');

        cellsHTML.forEach((td) => {
          // 类型断言为 HTMLTableCellElement 以访问 colSpan 和 rowSpan
          const cellElement = td as HTMLTableCellElement;

          // 提取单元格内容
          const value = this.extractTextContent(cellElement);

          // 如果单元格为空，仍然添加空单元格以保持表格结构
          if (!value) {
            cells.push({ value: '' });
            return;
          }

          // 提取 colspan 和 rowspan
          const colSpan = cellElement.colSpan > 1 ? cellElement.colSpan : undefined;
          const rowSpan = cellElement.rowSpan > 1 ? cellElement.rowSpan : undefined;

          const cell: Cell = { value };

          if (colSpan) cell.colSpan = colSpan;
          if (rowSpan) cell.rowSpan = rowSpan;

          cells.push(cell);

          if (colSpan || rowSpan) {
            console.log(`  单元格 [${rowIndex},${cells.length - 1}]: colspan=${colSpan || 1}, rowspan=${rowSpan || 1}, value="${value.substring(0, 20)}${value.length > 20 ? '...' : ''}"`);
          }
        });

        // 只有当行有单元格时才添加（跳过完全空的行）
        if (cells.length > 0) {
          rows.push({ cells });
          validRowCount++;
        }
      });

      if (rows.length === 0) {
        return {
          success: false,
          error: '表格中没有有效数据',
        };
      }

      console.log(`✅ HTML 表格解析成功: ${validRowCount} 行有效数据`);

      return {
        success: true,
        data: { rows },
        confidence: 1.0,
      };
    } catch (error) {
      console.error('❌ HTML 表格解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HTML 解析失败',
      };
    }
  }

  /**
   * 从表格数组中找到最好的数据表格
   * 评分标准：
   * - 行数和列数较多（数据丰富）
   * - 包含数字或日期（可能是数据表格）
   * - 不包含大量图片标签（可能是 UI 元素）
   */
  private findBestTable(tables: HTMLTableElement[]): HTMLTableElement | null {
    if (tables.length === 0) return null;
    if (tables.length === 1) return tables[0];

    let bestTable = tables[0];
    let bestScore = 0;

    tables.forEach((table, index) => {
      const score = this.scoreTable(table);
      console.log(`表格 ${index} 评分: ${score}`);

      if (score > bestScore) {
        bestScore = score;
        bestTable = table;
      }
    });

    console.log(`选择最佳表格 (评分: ${bestScore})`);
    return bestTable;
  }

  /**
   * 为表格评分，用于判断哪个是主要数据表格
   *
   * 评分标准：
   * - 行数和列数较多 → 高分
   * - 包含数字或日期 → 高分（数据表格特征）
   * - 单元格内容丰富 → 高分
   * - 包含大量图片但文字少 → 低分（可能是 UI 元素）
   * - 包含典型 UI 关键词 → 低分（工具栏、菜单等）
   */
  private scoreTable(table: HTMLTableElement): number {
    const rows = table.querySelectorAll('tr');
    let score = 0;

    // 行数权重（基础分）
    score += rows.length * 10;

    // 统计单元格内容
    let dataCellCount = 0;
    let emptyCellCount = 0;
    let imageOnlyCount = 0; // 只有图片的单元格
    let numberCount = 0;
    let dateCount = 0;
    let uiKeywordCount = 0; // UI 关键词出现次数

    // UI 关键词列表（用于识别工具栏、菜单等）
    const uiKeywords = [
      '粘贴', '复制', '剪切', '插入', '页面布局', '公式', '数据', '审阅',
      '文件', '开始', '视图', '工具', '窗口', '帮助', '开发工具',
      '剪贴板', '对齐方式', '数字', '样式', '单元格', '编辑',
      'Excel', '表格', 'xlsx', 'sheet', '工作表'
    ];

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td, th');
      cells.forEach((cell) => {
        const text = this.extractTextContent(cell).trim();
        const images = cell.querySelectorAll('img');
        const hasImages = images.length > 0;

        // 空单元格
        if (!text && !hasImages) {
          emptyCellCount++;
          return;
        }

        // 只有图片没有文字的单元格
        if (hasImages && !text) {
          imageOnlyCount++;
          return;
        }

        // 有文本内容的单元格
        if (text) {
          dataCellCount++;

          // 检查是否包含 UI 关键词
          const hasUIKeyword = uiKeywords.some(keyword => text.includes(keyword));
          if (hasUIKeyword) {
            uiKeywordCount++;
          }

          // 数字（包括小数、百分比等）
          if (/^[\d.,%¥$€£+-]+$/.test(text)) {
            numberCount++;
          }

          // 日期格式
          if (/\d{4}[/\-]\d{1,2}[/\-]\d{1,2}/.test(text)) {
            dateCount++;
          }
        }
      });
    });

    // 数据单元格权重
    score += dataCellCount * 2;

    // 空单元格惩罚（太多空单元格可能不是有效数据）
    if (emptyCellCount > dataCellCount) {
      score -= emptyCellCount;
    }

    // 数字和日期权重（数据表格的强特征）
    score += numberCount * 5;
    score += dateCount * 5;

    // UI 关键词惩罚（包含大量 UI 词汇的可能是工具栏）
    score -= uiKeywordCount * 15;

    // 只有图片的单元格轻微惩罚
    score -= imageOnlyCount * 3;

    // 奖励：如果数字+日期单元格占比超过 30%，说明这是数据表格
    const totalCells = dataCellCount + emptyCellCount + imageOnlyCount;
    if (totalCells > 0) {
      const dataRatio = (numberCount + dateCount) / totalCells;
      if (dataRatio > 0.3) {
        score += 50; // 大幅加分
      }
    }

    return Math.max(0, score);
  }

  /**
   * 提取单元格内容
   * 策略：
   * 1. 如果只有文本，返回纯文本
   * 2. 如果包含图片，尝试提取图片路径或 alt 文本
   * 3. 清理多余空白
   */
  private extractTextContent(cell: HTMLElement): string {
    // 检查是否包含图片
    const images = cell.querySelectorAll('img');
    const hasImages = images.length > 0;

    // 如果包含图片
    if (hasImages) {
      // 如果只有一个图片且没有其他文本，返回图片路径
      if (images.length === 1 && !cell.textContent?.replace(/\s/g, '')) {
        const img = images[0];
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';

        // 优先返回图片路径，其次返回 alt 文本
        return src || alt || '[图片]';
      }

      // 如果有图片和文本，提取文本内容（忽略图片标签）
      const text = cell.textContent?.trim() || '';
      if (text) {
        return this.cleanWhitespace(text);
      }

      // 多个图片但没有文本
      return `[${images.length}张图片]`;
    }

    // 没有图片，直接提取文本
    const text = cell.textContent || '';
    return this.cleanWhitespace(text);
  }

  /**
   * 清理文本中的多余空白
   */
  private cleanWhitespace(text: string): string {
    // 将多个空白字符替换为单个空格
    text = text.replace(/\s+/g, ' ');
    // 移除首尾空白
    return text.trim();
  }

  /**
   * 解析 Markdown 表格
   */
  private parseMarkdownTable(markdown: string): TableParseResult {
    try {
      const lines = markdown.split('\n');
      const tableLines: string[] = [];
      let inTable = false;

      // 提取表格行
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.includes('|')) {
          tableLines.push(trimmedLine);
          inTable = true;
        } else if (inTable && trimmedLine === '') {
          // 表格后的空行，结束表格
          break;
        }
      }

      if (tableLines.length < 2) {
        return {
          success: false,
          error: 'Markdown 表格格式无效：至少需要 2 行',
        };
      }

      const rows: Row[] = [];

      // 跳过分隔行（包含 --- 的行）
      for (let i = 0; i < tableLines.length; i++) {
        const line = tableLines[i];

        // 检查是否为分隔行（如 |---|---|）
        if (line.match(/^\|?\s*:?-+:?\|.*$/)) {
          continue;
        }

        // 解析单元格
        const cells: Cell[] = this.parseMarkdownRow(line);
        rows.push({ cells });
      }

      console.log(`✅ Markdown 表格解析成功: ${rows.length} 行`);

      return {
        success: true,
        data: { rows },
        confidence: 1.0,
      };
    } catch (error) {
      console.error('❌ Markdown 表格解析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Markdown 解析失败',
      };
    }
  }

  /**
   * 解析 Markdown 表格行
   */
  private parseMarkdownRow(line: string): Cell[] {
    const cells: Cell[] = [];

    // 移除行首和行尾的 |
    let trimmedLine = line.trim();
    if (trimmedLine.startsWith('|')) {
      trimmedLine = trimmedLine.substring(1);
    }
    if (trimmedLine.endsWith('|')) {
      trimmedLine = trimmedLine.substring(0, trimmedLine.length - 1);
    }

    // 按 | 分割单元格
    const rawCells = trimmedLine.split('|');

    for (const rawCell of rawCells) {
      const value = rawCell.trim();
      cells.push({ value });
    }

    return cells;
  }
}

/**
 * 导出单例实例
 */
export const markdownTableParser = new MarkdownTableParser();
