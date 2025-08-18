import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'
import type { State, StateInsert, StateUpdate } from '../types/supabase'
import { useAuthStore } from './auth'

export const useStatusStore = defineStore('status', () => {
  // State
  const statuses = ref<State[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const sortedStatuses = computed(() => {
    return [...statuses.value].sort((a, b) => {
      const sortA = a.sort || 0
      const sortB = b.sort || 0
      return sortA - sortB
    })
  })

  const getStatusById = computed(() => {
    return (id: string) => statuses.value.find(status => status.id === id)
  })

  const getStatusByCode = computed(() => {
    return (code: string) => statuses.value.find(status => status.code === code)
  })

  const getStatusByName = computed(() => {
    return (name: string) => statuses.value.find(status => status.name === name)
  })

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
      }
    })
    
    // Send updates to Supabase
    try {
      await updateStatusOrder(updates)
    } catch (error) {
      console.error('Error updating status order:', error)
      // Revert changes on error
      await fetchStatuses()
    }
  }

  const updateStatusOrder = async (updates: { id: string; sort: number }[]) => {
    for (const update of updates) {
      try {
        const { error: supabaseError } = await supabase
          .from('states')
          .update({ sort: update.sort })
          .eq('id', update.id)
        
        if (supabaseError) {
          throw new Error(supabaseError.message)
        }
      } catch (error) {
        console.error(`Error updating status ${update.id}:`, error)
        throw error
      }
    }
  }

  // Actions
  const fetchStatuses = async (entityType: string = 'request_information') => {
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
        .from('states')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('entity_type', entityType)
        .order('sort', { ascending: true })
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      statuses.value = data || []

      // If no statuses exist, create default ones
      if (statuses.value.length === 0) {
        await createDefaultStatuses(profile.organization_id, entityType)
      }
    } catch (err) {
      console.error('Error fetching statuses from Supabase:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching statuses'
      statuses.value = []
    } finally {
      loading.value = false
    }
  }

  const createDefaultStatuses = async (organizationId: string, entityType: string) => {
    const defaultStatuses = [
      { code: 'NUEVOS', name: 'Nuevos', sort: 1, default: true },
      { code: 'CONTACTADOS', name: 'Contactados', sort: 2, default: false },
      { code: 'CALIFICADOS', name: 'Calificados', sort: 3, default: false },
      { code: 'PROPUESTA', name: 'Propuesta', sort: 4, default: false },
      { code: 'NEGOCIACION', name: 'Negociación', sort: 5, default: false },
      { code: 'GANADOS', name: 'Ganados', sort: 6, default: false }
    ]

    try {
      const statusesToInsert: StateInsert[] = defaultStatuses.map(status => ({
        organization_id: organizationId,
        entity_type: entityType,
        code: status.code,
        name: status.name,
        sort: status.sort,
        default: status.default
      }))

      const { data, error: supabaseError } = await supabase
        .from('states')
        .insert(statusesToInsert)
        .select()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      statuses.value = data || []
    } catch (error) {
      console.error('Error creating default statuses:', error)
    }
  }

  const createStatus = async (statusData: Omit<StateInsert, 'organization_id'>) => {
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
        .from('states')
        .insert({
          ...statusData,
          organization_id: profile.organization_id
        })
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      if (data) {
        statuses.value.push(data)
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error creating status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async (id: string, updates: StateUpdate) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('states')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      // Update local state
      const index = statuses.value.findIndex(status => status.id === id)
      if (index > -1 && data) {
        statuses.value[index] = data
      }
      
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error updating status'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteStatus = async (id: string) => {
    const status = statuses.value.find(s => s.id === id)
    if (status?.default) {
      throw new Error('Cannot delete default status')
    }
    
    loading.value = true
    error.value = null
    
    try {
      const { error: supabaseError } = await supabase
        .from('states')
        .delete()
        .eq('id', id)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      // Remove from local state
      const index = statuses.value.findIndex(status => status.id === id)
      if (index > -1) {
        statuses.value.splice(index, 1)
      }
    } catch (err) {
      console.error('Error deleting status:', err)
      error.value = err instanceof Error ? err.message : 'Error deleting status'
      throw err
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
    getStatusByCode,
    getStatusByName,
    // Actions
    fetchStatuses,
    createStatus,
    updateStatus,
    deleteStatus,
    reorderStatuses,
    updateStatusOrder,
    createDefaultStatuses
  }
})