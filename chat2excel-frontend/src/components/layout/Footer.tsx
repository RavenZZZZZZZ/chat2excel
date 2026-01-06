// ==============================================================================
// Footer.tsx - 页面底部组件
// ==============================================================================
// 
// 本组件实现应用的页脚区域，包含：
// - 版权信息
// - 可扩展：链接、社交媒体图标等
// 
// 功能说明：
// - 使用 mt-auto 实现页脚始终在页面底部（flex 布局）
// - 响应式设计：在不同屏幕尺寸下保持居中
//
// ==============================================================================

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          {/* 版权信息 */}
          <p>&copy; 2024 Chat2Excel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
