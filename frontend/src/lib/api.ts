import {
  EventItem,
  TaskItem,
  VendorItem,
  DeadlineItem,
  RequirementItem,
  RiskItem,
  ChatMessageItem,
  ActivityItem,
  EventDashboardSummary,
  User,
} from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('xperience_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('xperience_token');
        localStorage.removeItem('xperience_user');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data.data !== undefined ? data.data : data;
  }

  // Auth
  async register(body: { email: string; name: string; password: string }) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async login(body: { email: string; password: string }) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  // Events
  async getEvents(): Promise<EventItem[]> {
    return this.request<EventItem[]>('/events');
  }

  async getEvent(eventId: string): Promise<EventItem> {
    return this.request<EventItem>(`/events/${eventId}`);
  }

  async getEventSummary(eventId: string): Promise<EventDashboardSummary> {
    return this.request<EventDashboardSummary>(`/events/${eventId}/summary`);
  }

  async createEvent(body: Partial<EventItem>): Promise<EventItem> {
    return this.request<EventItem>('/events', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateEvent(
    eventId: string,
    body: Partial<EventItem>
  ): Promise<EventItem> {
    return this.request<EventItem>(`/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks(
    eventId: string,
    params?: { status?: string; priority?: string; category?: string }
  ): Promise<TaskItem[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<TaskItem[]>(`/events/${eventId}/tasks${query ? `?${query}` : ''}`);
  }

  async createTask(
    eventId: string,
    body: Partial<TaskItem>
  ): Promise<TaskItem> {
    return this.request<TaskItem>(`/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateTask(
    taskId: string,
    body: Partial<TaskItem>
  ): Promise<TaskItem> {
    return this.request<TaskItem>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    return this.request<void>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Vendors
  async getVendors(eventId: string, category?: string): Promise<VendorItem[]> {
    const query = category ? `?category=${category}` : '';
    return this.request<VendorItem[]>(`/events/${eventId}/vendors${query}`);
  }

  async createVendor(
    eventId: string,
    body: Partial<VendorItem>
  ): Promise<VendorItem> {
    return this.request<VendorItem>(`/events/${eventId}/vendors`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateVendor(
    vendorId: string,
    body: Partial<VendorItem>
  ): Promise<VendorItem> {
    return this.request<VendorItem>(`/vendors/${vendorId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async deleteVendor(vendorId: string): Promise<void> {
    return this.request<void>(`/vendors/${vendorId}`, {
      method: 'DELETE',
    });
  }

  // Deadlines
  async getDeadlines(eventId: string): Promise<DeadlineItem[]> {
    return this.request<DeadlineItem[]>(`/events/${eventId}/deadlines`);
  }

  async createDeadline(
    eventId: string,
    body: Partial<DeadlineItem>
  ): Promise<DeadlineItem> {
    return this.request<DeadlineItem>(`/events/${eventId}/deadlines`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateDeadline(
    deadlineId: string,
    body: Partial<DeadlineItem>
  ): Promise<DeadlineItem> {
    return this.request<DeadlineItem>(`/deadlines/${deadlineId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async deleteDeadline(deadlineId: string): Promise<void> {
    return this.request<void>(`/deadlines/${deadlineId}`, {
      method: 'DELETE',
    });
  }

  // Requirements
  async getRequirements(eventId: string): Promise<RequirementItem[]> {
    return this.request<RequirementItem[]>(`/events/${eventId}/requirements`);
  }

  async createRequirement(
    eventId: string,
    body: Partial<RequirementItem>
  ): Promise<RequirementItem> {
    return this.request<RequirementItem>(`/events/${eventId}/requirements`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async updateRequirement(
    reqId: string,
    body: Partial<RequirementItem>
  ): Promise<RequirementItem> {
    return this.request<RequirementItem>(`/requirements/${reqId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async deleteRequirement(reqId: string): Promise<void> {
    return this.request<void>(`/requirements/${reqId}`, {
      method: 'DELETE',
    });
  }

  // Risks
  async getRisks(eventId: string, status?: string): Promise<RiskItem[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<RiskItem[]>(`/events/${eventId}/risks${query}`);
  }

  async updateRiskStatus(
    riskId: string,
    status: string,
    suggestedAction?: string
  ): Promise<RiskItem> {
    return this.request<RiskItem>(`/risks/${riskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, suggestedAction }),
    });
  }

  // Chat
  async getChatHistory(eventId: string): Promise<ChatMessageItem[]> {
    return this.request<ChatMessageItem[]>(`/events/${eventId}/chat`);
  }

  async sendChatMessage(
    eventId: string,
    message: string
  ): Promise<{
    message: string;
    appliedChanges: string[];
    structuredActions: any;
    summary: EventDashboardSummary;
  }> {
    return this.request<any>(`/events/${eventId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async clearChatHistory(eventId: string): Promise<void> {
    return this.request<void>(`/events/${eventId}/chat`, {
      method: 'DELETE',
    });
  }

  // Activity
  async getActivities(eventId: string, limit = 50): Promise<ActivityItem[]> {
    return this.request<ActivityItem[]>(`/events/${eventId}/activity?limit=${limit}`);
  }
}

export const api = new ApiClient();
