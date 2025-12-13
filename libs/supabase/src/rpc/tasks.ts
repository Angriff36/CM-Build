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
  // TODO: Implement claim_task RPC function
  throw new Error('claim_task RPC function not implemented yet');

  // const supabase = createClient();
  // const { data, error } = await supabase.rpc('claim_task', {
  //   task_id: request.task_id,
  //   note: request.note,
  // });

  // if (error) {
  //   throw error;
  // }

  // return data as ClaimTaskResponse;
}

export async function completeTask(request: CompleteTaskRequest): Promise<CompleteTaskResponse> {
  // TODO: Implement complete_task RPC function
  throw new Error('complete_task RPC function not implemented yet');
}

export async function undoTask(request: UndoTaskRequest): Promise<UndoTaskResponse> {
  // TODO: Implement undo_task RPC function
  throw new Error('undo_task RPC function not implemented yet');
}

export async function assignTask(request: AssignTaskRequest): Promise<AssignTaskResponse> {
  // TODO: Implement assign_task RPC function
  throw new Error('assign_task RPC function not implemented yet');
}

export async function combineTasks(request: CombineTasksRequest): Promise<CombineTasksResponse> {
  // TODO: Implement combine_tasks RPC function
  throw new Error('combine_tasks RPC function not implemented yet');
}
