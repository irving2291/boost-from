import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { StatusDefinition } from '../types'

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
    return [...statuses.value].sort((a, b) => a.order - b.order)
  })

  const getStatusById = computed(() => {
    return (id: string) => statuses.value.find(status => status.id === id)
  })

  const getStatusByName = computed(() => {
    return (name: string) => statuses.value.find(status => status.name === name)
  })

  // Actions
  const fetchStatuses = async () => {
    loading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual API call to api/v1/requests-information/status
      // const response = await fetch(`${API_BASE_URL}/requests-information/status`)
      // const data = await response.json()
      // statuses.value = data
      
      // For now, use default statuses
      await new Promise(resolve => setTimeout(resolve, 500))
      statuses.value = defaultStatuses
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching statuses'
    } finally {
      loading.value = false
    }
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
      // TODO: Replace with actual API call
      // await fetch(`${API_BASE_URL}/requests-information/status/${id}`, {
      //   method: 'DELETE'
      // })
      
      // For now, delete locally
      const index = statuses.value.findIndex(status => status.id === id)
      if (index > -1) {
        statuses.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error deleting status'
      throw err
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
    deleteStatus
  }
})