// ==============================================================================
// tool-registry.ts - 工具注册系统
// ==============================================================================
//
// 本文件实现可扩展的工具注册系统:
// - 动态注册工具
// - 按分类查询工具
// - 工具搜索功能
// - 为未来 100+ 工具提供架构支持
//
// 核心功能:
// - 工具注册和管理
// - 分类管理
// - 搜索和过滤
// - 类型安全的工具配置
//
// ==============================================================================

import { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * 工具分类配置
 */
export interface ToolCategory {
  /** 分类唯一标识 */
  id: string;
  /** 分类名称 */
  name: string;
  /** 分类图标 */
  icon: LucideIcon;
  /** 分类描述 */
  description: string;
  /** 排序权重 (越小越靠前) */
  order?: number;
}

/**
 * 工具配置项
 */
export interface ToolConfig {
  // ============= 基础信息 =============

  /** 工具唯一标识 */
  id: string;

  /** 工具名称 */
  name: string;

  /** 工具描述 (简短,一句话) */
  description: string;

  /** 工具详细说明 */
  detailedDescription?: string;

  /** 工具分类 */
  category: ToolCategory;

  /** 工具图标 */
  icon: LucideIcon;

  // ============= 路由配置 =============

  /** 路由路径 */
  path: string;

  // ============= UI 配置 =============

  /** 工具组件 */
  component: ComponentType;

  /** 布局方式 */
  layout?: 'vertical' | 'horizontal' | 'wizard';

  /** 是否显示进度条 */
  showProgress?: boolean;

  // ============= 功能配置 =============

  /** 工具设置 */
  settings?: ToolSettings;

  /** 是否启用批量处理 */
  enableBatch?: boolean;

  /** 是否启用预览 */
  enablePreview?: boolean;

  // ============= 元数据 =============

  /** 工具标签 (用于搜索和分类) */
  tags?: string[];

  /** 是否为新工具 (显示"新"标签) */
  isNew?: boolean;

  /** 是否为推荐工具 */
  isFeatured?: boolean;

  /** 排序权重 (越小越靠前) */
  order?: number;
}

/**
 * 工具设置配置
 */
export interface ToolSettings {
  // ============= 文件限制 =============

  /** 最大文件数量 */
  maxFiles?: number;

  /** 最大文件大小 (字节) */
  maxFileSize?: number;

  /** 允许的文件类型 (MIME 类型) */
  allowedTypes?: string[];

  /** 允许的文件扩展名 */
  allowedExtensions?: string[];

  // ============= UI 行为 =============

  /** 布局方式 */
  layout?: 'vertical' | 'horizontal';

  /** 是否显示进度条 */
  showProgress?: boolean;

  /** 是否支持批量处理 */
  enableBatch?: boolean;

  /** 是否支持预览 */
  enablePreview?: boolean;

  // ============= 功能开关 =============

  /** 是否启用自动开始 */
  autoStart?: boolean;

  /** 是否启用结果导出 */
  enableExport?: boolean;

  /** 支持的导出格式 */
  exportFormats?: ('xlsx' | 'csv' | 'json' | 'pdf')[];
}

/**
 * 工具注册表类
 *
 * 管理所有工具的注册、查询和搜索
 */
class ToolRegistry {
  /** 已注册的工具列表 */
  private tools = new Map<string, ToolConfig>();

  /** 已注册的分类列表 */
  private categories = new Map<string, ToolCategory>();

  /**
   * 注册工具
   *
   * @param tool - 工具配置
   * @throws {Error} 如果工具 ID 已存在
   */
  register(tool: ToolConfig): void {
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool with id "${tool.id}" already exists`);
    }

    this.tools.set(tool.id, tool);
    console.log(`[ToolRegistry] Registered tool: ${tool.name} (${tool.id})`);
  }

  /**
   * 批量注册工具
   *
   * @param tools - 工具配置列表
   */
  registerBatch(tools: ToolConfig[]): void {
    tools.forEach(tool => this.register(tool));
  }

  /**
   * 注册分类
   *
   * @param category - 分类配置
   * @throws {Error} 如果分类 ID 已存在
   */
  registerCategory(category: ToolCategory): void {
    if (this.categories.has(category.id)) {
      throw new Error(`Category with id "${category.id}" already exists`);
    }

    this.categories.set(category.id, category);
    console.log(`[ToolRegistry] Registered category: ${category.name} (${category.id})`);
  }

  /**
   * 批量注册分类
   *
   * @param categories - 分类配置列表
   */
  registerCategoriesBatch(categories: ToolCategory[]): void {
    categories.forEach(category => this.registerCategory(category));
  }

  /**
   * 获取指定工具
   *
   * @param id - 工具 ID
   * @returns 工具配置,如果不存在返回 undefined
   */
  get(id: string): ToolConfig | undefined {
    return this.tools.get(id);
  }

  /**
   * 按分类获取工具列表
   *
   * @param categoryId - 分类 ID
   * @returns 该分类下的所有工具
   */
  getByCategory(categoryId: string): ToolConfig[] {
    return Array.from(this.tools.values())
      .filter(tool => tool.category.id === categoryId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * 获取所有工具
   *
   * @returns 所有已注册的工具列表
   */
  getAll(): ToolConfig[] {
    return Array.from(this.tools.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * 获取所有分类
   *
   * @returns 所有已注册的分类列表
   */
  getCategories(): ToolCategory[] {
    return Array.from(this.categories.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * 获取指定分类
   *
   * @param id - 分类 ID
   * @returns 分类配置,如果不存在返回 undefined
   */
  getCategory(id: string): ToolCategory | undefined {
    return this.categories.get(id);
  }

  /**
   * 搜索工具
   *
   * @param query - 搜索关键词
   * @returns 匹配的工具列表
   */
  search(query: string): ToolConfig[] {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      return this.getAll();
    }

    return this.getAll().filter(tool => {
      // 搜索工具名称
      if (tool.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // 搜索工具描述
      if (tool.description.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // 搜索工具标签
      if (tool.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      // 搜索分类名称
      if (tool.category.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      return false;
    });
  }

  /**
   * 获取推荐工具
   *
   * @returns 所有标记为推荐的工具
   */
  getFeaturedTools(): ToolConfig[] {
    return this.getAll().filter(tool => tool.isFeatured);
  }

  /**
   * 获取新工具
   *
   * @returns 所有标记为新的工具
   */
  getNewTools(): ToolConfig[] {
    return this.getAll().filter(tool => tool.isNew);
  }

  /**
   * 按标签获取工具
   *
   * @param tag - 标签名称
   * @returns 包含该标签的所有工具
   */
  getByTag(tag: string): ToolConfig[] {
    return this.getAll().filter(tool =>
      tool.tags?.includes(tag)
    );
  }

  /**
   * 获取工具数量统计
   *
   * @returns 统计信息对象
   */
  getStats() {
    const tools = this.getAll();
    const categories = this.getCategories();

    return {
      totalTools: tools.length,
      totalCategories: categories.length,
      featuredCount: tools.filter(t => t.isFeatured).length,
      newCount: tools.filter(t => t.isNew).length,
      byCategory: categories.reduce((acc, cat) => {
        acc[cat.id] = this.getByCategory(cat.id).length;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * 注销工具
   *
   * @param id - 工具 ID
   * @returns 是否成功注销
   */
  unregister(id: string): boolean {
    const tool = this.tools.get(id);
    if (!tool) {
      return false;
    }

    this.tools.delete(id);
    console.log(`[ToolRegistry] Unregistered tool: ${tool.name} (${id})`);
    return true;
  }

  /**
   * 清空所有工具和分类
   *
   * ⚠️ 谨慎使用,此操作不可逆
   */
  clear(): void {
    this.tools.clear();
    this.categories.clear();
    console.log('[ToolRegistry] Cleared all tools and categories');
  }
}

/**
 * 全局工具注册表实例
 *
 * 使用单例模式,确保整个应用共享同一个注册表
 */
export const toolRegistry = new ToolRegistry();

/**
 * 便捷的工具注册辅助函数
 *
 * @param tools - 工具配置列表
 */
export function registerTools(...tools: ToolConfig[]): void {
  toolRegistry.registerBatch(tools);
}

/**
 * 便捷的分类注册辅助函数
 *
 * @param categories - 分类配置列表
 */
export function registerCategories(...categories: ToolCategory[]): void {
  toolRegistry.registerCategoriesBatch(categories);
}
