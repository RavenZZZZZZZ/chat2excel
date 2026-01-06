// ==============================================================================
// 测试直接上传（绕过列表限制）
// ==============================================================================

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirectUpload() {
  console.log('🧪 测试直接上传到 uploads bucket\n');

  // 创建测试文件内容
  const testContent = `This is a test file uploaded at ${new Date().toISOString()}`;
  const testFileName = `test-${Date.now()}.txt`;

  console.log(`📝 准备上传测试文件: ${testFileName}`);
  console.log(`📂 目标 bucket: uploads`);
  console.log(`📊 文件大小: ${testContent.length} bytes\n`);

  try {
    // 直接尝试上传（不先检查 bucket 是否存在）
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (error) {
      console.error('❌ 上传失败\n');
      console.error(`错误代码: ${error.code}`);
      console.error(`错误信息: ${error.message}`);
      console.error(`错误详情: ${JSON.stringify(error, null, 2)}\n`);

      console.log('💡 可能的原因:\n');

      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.log('1. Bucket "uploads" 确实不存在');
        console.log('   需要在 Supabase Dashboard 创建\n');
      } else if (error.message.includes('permission') || error.message.includes('policy') || error.code === '42501') {
        console.log('2. 权限不足（RLS 策略限制）');
        console.log('   需要配置 Storage 策略允许上传\n');
        console.log('   解决方案:');
        console.log('   a. 进入 Supabase Dashboard → Storage → uploads');
        console.log('   b. 点击 "Policies" 标签');
        console.log('   c. 添加以下 INSERT 策略:');
        console.log('   ```');
        console.log('   bucket_id = \'uploads\'');
        console.log('   ```\n');
      } else if (error.message.includes('JWT') || error.message.includes('auth')) {
        console.log('3. 认证问题');
        console.log('   需要先登录用户\n');
      } else {
        console.log('4. 其他错误');
        console.log(`   ${error.message}\n`);
      }

      return false;
    }

    console.log('✅ 上传成功！\n');
    console.log('文件信息:');
    console.log(`  - Path: ${data.path}`);
    console.log(`  - Full Path: ${data.fullPath}`);
    console.log(`  - ID: ${data.id}\n`);

    // 测试获取文件（验证查看权限）
    console.log('🔍 测试查看文件...');
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(testFileName);

    console.log(`✅ 公开 URL: ${urlData.publicUrl}\n`);

    // 清理测试文件
    console.log('🗑️  清理测试文件...');
    const { error: deleteError } = await supabase.storage
      .from('uploads')
      .remove([testFileName]);

    if (deleteError) {
      console.log('⚠️  删除失败（可能需要 DELETE 策略）');
      console.log(`   错误: ${deleteError.message}\n`);
    } else {
      console.log('✅ 测试文件已删除\n');
    }

    console.log('🎉 Storage 配置正常！可以继续开发了！');
    return true;

  } catch (err) {
    console.error('💥 上传异常:', err);
    return false;
  }
}

testDirectUpload()
  .then(success => {
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('✅ 测试通过：Storage 已正确配置');
      process.exit(0);
    } else {
      console.log('❌ 测试失败：Storage 需要配置');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n💥 测试失败:', err);
    process.exit(1);
  });
