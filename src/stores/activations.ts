import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Activation, 
  ActivationFilters, 
  ActivationStats, 
  ActivationActivity,
  CreateActivationRequest,
  UpdateActivationRequest,
  ActivationStatusUpdate,
  PaginationMeta
} from '../types'
import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from './auth'

export const useActivationsStore = defineStore('activations', () => {
  // State
  const activations = ref<Activation[]>([])
  const currentActivation = ref<Activation | null>(null)
  const activationActivities = ref<ActivationActivity[]>([])
  const stats = ref<ActivationStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Pagination
  const pagination = ref<PaginationMeta>({
    total: 0,
    page: 1,
    perPage: 20,
    pages: 0,
    orderBy: 'createdAt',
    direction: 'DESC'
  })

  // Filters
  const filters = ref<ActivationFilters>({
    search: '',
    type: 'all',
    status: 'all',
    priority: undefined,
    createdBy: [],
    assignedTo: [],
    dateFrom: undefined,
    dateTo: undefined,
    channels: []
  })


  // Computed
  const totalActivations = computed(() => pagination.value.total)
  const activeActivations = computed(() => stats.value?.activeActivations || 0)
  const scheduledActivations = computed(() => stats.value?.scheduledActivations || 0)
  const completedActivations = computed(() => stats.value?.completedActivations || 0)

  const filteredActivations = computed(() => {
    let filtered = [...activations.value]
    
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(activation => 
        activation.title.toLowerCase().includes(search) ||
        activation.description?.toLowerCase().includes(search) ||
        activation.targetAudience?.toLowerCase().includes(search)
      )
    }
    
    if (filters.value.type && filters.value.type !== 'all') {
      filtered = filtered.filter(activation => activation.type === filters.value.type)
    }
    
    if (filters.value.status && filters.value.status !== 'all') {
      filtered = filtered.filter(activation => activation.status === filters.value.status)
    }
    
    if (filters.value.priority) {
      filtered = filtered.filter(activation => activation.priority === filters.value.priority)
    }
    
    if (filters.value.assignedTo && filters.value.assignedTo.length > 0) {
      filtered = filtered.filter(activation => 
        activation.assignedTo && filters.value.assignedTo!.includes(activation.assignedTo)
      )
    }
    
    if (filters.value.channels && filters.value.channels.length > 0) {
      filtered = filtered.filter(activation => 
        filters.value.channels!.some(channel => activation.channels.includes(channel))
      )
    }
    
    return filtered
  })

  // Actions
  const fetchActivations = async (page = 1, perPage = 20) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      let url = `${API_ENDPOINTS.CRM.ACTIVATIONS}?page=${page}&perPage=${perPage}`
      
      // Add filters to URL if they exist
      if (filters.value.search) url += `&search=${encodeURIComponent(filters.value.search)}`
      if (filters.value.type && filters.value.type !== 'all') url += `&type=${filters.value.type}`
      if (filters.value.status && filters.value.status !== 'all') url += `&status=${filters.value.status}`
      if (filters.value.priority) url += `&priority=${filters.value.priority}`
      if (filters.value.assignedTo?.length) {
        filters.value.assignedTo.forEach(assignee => url += `&assignedTo[]=${assignee}`)
      }
      if (filters.value.channels?.length) {
        filters.value.channels.forEach(channel => url += `&channels[]=${channel}`)
      }
      
      const response = await fetch(url, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      if (data.data && Array.isArray(data.data)) {
        activations.value = data.data
        pagination.value = {
          total: data.total || 0,
          page: data.page || page,
          perPage: data.perPage || perPage,
          pages: Math.ceil((data.total || 0) / perPage),
          orderBy: 'createdAt',
          direction: 'DESC'
        }
      } else {
        console.error('Unexpected API response format for activations:', data)
        activations.value = []
        pagination.value = {
          total: 0,
          page: page,
          perPage: perPage,
          pages: 0,
          orderBy: 'createdAt',
          direction: 'DESC'
        }
        throw new Error('Invalid API response format')
      }
    } catch (err: any) {
      console.error('Error fetching activations from API:', err)
      error.value = err.message || 'Error fetching activations'
      activations.value = []
      pagination.value = {
        total: 0,
        page: page,
        perPage: perPage,
        pages: 0,
        orderBy: 'createdAt',
        direction: 'DESC'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchActivationById = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/${id}`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const activation = await response.json()
      
      currentActivation.value = activation
      return activation
    } catch (err: any) {
      console.error('Error fetching activation from API:', err)
      error.value = err.message || 'Error fetching activation'
      currentActivation.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  const createActivation = async (activationData: CreateActivationRequest) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}`, {
        method: 'POST',
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id),
        body: JSON.stringify(activationData)
      })
      
      await handleApiError(response)
      const data = await response.json()
      activations.value.unshift(data)
      pagination.value.total += 1
      return data
    } catch (err: any) {
      error.value = err.message || 'Error creating activation'
      console.error('Error creating activation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateActivation = async (id: string, activationData: UpdateActivationRequest) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/${id}`, {
        method: 'PUT',
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id),
        body: JSON.stringify(activationData)
      })
      
      await handleApiError(response)
      const data = await response.json()
      const index = activations.value.findIndex(activation => activation.id === id)
      if (index !== -1) {
        activations.value[index] = data
      }
      if (currentActivation.value?.id === id) {
        currentActivation.value = data
      }
      return data
    } catch (err: any) {
      error.value = err.message || 'Error updating activation'
      console.error('Error updating activation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateActivationStatus = async (id: string, statusUpdate: ActivationStatusUpdate) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/${id}/status`, {
        method: 'PATCH',
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id),
        body: JSON.stringify(statusUpdate)
      })
      
      await handleApiError(response)
      const data = await response.json()
      const index = activations.value.findIndex(activation => activation.id === id)
      if (index !== -1) {
        activations.value[index] = data
      }
      if (currentActivation.value?.id === id) {
        currentActivation.value = data
      }
      return data
    } catch (err: any) {
      error.value = err.message || 'Error updating activation status'
      console.error('Error updating activation status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteActivation = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      activations.value = activations.value.filter(activation => activation.id !== id)
      pagination.value.total -= 1
      if (currentActivation.value?.id === id) {
        currentActivation.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Error deleting activation'
      console.error('Error deleting activation:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchActivationActivities = async (activationId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/${activationId}/activities`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      activationActivities.value = Array.isArray(data) ? data : []
      return activationActivities.value
    } catch (err: any) {
      error.value = err.message || 'Error fetching activation activities'
      console.error('Error fetching activation activities:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.ACTIVATIONS}/stats`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      stats.value = data
      return data
    } catch (err: any) {
      console.error('Error fetching activation stats from API:', err)
      error.value = err.message || 'Error fetching activation stats'
      stats.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  // Filter actions
  const setFilters = (newFilters: Partial<ActivationFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      type: 'all',
      status: 'all',
      priority: undefined,
      createdBy: [],
      assignedTo: [],
      dateFrom: undefined,
      dateTo: undefined,
      channels: []
    }
  }

  const setPagination = (newPagination: Partial<PaginationMeta>) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  const clearCurrentActivation = () => {
    currentActivation.value = null
    activationActivities.value = []
  }

  const clearError = () => {
    error.value = null
  }


  return {
    // State
    activations,
    currentActivation,
    activationActivities,
    stats,
    loading,
    error,
    pagination,
    filters,
    
    // Computed
    totalActivations,
    activeActivations,
    scheduledActivations,
    completedActivations,
    filteredActivations,
    
    // Actions
    fetchActivations,
    fetchActivationById,
    createActivation,
    updateActivation,
    updateActivationStatus,
    deleteActivation,
    fetchActivationActivities,
    fetchStats,
    setFilters,
    clearFilters,
    setPagination,
    clearCurrentActivation,
    clearError
  }
})