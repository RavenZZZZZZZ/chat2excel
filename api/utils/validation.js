// @ts-check
// ==============================================================================
// api/utils/validation.ts - 验证工具
// ==============================================================================
//
// 提供输入验证和数据清理功能
//
// ==============================================================================

export interface ValidationError {
  code: string;
  error: string;
}

export class ValidationUtils {
  // 验证文件上传
  static validateFileUpload(file: File | null): ValidationError | null {
    const MAX_SIZE = 7 * 1024 * 1024; // 7MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!file) {
      return {
        code: 'NO_FILE',
        error: 'No file uploaded'
      };
    }

    if (file.size > MAX_SIZE) {
      return {
        code: 'FILE_TOO_LARGE',
        error: '文件大小超过 7MB 限制'
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        code: 'INVALID_TYPE',
        error: `不支持的文件类型: ${file.type}。仅支持 JPEG/PNG`
      };
    }

    return null;
  }

  // 验证和清理 uid 参数
  static sanitizeUid(uid: string | null): string {
    if (!uid) {
      throw new Error('uid is required');
    }

    // 只允许字母数字和连字符
    const sanitized = uid.replace(/[^a-zA-Z0-9-]/g, '');

    if (sanitized !== uid) {
      throw new Error('Invalid uid format');
    }

    if (sanitized.length === 0) {
      throw new Error('uid cannot be empty');
    }

    return sanitized;
  }

  // 验证请求方法
  static validateMethod(method: string | null, allowedMethods: string[]): boolean {
    if (!method) return false;
    return allowedMethods.includes(method);
  }
}
