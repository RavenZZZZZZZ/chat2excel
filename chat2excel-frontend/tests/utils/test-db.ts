// ==============================================================================
// Database Validation Script
// ==============================================================================

import { config } from 'dotenv';
// 加载环境变量
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 缺少环境变量 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function validateDatabase() {
  console.log('🔍 开始验证数据库...\n');

  let success = true;

  // Test 1: image_uploads 表
  console.log('测试 1/2: image_uploads 表');
  try {
    const { data, error, status } = await supabase
      .from('image_uploads')
      .select('id, file_name, created_at')
      .limit(1);

    if (error) {
      console.error(`❌ 失败 (HTTP ${status})`);
      console.error(`   错误代码: ${error.code}`);
      console.error(`   错误信息: ${error.message}`);
      console.error(`   提示: ${error.hint || '无'}`);
      success = false;
    } else {
      console.log('✅ 成功');
      console.log(`   查询结果: ${data.length} 条记录`);
    }
  } catch (err) {
    console.error('❌ 异常:', err);
    success = false;
  }

  console.log('');

  // Test 2: ocr_tasks 表
  console.log('测试 2/2: ocr_tasks 表');
  try {
    const { data, error, status } = await supabase
      .from('ocr_tasks')
      .select('id, status, created_at')
      .limit(1);

    if (error) {
      console.error(`❌ 失败 (HTTP ${status})`);
      console.error(`   错误代码: ${error.code}`);
      console.error(`   错误信息: ${error.message}`);
      console.error(`   提示: ${error.hint || '无'}`);
      success = false;
    } else {
      console.log('✅ 成功');
      console.log(`   查询结果: ${data.length} 条记录`);
    }
  } catch (err) {
    console.error('❌ 异常:', err);
    success = false;
  }

  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✅ 所有测试通过！数据库表已正确创建。');
  } else {
    console.log('❌ 部分测试失败，请检查错误信息。');
    console.log('\n常见问题:');
    console.log('1. 表不存在 - 需要在 Supabase SQL Editor 中创建表');
    console.log('2. RLS 策略问题 - 需要添加 RLS 策略允许认证用户访问');
    console.log('3. 权限问题 - 检查表是否启用了 RLS');
  }
  console.log('='.repeat(50));

  return success;
}

// 运行验证
validateDatabase()
  .then(result => {
    if (result) {
      console.log('\n🎉 数据库验证成功！');
      process.exit(0);
    } else {
      console.log('\n❌ 数据库验证失败！');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n💥 验证过程出错:', err);
    process.exit(1);
  });
