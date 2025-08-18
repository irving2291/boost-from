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
  sort?: number;
}

// Internal status interface for UI
export interface StatusDefinition {
  id: string;
  name: string;
  label: string;
  color: string;
  order: number;
  sort?: number;
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
  organizationId?: string;
  details: QuotationDetail[];
  status: 'creating' | 'sent' | 'accepted' | 'rejected';
  createdAt?: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

export interface CreateQuotationRequest {
  requestInformationId: string;
  details: QuotationDetail[];
  status: 'creating';
}

// Paginated response types
export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  pages: number;
  orderBy: string;
  direction: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
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

// Assignee Management Types
export interface Assignee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  active: boolean;
  role: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssigneeStats {
  assigneeId: string;
  assignee: Assignee;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  conversionRate: number;
  avgResponseTime: number; // in hours
  avgCloseTime: number; // in days
}

export interface AssignmentRule {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  priority: number;
  conditions: AssignmentCondition[];
  assignmentType: 'round_robin' | 'load_balanced' | 'skill_based' | 'manual';
  assigneeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentCondition {
  field: 'source' | 'priority' | 'amount' | 'location' | 'time' | 'tags';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  value: string | number | string[];
}

export interface RequestReassignment {
  requestId: string;
  fromAssigneeId?: string;
  toAssigneeId: string;
  reason?: string;
  reassignedBy: string;
  reassignedAt: string;
}

export interface AssigneeFilters {
  dateFrom?: string;
  dateTo?: string;
  assigneeIds?: string[];
  status?: string[];
  department?: string;
}

export interface AssigneeMetrics {
  totalAssignees: number;
  activeAssignees: number;
  avgConversionRate: number;
  totalRequestsAssigned: number;
  unassignedRequests: number;
}

// Socket.IO Types for real-time updates
export interface SocketEvent {
  type: 'request_assigned' | 'request_status_changed' | 'assignee_stats_updated' | 'new_request';
  data: any;
  timestamp: string;
}

export interface RealTimeStats {
  assigneeId: string;
  newRequests: number;
  completedToday: number;
  responseTime: number;
  lastActivity: string;
}

// Account Management Types - Extended for the new accounts section
export interface Account {
  id: string;
  type: 'person' | 'company';
  status: 'client' | 'prospect';
  
  // Basic Information
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  phone: string;
  avatar?: string;
  
  // Additional Information
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  industry?: string;
  
  // CRM Data
  source?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  
  // Relationship Management
  assignedTo?: string; // Current responsible person
  assignedToName?: string;
  
  // Business Metrics
  totalValue: number;
  potentialValue?: number;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  
  // Related Data Counts
  requestsCount: number;
  quotationsCount: number;
  conversationsCount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  convertedAt?: string; // When prospect became client
}

export interface AccountRequest {
  id: string;
  accountId: string;
  subject: string;
  description?: string;
  status: RequestStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  assignedToName?: string;
  amount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountQuotation {
  id: string;
  accountId: string;
  requestId?: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  assignedTo?: string;
  assignedToName?: string;
  validUntil?: string;
  sentAt?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountConversation {
  id: string;
  accountId: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'email' | 'sms' | 'phone';
  subject?: string;
  lastMessage?: string;
  lastActivity: string;
  status: 'active' | 'closed' | 'archived';
  assignedTo?: string;
  assignedToName?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountNote {
  id: string;
  accountId: string;
  content: string;
  type: 'general' | 'call' | 'meeting' | 'email' | 'follow_up';
  author: string;
  authorName: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountActivity {
  id: string;
  accountId: string;
  type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'note_added' | 'request_created' | 'quotation_sent' | 'conversation_started';
  description: string;
  metadata?: Record<string, any>;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export interface AccountFilters {
  search?: string;
  type?: 'person' | 'company' | 'all';
  status?: 'client' | 'prospect' | 'all';
  assignedTo?: string[];
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  hasRequests?: boolean;
  hasQuotations?: boolean;
  hasConversations?: boolean;
}

export interface AccountStats {
  totalAccounts: number;
  totalClients: number;
  totalProspects: number;
  conversionRate: number;
  totalValue: number;
  potentialValue: number;
  byType: {
    person: number;
    company: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  byAssignee: Record<string, number>;
  recentActivity: AccountActivity[];
}

export interface CreateAccountRequest {
  type: 'person' | 'company';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  industry?: string;
  source?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  potentialValue?: number;
  notes?: string;
}

export interface UpdateAccountRequest {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  industry?: string;
  source?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  potentialValue?: number;
  status?: 'client' | 'prospect';
}