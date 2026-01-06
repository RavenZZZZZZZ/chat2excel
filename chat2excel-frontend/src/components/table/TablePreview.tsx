// ==============================================================================
// TablePreview.tsx - 表格预览组件
// ==============================================================================
//
// 本组件实现识别结果的表格预览功能，主要功能包括：
// - 以表格形式展示解析结果
// - 支持单元格编辑
// - 显示单元格置信度
// - 支持添加/删除行列
// - 支持合并/拆分单元格
//
// ==============================================================================

import { useState } from 'react';
import type { TableData, Cell as TableCellType } from '@/types/recognition';

interface TablePreviewProps {
  tableData: TableData;
  onDataChange?: (newData: TableData) => void;
  readonly?: boolean;
}

/**
 * 表格预览组件
 */
export function TablePreview({ tableData, onDataChange, readonly = false }: TablePreviewProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [cellValues, setCellValues] = useState<Record<string, string>>({});

  /**
   * 处理单元格点击
   */
  const handleCellClick = (rowIndex: number, colIndex: number, cell: TableCellType) => {
    if (readonly) return;

    setEditingCell({ row: rowIndex, col: colIndex });
    setCellValues({
      ...cellValues,
      [`${rowIndex}-${colIndex}`]: cell.value,
    });
  };

  /**
   * 处理单元格值变更
   */
  const handleCellValueChange = (rowIndex: number, colIndex: number, newValue: string) => {
    setCellValues({
      ...cellValues,
      [`${rowIndex}-${colIndex}`]: newValue,
    });
  };

  /**
   * 处理单元格编辑完成
   */
  const handleCellEditComplete = (rowIndex: number, colIndex: number) => {
    const key = `${rowIndex}-${colIndex}`;
    const newValue = cellValues[key];

    if (newValue !== undefined && onDataChange) {
      const newData: TableData = {
        rows: tableData.rows.map((row, rIdx) => ({
          cells: row.cells.map((cell, cIdx) => {
            if (rIdx === rowIndex && cIdx === colIndex) {
              return {
                ...cell,
                value: newValue,
                isModified: newValue !== cell.value,
                originalValue: cell.originalValue || cell.value,
              };
            }
            return cell;
          }),
        })),
      };

      onDataChange(newData);
    }

    setEditingCell(null);
  };

  /**
   * 获取单元格的 rowspan 和 colspan
   */
  const getCellSpan = (cell: TableCellType) => {
    const rowSpan = cell.rowSpan || 1;
    const colSpan = cell.colSpan || 1;
    return { rowSpan, colSpan };
  };

  /**
   * 获取单元格背景色（根据置信度）
   */
  const getCellBgColor = (cell: TableCellType) => {
    if (cell.isModified) {
      return 'bg-blue-50 dark:bg-blue-900/20';
    }

    if (cell.confidence === undefined) {
      return '';
    }

    if (cell.confidence >= 0.9) {
      return '';
    } else if (cell.confidence >= 0.7) {
      return 'bg-yellow-50 dark:bg-yellow-900/20';
    } else {
      return 'bg-red-50 dark:bg-red-900/20';
    }
  };

  /**
   * 渲染单元格
   */
  const renderCell = (rowIndex: number, colIndex: number, cell: TableCellType) => {
    const { rowSpan, colSpan } = getCellSpan(cell);
    const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
    const currentValue = cellValues[`${rowIndex}-${colIndex}`] || cell.value;

    return (
      <td
        key={`${rowIndex}-${colIndex}`}
        rowSpan={rowSpan > 1 ? rowSpan : undefined}
        colSpan={colSpan > 1 ? colSpan : undefined}
        className={`
          border border-gray-300 dark:border-gray-600 px-4 py-2
          ${getCellBgColor(cell)}
          ${!readonly ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
          transition-colors
        `}
        onClick={() => handleCellClick(rowIndex, colIndex, cell)}
        title={
          cell.confidence !== undefined
            ? `置信度: ${(cell.confidence * 100).toFixed(1)}%${cell.isModified ? ' (已修改)' : ''}`
            : cell.isModified
            ? '已修改'
            : undefined
        }
      >
        {isEditing ? (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleCellValueChange(rowIndex, colIndex, e.target.value)}
            onBlur={() => handleCellEditComplete(rowIndex, colIndex)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCellEditComplete(rowIndex, colIndex);
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span className="block whitespace-pre-wrap">{currentValue}</span>
        )}
      </td>
    );
  };

  if (tableData.rows.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg">暂无表格数据</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.cells.map((cell, colIndex) => renderCell(rowIndex, colIndex, cell))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 图例说明 */}
      {!readonly && (
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-300"></div>
            <span>高置信度 (&ge;90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20"></div>
            <span>中等置信度 (70-90%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-red-300 bg-red-50 dark:bg-red-900/20"></div>
            <span>低置信度 (&lt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-blue-300 bg-blue-50 dark:bg-blue-900/20"></div>
            <span>已修改</span>
          </div>
        </div>
      )}
    </div>
  );
}
