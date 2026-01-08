// ==============================================================================
// client.ts - Axios API 客户端配置
// ==============================================================================
// 
// 本文件创建并配置 Axios HTTP 客户端，用于与后端 API 交互。
// 
// 主要功能：
// - 创建统一的 Axios 实例
// - 配置基础 URL 和超时时间
// - 添加请求拦截器（添加 token、修改请求头等）
// - 添加响应拦截器（统一错误处理、提取数据等）
//
// 使用说明：
// 在其他 API 文件中导入此客户端，使用 apiClient.get/post/put/delete 等方法
//
// ==============================================================================

import axios, { type AxiosInstance } from 'axios';
import type { ApiError } from '@/types';

/**
 * 创建 Axios 客户端实例
 *
 * 配置说明：
 * - baseURL: API 基础地址
 *   - 开发环境：从 VITE_API_BASE_URL 环境变量读取（默认 http://localhost:3000/api）
 *   - 生产环境：使用相对路径 /api（Vercel 自动路由到同域名的 /api）
 * - timeout: 请求超时时间（60秒，适合文件上传）
 * - headers: 默认请求头，设置为 JSON 格式
 */
const rawAxiosInstance = axios.create({
  // 开发环境：指向本地 Vite 开发服务器代理
  // 生产环境：使用相对路径 /api（Vercel 自动路由到同域名的 /api）
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000, // 60秒超时，适合文件上传
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * API 响应类型
 * 响应拦截器会自动解包 response.data，所以 API 调用直接返回这个类型
 */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: number;
};

/**
 * 请求拦截器
 *
 * 在发送请求前执行，可用于：
 * - 添加认证 token
 * - 修改请求头
 * - 显示加载动画
 */
rawAxiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 *
 * 在收到响应后执行，可用于：
 * - 统一提取响应数据（response.data）
 * - 统一错误处理
 * - 显示/隐藏加载动画
 */
rawAxiosInstance.interceptors.response.use(
  (response) => {
    // 直接返回响应数据，不需要每次都访问 response.data
    return response.data;
  },
  (error): Promise<ApiError> => {
    // 错误处理
    if (error.response) {
      // 服务器返回的错误，直接返回错误数据
      return Promise.reject(error.response.data as ApiError);
    }
    // 网络错误（无响应），返回默认错误格式
    return Promise.reject({
      success: false,
      code: 500,
      message: '网络错误',
      error: error.message,
      timestamp: Date.now(),
    });
  }
);

/**
 * 类型安全的 API 客户端
 *
 * 使用方式：
 * - apiClient.get<User>('/users/1') 返回 Promise<User>
 * - apiClient.post<{ id: string }>('/users', { name: 'foo' }) 返回 Promise<{ id: string }>
 */
const apiClient = rawAxiosInstance as AxiosInstance & {
  <T>(config: any): Promise<ApiResponse<T>>;
  get<T>(url: string, config?: any): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: any): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
};

export default apiClient;
