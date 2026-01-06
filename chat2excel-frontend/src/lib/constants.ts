// ==============================================================================
// constants.ts - 应用常量定义
// ==============================================================================
// 
// 本文件定义了项目中使用的各种常量，包括：
// - 文件上传限制（支持的格式、大小、尺寸）
// - OCR 提供商
// - 导出格式
// - 动画和提示持续时间
// - 表格编辑器配置
// - 响应式断点
//
// 使用常量的好处：
// 1. 避免魔法数字（magic numbers）
// 2. 方便统一修改配置
// 3. 提高代码可读性
//
// ==============================================================================

/**
 * 支持的图片格式
 * 
 * 定义文件上传时接受的 MIME 类型
 */
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/bmp', 'application/pdf'] as const;

/**
 * 最大文件大小
 * 
 * 限制上传文件的最大大小（10MB）
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 图片最小宽度（像素）
 */
export const MIN_IMAGE_WIDTH = 100;

/**
 * 图片最小高度（像素）
 */
export const MIN_IMAGE_HEIGHT = 100;

/**
 * 图片最大宽度（像素）
 */
export const MAX_IMAGE_WIDTH = 10000;

/**
 * 图片最大高度（像素）
 */
export const MAX_IMAGE_HEIGHT = 10000;

/**
 * OCR 提供商
 * 
 * 定义支持的 OCR 引擎
 */
export const OCR_PROVIDERS = {
  TESSERACT: 'tesseract',
  BAIDU: 'baidu',
  ALIYUN: 'aliyun',
} as const;

/**
 * 导出格式
 * 
 * 定义支持的 Excel 导出格式
 */
export const EXPORT_FORMATS = {
  XLSX: 'xlsx',
  XLS: 'xls',
  CSV: 'csv',
} as const;

/**
 * 动画持续时间（毫秒）
 * 
 * 定义不同动画效果的速度
 */
export const ANIMATION_DURATION = {
  FAST: 100,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Toast 提示持续时间（毫秒）
 * 
 * 定义不同类型 Toast 的显示时间
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
} as const;

/**
 * 表格编辑器配置
 * 
 * 定义表格编辑器的默认参数
 */
export const TABLE_EDITOR = {
  DEFAULT_COL_WIDTH: 120,
  DEFAULT_ROW_HEIGHT: 40,
  MIN_COL_WIDTH: 50,
  MIN_ROW_HEIGHT: 30,
  MAX_HISTORY: 20,
  AUTO_SAVE_DELAY: 500,
} as const;

/**
 * 响应式断点（像素）
 * 
 * 定义不同屏幕尺寸的断点，用于响应式设计
 */
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  DESKTOP: 1024,
} as const;
