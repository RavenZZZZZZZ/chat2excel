// ==============================================================================
// api/tasks/exists.ts - 检查任务是否存在
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase';
import { cors } from '../middleware/cors';
import { success, error } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 CORS
  if (cors(req, res)) return;

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return error(res, 'METHOD_NOT_ALLOWED', 'Method not allowed', null, 405);
  }

  try {
    const { taskId } = req.query;

    if (!taskId || typeof taskId !== 'string') {
      return error(res, 'INVALID_TASK_ID', 'Task ID is required', null, 400);
    }

    console.log(`[Tasks] Checking existence: ${taskId}`);

    const { data: task, error: fetchError } = await supabase
      .from('ocr_tasks')
      .select('id')
      .eq('task_id', taskId)
      .single();

    if (fetchError) {
      console.error('[Tasks] Check existence failed:', fetchError);
      return success(res, { exists: false }, 'Task does not exist');
    }

    const exists = !!task;

    console.log(`[Tasks] Task existence: ${taskId} -> ${exists}`);

    return success(res, { exists }, 'Task existence checked');

  } catch (err: any) {
    console.error('[Tasks] Error:', err);
    return success(res, { exists: false }, 'Task does not exist');
  }
}
