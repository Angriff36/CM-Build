import { z } from 'zod';

// Claim Task
export const ClaimTaskRequestSchema = z.object({
  task_id: z.string().uuid(),
  note: z.string().optional(),
});

export type ClaimTaskRequest = z.infer<typeof ClaimTaskRequestSchema>;

export const ClaimTaskResponseSchema = z.object({
  success: z.boolean(),
  undo_token: z.string().optional(),
  timestamp: z.string(),
});

export type ClaimTaskResponse = z.infer<typeof ClaimTaskResponseSchema>;

// Complete Task
export const CompleteTaskRequestSchema = z.object({
  task_id: z.string().uuid(),
});

export type CompleteTaskRequest = z.infer<typeof CompleteTaskRequestSchema>;

export const CompleteTaskResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.string(),
});

export type CompleteTaskResponse = z.infer<typeof CompleteTaskResponseSchema>;

// Undo Task
export const UndoTaskRequestSchema = z.object({
  undo_token: z.string(),
});

export type UndoTaskRequest = z.infer<typeof UndoTaskRequestSchema>;

export const UndoTaskResponseSchema = z.object({
  success: z.boolean(),
  timestamp: z.string(),
});

export type UndoTaskResponse = z.infer<typeof UndoTaskResponseSchema>;

// Assign Task
export const AssignTaskRequestSchema = z.object({
  task_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
});

export type AssignTaskRequest = z.infer<typeof AssignTaskRequestSchema>;

export const AssignTaskResponseSchema = z.object({
  success: z.boolean(),
  undo_token: z.string().optional(),
  timestamp: z.string(),
});

export type AssignTaskResponse = z.infer<typeof AssignTaskResponseSchema>;

// Combine Tasks
export const CombineTasksRequestSchema = z.object({
  task_ids: z.array(z.string().uuid()),
});

export type CombineTasksRequest = z.infer<typeof CombineTasksRequestSchema>;

export const CombineTasksResponseSchema = z.object({
  success: z.boolean(),
  combined_group_id: z.string().uuid(),
  timestamp: z.string(),
});

export type CombineTasksResponse = z.infer<typeof CombineTasksResponseSchema>;
