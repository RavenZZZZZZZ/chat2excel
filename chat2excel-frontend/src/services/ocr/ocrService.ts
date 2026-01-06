// ==============================================================================
// ocrService.ts - OCR 识别服务（Doc2X API 版本）
// ==============================================================================
//
// 本服务提供基于 Doc2X API 的图片文字识别功能
// - 支持高精度中英文识别
// - 实时进度追踪
// - 异步处理
// - 错误处理和重试
//
// ==============================================================================

import { Doc2XAdapter } from './adapters/Doc2XAdapter';
import type {
  OCRTask,
  OCROptions,
  OCRProgressCallback,
} from '@/types/ocr';

/**
 * OCR 服务类
 */
export class OCRService {
  private adapter: Doc2XAdapter;

  constructor(options: Partial<OCROptions> = {}) {
    // 保留 options 兼容性，但暂不使用
    void options; // 避免 unused 警告
    this.adapter = new Doc2XAdapter();
  }

  /**
   * 识别单张图片
   *
   * @param file - 图片文件
   * @param onProgress - 进度回调
   * @returns OCR 任务
   */
  async recognizeImage(
    file: File,
    onProgress?: OCRProgressCallback
  ): Promise<OCRTask> {
    const taskId = `ocr_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const startTime = Date.now();

    // 创建任务对象
    const task: OCRTask = {
      id: taskId,
      file,
      preview: URL.createObjectURL(file),
      status: 'idle',
      progress: 0,
      createdAt: startTime,
    };

    try {
      // 更新状态：开始识别
      task.status = 'recognizing';
      task.progress = 0;
      onProgress?.({ ...task });

      console.log('🔧 使用 Doc2X API 进行识别...');
      console.log(`📁 文件: ${file.name} (${file.size} bytes)`);

      // 执行识别
      const result = await this.adapter.recognize(
        file,
        (progress) => {
          task.progress = progress;
          onProgress?.({ ...task });
        }
      );

      // 更新状态：完成
      task.status = 'completed';
      task.progress = 100;
      task.result = result;

      console.log(`✅ 识别完成: ${file.name} (${result.duration}ms)`);
      console.log(`📝 识别文本长度: ${result.text.length} 字符`);
      console.log(`📊 识别项数量: ${result.items.length}`);

      onProgress?.({ ...task });

      return task;

    } catch (error) {
      // 更新状态：失败
      task.status = 'failed';
      task.error = this.handleError(error);

      console.error(`❌ 识别失败: ${file.name}`, error);

      onProgress?.({ ...task });

      return task;
    }
  }

  /**
   * 批量识别图片
   *
   * @param files - 图片文件列表
   * @param onProgress - 进度回调
   * @returns OCR 任务列表
   */
  async recognizeBatch(
    files: File[],
    onProgress?: OCRProgressCallback
  ): Promise<OCRTask[]> {
    const tasks: OCRTask[] = [];

    console.log(`📦 开始批量识别 ${files.length} 张图片`);

    // 串行识别（避免 API 限流）
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n[${i + 1}/${files.length}] 处理: ${file.name}`);

      const task = await this.recognizeImage(file, onProgress);
      tasks.push(task);

      // 批量处理时添加短暂延迟，避免 API 限流
      if (i < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`\n✅ 批量识别完成: ${tasks.length}/${files.length}`);

    return tasks;
  }

  /**
   * 处理错误信息
   */
  private handleError(error: unknown): string {
    console.error('OCR Service error:', error);

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const err = error as { message?: string; error?: string };
      return err.message || err.error || '识别失败';
    }

    return '未知错误';
  }

  /**
   * 获取支持的语言列表（Doc2X 自动检测）
   */
  static getSupportedLanguages(): string[] {
    return [
      'zh', // 中文
      'en', // 英语
      'auto', // 自动检测
    ];
  }
}

/**
 * 创建默认 OCR 服务实例
 */
export const ocrService = new OCRService({
  provider: 'doc2x',
});
