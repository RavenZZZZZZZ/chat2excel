// ==============================================================================
// app/api/tasks/[id]/route.ts - 获取/更新/删除单个任务
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsHeaders } from '@/lib/cors';
import { NotFoundError, ValidationError } from '@/lib/errors';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid task ID' },
        timestamp: Date.now(),
      }, { status: 400, headers: corsHeaders(request) });
    }

    console.log(`[Task] Fetching task: ${id}`);

    const { data: task, error: fetchError } = await supabase
      .from('ocr_tasks')
      .select('*')
      .eq('task_id', id)
      .single();

    if (fetchError) {
      console.error('[Task] Fetch failed:', fetchError);
      throw new Error('Failed to fetch task');
    }

    if (!task) {
      throw new NotFoundError('Task', id);
    }

    console.log(`[Task] Task fetched: ${task.id}`);

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task fetched successfully',
      timestamp: Date.now(),
    }, { headers: corsHeaders(request) });

  } catch (err: any) {
    console.error('[Task] Error:', err);

    if (err.code === 'NOT_FOUND') {
      return NextResponse.json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
        timestamp: Date.now(),
      }, { status: 404, headers: corsHeaders(request) });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error' },
      timestamp: Date.now(),
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    console.log(`[Task] Updating task: ${id}`, body);

    // 检查任务是否存在
    const { data: existingTask } = await supabase
      .from('ocr_tasks')
      .select('id')
      .eq('task_id', id)
      .single();

    if (!existingTask) {
      throw new NotFoundError('Task', id);
    }

    // 构造更新数据
    const updateData: any = {};
    if (body.ocrStatus !== undefined) updateData.ocr_status = body.ocrStatus;
    if (body.ocrText !== undefined) updateData.ocr_text = body.ocrText;
    if (body.ocrDuration !== undefined) updateData.ocr_duration = body.ocrDuration;
    if (body.ocrError !== undefined) updateData.ocr_error = body.ocrError;
    if (body.parseSuccess !== undefined) updateData.parse_success = body.parseSuccess;
    if (body.parseConfidence !== undefined) updateData.parse_confidence = body.parseConfidence;

    const { data: updatedTask, error: updateError } = await supabase
      .from('ocr_tasks')
      .update(updateData)
      .eq('task_id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Task] Update failed:', updateError);
      throw new Error('Failed to update task');
    }

    console.log(`[Task] Task updated: ${updatedTask.id}`);

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
      timestamp: Date.now(),
    }, { headers: corsHeaders(request) });

  } catch (err: any) {
    console.error('[Task] Error:', err);

    if (err.code === 'NOT_FOUND') {
      return NextResponse.json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
        timestamp: Date.now(),
      }, { status: 404, headers: corsHeaders(request) });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error' },
      timestamp: Date.now(),
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { imagePath } = body;

    console.log(`[Task] Deleting task: ${id}, imagePath: ${imagePath || 'none'}`);

    // 检查任务是否存在
    const { data: existingTask } = await supabase
      .from('ocr_tasks')
      .select('id, file_path')
      .eq('task_id', id)
      .single();

    if (!existingTask) {
      throw new NotFoundError('Task', id);
    }

    // 删除数据库记录
    const { error: deleteError } = await supabase
      .from('ocr_tasks')
      .delete()
      .eq('task_id', id);

    if (deleteError) {
      console.error('[Task] Delete failed:', deleteError);
      throw new Error('Failed to delete task');
    }

    // 删除 Storage 中的图片
    const pathToDelete = imagePath || existingTask.file_path;
    if (pathToDelete) {
      const bucketName = process.env.SUPABASE_BUCKET_NAME || 'ocr-images';
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([pathToDelete]);

      if (storageError) {
        console.warn('[Task] Failed to delete file from storage:', storageError);
      }
    }

    console.log(`[Task] Task deleted: ${id}`);

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Task deleted successfully',
      timestamp: Date.now(),
    }, { headers: corsHeaders(request) });

  } catch (err: any) {
    console.error('[Task] Error:', err);

    if (err.code === 'NOT_FOUND') {
      return NextResponse.json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
        timestamp: Date.now(),
      }, { status: 404, headers: corsHeaders(request) });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error' },
      timestamp: Date.now(),
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export const dynamic = 'force-dynamic';
