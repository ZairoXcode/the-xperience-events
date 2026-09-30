import { z } from 'zod';

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']);
export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(300),
  description: z.string().optional(),
  status: taskStatusSchema.optional().default('TODO'),
  priority: taskPrioritySchema.optional().default('MEDIUM'),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  category: z.string().optional(),
  relatedVendorId: z.string().optional(),
  relatedActivity: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const vendorCategorySchema = z.enum([
  'Venue',
  'Catering',
  'Decoration',
  'Photography',
  'Entertainment',
  'Accommodation',
  'Transportation',
  'Invitations',
  'Other',
]);

export const vendorStatusSchema = z.enum([
  'PENDING',
  'CONTACTED',
  'CONFIRMED',
  'UNAVAILABLE',
  'CANCELLED',
]);

export const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(200),
  category: vendorCategorySchema,
  status: vendorStatusSchema.optional().default('PENDING'),
  contactInfo: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  relatedActivities: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

export const deadlineStatusSchema = z.enum(['UPCOMING', 'OVERDUE', 'COMPLETED']);

export const createDeadlineSchema = z.object({
  title: z.string().min(1, 'Deadline title is required').max(300),
  description: z.string().optional(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  relatedTaskId: z.string().optional(),
  status: deadlineStatusSchema.optional().default('UPCOMING'),
});

export const updateDeadlineSchema = createDeadlineSchema.partial();

export const requirementStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'FULFILLED']);

export const createRequirementSchema = z.object({
  title: z.string().min(1, 'Requirement title is required').max(300),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().int().nonnegative().optional(),
  status: requirementStatusSchema.optional().default('PENDING'),
  notes: z.string().optional(),
});

export const updateRequirementSchema = createRequirementSchema.partial();

export const riskSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const riskStatusSchema = z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED']);

export const updateRiskSchema = z.object({
  status: riskStatusSchema.optional(),
  suggestedAction: z.string().optional(),
  severity: riskSeveritySchema.optional(),
});
