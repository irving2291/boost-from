import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RequestInformation, RequestStatus, RequestsSummary } from '../types'
import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from './auth'
import { useStatusStore } from './status'

export const useRequestsStore = defineStore('requests', () => {
  // State
  const requests = ref<RequestInformation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mock data for development
  const mockRequests: RequestInformation[] = []

  // Getters
  const requestsByStatus = computed(() => {
    const statusStore = useStatusStore()
    const grouped: Record<string, RequestInformation[]> = {}
    
    // Initialize groups for all available statuses
    statusStore.statuses.forEach((status: any) => {
      grouped[status.name] = []
    })

    requests.value.forEach(request => {
      // Map request status to dynamic status name using the status code
      const statusCode = request.status.code
      if (grouped[statusCode]) {
        grouped[statusCode].push(request)
      } else {
        // Fallback for unmapped statuses
        if (!grouped['UNKNOWN']) grouped['UNKNOWN'] = []
        grouped['UNKNOWN'].push(request)
      }
    })

    return grouped
  })

  // Legacy getter for backward compatibility
  const requestsByLegacyStatus = computed(() => {
    const grouped: Record<RequestStatus, RequestInformation[]> = {
      NEW: [],
      IN_PROGRESS: [],
      RECONTACT: [],
      WON: [],
      LOST: [],
      CLOSE: []
    }

    requests.value.forEach(request => {
      // Use legacy mapping for backward compatibility
      const legacyStatus = mapStatusCodeToLegacy(request.status.code)
      grouped[legacyStatus].push(request)
    })

    return grouped
  })

  const summary = computed((): RequestsSummary => {
    const byStatus: Record<RequestStatus, number> = {
      NEW: 0,
      IN_PROGRESS: 0,
      RECONTACT: 0,
      WON: 0,
      LOST: 0,
      CLOSE: 0
    }

    requests.value.forEach(request => {
      // Use legacy mapping for summary
      const legacyStatus = mapStatusCodeToLegacy(request.status.code)
      byStatus[legacyStatus]++
    })

    const total = requests.value.length
    const won = byStatus.WON
    const conversionRate = total > 0 ? won / total : 0

    return {
      byStatus,
      total,
      conversionRate,
      avgTimeToClose: 14 // Mock value
    }
  })

  // Helper function to map status codes to legacy status
  const mapStatusCodeToLegacy = (code: string): RequestStatus => {
    const mapping: Record<string, RequestStatus> = {
      'new': 'NEW',
      'in_progress': 'IN_PROGRESS',
      'recontact': 'RECONTACT',
      'won': 'WON',
      'lost': 'LOST',
      'close': 'CLOSE'
    }
    return mapping[code] || 'NEW'
  }

  // Actions
  const fetchRequests = async (statusCode?: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const statusStore = useStatusStore()
      
      // Build URL with status query parameters and limit
      let url = API_ENDPOINTS.CRM.REQUESTS
      const params = new URLSearchParams()
      
      // Add limit parameter
      params.append('limit', '999')
      
      // Add status parameters
      const statusCodes = statusCode ? [statusCode] : statusStore.statuses.map((s: any) => s.name)
      if (statusCodes.length > 0) {
        statusCodes.forEach((code: string) => params.append('status', code))
      }
      
      url += `?${params.toString()}`
      
      const response = await fetch(url, {
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      // Handle API response - adjust based on actual API structure
      if (Array.isArray(data)) {
        requests.value = data
      } else if (data.data && Array.isArray(data.data)) {
        requests.value = data.data
      } else {
        console.warn('Unexpected API response format for requests')
        requests.value = []
      }
    } catch (err) {
      console.error('Error fetching requests from API:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching requests'
      // Fallback to mock data on error for development
      requests.value = mockRequests
    } finally {
      loading.value = false
    }
  }

  const fetchRequestsByStatus = async (statusCode: string) => {
    return fetchRequests(statusCode)
  }

  const updateRequestStatus = async (requestId: string, newStatusCode: string) => {
    try {
      const authStore = useAuthStore()
      
      // Call API to update request status using the correct endpoint
      const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS}/${requestId}/status`, {
        method: 'PATCH',
        headers: createAuthHeaders(authStore.token || undefined),
        body: JSON.stringify({
          status_code: newStatusCode
        })
      })
      
      await handleApiError(response)
      
      // Update local state
      const request = requests.value.find(r => r.id === requestId)
      if (request) {
        request.status = {
          ...request.status,
          code: newStatusCode
        }
        request.updatedAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('Error updating request status:', error)
      
      // Fallback: update locally if API fails
      const request = requests.value.find(r => r.id === requestId)
      if (request) {
        request.status = {
          ...request.status,
          code: newStatusCode
        }
        request.updatedAt = new Date().toISOString()
      }
    }
  }

  const addRequest = async (newRequest: Omit<RequestInformation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const request: RequestInformation = {
      ...newRequest,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    requests.value.push(request)
  }

  const deleteRequest = async (requestId: string) => {
    const index = requests.value.findIndex(r => r.id === requestId)
    if (index > -1) {
      requests.value.splice(index, 1)
    }
  }

  // Initialize with mock data
  if (requests.value.length === 0) {
    requests.value = mockRequests
  }

  return {
    // State
    requests,
    loading,
    error,
    // Getters
    requestsByStatus,
    requestsByLegacyStatus,
    summary,
    // Actions
    fetchRequests,
    fetchRequestsByStatus,
    updateRequestStatus,
    addRequest,
    deleteRequest
  }
})