import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'
import type { RequestInformation, RequestInformationInsert, RequestInformationUpdate, State } from '../types/supabase'
import { useAuthStore } from './auth'
import { useStatusStore } from './status'

export const useRequestsStore = defineStore('requests', () => {
  // State
  const requests = ref<RequestInformation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const requestsByStatus = computed(() => {
    const statusStore = useStatusStore()
    const grouped: Record<string, RequestInformation[]> = {}
    
    // Initialize groups for all available statuses
    statusStore.statuses.forEach((status: State) => {
      grouped[status.code] = []
    })

    requests.value.forEach(request => {
      const statusCode = request.status_id
      // Find the status by ID to get the code
      const status = statusStore.statuses.find(s => s.id === statusCode)
      if (status && grouped[status.code]) {
        grouped[status.code].push(request)
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
      byStatus[status.code] = 0
    })

    // Count requests by their actual status
    requests.value.forEach(request => {
      const status = statusStore.statuses.find(s => s.id === request.status_id)
      if (status && byStatus[status.code] !== undefined) {
        byStatus[status.code]++
      } else {
        // Handle unknown statuses
        if (!byStatus['UNKNOWN']) byStatus['UNKNOWN'] = 0
        byStatus['UNKNOWN']++
      }
    })

    const total = requests.value.length
    
    // Calculate conversion rate based on "won" or "ganados" status
    const wonStatuses = statusStore.statuses.filter(s =>
      s.name?.toLowerCase().includes('ganado') ||
      s.name?.toLowerCase().includes('won') ||
      s.name?.toLowerCase().includes('cerrado')
    )
    const won = wonStatuses.reduce((sum, status) => sum + (byStatus[status.code] || 0), 0)
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
      const createdDate = new Date(request.created_at)
      createdDate.setHours(0, 0, 0, 0)
      return createdDate.getTime() === today.getTime()
    }).length
  })

  const pendingRequests = computed(() => {
    const statusStore = useStatusStore()
    const pendingStatuses = statusStore.statuses.filter(s =>
      s.name?.toLowerCase().includes('nuevo') ||
      s.name?.toLowerCase().includes('new') ||
      s.name?.toLowerCase().includes('pendiente') ||
      s.name?.toLowerCase().includes('pending')
    )
    
    return requests.value.filter(request =>
      pendingStatuses.some(status => status.id === request.status_id)
    ).length
  })

  const inProgressRequests = computed(() => {
    const statusStore = useStatusStore()
    const inProgressStatuses = statusStore.statuses.filter(s =>
      s.name?.toLowerCase().includes('contactado') ||
      s.name?.toLowerCase().includes('calificado') ||
      s.name?.toLowerCase().includes('propuesta') ||
      s.name?.toLowerCase().includes('negociacion') ||
      s.name?.toLowerCase().includes('progress')
    )
    
    return requests.value.filter(request =>
      inProgressStatuses.some(status => status.id === request.status_id)
    ).length
  })

  const completedRequests = computed(() => {
    const statusStore = useStatusStore()
    const completedStatuses = statusStore.statuses.filter(s =>
      s.name?.toLowerCase().includes('ganado') ||
      s.name?.toLowerCase().includes('won') ||
      s.name?.toLowerCase().includes('cerrado') ||
      s.name?.toLowerCase().includes('completed')
    )
    
    return requests.value.filter(request =>
      completedStatuses.some(status => status.id === request.status_id)
    ).length
  })

  // Actions
  const fetchRequests = async () => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      // Get user's organization from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', authStore.user?.id)
        .single()

      if (!profile?.organization_id) {
        throw new Error('No organization found for user')
      }

      const { data, error: supabaseError } = await supabase
        .from('request_information')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(999)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      requests.value = data || []
    } catch (err) {
      console.error('Error fetching requests from Supabase:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching requests'
      requests.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchRequestsByStatus = async (statusId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      // Get user's organization from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', authStore.user?.id)
        .single()

      if (!profile?.organization_id) {
        throw new Error('No organization found for user')
      }

      const { data, error: supabaseError } = await supabase
        .from('request_information')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('status_id', statusId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      requests.value = data || []
    } catch (err) {
      console.error('Error fetching requests by status from Supabase:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching requests'
      requests.value = []
    } finally {
      loading.value = false
    }
  }

  const updateRequestStatus = async (requestId: string, newStatusId: string) => {
    try {
      const authStore = useAuthStore()
      
      const { error: supabaseError } = await supabase
        .from('request_information')
        .update({
          status_id: newStatusId,
          updated_at: new Date().toISOString(),
          last_user_updated: {
            user_id: authStore.user?.id,
            email: authStore.user?.email,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', requestId)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      // Update local state
      const request = requests.value.find(r => r.id === requestId)
      if (request) {
        request.status_id = newStatusId
        request.updated_at = new Date().toISOString()
        request.last_user_updated = {
          user_id: authStore.user?.id,
          email: authStore.user?.email,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error updating request status:', error)
      throw error
    }
  }

  const addRequest = async (newRequest: RequestInformationInsert) => {
    try {
      const authStore = useAuthStore()
      
      // Get user's organization from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', authStore.user?.id)
        .single()

      if (!profile?.organization_id) {
        throw new Error('No organization found for user')
      }

      const { data, error: supabaseError } = await supabase
        .from('request_information')
        .insert({
          ...newRequest,
          organization_id: profile.organization_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      if (data) {
        requests.value.unshift(data)
      }
      
      return data
    } catch (error) {
      console.error('Error adding request:', error)
      throw error
    }
  }

  const updateRequest = async (requestId: string, updates: RequestInformationUpdate) => {
    try {
      const authStore = useAuthStore()
      
      const { data, error: supabaseError } = await supabase
        .from('request_information')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          last_user_updated: {
            user_id: authStore.user?.id,
            email: authStore.user?.email,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', requestId)
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      // Update local state
      const index = requests.value.findIndex(r => r.id === requestId)
      if (index > -1 && data) {
        requests.value[index] = data
      }
      
      return data
    } catch (error) {
      console.error('Error updating request:', error)
      throw error
    }
  }

  const deleteRequest = async (requestId: string) => {
    try {
      // Soft delete by setting deleted_at
      const { error: supabaseError } = await supabase
        .from('request_information')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      // Remove from local state
      const index = requests.value.findIndex(r => r.id === requestId)
      if (index > -1) {
        requests.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Error deleting request:', error)
      throw error
    }
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
    updateRequest,
    deleteRequest
  }
})