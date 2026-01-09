// ==============================================================================
// Doc2XAdapter.ts - Doc2X API 适配器
// ==============================================================================
//
// 本适配器负责与 Doc2X API 交互，实现图片识别功能。
//
// 主要功能：
// - 上传文件到 Doc2X API
// - 轮询识别结果
// - 将 API 响应转换为 OCRResult 格式
//
// ==============================================================================

import axios, { type AxiosError } from 'axios';
import type { OCRResult } from '@/types/ocr';
import type { Doc2XResponse } from '@/types/doc2x';

/**
 * Doc2X API 适配器
 *
 * 注意：已从直接调用 Doc2X API 迁移到通过后端 API 调用
 * baseURL 现在指向 Vercel Serverless Functions (/api/ocr)
 */
export class Doc2XAdapter {
  private baseURL: string;
  private timeout: number;

  constructor() {
    // 指向新的后端 API 路径
    // 开发环境：使用 VITE_API_BASE_URL 环境变量
    // 生产环境：/api/ocr（相对路径，自动使用当前域名）
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    if (apiBaseUrl && apiBaseUrl.includes('localhost')) {
      // 开发环境：使用指定的本地 API
      this.baseURL = `${apiBaseUrl}/ocr`;
    } else {
      // 生产环境：使用相对路径（自动适配当前域名）
      this.baseURL = '/api/ocr';
    }

    this.timeout = parseInt(import.meta.env.VITE_DOC2X_TIMEOUT || '60000', 10);

    console.log('🔧 Doc2X 适配器初始化完成 (使用后端 API)');
    console.log(`📍 Base URL: ${this.baseURL}`);
  }

  /**
   * 识别单个文件
   *
   * @param file - 图片文件
   * @param onProgress - 进度回调（0-100）
   * @returns OCR 识别结果
   */
  async recognize(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      console.log(`📤 开始上传文件: ${file.name} (${file.size} bytes)`);

      // 1. 上传文件
      const uid = await this.uploadFile(file, onProgress);
      console.log(`✅ 文件上传成功，uid: ${uid}`);

      // 2. 轮询结果
      console.log('⏳ 等待识别结果...');
      const result = await this.pollResult(uid, onProgress);
      console.log('✅ 识别完成');

      // 3. 转换为 OCRResult
      return this.adaptResult(result, Date.now() - startTime);

    } catch (error) {
      console.error('❌ Doc2X 识别失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 上传文件到 Doc2X
   *
   * @param file - 图片文件
   * @param onProgress - 进度回调
   * @returns 任务 uid
   */
  private async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      onProgress?.(5);

      // 使用 FormData 上传文件到后端 API
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<{
        code: string;
        data?: { uid: string };
        error?: string;
      }>(
        `${this.baseURL}/upload`,  // 改为 /upload
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: this.timeout,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const uploadProgress = Math.round((progressEvent.loaded / progressEvent.total) * 25);
              onProgress?.(5 + uploadProgress); // 上传占 0-30%
            }
          },
        }
      );

      if (response.data.code !== 'success') {
        throw new Error(response.data.error || '上传失败');
      }

      if (!response.data.data?.uid) {
        throw new Error('API 未返回 uid');
      }

      onProgress?.(30);
      return response.data.data.uid;

    } catch (error) {
      console.error('❌ 文件上传失败:', error);
      throw error;
    }
  }

  /**
   * 轮询识别结果
   *
   * @param uid - 任务 ID
   * @param onProgress - 进度回调
   * @returns Doc2X 识别结果
   */
  /**
   * 轮询配置
   */
  private static readonly POLL_CONFIG = {
    maxAttempts: 60,      // 最多轮询 60 次
    pollInterval: 2000,   // 2 秒间隔
    timeout: 10000,       // 请求超时 10 秒
  } as const;

  /**
   * 提取错误信息
   */
  private extractErrorMessage(response: Doc2XResponse): string {
    return (
      response.error ||
      (response as any).msg ||
      (response as any).message ||
      response.data?.detail ||
      (response.data as any)?.error ||
      '未知错误'
    );
  }

  /**
   * 检查响应是否成功
   */
  private checkResponseSuccess(response: Doc2XResponse): void {
    if (response.code !== 'success') {
      const errorMsg = this.extractErrorMessage(response);

      // 提供更友好的错误提示
      if (response.code === 'parse_error') {
        throw new Error(
          `Doc2X 解析错误: ${errorMsg}\n\n可能原因：\n` +
          `1. 图片格式不支持（建议使用 PNG/JPG）\n` +
          `2. 图片中没有可识别的表格或文本\n` +
          `3. 图片模糊或质量太低\n` +
          `4. 图片文件已损坏`
        );
      }

      throw new Error(`API 返回错误 (${response.code}): ${errorMsg}`);
    }
  }

  /**
   * 更新进度
   */
  private updateProgress(
    data: Doc2XResponse['data'],
    onProgress?: (progress: number) => void
  ): void {
    if (!data) return;

    if (data.status === 'processing') {
      const apiProgress = data.progress || 0;
      const progress = 30 + Math.round(apiProgress * 0.65);
      onProgress?.(Math.min(progress, 95));
    }
  }

  /**
   * 检查状态是否完成
   */
  private checkStatusComplete(
    data: Doc2XResponse['data'],
    onProgress?: (progress: number) => void
  ): boolean {
    if (!data) return false;

    if (data.status === 'success') {
      onProgress?.(100);
      return true;
    }

    if (data.status === 'failed') {
      throw new Error(data.detail || '识别失败');
    }

    return false;
  }

  /**
   * 是否为可重试的网络错误
   */
  private isRetryableError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    const retryableCodes = ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET'];
    return retryableCodes.includes(error.code || '');
  }

  /**
   * 轮询 API 结果
   */
  private async pollResult(
    uid: string,
    onProgress?: (progress: number) => void
  ): Promise<Doc2XResponse['data']> {
    const { maxAttempts, pollInterval, timeout } = Doc2XAdapter.POLL_CONFIG;

    // 设置初始进度
    onProgress?.(30);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // 请求状态
        const response = await axios.get<Doc2XResponse>(
          `${this.baseURL}/status`,
          { params: { uid }, timeout }
        );

        // 检查响应
        this.checkResponseSuccess(response.data);

        const data = response.data.data;

        // 更新进度 (每次轮询都显示一些进度,表示正在处理)
        const pollProgress = Math.min(30 + (attempt + 1) * 5, 95);
        onProgress?.(pollProgress);
        if (!data) {
          throw new Error('API 返回数据为空');
        }

        // 更新进度
        this.updateProgress(data, onProgress);

        // 检查是否完成
        if (this.checkStatusComplete(data, onProgress)) {
          return data;
        }

        // 等待下次轮询
        await new Promise((resolve) => setTimeout(resolve, pollInterval));

      } catch (error) {
        // 网络错误时重试
        if (this.isRetryableError(error)) {
          console.warn(`轮询超时，重试 ${attempt + 1}/${maxAttempts}`);
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
          continue;
        }
        throw error;
      }
    }

    throw new Error('轮询超时：未能获取识别结果（可能队列排队中）');
  }

  /**
   * 转换 Doc2X 结果为 OCRResult
   *
   * @param doc2xData - Doc2X API 返回数据
   * @param duration - 识别耗时（毫秒）
   * @returns OCR 识别结果
   */
  private adaptResult(
    doc2xData: Doc2XResponse['data'],
    duration: number
  ): OCRResult {
    console.log('🔍 Doc2X 原始响应数据:', JSON.stringify(doc2xData, null, 2));

    if (!doc2xData?.result) {
      console.error('❌ Doc2X 返回数据格式错误，没有 result 字段');
      console.error('完整数据:', doc2xData);
      throw new Error('Doc2X 返回结果格式错误');
    }

    console.log('📊 Doc2X result 内容:', doc2xData.result);

    // Doc2X v2 返回的数据结构：result.pages[0].md (Markdown 格式)
    const pages = doc2xData.result.pages;
    if (!pages || pages.length === 0) {
      console.warn('⚠️ Doc2X 未返回任何页面');
      return {
        text: '',
        items: [],
        status: 'completed',
        duration,
      };
    }

    // 提取第一个页面的 Markdown/HTML 内容
    const markdown = pages[0].md || '';
    console.log('📝 Markdown/HTML 内容长度:', markdown.length);

    if (!markdown) {
      console.warn('⚠️ Doc2X 未返回任何内容');
      return {
        text: '',
        items: [],
        status: 'completed',
        duration,
      };
    }

    console.log(`📊 成功提取 HTML/Markdown，长度: ${markdown.length} 字符`);

    // 返回原始 HTML/Markdown，items 保持空数组
    // MarkdownTableParser 将处理 HTML 表格内容，而 TableParser 处理带位置信息的 items
    return {
      text: markdown,
      items: [], // 空数组，表示没有位置信息的 OCR 文字块
      status: 'completed',
      duration,
    };
  }

  /**
   * 错误处理
   *
   * @param error - 原始错误
   * @returns 友好的错误信息
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = this.getErrorMessage(error);
      return new Error(message);
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error('未知错误');
  }

  /**
   * 从 AxiosError 提取友好错误信息
   *
   * @param error - Axios 错误对象
   * @returns 错误信息
   */
  private getErrorMessage(error: AxiosError): string {
    // 网络错误
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return '请求超时，请检查网络连接';
    }

    if (error.code === 'ECONNREFUSED') {
      return '无法连接到服务器，请检查网络';
    }

    // HTTP 错误
    const status = error.response?.status;
    if (status === 401) {
      return 'API Key 无效或已过期，请检查配置';
    }

    if (status === 403) {
      return '没有权限访问 API';
    }

    if (status === 429) {
      return '请求过于频繁，请稍后重试';
    }

    if (status === 500) {
      return '服务器错误，请稍后重试';
    }

    if (status === 503) {
      return '服务暂时不可用，可能是队列排队中';
    }

    // 其他错误
    return error.message || '请求失败';
  }
}
