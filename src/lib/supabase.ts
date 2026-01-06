// ==============================================================================
// supabase.ts - Supabase 客户端配置
// ==============================================================================
//
// 本文件初始化 Supabase 客户端，提供数据库和存储访问功能。
//
// 主要功能：
// - 初始化 Supabase 客户端
// - 提供类型安全的数据库查询
// - 提供文件上传下载功能
//
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 环境变量（可选）
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase 客户端实例（可选）
 *
 * 如果环境变量未配置，返回 null
 * 使用 anon key，受到 Row Level Security (RLS) 保护
 * 适合在前端代码中使用
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // 自动刷新 token
        autoRefreshToken: true,
        // 检测会话变化
        detectSessionInUrl: true,
        // 持久化会话
        persistSession: true,
      },
    })
  : null;

/**
 * 检查 Supabase 是否可用
 */
export function isSupabaseAvailable(): boolean {
  return supabase !== null;
}

/**
 * 数据库类型定义
 */
export type Database = {
  public: {
    Tables: {
      ocr_tasks: {
        Row: {
          id: string;
          task_id: string;
          file_name: string;
          file_size: number;
          file_path: string | null;
          file_url: string | null;
          ocr_text: string;
          ocr_status: string;
          ocr_duration: number;
          ocr_error: string | null;
          parse_success: boolean;
          parse_confidence: number | null;
          mime_type: string | null;
          image_width: number | null;
          image_height: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          file_name: string;
          file_size: number;
          file_path?: string | null;
          file_url?: string | null;
          ocr_text: string;
          ocr_status: string;
          ocr_duration: number;
          ocr_error?: string | null;
          parse_success?: boolean;
          parse_confidence?: number | null;
          mime_type?: string | null;
          image_width?: number | null;
          image_height?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          file_name?: string;
          file_size?: number;
          file_path?: string | null;
          file_url?: string | null;
          ocr_text?: string;
          ocr_status?: string;
          ocr_duration?: number;
          ocr_error?: string | null;
          parse_success?: boolean;
          parse_confidence?: number | null;
          mime_type?: string | null;
          image_width?: number | null;
          image_height?: number | null;
          updated_at?: string;
        };
      };
      ocr_items: {
        Row: {
          id: string;
          ocr_task_id: string;
          text: string;
          confidence: number;
          bbox_x0: number;
          bbox_y0: number;
          bbox_x1: number;
          bbox_y1: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          ocr_task_id: string;
          text: string;
          confidence: number;
          bbox_x0: number;
          bbox_y0: number;
          bbox_x1: number;
          bbox_y1: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          ocr_task_id?: string;
          text?: string;
          confidence?: number;
          bbox_x0?: number;
          bbox_y0?: number;
          bbox_x1?: number;
          bbox_y1?: number;
        };
      };
    };
  };
};
