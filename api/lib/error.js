// ==============================================================================
// error.ts - 自定义错误类
// ==============================================================================

/**
 * API 错误基类
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 验证错误 (400)
 */
export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

/**
 * 未找到错误 (404)
 */
export class NotFoundError extends APIError {
  constructor(resource: string, id: string) {
    super(404, 'NOT_FOUND', `${resource} not found`, { resource, id });
    this.name = 'NotFoundError';
  }
}

/**
 * 业务逻辑错误 (422)
 */
export class BusinessError extends APIError {
  constructor(message: string, details?: any) {
    super(422, 'BUSINESS_ERROR', message, details);
    this.name = 'BusinessError';
  }
}
