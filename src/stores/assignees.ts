import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Assignee, 
  AssigneeStats, 
  AssignmentRule, 
  RequestReassignment, 
  AssigneeFilters, 
  AssigneeMetrics,
  RealTimeStats 
} from '../types'
import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from './auth'

export const useAssigneesStore = defineStore('assignees', () => {
  // State
  const assignees = ref<Assignee[]>([])
  const assigneeStats = ref<AssigneeStats[]>([])
  const assignmentRules = ref<AssignmentRule[]>([])
  const realTimeStats = ref<Record<string, RealTimeStats>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<AssigneeFilters>({})

  // Mock data for development
  const mockAssignees: Assignee[] = [
    {
      id: '1',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@company.com',
      phone: '+593987654321',
      avatar: '',
      active: true,
      role: 'Sales Representative',
      department: 'Ventas',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      firstName: 'María',
      lastName: 'González',
      email: 'maria.gonzalez@company.com',
      phone: '+593987654322',
      avatar: '',
      active: true,
      role: 'Senior Sales Representative',
      department: 'Ventas',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '3',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      email: 'carlos.rodriguez@company.com',
      phone: '+593987654323',
      avatar: '',
      active: true,
      role: 'Sales Manager',
      department: 'Ventas',
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-01-05T10:00:00Z'
    }
  ]

  const mockAssignmentRules: AssignmentRule[] = [
    {
      id: '1',
      name: 'Distribución Equitativa',
      description: 'Asigna peticiones de forma equitativa entre todos los representantes activos',
      active: true,
      priority: 1,
      conditions: [],
      assignmentType: 'round_robin',
      assigneeIds: ['1', '2', '3'],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'Peticiones VIP',
      description: 'Asigna peticiones de alto valor al manager',
      active: true,
      priority: 2,
      conditions: [
        {
          field: 'amount',
          operator: 'greater_than',
          value: 10000
        }
      ],
      assignmentType: 'manual',
      assigneeIds: ['3'],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    }
  ]

  // Getters
  const activeAssignees = computed(() => 
    assignees.value.filter(assignee => assignee.active)
  )

  const assigneeMetrics = computed((): AssigneeMetrics => {
    const totalRequests = assigneeStats.value.reduce((sum, stat) => sum + stat.totalRequests, 0)
    const avgConversion = assigneeStats.value.length > 0 
      ? assigneeStats.value.reduce((sum, stat) => sum + stat.conversionRate, 0) / assigneeStats.value.length
      : 0

    return {
      totalAssignees: assignees.value.length,
      activeAssignees: activeAssignees.value.length,
      avgConversionRate: avgConversion,
      totalRequestsAssigned: totalRequests,
      unassignedRequests: 0 // This would come from requests store
    }
  })

  const getAssigneeById = computed(() => (id: string) => 
    assignees.value.find(assignee => assignee.id === id)
  )

  const getAssigneeStats = computed(() => (assigneeId: string) => 
    assigneeStats.value.find(stat => stat.assigneeId === assigneeId)
  )

  const activeAssignmentRules = computed(() => 
    assignmentRules.value.filter(rule => rule.active).sort((a, b) => a.priority - b.priority)
  )

  // Actions
  const fetchAssignees = async () => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS}/assignees`, {
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        assignees.value = data
      } else if (data.data && Array.isArray(data.data)) {
        assignees.value = data.data
      } else {
        console.warn('Unexpected API response format for assignees')
        assignees.value = mockAssignees
      }
    } catch (err) {
      console.error('Error fetching assignees from API:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching assignees'
      // Fallback to mock data
      assignees.value = mockAssignees
    } finally {
      loading.value = false
    }
  }

  const fetchAssigneeStats = async (filters?: AssigneeFilters) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      let url = `${API_ENDPOINTS.CRM.REQUESTS}/assignees/stats`
      
      if (filters) {
        const params = new URLSearchParams()
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
        if (filters.dateTo) params.append('dateTo', filters.dateTo)
        if (filters.assigneeIds?.length) {
          filters.assigneeIds.forEach(id => params.append('assigneeIds[]', id))
        }
        if (filters.status?.length) {
          filters.status.forEach(status => params.append('status[]', status))
        }
        if (filters.department) params.append('department', filters.department)
        
        if (params.toString()) {
          url += `?${params.toString()}`
        }
      }
      
      const response = await fetch(url, {
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        assigneeStats.value = data
      } else if (data.data && Array.isArray(data.data)) {
        assigneeStats.value = data.data
      } else {
        console.warn('Unexpected API response format for assignee stats')
        // Generate mock stats based on current assignees
        assigneeStats.value = generateMockStats()
      }
    } catch (err) {
      console.error('Error fetching assignee stats from API:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching assignee stats'
      // Fallback to mock data
      assigneeStats.value = generateMockStats()
    } finally {
      loading.value = false
    }
  }

  const fetchAssignmentRules = async () => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS}/assignment-rules`, {
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        assignmentRules.value = data
      } else if (data.data && Array.isArray(data.data)) {
        assignmentRules.value = data.data
      } else {
        console.warn('Unexpected API response format for assignment rules')
        assignmentRules.value = mockAssignmentRules
      }
    } catch (err) {
      console.error('Error fetching assignment rules from API:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching assignment rules'
      // Fallback to mock data
      assignmentRules.value = mockAssignmentRules
    } finally {
      loading.value = false
    }
  }

  const reassignRequest = async (reassignment: Omit<RequestReassignment, 'reassignedAt'>) => {
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS}/${reassignment.requestId}/reassign`, {
        method: 'PATCH',
        headers: createAuthHeaders(authStore.token || undefined),
        body: JSON.stringify({
          toAssigneeId: reassignment.toAssigneeId,
          reason: reassignment.reason
        })
      })
      
      await handleApiError(response)
      
      // Refresh stats after reassignment
      await fetchAssigneeStats(filters.value)
      
      return true
    } catch (err) {
      console.error('Error reassigning request:', err)
      error.value = err instanceof Error ? err.message : 'Error reassigning request'
      return false
    }
  }

  const createAssignmentRule = async (rule: Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS}/assignment-rules`, {
        method: 'POST',
        headers: createAuthHeaders(authStore.token || undefined),
        body: JSON.stringify(rule)
      })
      
      await handleApiError(response)
      const newRule = await response.json()
      
      assignmentRules.value.push(newRule)
      return newRule
    } catch (err) {
      console.error('Error creating assignment rule:', err)
      error.value = err instanceof Error ? err.message : 'Error creating assignment rule'
      return null
    }
  }

  const updateAssignmentRule = async (ruleId: string, updates: Partial<AssignmentRule>) => {
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS}/assignment-rules/${ruleId}`, {
        method: 'PATCH',
        headers: createAuthHeaders(authStore.token || undefined),
        body: JSON.stringify(updates)
      })
      
      await handleApiError(response)
      const updatedRule = await response.json()
      
      const index = assignmentRules.value.findIndex(rule => rule.id === ruleId)
      if (index > -1) {
        assignmentRules.value[index] = updatedRule
      }
      
      return updatedRule
    } catch (err) {
      console.error('Error updating assignment rule:', err)
      error.value = err instanceof Error ? err.message : 'Error updating assignment rule'
      return null
    }
  }

  const deleteAssignmentRule = async (ruleId: string) => {
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS}/assignment-rules/${ruleId}`, {
        method: 'DELETE',
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      
      const index = assignmentRules.value.findIndex(rule => rule.id === ruleId)
      if (index > -1) {
        assignmentRules.value.splice(index, 1)
      }
      
      return true
    } catch (err) {
      console.error('Error deleting assignment rule:', err)
      error.value = err instanceof Error ? err.message : 'Error deleting assignment rule'
      return false
    }
  }

  const updateFilters = (newFilters: AssigneeFilters) => {
    filters.value = { ...newFilters }
    fetchAssigneeStats(filters.value)
  }

  const updateRealTimeStats = (stats: RealTimeStats) => {
    realTimeStats.value[stats.assigneeId] = stats
  }

  // Helper function to generate mock stats
  const generateMockStats = (): AssigneeStats[] => {
    return assignees.value.map(assignee => ({
      assigneeId: assignee.id,
      assignee,
      totalRequests: Math.floor(Math.random() * 50) + 10,
      completedRequests: Math.floor(Math.random() * 30) + 5,
      pendingRequests: Math.floor(Math.random() * 15) + 2,
      conversionRate: Math.random() * 0.4 + 0.1, // 10% to 50%
      avgResponseTime: Math.random() * 8 + 1, // 1 to 9 hours
      avgCloseTime: Math.random() * 10 + 2 // 2 to 12 days
    }))
  }

  // Initialize with mock data
  if (assignees.value.length === 0) {
    assignees.value = mockAssignees
    assignmentRules.value = mockAssignmentRules
    assigneeStats.value = generateMockStats()
  }

  return {
    // State
    assignees,
    assigneeStats,
    assignmentRules,
    realTimeStats,
    loading,
    error,
    filters,
    // Getters
    activeAssignees,
    assigneeMetrics,
    getAssigneeById,
    getAssigneeStats,
    activeAssignmentRules,
    // Actions
    fetchAssignees,
    fetchAssigneeStats,
    fetchAssignmentRules,
    reassignRequest,
    createAssignmentRule,
    updateAssignmentRule,
    deleteAssignmentRule,
    updateFilters,
    updateRealTimeStats
  }
})