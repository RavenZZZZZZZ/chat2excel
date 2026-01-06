// ==============================================================================
// Storage Validation Script
// ==============================================================================

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function validateStorage() {
  console.log('📁 检查 Storage 配置...\n');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Storage 访问失败:', error.message);
      console.error('\n💡 可能的原因:');
      console.error('1. Storage 未启用');
      console.error('2. 权限配置问题');
      console.error('\n📝 解决方案:');
      console.error('在 Supabase Dashboard → Storage 中创建 bucket "uploads"');
      return false;
    }

    console.log('✅ Storage 已启用');
    console.log('   当前的 buckets:');
    if (buckets.length === 0) {
      console.log('   (无)');
    } else {
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (public: ${bucket.public})`);
      });
    }

    const uploadsBucket = buckets.find(b => b.name === 'uploads');
    console.log('\n检查 uploads bucket:');

    if (!uploadsBucket) {
      console.log('❌ Bucket "uploads" 不存在');
      console.log('\n📝 需要创建 uploads bucket:');
      console.log('1. 打开 Supabase Dashboard');
      console.log('2. 进入 Storage 页面');
      console.log('3. 点击 "New bucket"');
      console.log('4. Name: uploads');
      console.log('5. Public: false（私有）');
      console.log('6. File size limit: 10MB');
      console.log('7. Allowed MIME types: image/*');
      return false;
    }

    console.log('✅ Bucket "uploads" 存在');

    if (uploadsBucket.public) {
      console.log('⚠️  Bucket 是公开的（建议设为私有以提高安全性）');
    } else {
      console.log('✅ Bucket 是私有的（安全）');
    }

    // 测试上传权限
    console.log('\n测试上传权限...');
    const testFileName = `test/${Date.now()}.txt`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(testFileName, 'test content', {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.log('⚠️  上传测试失败（可能需要配置 RLS 策略）');
      console.log(`   错误: ${uploadError.message}`);
      console.log('\n💡 需要配置 Storage 策略:');
      console.log('在 Supabase Dashboard → Storage → uploads → Policies 中添加:');
      console.log(`
-- 允许认证用户上传
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

-- 允许用户查看自己的文件
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[0]);
      `);
    } else {
      console.log('✅ 上传权限正常');

      // 清理测试文件
      await supabase.storage.from('uploads').remove([testFileName]);
    }

    console.log('\n✨ Storage 检查完成！');
    return true;

  } catch (err) {
    console.error('❌ Storage 检查失败:', err);
    return false;
  }
}

validateStorage()
  .then(success => {
    if (success) {
      console.log('\n🎉 Storage 配置正常！');
      process.exit(0);
    } else {
      console.log('\n⚠️  Storage 需要配置');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n💥 检查过程出错:', err);
    process.exit(1);
  });
