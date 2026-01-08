// ==============================================================================
// response.ts - 统一响应格式
// ==============================================================================

import { VercelResponse } from '@vercel/node';

/**
 * 成功响应
 */
export function success<T>(
  res: VercelResponse,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: Date.now(),
  });
}

/**
 * 错误响应
 */
export function error(
  res: VercelResponse,
  code: string,
  message: string,
  details?: any,
  statusCode: number = 500
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: Date.now(),
  });
}

/**
 * 分页响应
 */
export function paginated<T>(
  res: VercelResponse,
  items: T[],
  page: number,
  pageSize: number,
  total: number
): void {
  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    },
    timestamp: Date.now(),
  });
}
