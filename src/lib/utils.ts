// ==============================================================================
// utils.ts - 通用工具函数
// ==============================================================================
// 
// 本文件提供项目通用的工具函数，包括：
// - cn: Tailwind CSS 类名合并
// - formatFileSize: 格式化文件大小
// - formatNumber: 格式化数字
// - debounce: 防抖函数
// - throttle: 节流函数
// - generateId: 生成唯一 ID
// - downloadFile: 下载文件
// - copyToClipboard: 复制到剪贴板
//
// ==============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 * 
 * 使用 clsx 和 tailwind-merge 来智能合并 Tailwind CSS 类名
 * 避免类名冲突，支持条件类名
 * 
 * @param inputs - 类名数组或对象
 * @returns 合并后的类名字符串
 * 
 * @example
 * cn('px-4', isActive && 'bg-blue-500', 'py-2')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化文件大小
 * 
 * 将字节数转换为人类可读的文件大小格式（B、KB、MB、GB）
 * 
 * @param bytes - 文件大小（字节数）
 * @returns 格式化后的文件大小字符串
 * 
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 格式化数字
 * 
 * 将数字转换为带千位分隔符的格式
 * 
 * @param value - 数字或数字字符串
 * @returns 格式化后的数字字符串
 * 
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber("1234567") // "1,234,567"
 */
export function formatNumber(value: string | number): string {
  if (typeof value === 'number') return value.toLocaleString();
  const num = parseFloat(value);
  return isNaN(num) ? value : num.toLocaleString();
}

/**
 * 防抖函数
 * 
 * 延迟执行函数，如果在延迟时间内再次调用，则重置延迟
 * 常用于搜索输入、窗口 resize 等场景
 * 
 * @param func - 需要防抖的函数
 * @param wait - 延迟时间（毫秒）
 * @returns 防抖后的函数
 * 
 * @example
 * const debouncedSearch = debounce(handleSearch, 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 * 
 * 限制函数的执行频率，在指定时间内只执行一次
 * 常用于滚动事件、鼠标移动等场景
 * 
 * @param func - 需要节流的函数
 * @param limit - 时间间隔（毫秒）
 * @returns 节流后的函数
 * 
 * @example
 * const throttledScroll = throttle(handleScroll, 100);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 生成唯一 ID
 * 
 * 使用随机数生成一个短字符串 ID
 * 
 * @returns 唯一 ID 字符串
 * 
 * @example
 * generateId() // "a1b2c3d4e5f6g"
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * 下载文件
 * 
 * 通过创建临时链接触发浏览器下载文件
 * 
 * @param url - 文件 URL
 * @param filename - 下载后的文件名
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 复制文本到剪贴板
 * 
 * 使用浏览器 Clipboard API 复制文本
 * 
 * @param text - 要复制的文本
 * @returns 是否复制成功
 * 
 * @example
 * copyToClipboard('Hello World').then(success => {
 *   if (success) console.log('复制成功')
 * })
 */
export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  );
}
