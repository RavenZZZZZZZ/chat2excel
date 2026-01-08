// ==============================================================================
// app/api/tasks/route.ts - 获取任务列表 & 创建新任务
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsHeaders } from '@/lib/cors';
import { ValidationError, BusinessError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') || undefined;
    const offset = (page - 1) * pageSize;

    console.log(`[Tasks] Fetching tasks: page=${page}, pageSize=${pageSize}, status=${status || 'all'}`);

    let query = supabase
      .from('ocr_tasks')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('ocr_status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data: tasks, error: fetchError, count } = await query;

    if (fetchError) {
      console.error('[Tasks] Fetch failed:', fetchError);
      throw new Error('Failed to fetch tasks');
    }

    console.log(`[Tasks] Fetched ${tasks?.length || 0} tasks, total: ${count || 0}`);

    return NextResponse.json({
      success: true,
      data: {
        items: tasks || [],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      },
      timestamp: Date.now(),
    }, { headers: corsHeaders(request) });

  } catch (err: any) {
    console.error('[Tasks] Error:', err);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error' },
      timestamp: Date.now(),
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.taskId || !body.fileName || !body.fileSize) {
      throw new ValidationError('Missing required fields: taskId, fileName, fileSize');
    }

    console.log(`[Tasks] Creating task: ${body.taskId}`);

    const record = {
      task_id: body.taskId,
      file_name: body.fileName,
      file_size: body.fileSize,
      file_path: body.imagePath || null,
      file_url: body.imageUrl || null,
      ocr_text: body.ocrText || '',
      ocr_status: body.ocrStatus || 'pending',
      ocr_duration: body.ocrDuration || 0,
      ocr_error: body.ocrError || null,
      parse_success: false,
      parse_confidence: null,
      mime_type: body.mimeType || null,
      image_width: body.imageWidth || null,
      image_height: body.imageHeight || null,
    };

    const { data: newTask, error: insertError } = await supabase
      .from('ocr_tasks')
      .insert(record)
      .select()
      .single();

    if (insertError) {
      console.error('[Tasks] Insert failed:', insertError);
      throw new BusinessError('Failed to create task');
    }

    console.log(`[Tasks] Task created: ${newTask.id}`);

    return NextResponse.json({
      success: true,
      data: { id: newTask.id, taskId: newTask.task_id },
      message: 'Task created successfully',
      timestamp: Date.now(),
    }, { status: 201, headers: corsHeaders(request) });

  } catch (err: any) {
    console.error('[Tasks] Error:', err);

    if (err instanceof ValidationError) {
      return NextResponse.json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
        timestamp: Date.now(),
      }, { status: 400, headers: corsHeaders(request) });
    }

    if (err instanceof BusinessError) {
      return NextResponse.json({
        success: false,
        error: { code: err.code, message: err.message, details: err.details },
        timestamp: Date.now(),
      }, { status: 422, headers: corsHeaders(request) });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Internal server error' },
      timestamp: Date.now(),
    }, { status: 500, headers: corsHeaders(request) });
  }
}

export const dynamic = 'force-dynamic';
