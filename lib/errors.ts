// @ts-check
// ==============================================================================
// lib/errors.ts - 自定义错误类
// ==============================================================================

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

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string, id: string) {
    super(404, 'NOT_FOUND', `${resource} not found`, { resource, id });
    this.name = 'NotFoundError';
  }
}

export class BusinessError extends APIError {
  constructor(message: string, details?: any) {
    super(422, 'BUSINESS_ERROR', message, details);
    this.name = 'BusinessError';
  }
}
