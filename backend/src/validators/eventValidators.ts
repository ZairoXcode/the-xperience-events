import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters').max(200),
  type: z.string().min(2, 'Event type must be at least 2 characters').max(100),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  guestCount: z.number().int().nonnegative('Guest count cannot be negative'),
  location: z.string().min(2, 'Location is required'),
  description: z.string().optional(),
  activities: z.array(z.string()).optional().default([]),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED']).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
