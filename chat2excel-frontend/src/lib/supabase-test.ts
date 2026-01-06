// ==============================================================================
// supabase-test.ts - 数据库连接测试
// ==============================================================================
//
// 临时测试文件，用于验证数据库表是否正确创建
//
// ==============================================================================

import { supabase } from './supabase';

/**
 * 测试数据库连接和表是否存在
 */
export async function testDatabaseConnection() {
  console.log('🔍 开始测试数据库连接...\n');

  // 1. 测试连接
  try {
    const { error } = await supabase
      .from('image_uploads')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ 连接失败:', error.message);
      return false;
    }

    console.log('✅ 数据库连接成功');
  } catch (err) {
    console.error('❌ 连接异常:', err);
    return false;
  }

  // 2. 检查 image_uploads 表
  console.log('\n📊 检查表结构...');

  const tables = [
    'image_uploads',
    'ocr_tasks',
  ];

  for (const tableName of tables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ 表 '${tableName}' 不存在或无权限访问`);
        console.error(`   错误: ${error.message}`);
      } else {
        console.log(`✅ 表 '${tableName}' 存在且可访问`);
      }
    } catch (err) {
      console.error(`❌ 表 '${tableName}' 检查失败:`, err);
    }
  }

  // 3. 检查 Storage
  console.log('\n📁 检查 Storage...');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Storage 访问失败:', error.message);
    } else {
      console.log('✅ Storage 访问成功');
      console.log('   可用的 buckets:', buckets.map(b => b.name).join(', '));

      const hasUploadsBucket = buckets.some(b => b.name === 'uploads');
      if (hasUploadsBucket) {
        console.log('✅ Bucket "uploads" 存在');
      } else {
        console.log('⚠️  Bucket "uploads" 不存在（需要创建）');
      }
    }
  } catch (err) {
    console.error('❌ Storage 检查失败:', err);
  }

  console.log('\n✨ 测试完成！');
  return true;
}

/**
 * 查询表结构（需要在 Supabase Dashboard 中执行）
 *
 * 复制以下 SQL 到 Supabase SQL Editor 中执行：
 */
export const tableSchemaQueries = {
  image_uploads: `
    -- 查看 image_uploads 表结构
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'image_uploads'
    ORDER BY ordinal_position;
  `,

  ocr_tasks: `
    -- 查看 ocr_tasks 表结构
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'ocr_tasks'
    ORDER BY ordinal_position;
  `,

  allTables: `
    -- 查看所有表
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `,

  rlsPolicies: `
    -- 查看 RLS 策略
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `,
};
