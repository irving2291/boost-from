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
      
      const response = await fetch(`${API_ENDPOINTS.CRM.ASSIGNEES}`, {
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        assignees.value = data
      } else if (data.data && Array.isArray(data.data)) {
        assignees.value = data.data
      } else {
        console.error('Unexpected API response format for assignees:', data)
        assignees.value = []
        throw new Error('Invalid API response format')
      }
    } catch (err) {
      console.error('Error fetching assignees from API:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching assignees'
      assignees.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAssigneeStats = async (filters?: AssigneeFilters) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      let url = `${API_ENDPOINTS.CRM.ASSIGNEES}/stats`
      
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
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        assigneeStats.value = data
      } else if (data.data && Array.isArray(data.data)) {
        assigneeStats.value = data.data
      } else {
        console.error('Unexpected API response format for assignee stats:', data)
        assigneeStats.value = []
        throw new Error('Invalid API response format')
      }
    } catch (err) {
      console.error('Error fetching assignee stats from API:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching assignee stats'
      assigneeStats.value = []
      throw err
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
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        assignmentRules.value = data
      } else if (data.data && Array.isArray(data.data)) {
        assignmentRules.value = data.data
      } else {
        console.error('Unexpected API response format for assignment rules:', data)
        assignmentRules.value = []
        throw new Error('Invalid API response format')
      }
    } catch (err) {
      console.error('Error fetching assignment rules from API:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching assignment rules'
      assignmentRules.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const reassignRequest = async (reassignment: Omit<RequestReassignment, 'reassignedAt'>) => {
    try {
      const authStore = useAuthStore()
      
      const response = await fetch(`${API_ENDPOINTS.CRM.REQUESTS}/${reassignment.requestId}/reassign`, {
        method: 'PATCH',
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id),
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
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id),
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
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id),
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
        headers: createAuthHeaders(authStore.token || undefined, authStore.currentOrganization?.id)
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