import { z } from 'zod';
import {
  taskStatusSchema,
  taskPrioritySchema,
  vendorCategorySchema,
  vendorStatusSchema,
  deadlineStatusSchema,
  requirementStatusSchema,
  riskSeveritySchema,
} from './entityValidators';

export const aiEntityActionSchema = z.object({
  entity: z.enum(['event', 'task', 'vendor', 'deadline', 'requirement', 'risk']),
  action: z.enum(['create', 'update', 'delete']),
  id: z.string().optional(),
  data: z.record(z.unknown()),
});

import { normalizeRiskSeverity } from '../utils/normalizers';

export const aiRiskItemSchema = z.object({
  title: z.string().min(1, 'Risk title is required'),
  description: z.string().min(1, 'Risk description is required'),
  severity: z.preprocess((v) => normalizeRiskSeverity(v), riskSeveritySchema).default('MEDIUM'),
  affectedArea: z.string().optional(),
  suggestedAction: z.string().optional(),
});

export const aiResponseSchema = z.object({
  message: z.string().min(1, 'Response message is required'),
  updates: z.array(aiEntityActionSchema).default([]),
  risks: z.array(aiRiskItemSchema).default([]),
  suggestions: z.array(z.string()).default([]),
});

// Specific entity payload schemas when validated inside AI service
export const aiEventUpdateDataSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  guestCount: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  activities: z.array(z.string()).optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED']).optional(),
});

export const aiTaskDataSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: taskStatusSchema.optional().default('TODO'),
  priority: taskPrioritySchema.optional().default('MEDIUM'),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  relatedActivity: z.string().optional(),
});

export const aiVendorDataSchema = z.object({
  name: z.string().min(1),
  category: vendorCategorySchema,
  status: vendorStatusSchema.optional().default('PENDING'),
  contactInfo: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
  relatedActivities: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const aiDeadlineDataSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().min(1),
  status: deadlineStatusSchema.optional().default('UPCOMING'),
});

export const aiRequirementDataSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().optional(),
  status: requirementStatusSchema.optional().default('PENDING'),
  notes: z.string().optional(),
});

export type AIResponse = z.infer<typeof aiResponseSchema>;
export type AIEntityAction = z.infer<typeof aiEntityActionSchema>;
export type AIRiskItem = z.infer<typeof aiRiskItemSchema>;
