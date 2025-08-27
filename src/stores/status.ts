import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StatusDefinition, ApiStatus } from '../types'
import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from './auth'

export const useStatusStore = defineStore('status', () => {
  // State
  const statuses = ref<StatusDefinition[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const sortedStatuses = computed(() => {
    // Sort by sort field if available, otherwise by order
    return [...statuses.value].sort((a, b) => {
      const sortA = a.sort !== undefined ? a.sort : a.order
      const sortB = b.sort !== undefined ? b.sort : b.order
      return sortA - sortB
    })
  })

  const getStatusById = computed(() => {
    return (id: string) => statuses.value.find(status => status.id === id)
  })

  const getStatusByName = computed(() => {
    return (name: string) => statuses.value.find(status => status.name === name)
  })

  // Actions for column ordering
  const reorderStatuses = async (fromIndex: number, toIndex: number) => {
    const currentOrder = sortedStatuses.value
    const newOrder = [...currentOrder]
    const [movedStatus] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, movedStatus)
    
    // Update sort values for all affected statuses
    const updates = newOrder.map((status, index) => ({
      id: status.id,
      sort: index + 1
    }))
    
    // Update local state immediately for better UX
    updates.forEach(update => {
      const status = statuses.value.find(s => s.id === update.id)
      if (status) {
        status.sort = update.sort
        status.order = update.sort
      }
    })
    
    // Send updates to API
    try {
      await updateStatusOrder(updates)
    } catch (error) {
      console.error('Error updating status order:', error)
      // Revert changes on error
      await fetchStatuses()
    }
  }

  const updateStatusOrder = async (updates: { id: string; sort: number }[]) => {
    const authStore = useAuthStore()
    
    for (const update of updates) {
      try {
        const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS_STATUS}/${update.id}`, {
          method: 'PATCH',
          headers: createAuthHeaders(authStore.token || undefined),
          body: JSON.stringify({ sort: update.sort })
        })
        
        await handleApiError(response)
      } catch (error) {
        console.error(`Error updating status ${update.id}:`, error)
        throw error
      }
    }
  }

  // Actions
  const fetchStatuses = async () => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(API_ENDPOINTS.CRM.REQUESTS_STATUS, {
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      // Transform API response to internal format
      if (data.status && Array.isArray(data.status)) {
        const apiStatuses: ApiStatus[] = data.status
        statuses.value = apiStatuses.map((apiStatus, index) => ({
          id: apiStatus.id,
          name: apiStatus.code,
          label: apiStatus.name,
          color: getColorForStatus(apiStatus.code, index),
          order: apiStatus.sort || index + 1,
          sort: apiStatus.sort,
          isDefault: apiStatus.code === 'new', // Assume 'new' is default
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      } else {
        // Fallback to default statuses if API response is unexpected
        console.warn('Unexpected API response format, using default statuses')
      }
    } catch (err) {
      console.error('Error fetching statuses from API:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching statuses'
    } finally {
      loading.value = false
    }
  }

  // Helper function to assign colors to statuses
  const getColorForStatus = (code: string, index: number): string => {
    const colors = [
      '#EF4444', // Red
      '#F59E0B', // Yellow
      '#10B981', // Green
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
    ]
    
    // Try to match common status patterns
    const lowerCode = code.toLowerCase()
    if (lowerCode.includes('nuevo') || lowerCode.includes('new')) return '#3B82F6'
    if (lowerCode.includes('contactado') || lowerCode.includes('contact')) return '#F59E0B'
    if (lowerCode.includes('calificado') || lowerCode.includes('qualified')) return '#10B981'
    if (lowerCode.includes('propuesta') || lowerCode.includes('proposal')) return '#3B82F6'
    if (lowerCode.includes('negociacion') || lowerCode.includes('negotiation')) return '#8B5CF6'
    if (lowerCode.includes('ganado') || lowerCode.includes('won')) return '#10B981'
    if (lowerCode.includes('perdido') || lowerCode.includes('lost')) return '#EF4444'
    
    // Fallback to cycling through colors
    return colors[index % colors.length]
  }

  const createStatus = async (statusData: Omit<StatusDefinition, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/requests-information/status`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(statusData)
      // })
      // const newStatus = await response.json()
      
      // For now, create locally
      const newStatus: StatusDefinition = {
        ...statusData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      statuses.value.push(newStatus)
      return newStatus
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async (id: string, updates: Partial<StatusDefinition>) => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/requests-information/status/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // })
      // const updatedStatus = await response.json()
      
      // For now, update locally
      const index = statuses.value.findIndex(status => status.id === id)
      if (index > -1) {
        statuses.value[index] = {
          ...statuses.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteStatus = async (id: string) => {
    const status = statuses.value.find(s => s.id === id)
    if (status?.isDefault) {
      throw new Error('Cannot delete default status')
    }
    
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS_STATUS}/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      
      // Remove from local state
      const index = statuses.value.findIndex(status => status.id === id)
      if (index > -1) {
        statuses.value.splice(index, 1)
      }
    } catch (err) {
      console.error('Error deleting status:', err)
      error.value = err instanceof Error ? err.message : 'Error deleting status'
      
      // Fallback: delete locally if API fails
      const index = statuses.value.findIndex(status => status.id === id)
      if (index > -1) {
        statuses.value.splice(index, 1)
      }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    statuses,
    loading,
    error,
    // Getters
    sortedStatuses,
    getStatusById,
    getStatusByName,
    // Actions
    fetchStatuses,
    createStatus,
    updateStatus,
    deleteStatus,
    reorderStatuses,
    updateStatusOrder
  }
})