// ==============================================================================
// Storage 详细诊断脚本
// ==============================================================================

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fullDiagnostic() {
  console.log('🔍 Storage 详细诊断\n');
  console.log('='.repeat(60));

  // 1. 检查项目 URL
  console.log('\n1️⃣ 项目配置');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseAnonKey?.substring(0, 20)}...`);

  // 2. 列出所有 buckets
  console.log('\n2️⃣ 列出所有 Buckets');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error(`   ❌ 失败: ${error.message}`);
      console.error(`   错误代码: ${error.code}`);
      console.error(`   错误详情: ${JSON.stringify(error, null, 2)}`);
    } else {
      console.log(`   ✅ 成功，找到 ${buckets.length} 个 bucket(s):`);
      if (buckets.length === 0) {
        console.log('   (空列表)');
      } else {
        buckets.forEach((bucket, index) => {
          console.log(`   ${index + 1}. ${bucket.name}`);
          console.log(`      - Public: ${bucket.public}`);
          console.log(`      - ID: ${bucket.id}`);
        });
      }
    }
  } catch (err) {
    console.error(`   💥 异常: ${err}`);
  }

  // 3. 尝试获取 bucket 信息
  console.log('\n3️⃣ 尝试获取 "uploads" bucket 信息');
  try {
    const { data, error } = await supabase.storage.getBucket('uploads');

    if (error) {
      console.error(`   ❌ Bucket 不存在或无权限`);
      console.error(`   错误信息: ${error.message}`);
      console.error(`   错误代码: ${error.code}`);

      console.log('\n   💡 可能的原因:');
      if (error.message.includes('not found')) {
        console.log('   - Bucket 确实不存在');
        console.log('   - 需要在 Supabase Dashboard 中创建');
      } else if (error.message.includes('permission') || error.code === '42501') {
        console.log('   - 权限不足');
        console.log('   - 需要配置 Storage 策略');
      }
    } else {
      console.log(`   ✅ Bucket 存在!`);
      console.log(`   - Name: ${data.name}`);
      console.log(`   - Public: ${data.public}`);
      console.log(`   - File size limit: ${data.file_size_limit}`);
      console.log(`   - Allowed MIME types: ${data.allowed_mime_types}`);
    }
  } catch (err) {
    console.error(`   💥 异常: ${err}`);
  }

  // 4. 尝试创建测试文件
  console.log('\n4️⃣ 尝试创建测试文件');
  if (supabase.auth.getUser()) {
    console.log('   ⚠️  需要先登录认证用户');
  } else {
    console.log('   ℹ️  当前未登录（匿名用户）');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 下一步操作建议:');

  console.log('\n如果 bucket 不存在，请按以下步骤创建:');
  console.log('1. 访问: https://supabase.com/dashboard/project/hlurjwzhsmieikygrlrs/storage');
  console.log('2. 点击 "New bucket"');
  console.log('3. 填写:');
  console.log('   - Name: uploads');
  console.log('   - Public bucket: ❌ (取消勾选)');
  console.log('   - File size limit: 10MB');
  console.log('   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif');
  console.log('4. 点击 "Create bucket"');

  console.log('\n创建 bucket 后，配置访问策略:');
  console.log('1. 进入刚创建的 "uploads" bucket');
  console.log('2. 点击 "Policies" 标签');
  console.log('3. 选择预设模板: "Give users access to only their own top level folder named as uid"');
  console.log('   或者自定义策略（INSERT, SELECT, DELETE）');

  console.log('\n' + '='.repeat(60));
}

fullDiagnostic()
  .then(() => {
    console.log('\n✨ 诊断完成！');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 诊断失败:', err);
    process.exit(1);
  });
