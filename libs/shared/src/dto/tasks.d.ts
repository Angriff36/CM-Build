import { z } from 'zod';
export declare const ClaimTaskRequestSchema: z.ZodObject<{
    task_id: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ClaimTaskRequest = z.infer<typeof ClaimTaskRequestSchema>;
export declare const ClaimTaskResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    undo_token: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
}, z.core.$strip>;
export type ClaimTaskResponse = z.infer<typeof ClaimTaskResponseSchema>;
export declare const CompleteTaskRequestSchema: z.ZodObject<{
    task_id: z.ZodString;
}, z.core.$strip>;
export type CompleteTaskRequest = z.infer<typeof CompleteTaskRequestSchema>;
export declare const CompleteTaskResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    timestamp: z.ZodString;
}, z.core.$strip>;
export type CompleteTaskResponse = z.infer<typeof CompleteTaskResponseSchema>;
export declare const UndoTaskRequestSchema: z.ZodObject<{
    undo_token: z.ZodString;
}, z.core.$strip>;
export type UndoTaskRequest = z.infer<typeof UndoTaskRequestSchema>;
export declare const UndoTaskResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    timestamp: z.ZodString;
}, z.core.$strip>;
export type UndoTaskResponse = z.infer<typeof UndoTaskResponseSchema>;
export declare const AssignTaskRequestSchema: z.ZodObject<{
    task_id: z.ZodString;
    user_id: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type AssignTaskRequest = z.infer<typeof AssignTaskRequestSchema>;
export declare const AssignTaskResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    undo_token: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
}, z.core.$strip>;
export type AssignTaskResponse = z.infer<typeof AssignTaskResponseSchema>;
export declare const CombineTasksRequestSchema: z.ZodObject<{
    task_ids: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type CombineTasksRequest = z.infer<typeof CombineTasksRequestSchema>;
export declare const CombineTasksResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    combined_group_id: z.ZodString;
    timestamp: z.ZodString;
}, z.core.$strip>;
export type CombineTasksResponse = z.infer<typeof CombineTasksResponseSchema>;
