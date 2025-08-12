// API Types
export interface RequestInformation {
  id: string;
  clientName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  company?: string;
  status: RequestStatus;
  priority: 'low' | 'medium' | 'high';
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  tags: string[];
  notes: RequestNote[];
  amount?: number; // New field for sales amount
}

export interface RequestNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'RECONTACT' | 'WON' | 'LOST' | 'CLOSE';

// New dynamic status interface
export interface StatusDefinition {
  id: string;
  name: string;
  label: string;
  color: string;
  order: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequestSummary {
  total: number;
  byStatus: Record<RequestStatus, number>;
  conversionRate: number;
  avgTimeToClose: number;
}

// Alias for compatibility
export type RequestsSummary = RequestSummary;

export interface ApiResponse<T> {
  data: T[];
  page: number;
  limit: number;
  count: number;
}

// UI Types
export interface StatusChangeConfirmation {
  fromStatus: RequestStatus;
  toStatus: RequestStatus;
  requestId: string;
  requestTitle: string;
}

export interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
}

// Component Props for Vue
export interface KanbanColumnProps {
  status: RequestStatus;
  requests: RequestInformation[];
}

export interface RequestCardProps {
  request: RequestInformation;
}

// Vue specific types
export interface DashboardMetric {
  title: string;
  value: string | number;
  previousValue?: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  icon: string;
  color: 'default' | 'blue' | 'green' | 'red' | 'yellow';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}