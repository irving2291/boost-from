import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { RequestInformation, RequestSummary, ApiResponse, RequestStatus } from '../types';
import { API_BASE_URL } from '../utils/constants';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens (if needed in the future)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// API Service Class
export class ApiService {
  // Get paginated requests with optional status filter
  static async getRequests(params: {
    status?: RequestStatus;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<ApiResponse<RequestInformation>> {
    const { data } = await apiClient.get('/requests-information', { params });
    return data;
  }

  // Get requests summary by status
  static async getRequestsSummary(dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<RequestSummary> {
    const { data } = await apiClient.get('/requests-information/summary', {
      params: dateRange,
    });
    return data;
  }

  // Create new request
  static async createRequest(request: Omit<RequestInformation, 'id' | 'createdAt' | 'updatedAt'>): Promise<RequestInformation> {
    const { data } = await apiClient.post('/requests-information', request);
    return data;
  }

  // Update request status
  static async updateRequestStatus(
    requestId: string,
    status: RequestStatus
  ): Promise<RequestInformation> {
    const { data } = await apiClient.patch(`/requests-information/${requestId}/status`, {
      status,
    });
    return data;
  }

  // Get request by ID
  static async getRequestById(requestId: string): Promise<RequestInformation> {
    const { data } = await apiClient.get(`/requests-information/${requestId}`);
    return data;
  }

  // Get request notes
  static async getRequestNotes(requestId: string) {
    const { data } = await apiClient.get(`/requests-information/${requestId}/notes`);
    return data;
  }

  // Add note to request
  static async addRequestNote(requestId: string, content: string) {
    const { data } = await apiClient.post(`/requests-information/${requestId}/notes`, {
      content,
    });
    return data;
  }

  // Update note
  static async updateRequestNote(noteId: string, content: string) {
    const { data } = await apiClient.patch(`/requests-information/notes/${noteId}`, {
      content,
    });
    return data;
  }

  // Delete note
  static async deleteRequestNote(noteId: string) {
    await apiClient.delete(`/requests-information/notes/${noteId}`);
  }

  // Quotation endpoints (for future use)
  static async createQuotation(requestId: string, quotationData: any) {
    const { data } = await apiClient.post('/quotations', {
      requestInformationId: requestId,
      ...quotationData,
    });
    return data;
  }

  static async getQuotationByRequestId(requestId: string) {
    const { data } = await apiClient.get(`/quotations/request-information/${requestId}`);
    return data;
  }

  static async updateQuotationStatus(quotationId: string, status: string) {
    const { data } = await apiClient.patch(`/quotations/${quotationId}/status`, {
      status,
    });
    return data;
  }
}

// Network status checker
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

// Export the configured axios instance for direct use if needed
export { apiClient };
export default ApiService;