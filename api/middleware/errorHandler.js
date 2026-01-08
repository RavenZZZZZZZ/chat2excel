// ==============================================================================
// api/middleware/errorHandler.ts - 错误处理中间件
// ==============================================================================
//
// 统一错误处理和响应格式化
//
// ==============================================================================

import { NextResponse } from 'next/server';

// 自定义 API 错误类
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 处理 API 错误并返回标准化响应
export function handleApiError(error: unknown): NextResponse {
  console.error('❌ API Error:', error);

  // 处理自定义 API 错误
  if (error instanceof ApiError) {
    return NextResponse.json(
      { code: error.code, error: error.message },
      { status: error.statusCode }
    );
  }

  // 处理普通 Error
  if (error instanceof Error) {
    return NextResponse.json(
      { code: 'internal_error', error: error.message },
      { status: 500 }
    );
  }

  // 处理未知错误类型
  return NextResponse.json(
    { code: 'internal_error', error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

// 创建标准错误响应
export function createErrorResponse(
  statusCode: number,
  code: string,
  message: string
): NextResponse {
  return NextResponse.json(
    { code, error: message },
    { status: statusCode }
  );
}

// 创建成功响应
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(data, { status: statusCode });
}
