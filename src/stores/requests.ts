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

  const summary = computed(() => {
    const statusStore = useStatusStore()
    const byStatus: Record<string, number> = {}
    
    // Initialize counts for all available statuses
    statusStore.statuses.forEach(status => {
      byStatus[status.name] = 0
    })

    // Count requests by their actual status
    requests.value.forEach(request => {
      const statusCode = request.status.code
      if (byStatus[statusCode] !== undefined) {
        byStatus[statusCode]++
      } else {
        // Handle unknown statuses
        if (!byStatus['UNKNOWN']) byStatus['UNKNOWN'] = 0
        byStatus['UNKNOWN']++
      }
    })

    const total = requests.value.length
    
    // Calculate conversion rate based on "won" or "ganados" status
    const wonStatuses = statusStore.statuses.filter(s =>
      s.name.toLowerCase().includes('ganado') ||
      s.name.toLowerCase().includes('won') ||
      s.name.toLowerCase().includes('cerrado')
    )
    const won = wonStatuses.reduce((sum, status) => sum + (byStatus[status.name] || 0), 0)
    const conversionRate = total > 0 ? won / total : 0

    return {
      byStatus,
      total,
      conversionRate,
      avgTimeToClose: 14 // Mock value - could be calculated from actual data
    }
  })

  // New computed properties for dashboard metrics
  const newToday = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return requests.value.filter(request => {
      const createdDate = new Date(request.createdAt)
      createdDate.setHours(0, 0, 0, 0)
      return createdDate.getTime() === today.getTime()
    }).length
  })

  const pendingRequests = computed(() => {
    const statusStore = useStatusStore()
    const pendingStatuses = statusStore.statuses.filter(s =>
      s.name.toLowerCase().includes('nuevo') ||
      s.name.toLowerCase().includes('new') ||
      s.name.toLowerCase().includes('pendiente') ||
      s.name.toLowerCase().includes('pending')
    )
    
    return requests.value.filter(request =>
      pendingStatuses.some(status => status.name === request.status.code)
    ).length
  })

  const inProgressRequests = computed(() => {
    const statusStore = useStatusStore()
    const inProgressStatuses = statusStore.statuses.filter(s =>
      s.name.toLowerCase().includes('contactado') ||
      s.name.toLowerCase().includes('calificado') ||
      s.name.toLowerCase().includes('propuesta') ||
      s.name.toLowerCase().includes('negociacion') ||
      s.name.toLowerCase().includes('progress')
    )
    
    return requests.value.filter(request =>
      inProgressStatuses.some(status => status.name === request.status.code)
    ).length
  })

  const completedRequests = computed(() => {
    const statusStore = useStatusStore()
    const completedStatuses = statusStore.statuses.filter(s =>
      s.name.toLowerCase().includes('ganado') ||
      s.name.toLowerCase().includes('won') ||
      s.name.toLowerCase().includes('cerrado') ||
      s.name.toLowerCase().includes('completed')
    )
    
    return requests.value.filter(request =>
      completedStatuses.some(status => status.name === request.status.code)
    ).length
  })

  // Actions
  const fetchRequests = async (range:any|null) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const statusStore = useStatusStore()
      
      // Build URL with limit parameter only
      let url = API_ENDPOINTS.CRM.REQUESTS
      const params = new URLSearchParams()
      
      // Add limit parameter
      params.append('limit', '999')
      if (range?.from) {
        params.append('from', range.from)
      }
      if (range?.to) {
        params.append('to', range.to)
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
    // Status parameter is no longer needed, just fetch all requests
    return fetchRequests()
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
    summary,
    newToday,
    pendingRequests,
    inProgressRequests,
    completedRequests,
    // Actions
    fetchRequests,
    fetchRequestsByStatus,
    updateRequestStatus,
    addRequest,
    deleteRequest
  }
})