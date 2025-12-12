import { z } from 'zod';

export const StaffSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1, 'Display name is required'),
  role: z.enum(['staff', 'manager', 'event_lead', 'owner']),
  status: z.enum(['active', 'inactive']).default('active'),
  presence: z.enum(['online', 'idle', 'offline']).optional(),
  shift_start: z.string().optional(),
  shift_end: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Staff = z.infer<typeof StaffSchema>;

export const CreateStaffRequestSchema = StaffSchema.omit({
  id: true,
  presence: true,
  created_at: true,
  updated_at: true,
});

export type CreateStaffRequest = z.infer<typeof CreateStaffRequestSchema>;

export const UpdateStaffRequestSchema = StaffSchema.partial().omit({
  id: true,
  presence: true,
  created_at: true,
  updated_at: true,
});

export type UpdateStaffRequest = z.infer<typeof UpdateStaffRequestSchema>;
