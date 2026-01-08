#!/usr/bin/env node

// Vercel 部署前检查脚本
// 用于诊断常见的部署问题

const fs = require('fs');
const path = require('path');

console.log('🔍 检查 Vercel 部署配置...\n');

// 1. 检查 vercel.json
if (fs.existsSync('vercel.json')) {
  console.log('✅ vercel.json 存在');
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf-8'));
  console.log('   - buildCommand:', vercelConfig.buildCommand);
  console.log('   - outputDirectory:', vercelConfig.outputDirectory);
  console.log('   - functions:', JSON.stringify(vercelConfig.functions, null, 2));
} else {
  console.log('❌ vercel.json 不存在');
}

// 2. 检查 API 目录
if (fs.existsSync('api')) {
  console.log('\n✅ api/ 目录存在');
  const apiFiles = fs.readdirSync('api', { recursive: true });
  const tsFiles = apiFiles.filter(f => f.endsWith('.ts'));
  console.log(`   - 找到 ${tsFiles.length} 个 TypeScript 文件`);
} else {
  console.log('\n❌ api/ 目录不存在');
}

// 3. 检查必需的环境变量（不从 .env 加载，只提示）
console.log('\n📋 需要在 Vercel 配置的环境变量:');
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_BUCKET_NAME',
  'DOC2X_API_KEY',
  'DOC2X_API_BASE_URL',
  'ALLOWED_ORIGINS',
  'MAX_FILE_SIZE',
  'ALLOWED_FILE_TYPES'
];

requiredEnvVars.forEach(envVar => {
  console.log(`   - ${envVar}`);
});

// 4. 检查依赖
console.log('\n📦 检查关键依赖...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const criticalDeps = [
  '@vercel/node',
  'formidable',
  'axios',
  'exceljs',
  'i18next',
  'react-i18next'
];

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.dependencies[dep] || packageJson.devDependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - 缺失`);
  }
});

// 5. 检查 API 函数导出
console.log('\n🔍 检查 API 函数导出...');
const apiRoutes = [
  'api/health.ts',
  'api/storage/upload.ts',
  'api/storage/delete.ts',
  'api/tasks/index.ts',
  'api/tasks/[id].ts',
  'api/ocr/upload.ts',
  'api/ocr/status.ts'
];

apiRoutes.forEach(route => {
  const fullPath = path.join(process.cwd(), route);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const hasDefaultExport = content.includes('export default') || content.includes('export default async');
    const hasHandlerType = content.includes('VercelRequest') && content.includes('VercelResponse');

    if (hasDefaultExport) {
      console.log(`✅ ${route} - 有默认导出`);
    } else {
      console.log(`⚠️  ${route} - 没有默认导出`);
    }

    if (!hasHandlerType) {
      console.log(`   ⚠️  可能缺少 VercelRequest/VercelResponse 类型`);
    }
  } else {
    console.log(`❌ ${route} - 文件不存在`);
  }
});

console.log('\n✨ 检查完成！');
console.log('\n💡 如果 Vercel 部署失败，请检查:');
console.log('   1. Vercel 环境变量是否全部配置');
console.log('   2. Build Logs 中的具体错误信息');
console.log('   3. 是否有语法错误或类型错误');
