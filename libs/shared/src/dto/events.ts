import { z } from 'zod';

export const EventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  date: z.string().min(1, 'Date is required'),
  location: z.string().optional(),
  status: z.enum(['draft', 'published', 'completed', 'archived']).optional().default('draft'),
  scheduled_at: z.string().optional(),
  company_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Event = z.infer<typeof EventSchema>;

export const CreateEventRequestSchema = EventSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  location: true, // Remove location as it's not in DB schema
});

export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;

export const UpdateEventRequestSchema = EventSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type UpdateEventRequest = z.infer<typeof UpdateEventRequestSchema>;
