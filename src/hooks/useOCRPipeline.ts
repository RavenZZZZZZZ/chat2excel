// ==============================================================================
// useOCRPipeline.ts - OCR 流水线 Hook
// ==============================================================================
//
// 本 Hook 封装完整的 OCR 识别流程:
// - 调用 OCR 服务批量识别
// - 更新任务进度
// - 解析表格结构
// - 保存结果到 Zustand store
//
// 核心功能:
// - 自动启动 OCR 识别
// - 实时更新任务进度
// - 解析 HTML 表格或位置信息
// - 错误处理和重试
//
// ==============================================================================

import { useEffect, useRef } from 'react';
import { ocrService } from '@/services/ocr';
import { tableParser, markdownTableParser } from '@/services/table';
import type { OCRTask } from '@/types/ocr';
import type { TableParseResult } from '@/types/table';

/**
 * OCR 流水线 Hook
 *
 * 封装完整的 OCR 识别流程:
 * 1. 调用 ocrService.recognizeBatch() 批量识别
 * 2. 实时更新任务进度 (通过 onProgress 回调)
 * 3. 解析表格结构 (优先使用 MarkdownTableParser)
 * 4. 保存解析结果到 Zustand store
 *
 * @param files - 待识别的文件列表
 * @param onProgress - 进度更新回调
 */
export function useOCRPipeline(
  files: File[],
  onProgress: (task: OCRTask) => void,
  setParsedResults?: (results: TableParseResult[]) => void
) {
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current || files.length === 0) {
      return;
    }

    hasStartedRef.current = true;

    const startOCR = async () => {
      try {
        console.log(`Starting OCR for ${files.length} files`);

        // 调用 OCR 服务批量识别
        const results = await ocrService.recognizeBatch(files, (updatedTask) => {
          // 实时更新任务进度
          onProgress(updatedTask);
        });

        console.log('All OCR tasks completed');

        // 解析表格结构
        console.log('Starting table structure parsing...');
        const parseResults: TableParseResult[] = [];

        for (const task of results) {
          if (!task.result) {
            console.warn(`Skipping task: ${task.file.name}, no recognition result`);
            continue;
          }

          console.log(`Parsing image: ${task.file.name}`);

          let parseResult: TableParseResult;

          // 优先使用 MarkdownTableParser 解析 HTML 表格内容
          if (task.result.text) {
            console.log('Trying MarkdownTableParser for HTML table...');
            parseResult = markdownTableParser.parse(task.result.text);

            // 如果 HTML 解析失败且有位置信息的 items,则回退到 TableParser
            if (!parseResult.success && task.result.items.length > 0) {
              console.log('HTML parsing failed, falling back to TableParser...');
              parseResult = tableParser.parse(task.result.items);
            }
          } else if (task.result.items.length > 0) {
            // 只有位置信息的 items,使用 TableParser
            console.log('Using TableParser for position info...');
            parseResult = tableParser.parse(task.result.items);
          } else {
            // 既没有 text 也没有 items
            console.warn(`Skipping task: ${task.file.name}, no parseable content`);
            continue;
          }

          parseResults.push(parseResult);

          if (parseResult.success) {
            console.log(
              `Table parsing successful: ${task.file.name}, ` +
              `confidence: ${(parseResult.confidence! * 100).toFixed(1)}%`
            );
          } else {
            console.warn(`Table parsing failed: ${task.file.name}, reason: ${parseResult.error}`);
          }
        }

        // 保存解析结果
        if (setParsedResults) {
          setParsedResults(parseResults);
        }

        console.log('All table parsing completed');
      } catch (error) {
        console.error('OCR pipeline failed:', error);
        // TODO: 显示错误提示
      }
    };

    startOCR();
  }, [files, onProgress, setParsedResults]);
}
