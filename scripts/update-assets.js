#!/usr/bin/env node
// ==============================================================================
// update-assets.js - 自动更新 app/page.tsx 中的前端资源引用
// ==============================================================================
//
// 功能:
//   1. 读取 Vite 构建生成的 dist/index.html
//   2. 提取 JS 和 CSS 文件名
//   3. 更新 app/page.tsx 中的资源引用
//
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 文件路径
const distHtmlPath = path.join(__dirname, '../dist/index.html');
const pageTsxPath = path.join(__dirname, '../app/page.tsx');

console.log('📝 开始更新前端资源引用...\n');

// 1. 读取 Vite 构建生成的 index.html
if (!fs.existsSync(distHtmlPath)) {
  console.error('❌ 错误: dist/index.html 不存在');
  console.error('   请先运行 npm run build:vite');
  process.exit(1);
}

const distHtml = fs.readFileSync(distHtmlPath, 'utf-8');
console.log('✅ 已读取 dist/index.html');

// 2. 提取 JS 文件名
const jsMatch = distHtml.match(/<script[^>]+src="\/assets\/index-[^"]+\.js"/);
if (!jsMatch) {
  console.error('❌ 错误: 无法在 dist/index.html 中找到 JS 文件引用');
  process.exit(1);
}

const jsScript = jsMatch[0];
const jsFilename = jsScript.match(/index-[^"]+\.js/)[0];
console.log(`✅ 找到 JS 文件: ${jsFilename}`);

// 3. 提取 CSS 文件名
const cssMatch = distHtml.match(/<link[^>]+href="\/assets\/index-[^"]+\.css"/);
if (!cssMatch) {
  console.error('❌ 错误: 无法在 dist/index.html 中找到 CSS 文件引用');
  process.exit(1);
}

const cssLink = cssMatch[0];
const cssFilename = cssLink.match(/index-[^"]+\.css/)[0];
console.log(`✅ 找到 CSS 文件: ${cssFilename}`);

// 4. 读取 app/page.tsx
if (!fs.existsSync(pageTsxPath)) {
  console.error('❌ 错误: app/page.tsx 不存在');
  process.exit(1);
}

let pageTsx = fs.readFileSync(pageTsxPath, 'utf-8');

// 5. 替换资源引用
console.log('✅ 正在更新 app/page.tsx...');

// 使用精确的正则表达式替换
// 匹配并替换 script 标签
pageTsx = pageTsx.replace(
  /(<script[^>]*src=")\/assets\/index-[^"]+\.js("[^>]*><\/script>)/g,
  `$1/assets/${jsFilename}$2`
);

// 匹配并替换 link 标签
pageTsx = pageTsx.replace(
  /(<link[^>]*href=")\/assets\/index-[^"]+\.css("[^>]*>)/g,
  `$1/assets/${cssFilename}$2`
);

// 6. 写回 app/page.tsx
fs.writeFileSync(pageTsxPath, pageTsx, 'utf-8');
console.log('✅ 已更新 app/page.tsx');

// 7. 验证
const updatedPageTsx = fs.readFileSync(pageTsxPath, 'utf-8');
if (updatedPageTsx.includes(jsFilename) && updatedPageTsx.includes(cssFilename)) {
  console.log('\n✅ 资源引用更新成功!\n');
  console.log(`   JS:  /assets/${jsFilename}`);
  console.log(`   CSS: /assets/${cssFilename}\n`);
} else {
  console.error('\n❌ 错误: 资源引用验证失败\n');
  process.exit(1);
}
