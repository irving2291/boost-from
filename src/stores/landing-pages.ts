import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { LandingPage, LandingPageFormSubmission, ContactFormConfig } from '../types/landing-pages'

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
  const fetchLandingPages = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Mock data for now - replace with actual API call
      const mockPages: LandingPage[] = [
        {
          id: '1',
          title: 'Página de Contacto Principal',
          slug: 'contacto-principal',
          htmlContent: '<div class="container mx-auto px-4 py-8"><h1>Contáctanos</h1><p>Estamos aquí para ayudarte</p></div>',
          isPublished: true,
          hasContactForm: true,
          contactFormConfig: {
            title: 'Formulario de Contacto',
            description: 'Déjanos tus datos y te contactaremos pronto',
            fields: [
              {
                id: 'firstName',
                name: 'firstName',
                label: 'Nombre',
                type: 'text',
                required: true,
                placeholder: 'Tu nombre'
              },
              {
                id: 'lastName',
                name: 'lastName',
                label: 'Apellido',
                type: 'text',
                required: true,
                placeholder: 'Tu apellido'
              },
              {
                id: 'email',
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true,
                placeholder: 'tu@email.com'
              },
              {
                id: 'phone',
                name: 'phone',
                label: 'Teléfono',
                type: 'phone',
                required: false,
                placeholder: '+593 99 999 9999'
              },
              {
                id: 'message',
                name: 'message',
                label: 'Mensaje',
                type: 'textarea',
                required: true,
                placeholder: 'Cuéntanos en qué podemos ayudarte'
              }
            ],
            submitButtonText: 'Enviar Mensaje',
            successMessage: '¡Gracias! Hemos recibido tu mensaje y te contactaremos pronto.'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'user-1',
          organizationId: 'org-1'
        }
      ]
      
      landingPages.value = mockPages
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error loading landing pages'
    } finally {
      loading.value = false
    }
  }

  const createLandingPage = async (pageData: Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    
    try {
      const newPage: LandingPage = {
        ...pageData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      landingPages.value.push(newPage)
      return newPage
    } catch (err) {
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
      const index = landingPages.value.findIndex(page => page.id === id)
      if (index === -1) {
        throw new Error('Landing page not found')
      }
      
      landingPages.value[index] = {
        ...landingPages.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      return landingPages.value[index]
    } catch (err) {
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
      const index = landingPages.value.findIndex(page => page.id === id)
      if (index === -1) {
        throw new Error('Landing page not found')
      }
      
      landingPages.value.splice(index, 1)
    } catch (err) {
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
      const submission: LandingPageFormSubmission = {
        id: Date.now().toString(),
        landingPageId: pageId,
        formData,
        submittedAt: new Date().toISOString(),
        processed: false
      }
      
      formSubmissions.value.push(submission)
      
      // Here you would typically also create a request in the requests store
      // For now, we'll just return the submission
      return submission
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error submitting form'
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrentLandingPage = (page: LandingPage | null) => {
    currentLandingPage.value = page
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