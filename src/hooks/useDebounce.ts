// ==============================================================================
// useDebounce.ts - 防抖 Hook
// ==============================================================================
// 
// 本 Hook 实现防抖功能，延迟更新值。
// 
// 使用场景：
// - 搜索框输入：避免每次输入都触发搜索
// - 窗口 resize：避免频繁触发布局计算
// - 表单输入：减少验证次数
//
// 防抖 vs 节流：
// - 防抖：延迟执行，如果在延迟内再次调用则重置
// - 节流：在指定时间内只执行一次
//
// ==============================================================================

import { useState, useEffect } from 'react';

/**
 * 防抖 Hook
 * 
 * 延迟更新值，如果在延迟时间内值发生变化，则重置延迟。
 * 只有当值在指定时间内不再变化时，才会更新返回值。
 * 
 * @template T - 值的类型
 * @param value - 需要防抖的值
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的值
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 * // 搜索逻辑使用 debouncedSearch，而不是 search
 */
export function useDebounce<T>(value: T, delay: number): T {
  // 存储防抖后的值
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置定时器，延迟更新值
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：取消之前的定时器
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
