import axios from 'axios'
import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from '../stores/auth'

export interface Event {
  pk: string
  sk: string
  ts: string
  eventType: string
  source: string
  payload: {
    channel?: string
    note?: string
    [key: string]: any
  }
  actor: {
    id: string
    username: string
  }
  traceId: string
}

export interface EventsResponse {
  data: Event[]
  total: number
  page: number
  perPage: number
}

export class EventsService {
  private getAuthHeaders() {
    const authStore = useAuthStore()
    return createAuthHeaders(authStore.token, authStore.currentOrganization?.id)
  }

  async getEvents(entityId: string, tenantId: string, params: { page?: number; perPage?: number } = {}): Promise<EventsResponse> {
    const queryParams = new URLSearchParams()
    queryParams.append('entityId', entityId)
    queryParams.append('tenantId', tenantId)

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.perPage) queryParams.append('perPage', params.perPage.toString())

    const url = `${API_ENDPOINTS.CRM.EVENTS}?${queryParams.toString()}`

    const response = await axios.get(url, {
      headers: this.getAuthHeaders()
    })
    return response.data
  }
}

// Export singleton instance
export const eventsService = new EventsService()