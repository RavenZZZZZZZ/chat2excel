// ==============================================================================
// userId.ts - 用户 ID 工具函数
// ==============================================================================

/**
 * 获取或创建匿名用户 ID
 *
 * 临时方案：使用 localStorage 存储匿名用户 ID
 * TODO: 后续替换为真实的用户认证系统
 */
export function getOrCreateUserId(): string {
  let userId = localStorage.getItem('anonymous_user_id');

  if (!userId) {
    // 生成新的匿名用户 ID
    userId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('anonymous_user_id', userId);
  }

  return userId;
}

/**
 * 获取当前用户 ID
 */
export function getCurrentUserId(): string | null {
  return localStorage.getItem('anonymous_user_id');
}

/**
 * 清除用户 ID（用于测试或重置）
 */
export function clearUserId(): void {
  localStorage.removeItem('anonymous_user_id');
}
