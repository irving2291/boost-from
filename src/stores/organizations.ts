import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'
import type { Organization, OrganizationInsert, OrganizationUpdate } from '../types/supabase'
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
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('organizations')
        .select('*')
        .eq('active', true)
        .is('deleted_at', null)
        .order('name')

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      organizations.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar organizaciones'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchOrganizationById = async (id: string): Promise<Organization | null> => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .is('deleted_at', null)
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      return data
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
    
    // Get organization from user profile
    if (!authStore.user?.id) {
      return
    }

    try {
      // First get the user's profile to get organization_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', authStore.user.id)
        .single()

      if (profileError || !profile?.organization_id) {
        console.error('Error loading user profile:', profileError)
        return
      }

      const organization = await fetchOrganizationById(profile.organization_id)
      if (organization) {
        setCurrentOrganization(organization)
      }
    } catch (err) {
      console.error('Error loading organization from token:', err)
    }
  }

  const createOrganization = async (organizationData: OrganizationInsert): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase
        .from('organizations')
        .insert({
          ...organizationData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (supabaseError) {
        throw new Error(supabaseError.message)
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

  const updateOrganization = async (id: string, organizationData: OrganizationUpdate): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase
        .from('organizations')
        .update({
          ...organizationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (supabaseError) {
        throw new Error(supabaseError.message)
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
    loading.value = true
    error.value = null

    try {
      // Soft delete by setting deleted_at and active = false
      const { error: supabaseError } = await supabase
        .from('organizations')
        .update({
          active: false,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (supabaseError) {
        throw new Error(supabaseError.message)
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
    
    // For Supabase storage, construct the URL
    // This assumes logos are stored in Supabase Storage
    const { data } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(logoPath)
    
    return data.publicUrl || '/default-org-logo.svg'
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