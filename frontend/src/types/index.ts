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

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface EventItem {
  _id: string;
  userId: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  location: string;
  description?: string;
  activities: string[];
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  _id: string;
  eventId: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  category?: string;
  relatedVendorId?: string;
  relatedActivity?: string;
  source: EntitySource;
  createdAt: string;
  updatedAt: string;
}

export interface VendorItem {
  _id: string;
  eventId: string;
  userId: string;
  name: string;
  category: VendorCategory;
  status: VendorStatus;
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  relatedActivities: string[];
  notes?: string;
  source: EntitySource;
  createdAt: string;
  updatedAt: string;
}

export interface DeadlineItem {
  _id: string;
  eventId: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string;
  relatedTaskId?: string;
  status: DeadlineStatus;
  source: EntitySource;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementItem {
  _id: string;
  eventId: string;
  userId: string;
  title: string;
  category: string;
  quantity?: number;
  status: RequirementStatus;
  notes?: string;
  source: EntitySource;
  createdAt: string;
  updatedAt: string;
}

export interface RiskItem {
  _id: string;
  eventId: string;
  userId: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  status: RiskStatus;
  affectedArea?: string;
  suggestedAction?: string;
  sourceConversation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageItem {
  _id: string;
  eventId: string;
  userId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  appliedChanges?: string[];
  createdAt: string;
}

export interface ActivityItem {
  _id: string;
  eventId: string;
  userId: string;
  description: string;
  type: string;
  entityType?: string;
  createdAt: string;
}

export interface EventDashboardSummary {
  event: EventItem;
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    blocked: number;
  };
  risks: {
    total: number;
    open: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  vendors: {
    total: number;
    confirmed: number;
    pending: number;
    contacted: number;
    unavailable: number;
  };
  requirements: {
    total: number;
    pending: number;
    fulfilled: number;
  };
  deadlines: {
    total: number;
    upcoming: number;
    overdue: number;
  };
}
