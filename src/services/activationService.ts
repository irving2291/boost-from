import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from '../stores/auth'

export interface Activation {
  id: string
  title: string
  description: string
  type: 'promotion' | 'announcement' | 'reminder' | 'survey'
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  channels: string[]
  targetAudience?: string
  scheduledFor?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
}

export interface CreateActivationData {
  title: string
  description: string
  type: 'promotion' | 'announcement' | 'reminder' | 'survey'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  channels: string[]
  targetAudience?: string
  scheduledFor?: string
}

export interface UpdateActivationData extends Partial<CreateActivationData> {}

export interface ListActivationsParams {
  page?: number
  perPage?: number
  status?: string
  type?: string
  search?: string
}

export interface ListActivationsResponse {
  data: Activation[]
  total: number
  page: number
  perPage: number
}

export class ActivationService {
  private getAuthHeaders() {
    const authStore = useAuthStore()
    return createAuthHeaders(authStore.token, authStore.currentOrganization?.id)
  }

  async listActivations(params: ListActivationsParams = {}): Promise<ListActivationsResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.perPage) queryParams.append('perPage', params.perPage.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.type) queryParams.append('type', params.type)
    if (params.search) queryParams.append('search', params.search)

    const url = `${API_ENDPOINTS.CRM.ACTIVATIONS}?${queryParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    await handleApiError(response)
    return response.json()
  }

  async getActivation(id: string): Promise<Activation> {
    const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    await handleApiError(response)
    return response.json()
  }

  async createActivation(data: CreateActivationData): Promise<Activation> {
    const response = await fetch(API_ENDPOINTS.CRM.ACTIVATIONS, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    await handleApiError(response)
    return response.json()
  }

  async updateActivation(id: string, data: UpdateActivationData): Promise<Activation> {
    const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    await handleApiError(response)
    return response.json()
  }

  async changeActivationStatus(id: string, status: string, scheduledFor?: string): Promise<{ success: boolean; message: string; newStatus: string }> {
    const data: { status: string; scheduledFor?: string } = { status }
    if (scheduledFor) {
      data.scheduledFor = scheduledFor
    }

    const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    await handleApiError(response)
    return response.json()
  }

  async deleteActivation(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    await handleApiError(response)
    return response.json()
  }
}

// Export singleton instance
export const activationService = new ActivationService()