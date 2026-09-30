import { Types } from 'mongoose';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type VendorCategory =
  | 'Venue'
  | 'Catering'
  | 'Decoration'
  | 'Photography'
  | 'Entertainment'
  | 'Accommodation'
  | 'Transportation'
  | 'Invitations'
  | 'Other';

export type VendorStatus =
  | 'PENDING'
  | 'CONTACTED'
  | 'CONFIRMED'
  | 'UNAVAILABLE'
  | 'CANCELLED';

export type DeadlineStatus = 'UPCOMING' | 'OVERDUE' | 'COMPLETED';

export type RequirementStatus = 'PENDING' | 'IN_PROGRESS' | 'FULFILLED';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export type EntitySource = 'MANUAL' | 'AI';

export type ChatRole = 'USER' | 'ASSISTANT';

export type ActivityType =
  | 'UPDATE'
  | 'CREATE'
  | 'DELETE'
  | 'RISK'
  | 'DEADLINE'
  | 'VENDOR'
  | 'TASK'
  | 'REQUIREMENT';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IEvent {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  type: string; // e.g. "Wedding", "Corporate Outing"
  startDate: Date;
  endDate: Date;
  guestCount: number;
  location: string;
  description?: string;
  activities: string[]; // e.g. ["Sangeet", "Haldi", "Wedding Ceremony", "Reception"]
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  category?: string;
  relatedVendorId?: Types.ObjectId;
  relatedActivity?: string;
  source: EntitySource;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVendorContact {
  name?: string;
  phone?: string;
  email?: string;
}

export interface IVendor {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  category: VendorCategory;
  status: VendorStatus;
  contactInfo?: IVendorContact;
  relatedActivities: string[];
  notes?: string;
  source: EntitySource;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeadline {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  dueDate: Date;
  relatedTaskId?: Types.ObjectId;
  status: DeadlineStatus;
  source: EntitySource;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequirement {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  category: string;
  quantity?: number;
  status: RequirementStatus;
  notes?: string;
  source: EntitySource;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRisk {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  severity: RiskSeverity;
  status: RiskStatus;
  affectedArea?: string; // e.g. "Reception", "Transportation"
  suggestedAction?: string;
  sourceConversation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivity {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  description: string;
  type: ActivityType;
  entityType?: 'event' | 'task' | 'vendor' | 'deadline' | 'requirement' | 'risk';
  entityId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IAIStructuredAction {
  entity: 'event' | 'task' | 'vendor' | 'deadline' | 'requirement' | 'risk';
  action: 'create' | 'update' | 'delete';
  id?: string;
  data: Record<string, unknown>;
}

export interface IAIDetectedRisk {
  title: string;
  description: string;
  severity: RiskSeverity;
  affectedArea?: string;
  suggestedAction?: string;
}

export interface IAIStructuredResponse {
  message: string;
  updates: IAIStructuredAction[];
  risks: IAIDetectedRisk[];
  suggestions: string[];
}

export interface IChatMessage {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  role: ChatRole;
  content: string;
  structuredActions?: IAIStructuredResponse;
  appliedChanges?: string[];
  createdAt: Date;
}
