// ==============================================================================
// app/api/tasks/exists/route.ts - 检查任务是否存在
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { corsHeaders } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_TASK_ID', message: 'Task ID is required' },
        timestamp: Date.now(),
      }, { status: 400, headers: corsHeaders(request) });
    }

    console.log(`[Tasks] Checking existence: ${taskId}`);

    const { data: task, error: fetchError } = await supabase
      .from('ocr_tasks')
      .select('id')
      .eq('task_id', taskId)
      .single();

    if (fetchError) {
      console.error('[Tasks] Check existence failed:', fetchError);
      return NextResponse.json({
        success: true,
        data: { exists: false },
        message: 'Task does not exist',
        timestamp: Date.now(),
      }, { headers: corsHeaders(request) });
    }

    const exists = !!task;

    console.log(`[Tasks] Task existence: ${taskId} -> ${exists}`);

    return NextResponse.json({
      success: true,
      data: { exists },
      message: 'Task existence checked',
      timestamp: Date.now(),
    }, { headers: corsHeaders(request) });

  } catch (err: any) {
    console.error('[Tasks] Error:', err);
    return NextResponse.json({
      success: true,
      data: { exists: false },
      message: 'Task does not exist',
      timestamp: Date.now(),
    }, { headers: corsHeaders(request) });
  }
}

export const dynamic = 'force-dynamic';
