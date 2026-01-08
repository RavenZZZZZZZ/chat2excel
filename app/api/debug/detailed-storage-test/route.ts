// ==============================================================================
// app/api/debug/detailed-storage-test/route.ts - 详细的 Storage 诊断
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    steps: [] as any[],
  };

  const addStep = (name: string, status: string, data: any = {}) => {
    results.steps.push({ step: name, status, ...data });
    console.log(`[Step] ${name}: ${status}`, data);
  };

  try {
    // 1. 检查环境变量
    addStep('1. Environment Variables', 'checking');
    const env = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_URL_LENGTH: process.env.SUPABASE_URL?.length,
      SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME,
      HAS_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    };
    addStep('1. Environment Variables', 'success', env);

    // 2. 测试数据库连接
    addStep('2. Database Connection', 'checking');
    const { data: dbData, error: dbError } = await supabase
      .from('ocr_tasks')
      .select('count')
      .limit(1);

    if (dbError) {
      addStep('2. Database Connection', 'failed', { error: dbError.message });
    } else {
      addStep('2. Database Connection', 'success', { result: 'Database connected' });
    }

    // 3. 列出所有 buckets
    addStep('3. List Buckets', 'checking');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      addStep('3. List Buckets', 'failed', {
        error: listError.message,
        name: listError.name,
      });
    } else {
      addStep('3. List Buckets', 'success', {
        buckets: buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })),
      });
    }

    // 4. 检查特定 bucket
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'ocr-images';
    addStep('4. Check Bucket Exists', 'checking', { bucketName });

    const bucketExists = buckets?.some(b => b.name === bucketName);
    if (!bucketExists) {
      addStep('4. Check Bucket Exists', 'failed', {
        error: `Bucket '${bucketName}' not found`,
        availableBuckets: buckets?.map(b => b.name),
      });
      return NextResponse.json(results);
    } else {
      addStep('4. Check Bucket Exists', 'success', { bucketName, exists: true });
    }

    // 5. 尝试列出 bucket 中的文件
    addStep('5. List Files in Bucket', 'checking');
    const { data: files, error: filesError } = await supabase.storage
      .from(bucketName)
      .list('uploads', { limit: 5 });

    if (filesError) {
      addStep('5. List Files in Bucket', 'failed', {
        error: filesError.message,
        name: filesError.name,
      });
    } else {
      addStep('5. List Files in Bucket', 'success', {
        fileCount: files?.length,
        files: files?.map(f => f.name),
      });
    }

    // 6. 尝试上传一个测试文件
    addStep('6. Upload Test File', 'checking');
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'This is a test file from Vercel';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`uploads/${testFileName}`, testContent, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      addStep('6. Upload Test File', 'failed', {
        error: uploadError.message,
        name: uploadError.name,
        errorObject: uploadError,
      });
    } else {
      addStep('6. Upload Test File', 'success', {
        path: uploadData?.path,
        message: 'Upload successful',
      });

      // 7. 清理测试文件
      addStep('7. Clean Up Test File', 'checking');
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([`uploads/${testFileName}`]);

      if (deleteError) {
        addStep('7. Clean Up Test File', 'failed', { error: deleteError.message });
      } else {
        addStep('7. Clean Up Test File', 'success', { message: 'Test file removed' });
      }
    }

  } catch (err: any) {
    addStep('Unexpected Error', 'failed', {
      error: err.message,
      name: err.name,
      stack: err.stack?.split('\n')?.slice(0, 3),
    });
  }

  return NextResponse.json(results);
}

export const dynamic = 'force-dynamic';
