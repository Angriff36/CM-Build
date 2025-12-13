import { z } from 'zod';
// Claim Task
export const ClaimTaskRequestSchema = z.object({
    task_id: z.string().uuid(),
    note: z.string().optional(),
});
export const ClaimTaskResponseSchema = z.object({
    success: z.boolean(),
    undo_token: z.string().optional(),
    timestamp: z.string(),
});
// Complete Task
export const CompleteTaskRequestSchema = z.object({
    task_id: z.string().uuid(),
});
export const CompleteTaskResponseSchema = z.object({
    success: z.boolean(),
    timestamp: z.string(),
});
// Undo Task
export const UndoTaskRequestSchema = z.object({
    undo_token: z.string(),
});
export const UndoTaskResponseSchema = z.object({
    success: z.boolean(),
    timestamp: z.string(),
});
// Assign Task
export const AssignTaskRequestSchema = z.object({
    task_id: z.string().uuid(),
    user_id: z.string().uuid().nullable(),
});
export const AssignTaskResponseSchema = z.object({
    success: z.boolean(),
    undo_token: z.string().optional(),
    timestamp: z.string(),
});
// Combine Tasks
export const CombineTasksRequestSchema = z.object({
    task_ids: z.array(z.string().uuid()),
});
export const CombineTasksResponseSchema = z.object({
    success: z.boolean(),
    combined_group_id: z.string().uuid(),
    timestamp: z.string(),
});
