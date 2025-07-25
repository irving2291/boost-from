// API Types
export interface RequestInformation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  notes?: RequestNote[];
}

export interface RequestNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'RECONTACT' | 'WON' | 'LOST' | 'CLOSE';

export interface RequestSummary {
  total: number;
  byStatus: Record<RequestStatus, number>;
  conversionRate: number;
  avgTimeToClose: number;
}

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

// Component Props
export interface KanbanColumnProps {
  status: RequestStatus;
  requests: RequestInformation[];
  onStatusChange: (requestId: string, newStatus: RequestStatus) => void;
}

export interface RequestCardProps {
  request: RequestInformation;
  onStatusChange: (requestId: string, newStatus: RequestStatus) => void;
}