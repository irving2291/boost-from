import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RequestInformation, RequestStatus, RequestsSummary } from '../types'
import { REQUEST_STATUSES } from '../utils/constants'

export const useRequestsStore = defineStore('requests', () => {
  // State
  const requests = ref<RequestInformation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mock data for development
  const mockRequests: RequestInformation[] = []

  // Getters
  const requestsByStatus = computed(() => {
    const grouped: Record<RequestStatus, RequestInformation[]> = {
      NEW: [],
      IN_PROGRESS: [],
      RECONTACT: [],
      WON: [],
      LOST: [],
      CLOSE: []
    }

    requests.value.forEach(request => {
      grouped[request.status].push(request)
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
      byStatus[request.status]++
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

  // Actions
  const fetchRequests = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      requests.value = mockRequests
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching requests'
    } finally {
      loading.value = false
    }
  }

  const updateRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    const request = requests.value.find(r => r.id === requestId)
    if (request) {
      request.status = newStatus
      request.updatedAt = new Date().toISOString()
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
    // Actions
    fetchRequests,
    updateRequestStatus,
    addRequest,
    deleteRequest
  }
})