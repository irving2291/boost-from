import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Quotation, CreateQuotationRequest } from '../types'
import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from './auth'

export const useQuotationsStore = defineStore('quotations', () => {
  // State
  const quotations = ref<Quotation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getQuotationsByRequestId = computed(() => {
    return (requestId: string) => quotations.value.filter(q => q.requestInformationId === requestId)
  })

  const quotationsByStatus = computed(() => {
    const grouped: Record<string, Quotation[]> = {
      creating: [],
      sent: [],
      accepted: [],
      rejected: []
    }

    quotations.value.forEach(quotation => {
      grouped[quotation.status].push(quotation)
    })

    return grouped
  })

  // Actions
  const fetchQuotations = async () => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(API_ENDPOINTS.CRM.QUOTATIONS, {
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      const data = await response.json()
      
      if (Array.isArray(data)) {
        quotations.value = data
      } else if (data.data && Array.isArray(data.data)) {
        quotations.value = data.data
      } else {
        quotations.value = []
      }
    } catch (err) {
      console.error('Error fetching quotations from API:', err)
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
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.QUOTATIONS}/${id}`, {
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      const quotation = await response.json()
      
      return quotation
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
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.QUOTATIONS}/request-information/${requestId}`, {
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      const quotation = await response.json()
      
      return quotation
    } catch (err) {
      console.error('Error fetching quotation by request ID:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching quotation'
      return null
    } finally {
      loading.value = false
    }
  }

  const createQuotation = async (quotationData: CreateQuotationRequest): Promise<Quotation | null> => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(API_ENDPOINTS.CRM.QUOTATIONS, {
        method: 'POST',
        headers: createAuthHeaders(authStore.token || undefined),
        body: JSON.stringify(quotationData)
      })
      
      await handleApiError(response)
      const newQuotation = await response.json()
      
      // Add to local state
      quotations.value.push(newQuotation)
      
      return newQuotation
    } catch (err) {
      console.error('Error creating quotation:', err)
      error.value = err instanceof Error ? err.message : 'Error creating quotation'
      return null
    } finally {
      loading.value = false
    }
  }

  const updateQuotationStatus = async (id: string, status: Quotation['status']): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.QUOTATIONS}/${id}`, {
        method: 'PATCH',
        headers: createAuthHeaders(authStore.token || undefined),
        body: JSON.stringify({ status })
      })
      
      await handleApiError(response)
      
      // Update local state
      const quotation = quotations.value.find(q => q.id === id)
      if (quotation) {
        quotation.status = status
        quotation.updatedAt = new Date().toISOString()
      }
      
      return true
    } catch (err) {
      console.error('Error updating quotation status:', err)
      error.value = err instanceof Error ? err.message : 'Error updating quotation status'
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteQuotation = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.QUOTATIONS}/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(authStore.token || undefined)
      })
      
      await handleApiError(response)
      
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
    updateQuotationStatus,
    deleteQuotation
  }
})