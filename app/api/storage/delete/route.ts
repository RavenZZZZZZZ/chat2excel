// ==============================================================================
// app/api/storage/delete/route.ts - 删除 Supabase Storage 中的图片
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsHeaders } from '@/lib/cors';
import { ValidationError } from '@/lib/errors';

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');

    if (!path) {
      throw new ValidationError('File path is required');
    }

    console.log(`[Storage Delete] Deleting file: ${path}`);

    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'ocr-images';

    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (deleteError) {
      console.error('[Storage Delete] Delete failed:', deleteError);
      throw new Error('Failed to delete file from storage');
    }

    console.log(`[Storage Delete] Delete successful: ${path}`);

    return NextResponse.json({
      success: true,
      data: { path },
      message: 'File deleted successfully',
      timestamp: Date.now(),
    }, { headers: corsHeaders(request) });

  } catch (err: any) {
    console.error('[Storage Delete] Error:', err);

    if (err.code === 'VALIDATION_ERROR') {
      return NextResponse.json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
        timestamp: Date.now(),
      }, { status: 400, headers: corsHeaders(request) });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'DELETE_FAILED', message: err.message || 'Failed to delete file' },
      timestamp: Date.now(),
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export const dynamic = 'force-dynamic';
