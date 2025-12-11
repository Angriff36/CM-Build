import { createClient } from '../client';
import type {
  ClaimTaskRequest,
  ClaimTaskResponse,
  CompleteTaskRequest,
  CompleteTaskResponse,
  UndoTaskRequest,
  UndoTaskResponse,
  AssignTaskRequest,
  AssignTaskResponse,
  CombineTasksRequest,
  CombineTasksResponse,
} from '../../../shared/src/dto/tasks';

export async function claimTask(request: ClaimTaskRequest): Promise<ClaimTaskResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('claim_task', {
    task_id: request.task_id,
    note: request.note,
  });

  if (error) {
    throw error;
  }

  return data as ClaimTaskResponse;
}

export async function completeTask(request: CompleteTaskRequest): Promise<CompleteTaskResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('complete_task', {
    task_id: request.task_id,
  });

  if (error) {
    throw error;
  }

  return data as CompleteTaskResponse;
}

export async function undoTask(request: UndoTaskRequest): Promise<UndoTaskResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('undo_task', {
    undo_token: request.undo_token,
  });

  if (error) {
    throw error;
  }

  return data as UndoTaskResponse;
}

export async function assignTask(request: AssignTaskRequest): Promise<AssignTaskResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('assign_task', {
    task_id: request.task_id,
    user_id: request.user_id,
  });

  if (error) {
    throw error;
  }

  return data as AssignTaskResponse;
}

export async function combineTasks(request: CombineTasksRequest): Promise<CombineTasksResponse> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('combine_tasks', {
    task_ids: request.task_ids,
  });

  if (error) {
    throw error;
  }

  return data as CombineTasksResponse;
}
