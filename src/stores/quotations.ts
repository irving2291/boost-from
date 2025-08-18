import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'
import type { Quotation, QuotationInsert, QuotationUpdate, State } from '../types/supabase'
import { useAuthStore } from './auth'

export const useQuotationsStore = defineStore('quotations', () => {
  // State
  const quotations = ref<Quotation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getQuotationsByRequestId = computed(() => {
    return (requestId: string) => quotations.value.filter(q => q.request_information_id === requestId)
  })

  const quotationsByStatus = computed(() => {
    // Initialize with empty arrays for expected status types
    const grouped = {
      creating: [] as Quotation[],
      sent: [] as Quotation[],
      accepted: [] as Quotation[],
      rejected: [] as Quotation[]
    }
    
    // For now, we'll need to map status_id to status names
    // This is a temporary solution until we have proper status mapping
    quotations.value.forEach(quotation => {
      // Since we don't have status mapping yet, we'll put all in creating for now
      // TODO: Implement proper status mapping with states table
      grouped.creating.push(quotation)
    })

    return grouped
  })

  // Actions
  const fetchQuotations = async (page: number = 1, perPage: number = 20) => {
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
        .from('quotations')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      quotations.value = data || []
    } catch (err) {
      console.error('Error fetching quotations from Supabase:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching quotations'
      quotations.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchQuotationById = async (id: string): Promise<Quotation | null> => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      return data
    } catch (err) {
      console.error('Error fetching quotation by ID:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching quotation'
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchQuotationByRequestId = async (requestId: string): Promise<Quotation | null> => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('quotations')
        .select('*')
        .eq('request_information_id', requestId)
        .is('deleted_at', null)
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      return data
    } catch (err) {
      console.error('Error fetching quotation by request ID:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching quotation'
      return null
    } finally {
      loading.value = false
    }
  }

  const createQuotation = async (quotationData: QuotationInsert): Promise<Quotation | null> => {
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
        .from('quotations')
        .insert({
          ...quotationData,
          organization_id: profile.organization_id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      if (data) {
        quotations.value.unshift(data)
      }
      
      return data
    } catch (err) {
      console.error('Error creating quotation:', err)
      error.value = err instanceof Error ? err.message : 'Error creating quotation'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateQuotation = async (id: string, updates: QuotationUpdate): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('quotations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      // Update local state
      const index = quotations.value.findIndex(q => q.id === id)
      if (index > -1 && data) {
        quotations.value[index] = data
      }
      
      return true
    } catch (err) {
      console.error('Error updating quotation:', err)
      error.value = err instanceof Error ? err.message : 'Error updating quotation'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateQuotationStatus = async (id: string, statusId: string): Promise<boolean> => {
    return updateQuotation(id, { status_id: statusId })
  }

  const deleteQuotation = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      // Soft delete by setting deleted_at
      const { error: supabaseError } = await supabase
        .from('quotations')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      // Remove from local state
      const index = quotations.value.findIndex(q => q.id === id)
      if (index > -1) {
        quotations.value.splice(index, 1)
      }
      
      return true
    } catch (err) {
      console.error('Error deleting quotation:', err)
      error.value = err instanceof Error ? err.message : 'Error deleting quotation'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    quotations,
    loading,
    error,
    // Getters
    getQuotationsByRequestId,
    quotationsByStatus,
    // Actions
    fetchQuotations,
    fetchQuotationById,
    fetchQuotationByRequestId,
    createQuotation,
    updateQuotation,
    updateQuotationStatus,
    deleteQuotation
  }
})