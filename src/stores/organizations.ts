import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Organization } from '../types'
import { API_ENDPOINTS } from '../utils/api'
import { useAuthStore } from './auth'

export const useOrganizationsStore = defineStore('organizations', () => {
  // State
  const organizations = ref<Organization[]>([])
  const currentOrganization = ref<Organization | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const organizationById = computed(() => (id: string) => {
    return organizations.value.find(org => org.id === id)
  })

  const hasCurrentOrganization = computed(() => currentOrganization.value !== null)

  // Actions
  const fetchOrganizations = async (): Promise<void> => {
    const authStore = useAuthStore()
    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_ENDPOINTS.ORGANIZATIONS.LIST, {
        headers: {
          'Authorization': authStore.authHeader || '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar organizaciones')
      }

      const data = await response.json()
      organizations.value = data.data || data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchOrganizationById = async (id: string): Promise<Organization | null> => {
    const authStore = useAuthStore()
    
    try {
      const response = await fetch(`${API_ENDPOINTS.ORGANIZATIONS.LIST}/${id}`, {
        headers: {
          'Authorization': authStore.authHeader || '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar organización')
      }

      const data = await response.json()
      return data.data || data
    } catch (err) {
      console.error('Error fetching organization:', err)
      return null
    }
  }

  const setCurrentOrganization = (organization: Organization | null) => {
    currentOrganization.value = organization
    
    // Store in localStorage
    if (organization) {
      localStorage.setItem('current_organization', JSON.stringify(organization))
    } else {
      localStorage.removeItem('current_organization')
    }
  }

  const loadCurrentOrganizationFromStorage = () => {
    try {
      const stored = localStorage.getItem('current_organization')
      if (stored) {
        currentOrganization.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('Error loading organization from storage:', err)
      localStorage.removeItem('current_organization')
    }
  }

  const loadCurrentOrganizationFromToken = async () => {
    const authStore = useAuthStore()
    
    if (!authStore.user?.org_id) {
      return
    }

    try {
      const organization = await fetchOrganizationById(authStore.user.org_id)
      if (organization) {
        setCurrentOrganization(organization)
      }
    } catch (err) {
      console.error('Error loading organization from token:', err)
    }
  }

  const createOrganization = async (organizationData: Partial<Organization>): Promise<boolean> => {
    const authStore = useAuthStore()
    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_ENDPOINTS.ORGANIZATIONS.LIST, {
        method: 'POST',
        headers: {
          'Authorization': authStore.authHeader || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(organizationData)
      })

      if (!response.ok) {
        throw new Error('Error al crear organización')
      }

      await fetchOrganizations()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear organización'
      return false
    } finally {
      loading.value = false
    }
  }

  const updateOrganization = async (id: string, organizationData: Partial<Organization>): Promise<boolean> => {
    const authStore = useAuthStore()
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_ENDPOINTS.ORGANIZATIONS.LIST}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': authStore.authHeader || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(organizationData)
      })

      if (!response.ok) {
        throw new Error('Error al actualizar organización')
      }

      await fetchOrganizations()
      
      // Update current organization if it's the one being updated
      if (currentOrganization.value?.id === id) {
        await loadCurrentOrganizationFromToken()
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar organización'
      return false
    } finally {
      loading.value = false
    }
  }

  const deleteOrganization = async (id: string): Promise<boolean> => {
    const authStore = useAuthStore()
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_ENDPOINTS.ORGANIZATIONS.LIST}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authStore.authHeader || '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error al eliminar organización')
      }

      await fetchOrganizations()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar organización'
      return false
    } finally {
      loading.value = false
    }
  }

  const clearOrganizationData = () => {
    organizations.value = []
    currentOrganization.value = null
    error.value = null
    localStorage.removeItem('current_organization')
  }

  const getLogoUrl = (logoPath?: string): string => {
    if (!logoPath) {
      // Return default organization logo
      return '/default-org-logo.svg'
    }
    
    // If it's already a full URL, return as is
    if (logoPath.startsWith('http')) {
      return logoPath
    }
    
    // Otherwise, construct the full URL using the API base
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://boost.pitahayasoft.com/api/v1'
    return `${baseUrl.replace('/api/v1', '')}/${logoPath}`
  }

  return {
    // State
    organizations,
    currentOrganization,
    loading,
    error,
    // Getters
    organizationById,
    hasCurrentOrganization,
    // Actions
    fetchOrganizations,
    fetchOrganizationById,
    setCurrentOrganization,
    loadCurrentOrganizationFromStorage,
    loadCurrentOrganizationFromToken,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    clearOrganizationData,
    getLogoUrl
  }
})