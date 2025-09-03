import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LandingPage, LandingPageFormSubmission, ContactFormConfig } from '../types/landing-pages'
import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../utils/api'
import { useAuthStore } from './auth'
import { useOrganizationsStore } from './organizations'

export const useLandingPagesStore = defineStore('landingPages', () => {
  // State
  const landingPages = ref<LandingPage[]>([])
  const currentLandingPage = ref<LandingPage | null>(null)
  const formSubmissions = ref<LandingPageFormSubmission[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const publishedPages = computed(() => 
    landingPages.value.filter(page => page.isPublished)
  )

  const draftPages = computed(() => 
    landingPages.value.filter(page => !page.isPublished)
  )

  const getPageBySlug = computed(() => (slug: string) => 
    landingPages.value.find(page => page.slug === slug)
  )

  const getSubmissionsByPageId = computed(() => (pageId: string) => 
    formSubmissions.value.filter(submission => submission.landingPageId === pageId)
  )

  // Actions
  const fetchLandingPages = async (published?: boolean) => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()
      let url = `${API_ENDPOINTS.CRM.LANDING_PAGES}`

      if (published !== undefined) {
        url += `?published=${published}`
      }

      const response = await fetch(url, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      await handleApiError(response)
      const data = await response.json()

      if (Array.isArray(data)) {
        landingPages.value = data
      } else if (data.data && Array.isArray(data.data)) {
        landingPages.value = data.data
      } else {
        console.error('Unexpected API response format for landing pages:', data)
        landingPages.value = []
        throw new Error('Invalid API response format')
      }
    } catch (err) {
      console.error('Error fetching landing pages from API:', err)
      error.value = err instanceof Error ? err.message : 'Error loading landing pages'
      landingPages.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const createLandingPage = async (pageData: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.LANDING_PAGES}`, {
        method: 'POST',
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id),
        body: JSON.stringify(pageData)
      })

      await handleApiError(response)
      const newPage = await response.json()

      landingPages.value.push(newPage)
      return newPage
    } catch (err) {
      console.error('Error creating landing page:', err)
      error.value = err instanceof Error ? err.message : 'Error creating landing page'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateLandingPage = async (id: string, updates: Partial<LandingPage>) => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.LANDING_PAGES}/${id}`, {
        method: 'PUT',
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id),
        body: JSON.stringify(updates)
      })

      await handleApiError(response)
      const updatedPage = await response.json()

      const index = landingPages.value.findIndex(page => page.id === id)
      if (index !== -1) {
        landingPages.value[index] = updatedPage
      }

      return updatedPage
    } catch (err) {
      console.error('Error updating landing page:', err)
      error.value = err instanceof Error ? err.message : 'Error updating landing page'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteLandingPage = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.LANDING_PAGES}/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      await handleApiError(response)

      const index = landingPages.value.findIndex(page => page.id === id)
      if (index !== -1) {
        landingPages.value.splice(index, 1)
      }
    } catch (err) {
      console.error('Error deleting landing page:', err)
      error.value = err instanceof Error ? err.message : 'Error deleting landing page'
      throw err
    } finally {
      loading.value = false
    }
  }

  const publishLandingPage = async (id: string) => {
    return updateLandingPage(id, { isPublished: true })
  }

  const unpublishLandingPage = async (id: string) => {
    return updateLandingPage(id, { isPublished: false })
  }

  const submitContactForm = async (pageId: string, formData: Record<string, any>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_ENDPOINTS.CRM.LANDING_PAGES}/${pageId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      await handleApiError(response)
      const result = await response.json()
      
      const submission: LandingPageFormSubmission = {
        id: result.id || Date.now().toString(),
        landingPageId: pageId,
        formData,
        submittedAt: new Date().toISOString(),
        processed: false
      }
      
      formSubmissions.value.push(submission)
      return submission
    } catch (err) {
      console.error('Error submitting contact form:', err)
      error.value = err instanceof Error ? err.message : 'Error submitting form'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentLandingPage = (page: LandingPage | null) => {
    currentLandingPage.value = page
  }

  const fetchLandingPageById = async (id: string): Promise<LandingPage | null> => {
    loading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const organizationsStore = useOrganizationsStore()
      const response = await fetch(`${API_ENDPOINTS.CRM.LANDING_PAGES}/${id}`, {
        headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
      })

      await handleApiError(response)
      const data = await response.json()

      return data as LandingPage
    } catch (err) {
      console.error('Error fetching landing page by ID:', err)
      error.value = err instanceof Error ? err.message : 'Error loading landing page'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLandingPageBySlug = async (slug: string): Promise<LandingPage | null> => {
    loading.value = true
    error.value = null

    try {
      // Use the public endpoint that doesn't require authentication
      const response = await fetch(`${API_ENDPOINTS.CRM.PUBLIC_LANDING_PAGES}/slug/${slug}`)

      await handleApiError(response)
      const data = await response.json()

      // The API returns the landing page data directly
      return data as LandingPage
    } catch (err) {
      console.error('Error fetching landing page by slug:', err)
      error.value = err instanceof Error ? err.message : 'Error loading landing page'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    landingPages,
    currentLandingPage,
    formSubmissions,
    loading,
    error,

    // Getters
    publishedPages,
    draftPages,
    getPageBySlug,
    getSubmissionsByPageId,

    // Actions
    fetchLandingPages,
    fetchLandingPageById,
    fetchLandingPageBySlug,
    createLandingPage,
    updateLandingPage,
    deleteLandingPage,
    publishLandingPage,
    unpublishLandingPage,
    submitContactForm,
    setCurrentLandingPage,
    clearError
  }
})