// ==============================================================================
// api/tasks/[id].ts - 获取/更新/删除单个任务
// ==============================================================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../api-modules/lib/supabase';
import { cors } from '../../api-modules/middleware/cors';
import { success, error } from '../../api-modules/lib/response';
import { ValidationError, NotFoundError } from '../../api-modules/lib/error';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 CORS
  if (cors(req, res)) return;

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return error(res, 'INVALID_ID', 'Invalid task ID', null, 400);
  }

  try {
    // GET - 获取任务详情
    if (req.method === 'GET') {
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

      return success(res, task, 'Task fetched successfully');
    }

    // PUT - 更新任务
    if (req.method === 'PUT') {
      const body = req.body;

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

      // 构造更新数据（只更新提供的字段）
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

      return success(res, updatedTask, 'Task updated successfully');
    }

    // DELETE - 删除任务
    if (req.method === 'DELETE') {
      const { imagePath } = req.body;

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

      // 删除 Storage 中的图片（如果有）
      const pathToDelete = imagePath || existingTask.file_path;
      if (pathToDelete) {
        const bucketName = process.env.SUPABASE_BUCKET_NAME || 'ocr-images';
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([pathToDelete]);

        if (storageError) {
          console.warn('[Task] Failed to delete file from storage:', storageError);
          // 不抛出错误，因为数据库记录已删除
        }
      }

      console.log(`[Task] Task deleted: ${id}`);

      return success(res, { id }, 'Task deleted successfully');
    }

    // 其他方法不支持
    return error(res, 'METHOD_NOT_ALLOWED', 'Method not allowed', null, 405);

  } catch (err: any) {
    console.error('[Task] Error:', err);

    if (err.code === 'VALIDATION_ERROR') {
      return error(res, err.code, err.message, err.details, 400);
    }

    if (err.code === 'NOT_FOUND') {
      return error(res, err.code, err.message, err.details, 404);
    }

    return error(res, 'INTERNAL_ERROR', err.message || 'Internal server error', null, 500);
  }
}
