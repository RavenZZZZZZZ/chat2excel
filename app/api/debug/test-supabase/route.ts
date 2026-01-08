// ==============================================================================
// app/api/debug/test-supabase/route.ts - Supabase 连接测试
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {},
    supabase: {},
    bucket: {},
  };

  // 1. 检查环境变量
  results.environment = {
    SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME || '(default: ocr-images)',
    SUPABASE_URL_LENGTH: process.env.SUPABASE_URL?.length || 0,
    SUPABASE_SERVICE_ROLE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
  };

  // 2. 测试 Supabase 连接
  try {
    const { data, error } = await supabase.from('ocr_tasks').select('count').limit(1);

    results.supabase = {
      status: error ? '❌ Error' : '✅ Connected',
      error: error?.message || null,
      data: data ? '✅ Query successful' : null,
    };
  } catch (err: any) {
    results.supabase = {
      status: '❌ Exception',
      error: err.message,
    };
  }

  // 3. 检查 Storage Bucket
  try {
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'ocr-images';
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      results.bucket = {
        status: '❌ Error',
        error: listError.message,
      };
    } else {
      const bucketExists = buckets?.some(b => b.name === bucketName);
      results.bucket = {
        status: bucketExists ? '✅ Exists' : '❌ Not Found',
        bucketName,
        allBuckets: buckets?.map(b => b.name) || [],
      };
    }
  } catch (err: any) {
    results.bucket = {
      status: '❌ Exception',
      error: err.message,
    };
  }

  return NextResponse.json(results);
}

export const dynamic = 'force-dynamic';
