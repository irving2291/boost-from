import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type {
  Assignee,
  AssigneeStats,
  AssignmentRule,
  RequestReassignment,
  AssigneeFilters,
  AssigneeMetrics,
  RealTimeStats
} from '../types'
import { API_BASE_URL, API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from './auth'
import { useOrganizationsStore } from './organizations'

export const useAssigneesStore = defineStore('assignees', () => {
  // State
  const assignees = ref<Assignee[]>([])
  const assigneeStats = ref<AssigneeStats[]>([])
  const assignmentRules = ref<AssignmentRule[]>([])
  const realTimeStats = ref<Record<string, RealTimeStats>>({})
  const searchResults = ref<Assignee[]>([])
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
      const organizationsStore = useOrganizationsStore()

      const response = await axios.get(`${API_ENDPOINTS.CRM.ASSIGNEES}`, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      const data = response.data
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
      const organizationsStore = useOrganizationsStore()

      const params: any = {}
      if (filters) {
        if (filters.dateFrom) params.dateFrom = filters.dateFrom
        if (filters.dateTo) params.dateTo = filters.dateTo
        if (filters.assigneeIds?.length) params.assigneeIds = filters.assigneeIds
        if (filters.status?.length) params.status = filters.status
        if (filters.department) params.department = filters.department
      }

      const response = await axios.get(`${API_ENDPOINTS.CRM.ASSIGNEES}/stats`, {
        params,
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      const data = response.data

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
      const organizationsStore = useOrganizationsStore()

      const response = await axios.get(`${API_ENDPOINTS.CRM.REQUESTS}/assignment-rules`, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      const data = response.data

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
      const organizationsStore = useOrganizationsStore()

      await axios.patch(`${API_ENDPOINTS.CRM.REQUESTS}/${reassignment.requestId}/reassign`, {
        toAssigneeId: reassignment.toAssigneeId,
        reason: reassignment.reason
      }, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

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
      const organizationsStore = useOrganizationsStore()

      const response = await axios.post(`${API_ENDPOINTS.CRM.REQUESTS}/assignment-rules`, rule, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      const newRule = response.data
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
      const organizationsStore = useOrganizationsStore()

      const response = await axios.patch(`${API_ENDPOINTS.CRM.REQUESTS}/assignment-rules/${ruleId}`, updates, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      const updatedRule = response.data

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
      const organizationsStore = useOrganizationsStore()

      await axios.delete(`${API_ENDPOINTS.CRM.REQUESTS}/assignment-rules/${ruleId}`, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

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

  const searchUsers = async (query: string) => {
    loading.value = true
    error.value = null
    searchResults.value = [] // Initialize as empty array

    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()

      // Use axios for the request
      const response = await axios.get(`${API_BASE_URL}/auth/my-org/users`, {
        params: { search: query },
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      const data = response.data

      // Handle the new API response format and map to Assignee objects
      let rawUsers: any[] = []
      if (data.data && Array.isArray(data.data)) {
        rawUsers = data.data
      } else if (Array.isArray(data)) {
        rawUsers = data
      } else {
        console.error('Unexpected API response format for user search:', data)
        searchResults.value = []
        throw new Error('Invalid API response format')
      }

      // Map raw API users to Assignee objects
      searchResults.value = rawUsers.map(mapApiUserToAssignee).slice(0, 25)
    } catch (err) {
      console.error('Error searching users from API:', err)
      error.value = err instanceof Error ? err.message : 'Error searching users'
      searchResults.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper function to map API user to Assignee
  const mapApiUserToAssignee = (apiUser: any): Assignee => {
    // Split the name into first and last name
    const nameParts = apiUser.name?.split(' ') || []
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    return {
      id: apiUser.id,
      firstName,
      lastName,
      email: apiUser.email,
      phone: '', // API doesn't provide phone
      avatar: undefined, // API doesn't provide avatar
      active: true, // Assume active by default
      role: 'user', // Default role
      department: undefined, // API doesn't provide department
      createdAt: apiUser.created_at,
      updatedAt: apiUser.created_at
    }
  }

  const clearSearchResults = () => {
    searchResults.value = []
  }

  const fetchCurrentUserAssignee = async (): Promise<Assignee | null> => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()
      const userId = authStore.user?.sub

      console.log('AssigneesStore: Fetching current user assignee for userId:', userId)

      if (!userId) {
        throw new Error('Usuario no autenticado')
      }

      const url = `${API_ENDPOINTS.CRM.ASSIGNEES}/user/${userId}`
      console.log('AssigneesStore: API URL:', url)

      const response = await axios.get(url, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      console.log('AssigneesStore: API response status:', response.status)
      const data = response.data
      console.log('AssigneesStore: Raw API response:', data)

      // Handle different response formats and ensure we return a single Assignee object
      let assigneeData: Assignee | null = null

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // If data.data is an array, take the first element
        assigneeData = data.data[0]
        console.log('AssigneesStore: Using first element of data.data array:', assigneeData)
      } else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        // If data.data is already an object, use it directly
        assigneeData = data.data
        console.log('AssigneesStore: Using data.data object:', assigneeData)
      } else if (Array.isArray(data) && data.length > 0) {
        // If API returns an array directly, take the first element
        assigneeData = data[0]
        console.log('AssigneesStore: Using first element of direct array:', assigneeData)
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        // If data is already an object, use it directly
        assigneeData = data
        console.log('AssigneesStore: Using data directly:', assigneeData)
      }

      // Ensure the returned data is a valid Assignee object
      if (assigneeData && typeof assigneeData === 'object' && assigneeData.id) {
        console.log('AssigneesStore: Returning valid assignee:', assigneeData)
        return assigneeData as Assignee
      } else {
        console.warn('AssigneesStore: Invalid assignee data received:', assigneeData)
        return null
      }
    } catch (err) {
      console.error('AssigneesStore: Error fetching current user assignee:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching current user assignee'
      return null
    } finally {
      loading.value = false
    }
  }

  const createAssignee = async (assigneeData: Omit<Assignee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()

      const response = await axios.post(`${API_ENDPOINTS.CRM.ASSIGNEES}`, assigneeData, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      const newAssignee = response.data

      // Add to the assignees list
      assignees.value.push(newAssignee)

      return newAssignee
    } catch (err) {
      console.error('Error creating assignee:', err)
      error.value = err instanceof Error ? err.message : 'Error creating assignee'
      throw err
    }
  }

  const updateAssignee = async (assigneeId: string, updates: Partial<Assignee>) => {
    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()

      const response = await axios.patch(`${API_ENDPOINTS.CRM.ASSIGNEES}/${assigneeId}`, updates, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      const updatedAssignee = response.data

      // Update in the assignees list
      const index = assignees.value.findIndex(a => a.id === assigneeId)
      if (index > -1) {
        assignees.value[index] = updatedAssignee
      }

      return updatedAssignee
    } catch (err) {
      console.error('Error updating assignee:', err)
      error.value = err instanceof Error ? err.message : 'Error updating assignee'
      throw err
    }
  }

  const deleteAssignee = async (assigneeId: string) => {
    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()

      await axios.delete(`${API_ENDPOINTS.CRM.ASSIGNEES}/${assigneeId}`, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      // Remove from the assignees list
      const index = assignees.value.findIndex(a => a.id === assigneeId)
      if (index > -1) {
        assignees.value.splice(index, 1)
      }

      return true
    } catch (err) {
      console.error('Error deleting assignee:', err)
      error.value = err instanceof Error ? err.message : 'Error deleting assignee'
      return false
    }
  }

  return {
    // State
    assignees,
    assigneeStats,
    assignmentRules,
    searchResults,
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
    updateRealTimeStats,
    searchUsers,
    clearSearchResults,
    fetchCurrentUserAssignee,
    createAssignee,
    updateAssignee,
    deleteAssignee
  }
})