// ==============================================================================
// Storage 详细诊断脚本（调试版本）
// ==============================================================================

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugStorage() {
  console.log('🔍 Storage 调试模式\n');
  console.log('='.repeat(60));

  // 1. 列出所有 buckets（显示详细信息）
  console.log('\n1️⃣ 列出所有 Buckets（调试模式）');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error(`   ❌ 失败: ${error.message}`);
    } else {
      console.log(`   ✅ 找到 ${buckets.length} 个 bucket(s)\n`);

      if (buckets.length === 0) {
        console.log('   ⚠️  Bucket 列表为空');
        console.log('   💡 但你在 Dashboard 看到了 uploads？');
        console.log('   🤔 可能原因:');
        console.log('      1. 不同的项目（检查 URL）');
        console.log('      2. API 密钥权限问题');
        console.log('      3. 缓存问题（尝试刷新 Dashboard）');
      } else {
        buckets.forEach((bucket, index) => {
          console.log(`   Bucket ${index + 1}:`);
          console.log(`      - 名称: "${bucket.name}"`);
          console.log(`      - 长度: ${bucket.name.length} 字符`);
          console.log(`      - 字节: ${Array.from(bucket.name).map(c => c.charCodeAt(0)).join(', ')}`);
          console.log(`      - Public: ${bucket.public}`);
          console.log(`      - ID: ${bucket.id}`);
        });
      }
    }
  } catch (err) {
    console.error(`   💥 异常: ${err}`);
  }

  // 2. 尝试不同的 bucket 名称
  console.log('\n2️⃣ 尝试不同的 bucket 名称');
  const possibleNames = [
    'uploads',
    'uploads ',
    ' uploads',
    'upload',
    'Uploads',
    'UPLOADS',
  ];

  for (const name of possibleNames) {
    try {
      const { data, error } = await supabase.storage.getBucket(name);

      if (!error && data) {
        console.log(`   ✅ 找到 Bucket: "${name}"`);
        console.log(`      - 实际名称: "${data.name}"`);
        console.log(`      - 长度: ${data.name.length}`);
      }
    } catch (err) {
      // 忽略，继续测试下一个
    }
  }

  // 3. 检查当前环境变量
  console.log('\n3️⃣ 环境变量检查');
  console.log(`   VITE_SUPABASE_URL: ${supabaseUrl}`);
  console.log(`   VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey?.substring(0, 30)}...`);

  // 从 URL 提取项目 ID
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (urlMatch) {
    console.log(`   项目 ID: ${urlMatch[1]}`);
    console.log(`   预期 URL: https://supabase.com/dashboard/project/${urlMatch[1]}/storage`);
  }

  // 4. 测试带认证的请求
  console.log('\n4️⃣ 测试用户认证状态');
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log(`   ✅ 已登录用户: ${session.user?.email}`);
    console.log(`   用户 ID: ${session.user?.id}`);
  } else {
    console.log(`   ⚠️  未登录（匿名用户）`);
    console.log(`   💡 某些操作可能需要登录`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 请确认以下信息:\n');

  console.log('1. 你在 Supabase Dashboard 看到的 bucket 名称是什么？');
  console.log('   (注意大小写和空格)\n');

  console.log('2. Dashboard URL 中的项目 ID 是否为: hlurjwzhsmieikygrlrs ?\n');

  console.log('3. 是否在正确的项目中？');
  console.log('   访问: https://supabase.com/dashboard/project/hlurjwzhsmieikygrlrs/storage\n');

  console.log('4. 如果 bucket 确实存在，请截图或复制以下信息:');
  console.log('   - Bucket 名称（包括空格）');
  console.log('   - Bucket ID');
  console.log('   - Public/Private 设置');

  console.log('\n' + '='.repeat(60));
}

debugStorage()
  .then(() => {
    console.log('\n✨ 调试完成！');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 调试失败:', err);
    process.exit(1);
  });
