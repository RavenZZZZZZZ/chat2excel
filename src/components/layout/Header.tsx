// ==============================================================================
// Header.tsx - 页面顶部导航栏组件
// ==============================================================================
//
// 本组件实现应用的顶部导航栏，包含：
// - Logo/应用名称
// - 导航菜单（首页、帮助）
// - 语言切换器
//
// 功能说明：
// - 响应式设计：在不同屏幕尺寸下自动调整布局
// - 使用 Tailwind CSS 进行样式管理
// - 使用 react-router-dom 的 Link 组件进行路由跳转（待优化）
// - 支持国际化（i18n）
//
// ==============================================================================

import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左侧：Logo/应用名称 */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">
              {t('common.appName')}
            </h1>
          </div>

          {/* 右侧：导航菜单 + 语言切换 + 主题切换 */}
          <nav className="flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.home')}
            </a>
            <a href="/help" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.help')}
            </a>
            <LanguageSwitcher />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
