import type { ClaimTaskRequest, ClaimTaskResponse, CompleteTaskRequest, CompleteTaskResponse, UndoTaskRequest, UndoTaskResponse, AssignTaskRequest, AssignTaskResponse, CombineTasksRequest, CombineTasksResponse } from '../../../shared/src/dto/tasks';
export declare function claimTask(request: ClaimTaskRequest): Promise<ClaimTaskResponse>;
export declare function completeTask(request: CompleteTaskRequest): Promise<CompleteTaskResponse>;
export declare function undoTask(request: UndoTaskRequest): Promise<UndoTaskResponse>;
export declare function assignTask(request: AssignTaskRequest): Promise<AssignTaskResponse>;
export declare function combineTasks(request: CombineTasksRequest): Promise<CombineTasksResponse>;
