// ==============================================================================
// 测试上传权限
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

async function testUploadPermission() {
  console.log('🧪 测试 Supabase Storage 上传权限\n');
  console.log('='.repeat(60));

  // 创建测试图片内容（1x1 像素的 PNG）
  const testImageData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  );
  const testFileName = `test-upload-${Date.now()}.png`;

  console.log(`\n📝 准备上传测试文件: ${testFileName}`);
  console.log(`📂 目标 bucket: uploads`);
  console.log(`📊 文件大小: ${testImageData.length} bytes\n`);

  try {
    // 测试上传
    console.log('⬆️  开始上传...\n');
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(testFileName, testImageData, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error('❌ 上传失败\n');
      console.error('错误详情:');
      console.error(JSON.stringify(error, null, 2));
      console.log('\n' + '='.repeat(60));
      console.log('\n💡 可能的原因:\n');

      if (error.message.includes('policy') || error.message.includes('permission')) {
        console.log('1. ❌ Storage 策略限制（RLS）');
        console.log('   需要在 Supabase Dashboard 配置上传策略\n');
        console.log('   解决方案:');
        console.log('   a. 访问: https://supabase.com/dashboard/project/hlurjwzhsmieikygrlrs/storage/uploads');
        console.log('   b. 点击 "Policies" 标签');
        console.log('   c. 创建新策略，选择 "Insert" 权限');
        console.log('   d. 使用以下策略模板:');
        console.log('   ```');
        console.log('   bucket_id = \'uploads\'');
        console.log('   ```');
      } else if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.log('2. ❌ Bucket 不存在');
        console.log('   需要先创建 bucket "uploads"\n');
        console.log('   解决方案:');
        console.log('   访问: https://supabase.com/dashboard/project/hlurjwzhsmieikygrlrs/storage');
      } else if (error.message.includes('JWT') || error.message.includes('auth')) {
        console.log('3. ❌ 认证问题');
        console.log('   可能需要登录用户\n');
      } else {
        console.log('4. ❌ 其他错误');
        console.log(`   ${error.message}\n`);
      }

      return false;
    }

    console.log('✅ 上传成功！\n');
    console.log('文件信息:');
    console.log(`  - Path: ${data.path}`);
    console.log(`  - Full Path: ${data.fullPath}`);
    console.log(`  - ID: ${data.id}\n`);

    // 测试获取公开 URL
    console.log('🔍 获取公开 URL...\n');
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(testFileName);

    console.log(`✅ 公开 URL: ${urlData.publicUrl}\n`);

    // 测试列出文件（验证读取权限）
    console.log('📋 测试列出文件...\n');
    const { data: listData, error: listError } = await supabase.storage
      .from('uploads')
      .list('', {
        limit: 10,
      });

    if (listError) {
      console.log('⚠️  列出文件失败（可能需要 SELECT 策略）');
      console.log(`   错误: ${listError.message}\n`);
    } else {
      console.log(`✅ 成功列出 ${listData.length} 个文件\n`);
    }

    // 清理测试文件
    console.log('🗑️  清理测试文件...\n');
    const { error: deleteError } = await supabase.storage
      .from('uploads')
      .remove([testFileName]);

    if (deleteError) {
      console.log('⚠️  删除失败（可能需要 DELETE 策略）');
      console.log(`   错误: ${deleteError.message}\n`);
    } else {
      console.log('✅ 测试文件已删除\n');
    }

    console.log('🎉 Storage 配置正常！');
    console.log('✅ 可以开始使用了！\n');
    return true;

  } catch (err) {
    console.error('\n💥 上传异常:', err);
    console.error('\n' + '='.repeat(60));
    return false;
  }
}

testUploadPermission()
  .then(success => {
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('✅ 测试通过：Storage 权限配置正确');
      process.exit(0);
    } else {
      console.log('❌ 测试失败：需要配置 Storage 权限');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n💥 测试失败:', err);
    process.exit(1);
  });
