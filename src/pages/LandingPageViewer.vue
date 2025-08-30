<template>
  <div class="min-h-screen bg-white">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <h1 class="mt-4 text-2xl font-bold text-gray-900">{{ t('landingPages.pageNotFound') }}</h1>
        <p class="mt-2 text-gray-600">{{ error }}</p>
      </div>
    </div>

    <!-- Landing Page Content -->
    <div v-else-if="landingPage">
      <!-- Render HTML Content -->
      <div ref="contentContainer" class="landing-page-content"></div>

      <!-- Contact Form -->
      <div v-if="landingPage.hasContactForm && landingPage.contactFormConfig" class="contact-form-container">
        <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border" id="contact-form">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              {{ landingPage.contactFormConfig.title }}
            </h2>
            <p v-if="landingPage.contactFormConfig.description" class="text-gray-600">
              {{ landingPage.contactFormConfig.description }}
            </p>
          </div>

          <!-- Success Message -->
          <div v-if="formSubmitted" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-green-800">
                  {{ landingPage.contactFormConfig.successMessage }}
                </p>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <form v-else @submit.prevent="submitForm" class="space-y-4">
            <div v-for="field in landingPage.contactFormConfig.fields" :key="field.id" class="form-field">
              <label :for="field.id" class="block text-sm font-medium text-gray-700 mb-1">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
              
              <textarea
                v-if="field.type === 'textarea'"
                :id="field.id"
                v-model="formData[field.name]"
                :placeholder="field.placeholder"
                :required="field.required"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              
              <select
                v-else-if="field.type === 'select'"
                :id="field.id"
                v-model="formData[field.name]"
                :required="field.required"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{{ t('common.select') }}...</option>
                <option v-for="option in field.options" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              
              <input
                v-else
                :id="field.id"
                v-model="formData[field.name]"
                :type="field.type === 'phone' ? 'tel' : field.type"
                :placeholder="field.placeholder"
                :required="field.required"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Submit Button -->
            <div class="pt-4">
              <button
                type="submit"
                :disabled="submitting"
                class="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="submitting" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t('common.sending') }}...
                </span>
                <span v-else>
                  {{ landingPage.contactFormConfig.submitButtonText }}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLandingPagesStore } from '../stores/landing-pages'
import { useRequestsStore } from '../stores/requests'
import type { LandingPage } from '../types/landing-pages'

const { t } = useI18n()
const route = useRoute()
const landingPagesStore = useLandingPagesStore()
const requestsStore = useRequestsStore()

// Reactive data
const landingPage = ref<LandingPage | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const formData = ref<Record<string, any>>({})
const submitting = ref(false)
const formSubmitted = ref(false)
const contentContainer = ref<HTMLDivElement>()
const pageScripts = ref<HTMLScriptElement[]>([])
const pageStyles = ref<HTMLStyleElement[]>([])

// Methods
const loadLandingPage = async () => {
  try {
    loading.value = true
    error.value = null

    const slug = route.params.slug as string
    if (!slug) {
      error.value = t('landingPages.invalidSlug')
      return
    }

    // Fetch the landing page directly by slug using the public endpoint
    const page = await landingPagesStore.fetchLandingPageBySlug(slug)

    if (!page) {
      error.value = t('landingPages.pageNotFound')
      return
    }

    landingPage.value = page

    // Initialize form data
    if (page.hasContactForm && page.contactFormConfig) {
      const initialData: Record<string, any> = {}
      page.contactFormConfig.fields.forEach((field: any) => {
        initialData[field.name] = ''
      })
      formData.value = initialData
    }

    // Render content with JavaScript execution
    nextTick(() => {
      renderPageContent()
    })

  } catch (err) {
    error.value = err instanceof Error ? err.message : t('landingPages.loadError')
  } finally {
    loading.value = false
  }
}

const renderPageContent = () => {
  if (!contentContainer.value || !landingPage.value) return

  // Clean up existing scripts and styles
  pageScripts.value.forEach((script: HTMLScriptElement) => {
    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }
  })
  pageScripts.value = []

  pageStyles.value.forEach((style: HTMLStyleElement | HTMLLinkElement) => {
    if (style.parentNode) {
      style.parentNode.removeChild(style)
    }
  })
  pageStyles.value = []

  // Process variables in HTML content
  let processedHtml = landingPage.value.htmlContent

  // Replace system variables
  processedHtml = processedHtml.replace(/\{\{current_year\}\}/g, new Date().getFullYear().toString())
  processedHtml = processedHtml.replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString())
  processedHtml = processedHtml.replace(/\{\{page_title\}\}/g, landingPage.value.title)
  processedHtml = processedHtml.replace(/\{\{page_url\}\}/g, window.location.href)

  // Set the HTML content
  contentContainer.value.innerHTML = processedHtml

  // Execute CSS and JavaScript
  executePageStyles()
  executePageScripts()
}

const executePageStyles = () => {
  if (!contentContainer.value) return

  // Find all style tags in the content
  const styleTags = contentContainer.value.querySelectorAll('style')
  
  styleTags.forEach((originalStyle: HTMLStyleElement) => {
    try {
      // Create a new style element
      const newStyle = document.createElement('style')
      
      // Copy attributes
      Array.from(originalStyle.attributes).forEach((attr: Attr) => {
        newStyle.setAttribute(attr.name, attr.value)
      })

      // Copy CSS content
      if (originalStyle.innerHTML.trim()) {
        newStyle.innerHTML = originalStyle.innerHTML
      }

      // Add to document head for global styles
      document.head.appendChild(newStyle)
      pageStyles.value.push(newStyle)

    } catch (error) {
      console.warn('Error processing page styles:', error)
    }
  })

  // Process external CSS links
  const linkTags = contentContainer.value.querySelectorAll('link[rel="stylesheet"]')
  
  linkTags.forEach((originalLink: HTMLLinkElement) => {
    try {
      // Create a new link element
      const newLink = document.createElement('link')
      
      // Copy attributes
      Array.from(originalLink.attributes).forEach((attr: Attr) => {
        newLink.setAttribute(attr.name, attr.value)
      })

      // Add to document head
      document.head.appendChild(newLink)
      pageStyles.value.push(newLink as any) // Store for cleanup

    } catch (error) {
      console.warn('Error loading external stylesheet:', error)
    }
  })
}

const executePageScripts = () => {
  if (!contentContainer.value) return

  // Find all script tags in the content
  const scriptTags = contentContainer.value.querySelectorAll('script')
  
  scriptTags.forEach((originalScript: HTMLScriptElement) => {
    try {
      // Create a new script element
      const newScript = document.createElement('script')
      
      // Copy attributes
      Array.from(originalScript.attributes).forEach((attr: Attr) => {
        newScript.setAttribute(attr.name, attr.value)
      })

      // Handle inline scripts
      if (originalScript.innerHTML.trim()) {
        // Wrap the script in a try-catch for safety
        const wrappedCode = `
          try {
            ${originalScript.innerHTML}
          } catch (error) {
            console.warn('Landing page script error:', error);
          }
        `
        newScript.innerHTML = wrappedCode
      }

      // Replace the original script with the new one
      originalScript.parentNode?.replaceChild(newScript, originalScript)
      pageScripts.value.push(newScript)

    } catch (error) {
      console.warn('Error executing page script:', error)
    }
  })
}

const submitForm = async () => {
  if (!landingPage.value || !landingPage.value.contactFormConfig) return

  try {
    submitting.value = true

    // Validate required fields
    const requiredFields = landingPage.value.contactFormConfig.fields.filter((field: any) => field.required)
    for (const field of requiredFields) {
      if (!formData.value[field.name] || formData.value[field.name].trim() === '') {
        throw new Error(t('landingPages.fieldRequired', { field: field.label }))
      }
    }

    // Submit form to landing pages store
    await landingPagesStore.submitContactForm(landingPage.value.id, formData.value)

    // Create a request information entry
    const requestData = {
      fistName: formData.value.firstName || '',
      lastName: formData.value.lastName || '',
      email: formData.value.email || '',
      phone: formData.value.phone || '',
      company: formData.value.company || '',
      message: formData.value.message || '',
      source: `Landing Page: ${landingPage.value.title}`,
      status: { code: 'NEW', name: 'Nuevo' }
    }

    // This would typically be handled by the API
    // For now, we'll just show success
    formSubmitted.value = true

    // Scroll to success message
    setTimeout(() => {
      const formElement = document.getElementById('contact-form')
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)

  } catch (err) {
    alert(err instanceof Error ? err.message : t('landingPages.submitError'))
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadLandingPage()
})

// Cleanup on unmount
onUnmounted(() => {
  pageScripts.value.forEach((script: HTMLScriptElement) => {
    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }
  })
  
  pageStyles.value.forEach((style: HTMLStyleElement | HTMLLinkElement) => {
    if (style.parentNode) {
      style.parentNode.removeChild(style)
    }
  })
})
</script>

<style scoped>
/* Landing page content styles */
.landing-page-content {
  /* Allow the HTML content to use full styling */
}

.contact-form-container {
  /* Ensure the form is properly positioned */
  margin: 2rem 0;
  padding: 0 1rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .contact-form-container {
    padding: 0 0.5rem;
  }
}
</style>