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

/**
 * Claims a task for the current user.
 * @param request - The claim task request containing task_id and optional note
 * @returns Promise resolving to claim task response with success status, undo token, and timestamp
 * @throws Error if the RPC call fails or task cannot be claimed
 */
export async function claimTask(request: ClaimTaskRequest): Promise<ClaimTaskResponse> {
  const supabase = createClient();
  
  // Use type assertion to bypass type checking for RPC function names not in generated types
  const { data, error } = await (supabase.rpc as any)('claim_task', {
    task_id: request.task_id,
    note: request.note ?? null,
  });

  if (error) {
    throw new Error(`Failed to claim task: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from claim_task RPC');
  }

  return data as ClaimTaskResponse;
}

/**
 * Marks a task as completed.
 * @param request - The complete task request containing task_id
 * @returns Promise resolving to complete task response with success status and timestamp
 * @throws Error if the RPC call fails or task cannot be completed
 */
export async function completeTask(request: CompleteTaskRequest): Promise<CompleteTaskResponse> {
  const supabase = createClient();
  
  const { data, error } = await (supabase.rpc as any)('complete_task', {
    task_id: request.task_id,
  });

  if (error) {
    throw new Error(`Failed to complete task: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from complete_task RPC');
  }

  return data as CompleteTaskResponse;
}

/**
 * Reverts the last action on a task using an undo token.
 * @param request - The undo task request containing the undo_token
 * @returns Promise resolving to undo task response with success status and timestamp
 * @throws Error if the RPC call fails, token is invalid/expired, or action cannot be undone
 */
export async function undoTask(request: UndoTaskRequest): Promise<UndoTaskResponse> {
  const supabase = createClient();
  
  const { data, error } = await (supabase.rpc as any)('undo_task', {
    undo_token: request.undo_token,
  });

  if (error) {
    throw new Error(`Failed to undo task: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from undo_task RPC');
  }

  return data as UndoTaskResponse;
}

/**
 * Assigns a task to a user.
 * Note: The assign_task SQL function must be created before this wrapper will work.
 * @param request - The assign task request containing task_id and user_id
 * @returns Promise resolving to assign task response with success status, optional undo token, and timestamp
 * @throws Error if the RPC call fails or task cannot be assigned
 */
export async function assignTask(request: AssignTaskRequest): Promise<AssignTaskResponse> {
  const supabase = createClient();
  
  const { data, error } = await (supabase.rpc as any)('assign_task', {
    task_id: request.task_id,
    user_id: request.user_id,
  });

  if (error) {
    throw new Error(`Failed to assign task: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from assign_task RPC');
  }

  return data as AssignTaskResponse;
}

/**
 * Combines multiple tasks into a single combined group.
 * @param request - The combine tasks request containing array of task_ids
 * @returns Promise resolving to combine tasks response with success status, combined_group_id, and timestamp
 * @throws Error if the RPC call fails or tasks cannot be combined
 */
export async function combineTasks(request: CombineTasksRequest): Promise<CombineTasksResponse> {
  const supabase = createClient();
  
  const { data, error } = await (supabase.rpc as any)('combine_tasks', {
    task_ids: request.task_ids,
  });

  if (error) {
    throw new Error(`Failed to combine tasks: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from combine_tasks RPC');
  }

  return data as CombineTasksResponse;
}
