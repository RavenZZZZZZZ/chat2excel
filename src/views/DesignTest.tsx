// ==============================================================================
// DesignTest.tsx - Claude 官网极简风格
// ==============================================================================

import { useState } from 'react';

export default function DesignTest() {
  const [darkMode, setDarkMode] = useState(false);

  // Claude 官网色彩系统
  const colors = {
    bg: darkMode ? 'bg-[#09090B]' : 'bg-[#FDFDF7]',
    text: darkMode ? 'text-[#FDFDF7]' : 'text-[#0E0E0E]',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-600',
    cardBg: darkMode ? 'bg-[#0E0E0E]' : 'bg-white',
    border: darkMode ? 'border-gray-800' : 'border-gray-200',
    primary: darkMode ? 'text-[#D4A27F]' : 'text-[#0E0E0E]',
    primaryBg: darkMode ? 'bg-[#D4A27F]' : 'bg-[#0E0E0E]',
    primaryText: darkMode ? 'text-[#0E0E0E]' : 'text-white',
    hover: darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
  };

  return (
    <div className={`min-h-screen ${colors.bg} transition-colors duration-500`}>
      {/* 顶部导航栏 - 响应式设计 */}
      <div className="sticky top-0 z-30 w-full">
        {/* 背景模糊层 */}
        <div className="absolute w-full h-full backdrop-blur transition-colors duration-500 border-b border-gray-500/5 dark:border-gray-300/[0.06]" />

        <div className="max-w-8xl mx-auto relative">
          <div className="relative">
            {/* 导航栏内容 - 移动端优化 */}
            <div className="flex items-center px-4 sm:px-6 md:px-8 lg:px-12 h-14 sm:h-16 min-w-0">
              {/* Logo - 移动端简化 */}
              <div className="flex items-center gap-x-2 sm:gap-x-4 flex-shrink-0">
                <a href="#" className="flex items-center gap-2 sm:gap-3">
                  {/* 闪电图标 Logo - 响应式尺寸 */}
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 ${colors.cardBg} ${colors.border} border flex items-center justify-center rounded-lg`}>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className={`font-semibold text-base sm:text-lg ${colors.text} hidden xs:block`}>
                    Chat2Excel
                  </span>
                </a>

                {/* 导航标签 - 桌面端显示 */}
                <nav className="hidden lg:flex h-full text-sm gap-x-4 sm:gap-x-6 ml-4 sm:ml-8">
                  {['概览', '快速开始', '功能', '文档'].map((item, index) => (
                    <a
                      key={item}
                      href="#"
                      className={`relative h-full flex items-center font-medium transition-colors duration-200 whitespace-nowrap ${
                        index === 0
                          ? `${colors.text} [text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor]`
                          : colors.textSecondary
                      }`}
                    >
                      {item}
                      {index === 0 && (
                        <div className={`absolute bottom-0 h-[1.5px] w-full left-0 ${darkMode ? 'bg-[#D4A27F]' : 'bg-[#0E0E0E]'}`} />
                      )}
                    </a>
                  ))}
                </nav>
              </div>

              {/* 右侧操作区 - 移动端优化 */}
              <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1 ml-2 sm:ml-4">
                {/* 搜索框 - 仅在平板及以上显示 */}
                <button className={`hidden md:flex pointer-events-auto rounded-xl w-36 sm:w-48 items-center text-xs sm:text-sm leading-6 h-8 sm:h-9 pl-2.5 sm:pl-3.5 pr-2 sm:pr-3 ${colors.textSecondary} ${colors.cardBg} ring-1 ring-gray-400/30 hover:ring-gray-600/30 dark:ring-gray-600/30 transition-all duration-200`}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeWidth="2" />
                      <path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="truncate">搜索...</span>
                  </div>
                  <span className="text-xs font-semibold ml-auto flex-shrink-0 hidden sm:inline">⌘K</span>
                </button>

                {/* 移动端搜索图标按钮 */}
                <button className={`md:hidden p-2 rounded-lg ${colors.hover} transition-colors duration-200`} aria-label="搜索">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth="2" />
                    <path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>

                {/* 深色模式切换 - 响应式尺寸 */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-1.5 sm:p-2 rounded-lg ${colors.hover} transition-colors duration-200`}
                  aria-label="切换深色模式"
                >
                  {darkMode ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="4" strokeWidth="2" />
                      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>

                {/* 移动端菜单按钮 - 仅在移动端显示 */}
                <button className={`lg:hidden p-1.5 sm:p-2 rounded-lg ${colors.hover} transition-colors duration-200`} aria-label="菜单">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 4.75A.75.75 0 01.75 4h14.5a.75.75 0 010 1.5H.75A.75.75 0 010 4.75zm0 4A.75.75 0 01.75 8h14.5a.75.75 0 010 1.5H.75A.75.75 0 010 8.75zm0 4A.75.75 0 01.75 12h14.5a.75.75 0 010 1.5H.75a.75.75 0 010-1.5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 - 响应式设计 */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16">
        {/* 标题区 - 响应式字体 */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold ${colors.text} mb-4 sm:mb-6 tracking-tight`}>
            图片转表格，<span className={darkMode ? 'text-[#D4A27F]' : 'text-[#0E0E0E]'}>一键完成</span>
          </h1>
          <p className={`text-base sm:text-lg md:text-xl ${colors.textSecondary} max-w-3xl leading-relaxed`}>
            使用先进的 AI OCR 技术，快速识别图片中的表格数据并导出为 Excel 文件。
            支持多种图片格式，识别准确率高达 98%。
          </p>
        </div>

        {/* 主要操作区 - 移动端单列，大屏双列 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
          {/* 上传区域 - 响应式内边距 */}
          <div className={`${colors.cardBg} rounded-2xl p-4 sm:p-6 md:p-8 ${colors.border} border-2`}>
            <div className="border-2 border-dashed rounded-xl p-6 sm:p-8 md:p-12 text-center transition-colors duration-200 hover:border-gray-400/30">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${colors.cardBg} ${colors.border} border-2 flex items-center justify-center mx-auto mb-4 sm:mb-6 rounded-xl`}>
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className={`text-xl sm:text-2xl font-semibold ${colors.text} mb-2 sm:mb-3`}>
                上传图片
              </h3>
              <p className={`text-xs sm:text-sm ${colors.textSecondary} mb-4 sm:mb-6`}>
                拖拽图片到这里，或点击选择文件<br />
                支持 PNG、JPG、WebP 格式，最大 7MB
              </p>
              <button className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 ${colors.primaryBg} ${colors.primaryText} font-semibold rounded-xl transition-all duration-200 hover:opacity-90 active:scale-[0.985]`}>
                选择文件
              </button>
            </div>
          </div>

          {/* 功能说明 - 响应式卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '⚡', title: '快速识别', desc: 'AI 驱动的 OCR 技术，秒级响应' },
              { icon: '🎯', title: '高准确率', desc: '识别准确率高达 98%，支持复杂表格' },
              { icon: '📊', title: '格式保留', desc: '完美保留原始表格的格式和样式' },
              { icon: '💾', title: '一键导出', desc: '支持导出为 Excel、CSV 等多种格式' },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`${colors.cardBg} ${colors.border} border rounded-xl p-4 sm:p-5 hover:bg-gray-600/5 dark:hover:bg-gray-200/5 transition-colors duration-200`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="text-xl sm:text-2xl">{feature.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold ${colors.text} mb-1 text-sm sm:text-base`}>{feature.title}</h4>
                    <p className={`text-xs sm:text-sm ${colors.textSecondary}`}>{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近任务表格 - 响应式设计 */}
        <div className={`${colors.cardBg} ${colors.border} border-2 rounded-2xl overflow-hidden`}>
          <div className="p-4 sm:p-6 border-b border-gray-500/5 dark:border-gray-300/[0.06]">
            <h3 className={`text-base sm:text-lg font-semibold ${colors.text}`}>最近任务</h3>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full">
              <thead>
                <tr className={`${colors.border} border-b ${colors.hover}`}>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                    文件名
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                    状态
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold ${colors.text} uppercase tracking-wider hidden sm:table-cell`}>
                    表格数
                  </th>
                  <th className={`px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                    时间
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'invoice_2024.png', status: '完成', statusColor: 'emerald', tables: 3, time: '2分钟前' },
                  { name: 'report_q4.jpg', status: '处理中', statusColor: 'amber', tables: '-', time: '5分钟前' },
                  { name: 'data_sheet.png', status: '完成', statusColor: 'emerald', tables: 12, time: '1小时前' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-600/5 dark:hover:bg-gray-200/5 transition-colors cursor-pointer">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm font-medium ${colors.text} truncate max-w-[120px] sm:max-w-none`}>{row.name}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.statusColor === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className={`text-sm ${colors.text}`}>{row.tables}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm ${colors.textSecondary}`}>{row.time}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 底部说明 - 响应式间距 */}
        <div className={`mt-12 sm:mt-16 text-center ${colors.textSecondary}`}>
          <p className="text-xs sm:text-sm">
            💡 Claude 官网极简风格 - 深黑 (#0E0E0E) + 暖白 (#FDFDF7) + 暖桃色 (#D4A27F)
          </p>
          <p className="text-xs mt-2 opacity-60">
            1px 细边框 · 12px 圆角 · 充足留白 · 微妙交互 · 高对比度
          </p>
          <div className="mt-4 pt-4 border-t border-gray-500/5 dark:border-gray-300/[0.06]">
            <p className="text-xs opacity-50">
              响应式断点：mobile (&lt;640px) · tablet (640-1024px) · desktop (&gt;1024px)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
