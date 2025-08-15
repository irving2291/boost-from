// API Types - Updated to match actual API response
export interface RequestInformation {
  id: string;
  fistName: string; // Note: API has typo "fistName" instead of "firstName"
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string | null;
  status: {
    id: string;
    code: string;
    name: string;
    organization: string;
    default: boolean;
  };
  // Optional fields for backward compatibility
  clientName?: string;
  firstName?: string;
  company?: string;
  priority?: 'low' | 'medium' | 'high';
  subject?: string;
  description?: string;
  assignedTo?: string;
  tags?: string[];
  notes?: RequestNote[];
  amount?: number;
}

export interface RequestNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'RECONTACT' | 'WON' | 'LOST' | 'CLOSE';

// API Status interface (matches actual API response)
export interface ApiStatus {
  id: string;
  code: string;
  name: string;
}

// Internal status interface for UI
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

// Quotation types based on API
export interface QuotationDetail {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Quotation {
  id?: string;
  requestInformationId: string;
  details: QuotationDetail[];
  status: 'creating' | 'sent' | 'accepted' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuotationRequest {
  requestInformationId: string;
  details: QuotationDetail[];
  status: 'creating';
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

// Chat and Communication Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'prospect' | 'agent' | 'bot';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'audio';
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email' | 'sms';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
    audioUrl?: string;
  };
}

export interface Conversation {
  id: string;
  prospectId: string;
  clientId?: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email' | 'sms';
  status: 'active' | 'closed' | 'archived';
  lastMessage?: ChatMessage;
  lastActivity: string;
  unreadCount: number;
  assignedTo?: string;
  tags: string[];
  isClientConverted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Prospect {
  id: string;
  identifier: string; // phone number, email, or social media handle
  identifierType: 'phone' | 'email' | 'social';
  name?: string;
  avatar?: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email' | 'sms';
  isClient: boolean;
  clientId?: string;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  tags: string[];
  notes: ClientNote[];
  quotes: ClientQuote[];
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientQuote {
  id: string;
  clientId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSettings {
  botEnabled: boolean;
  autoResponse: boolean;
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  notifications: {
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
}

export interface SocketConfig {
  url: string;
  options?: {
    transports?: string[];
    timeout?: number;
    forceNew?: boolean;
  };
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  logo_path?: string;
  active: boolean;
  users_count?: number;
  created_at: string;
  updated_at?: string;
  // Meta/Facebook integration fields
  meta_config?: MetaConfig;
}

export interface MetaConfig {
  app_id?: string;
  app_secret?: string;
  access_token?: string;
  verify_token?: string;
  webhook_url?: string;
  phone_number_id?: string;
  business_account_id?: string;
  whatsapp_enabled?: boolean;
  facebook_enabled?: boolean;
  instagram_enabled?: boolean;
}