// ==============================================================================
// api/tasks/index.ts - 获取任务列表 & 创建新任务
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../lib/supabase.js';
import { cors } from '../middleware/cors.js';
import { success, error, paginated } from '../lib/response.js';
import { ValidationError, BusinessError } from '../lib/error.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 CORS
  if (cors(req, res)) return;

  try {
    // GET - 获取任务列表
    if (req.method === 'GET') {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const status = req.query.status as string | undefined;
      const offset = (page - 1) * pageSize;

      console.log(`[Tasks] Fetching tasks: page=${page}, pageSize=${pageSize}, status=${status || 'all'}`);

      // 构建查询
      let query = supabase
        .from('ocr_tasks')
        .select('*', { count: 'exact' });

      // 添加状态筛选
      if (status) {
        query = query.eq('ocr_status', status);
      }

      // 添加分页
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: tasks, error: fetchError, count } = await query;

      if (fetchError) {
        console.error('[Tasks] Fetch failed:', fetchError);
        throw new Error('Failed to fetch tasks');
      }

      console.log(`[Tasks] Fetched ${tasks?.length || 0} tasks, total: ${count || 0}`);

      return paginated(res, tasks || [], page, pageSize, count || 0);
    }

    // POST - 创建新任务
    if (req.method === 'POST') {
      const body = req.body;

      // 验证必需字段
      if (!body.taskId || !body.fileName || !body.fileSize) {
        throw new ValidationError('Missing required fields: taskId, fileName, fileSize');
      }

      console.log(`[Tasks] Creating task: ${body.taskId}`);

      // 构造数据库记录
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

      return success(res, { id: newTask.id, taskId: newTask.task_id }, 'Task created successfully', 201);
    }

    // 其他方法不支持
    return error(res, 'METHOD_NOT_ALLOWED', 'Method not allowed', null, 405);

  } catch (err: any) {
    console.error('[Tasks] Error:', err);

    if (err.code === 'VALIDATION_ERROR') {
      return error(res, err.code, err.message, err.details, 400);
    }

    if (err.code === 'BUSINESS_ERROR') {
      return error(res, err.code, err.message, err.details, 422);
    }

    return error(res, 'INTERNAL_ERROR', err.message || 'Internal server error', null, 500);
  }
}
