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

  // Default statuses based on the image design
  const defaultStatuses: StatusDefinition[] = [
    {
      id: 'nuevos',
      name: 'NUEVOS',
      label: 'Nuevos',
      color: '#EF4444', // Red border for high priority
      order: 1,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'contactados',
      name: 'CONTACTADOS',
      label: 'Contactados',
      color: '#F59E0B', // Yellow border for medium priority
      order: 2,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'calificados',
      name: 'CALIFICADOS',
      label: 'Calificados',
      color: '#10B981', // Green border for low priority
      order: 3,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'propuesta',
      name: 'PROPUESTA',
      label: 'Propuesta',
      color: '#3B82F6', // Blue border
      order: 4,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'negociacion',
      name: 'NEGOCIACION',
      label: 'Negociación',
      color: '#8B5CF6', // Purple border
      order: 5,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ganados',
      name: 'GANADOS',
      label: 'Ganados',
      color: '#10B981', // Green border
      order: 6,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  // Getters
  const sortedStatuses = computed(() => {
    // Get saved order from localStorage
    const savedOrder = localStorage.getItem('status-column-order')
    if (savedOrder) {
      try {
        const orderArray = JSON.parse(savedOrder) as string[]
        const orderedStatuses = []
        
        // First, add statuses in saved order
        for (const statusId of orderArray) {
          const status = statuses.value.find(s => s.id === statusId)
          if (status) {
            orderedStatuses.push(status)
          }
        }
        
        // Then add any new statuses that weren't in saved order
        for (const status of statuses.value) {
          if (!orderArray.includes(status.id)) {
            orderedStatuses.push(status)
          }
        }
        
        return orderedStatuses
      } catch (error) {
        console.error('Error parsing saved status order:', error)
      }
    }
    
    // Fallback to default order
    return [...statuses.value].sort((a, b) => a.order - b.order)
  })

  const getStatusById = computed(() => {
    return (id: string) => statuses.value.find(status => status.id === id)
  })

  const getStatusByName = computed(() => {
    return (name: string) => statuses.value.find(status => status.name === name)
  })

  // Actions for column ordering
  const saveColumnOrder = (statusIds: string[]) => {
    localStorage.setItem('status-column-order', JSON.stringify(statusIds))
  }

  const reorderStatuses = (fromIndex: number, toIndex: number) => {
    const currentOrder = sortedStatuses.value
    const newOrder = [...currentOrder]
    const [movedStatus] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, movedStatus)
    
    // Save new order to localStorage
    const statusIds = newOrder.map(s => s.id)
    saveColumnOrder(statusIds)
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
          order: index + 1,
          isDefault: apiStatus.code === 'new', // Assume 'new' is default
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      } else {
        // Fallback to default statuses if API response is unexpected
        console.warn('Unexpected API response format, using default statuses')
        statuses.value = defaultStatuses
      }
    } catch (err) {
      console.error('Error fetching statuses from API:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching statuses'
      // Fallback to default statuses on error
      statuses.value = defaultStatuses
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
    if (lowerCode.includes('nuevo') || lowerCode.includes('new')) return '#EF4444'
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

  // Initialize with default statuses
  if (statuses.value.length === 0) {
    statuses.value = defaultStatuses
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
    saveColumnOrder,
    reorderStatuses
  }
})