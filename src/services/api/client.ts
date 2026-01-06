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

import axios from 'axios';
import type { ApiError } from '@/types';
import { config } from '@/config/app.config';

/**
 * 创建 Axios 客户端实例
 * 
 * 配置说明：
 * - baseURL: API 基础地址，从配置文件读取
 * - timeout: 请求超时时间，从配置文件读取
 * - headers: 默认请求头，设置为 JSON 格式
 */
const apiClient = axios.create({
  baseURL: config.app.apiBaseUrl,
  timeout: config.app.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 
 * 在发送请求前执行，可用于：
 * - 添加认证 token
 * - 修改请求头
 * - 显示加载动画
 */
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
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

export default apiClient;
