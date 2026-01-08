// ==============================================================================
// storage/index.ts - 存储服务导出
// ==============================================================================
//
// 注意：已从 Supabase 客户端迁移到后端 API
// 为了保持向后兼容，这里重新导出新的 API 函数
//
// ==============================================================================

// 导出新的 API 函数（替代 supabaseStorageService）
export {
  uploadImage,
  uploadImageWithRetry,
  saveOCRTask,
  saveOCRResult,
  taskExists,
  deleteOCRTask,
  deleteImage,
} from '@/services/api/storage.api';
