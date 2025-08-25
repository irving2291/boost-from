<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="goBack"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <div>
          <h1 class="text-xl font-semibold text-gray-900">
            {{ isEditing ? t('landingPages.editPage') : t('landingPages.createNew') }}
          </h1>
          <p class="text-sm text-gray-500">
            {{ form.title || t('landingPages.untitled') }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <!-- Variables Panel Toggle -->
        <button
          @click="showVariables = !showVariables"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            showVariables
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
          </svg>
          {{ t('landingPages.variables') }}
        </button>
        
        <!-- Preview Toggle -->
        <button
          @click="showPreview = !showPreview"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            showPreview
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          {{ showPreview ? t('landingPages.hidePreview') : t('landingPages.showPreview') }}
        </button>
        
        <!-- Save Button -->
        <button
          @click="savePage"
          :disabled="!isFormValid || saving"
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ saving ? t('common.saving') : t('common.save') }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Variables Panel -->
      <div v-if="showVariables" class="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ t('landingPages.variables') }}</h3>
          <p class="text-sm text-gray-600">{{ t('landingPages.variablesHelp') }}</p>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- System Variables -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-2">{{ t('landingPages.systemVariables') }}</h4>
            <div class="space-y-2">
              <div
                v-for="variable in systemVariables"
                :key="variable.key"
                class="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                @click="insertVariable(variable.key)"
              >
                <div class="flex items-center justify-between">
                  <code class="text-sm font-mono text-blue-600">{{ variable.key }}</code>
                  <button
                    @click.stop="copyVariable(variable.key)"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ variable.description }}</p>
              </div>
            </div>
          </div>

          <!-- Custom Variables -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-900">{{ t('landingPages.customVariables') }}</h4>
              <button
                @click="addCustomVariable"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                + {{ t('common.add') }}
              </button>
            </div>
            <div class="space-y-2">
              <div
                v-for="(variable, index) in customVariables"
                :key="index"
                class="p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center space-x-2 mb-2">
                  <input
                    v-model="variable.key"
                    :placeholder="t('landingPages.variableKey')"
                    class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    @click="removeCustomVariable(index)"
                    class="text-red-500 hover:text-red-700"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                <input
                  v-model="variable.value"
                  :placeholder="t('landingPages.variableValue')"
                  class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor and Preview -->
      <div class="flex-1 flex">
        <!-- HTML Editor -->
        <div class="flex-1 flex flex-col">
          <!-- Editor Header -->
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h3 class="text-sm font-medium text-gray-900">{{ t('landingPages.htmlEditor') }}</h3>
              <div class="flex items-center space-x-2">
                <input
                  v-model="form.title"
                  :placeholder="t('landingPages.titlePlaceholder')"
                  class="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  v-model="form.slug"
                  :placeholder="t('landingPages.slugPlaceholder')"
                  class="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <label class="flex items-center text-sm">
                <input
                  v-model="form.isPublished"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                {{ t('landingPages.published') }}
              </label>
            </div>
          </div>
          
          <!-- Code Editor -->
          <div class="flex-1 relative">
            <textarea
              ref="codeEditor"
              v-model="form.htmlContent"
              :placeholder="t('landingPages.htmlPlaceholder')"
              class="w-full h-full font-mono text-sm border-0 focus:outline-none resize-none bg-gray-900 text-green-400"
              style="padding: 16px 16px 16px 56px;"
              @input="processVariables"
            ></textarea>
            
            <!-- Line Numbers -->
            <div class="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700 flex flex-col text-xs text-gray-500 pt-4 pointer-events-none">
              <div
                v-for="line in lineNumbers"
                :key="line"
                class="h-5 flex items-center justify-end pr-2"
              >
                {{ line }}
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Panel -->
        <div v-if="showPreview" class="flex-1 border-l border-gray-200 bg-white flex flex-col">
          <div class="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-900">{{ t('landingPages.preview') }}</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="refreshPreview"
                class="text-gray-500 hover:text-gray-700"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="flex-1 overflow-hidden bg-white">
            <iframe
              ref="previewFrame"
              class="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
              srcdoc=""
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Form Configuration Modal -->
    <Modal v-if="showFormConfig" :title="t('landingPages.contactForm')" @close="showFormConfig = false">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input
              v-model="form.hasContactForm"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">{{ t('landingPages.enableContactForm') }}</span>
          </label>
        </div>

        <div v-if="form.hasContactForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('landingPages.formTitle') }}
            </label>
            <input
              v-model="form.contactFormConfig.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('landingPages.formDescription') }}
            </label>
            <textarea
              v-model="form.contactFormConfig.description"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            @click="showFormConfig = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="insertContactForm"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {{ t('landingPages.insertForm') }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import Modal from '../core/components/Modal.vue'
import { useLandingPagesStore } from '../stores/landing-pages'
import type { LandingPage, ContactFormConfig } from '../types/landing-pages'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const landingPagesStore = useLandingPagesStore()

// Reactive data
const showVariables = ref(true)
const showPreview = ref(true)
const showFormConfig = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const codeEditor = ref<HTMLTextAreaElement>()
const previewFrame = ref<HTMLIFrameElement>()

const form = ref({
  title: '',
  slug: '',
  htmlContent: '',
  isPublished: false,
  hasContactForm: false,
  contactFormConfig: {
    title: 'Formulario de Contacto',
    description: 'Déjanos tus datos y te contactaremos pronto',
    submitButtonText: 'Enviar Mensaje',
    successMessage: '¡Gracias! Hemos recibido tu mensaje.',
    fields: []
  } as ContactFormConfig
})

const customVariables = ref([
  { key: '{{company_name}}', value: 'Mi Empresa' },
  { key: '{{phone}}', value: '+593 99 999 9999' },
  { key: '{{email}}', value: 'contacto@miempresa.com' }
])

// System variables
const systemVariables = [
  { key: '{{current_year}}', description: 'Año actual' },
  { key: '{{current_date}}', description: 'Fecha actual' },
  { key: '{{page_title}}', description: 'Título de la página' },
  { key: '{{page_url}}', description: 'URL de la página' },
  { key: '{{contact_form}}', description: 'Formulario de contacto' }
]

// Computed properties
const isFormValid = computed(() => {
  return form.value.title.trim() !== '' &&
         form.value.slug.trim() !== '' &&
         form.value.htmlContent.trim() !== ''
})

const lineNumbers = computed(() => {
  const lines = form.value.htmlContent.split('\n').length
  return Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1)
})

const processedHtml = computed(() => {
  let html = form.value.htmlContent
  
  // Replace system variables
  html = html.replace(/\{\{current_year\}\}/g, new Date().getFullYear().toString())
  html = html.replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString())
  html = html.replace(/\{\{page_title\}\}/g, form.value.title)
  html = html.replace(/\{\{page_url\}\}/g, `/landing/${form.value.slug}`)
  
  // Replace custom variables
  customVariables.value.forEach((variable: any) => {
    const regex = new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g')
    html = html.replace(regex, variable.value)
  })
  
  // Replace contact form placeholder
  if (form.value.hasContactForm) {
    html = html.replace(/\{\{contact_form\}\}/g, generateContactFormHtml())
  }
  
  return html
})

// Methods
const goBack = () => {
  router.push('/landing-pages')
}

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const processVariables = () => {
  // This could be enhanced to provide real-time variable suggestions
}

const insertVariable = (variable: string) => {
  if (codeEditor.value) {
    const start = codeEditor.value.selectionStart
    const end = codeEditor.value.selectionEnd
    const text = form.value.htmlContent
    
    form.value.htmlContent = text.substring(0, start) + variable + text.substring(end)
    
    nextTick(() => {
      if (codeEditor.value) {
        codeEditor.value.focus()
        codeEditor.value.setSelectionRange(start + variable.length, start + variable.length)
      }
    })
  }
}

const copyVariable = (variable: string) => {
  navigator.clipboard.writeText(variable)
}

const addCustomVariable = () => {
  customVariables.value.push({ key: '{{new_variable}}', value: '' })
}

const removeCustomVariable = (index: number) => {
  customVariables.value.splice(index, 1)
}

const refreshPreview = () => {
  updatePreview()
}

const updatePreview = () => {
  if (!previewFrame.value) return

  // Create the complete HTML document
  const doc = previewFrame.value.contentDocument || previewFrame.value.contentWindow?.document
  if (!doc) return

  doc.open()
  doc.write('<!DOCTYPE html>')
  doc.write('<html lang="es">')
  doc.write('<head>')
  doc.write('<meta charset="UTF-8">')
  doc.write('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
  doc.write('<title>Preview</title>')
  doc.write('<style>')
  doc.write('* { margin: 0; padding: 0; box-sizing: border-box; }')
  doc.write('html, body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; background: #fff; }')
  doc.write('h1, h2, h3, h4, h5, h6 { margin: 0; font-weight: bold; }')
  doc.write('p { margin: 0; }')
  doc.write('a { color: #007bff; text-decoration: none; }')
  doc.write('a:hover { text-decoration: underline; }')
  doc.write('img { max-width: 100%; height: auto; }')
  doc.write('input, textarea, select, button { font-family: inherit; font-size: inherit; }')
  doc.write('</style>')
  doc.write('</head>')
  doc.write('<body>')
  doc.write(processedHtml.value)
  doc.write('</body>')
  doc.write('</html>')
  doc.close()

  // Add event listeners after content is loaded
  setTimeout(() => {
    const forms = doc.querySelectorAll('form')
    forms.forEach((form: HTMLFormElement) => {
      form.addEventListener('submit', function(e: Event) {
        e.preventDefault()
        alert('Formulario enviado (modo preview)')
      })
    })

    const links = doc.querySelectorAll('a[href]')
    links.forEach((link: HTMLAnchorElement) => {
      link.addEventListener('click', function(e: Event) {
        const href = (this as HTMLAnchorElement).getAttribute('href')
        if (href && href.startsWith('#')) {
          return
        }
        e.preventDefault()
        alert('Enlace: ' + (href || '#') + ' (modo preview)')
      })
    })
  }, 100)
}


const generateContactFormHtml = () => {
  return `
    <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">${form.value.contactFormConfig.title}</h2>
      <p class="text-gray-600 mb-6">${form.value.contactFormConfig.description}</p>
      <form class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Nombre" class="px-3 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" placeholder="Apellido" class="px-3 py-2 border border-gray-300 rounded-lg" required />
        </div>
        <input type="email" placeholder="Email" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
        <input type="tel" placeholder="Teléfono" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        <textarea placeholder="Mensaje" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg" required></textarea>
        <button type="submit" class="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
          ${form.value.contactFormConfig.submitButtonText}
        </button>
      </form>
    </div>
  `
}

const insertContactForm = () => {
  insertVariable('{{contact_form}}')
  showFormConfig.value = false
}

const savePage = async () => {
  if (!isFormValid.value) return

  try {
    saving.value = true

    const pageData = {
      title: form.value.title.trim(),
      slug: form.value.slug.trim(),
      htmlContent: form.value.htmlContent.trim(),
      isPublished: form.value.isPublished,
      hasContactForm: form.value.hasContactForm,
      contactFormConfig: form.value.hasContactForm ? form.value.contactFormConfig : undefined,
      variables: customVariables.value,
      createdBy: 'current-user',
      organizationId: 'current-org'
    }

    if (isEditing.value && route.params.id) {
      await landingPagesStore.updateLandingPage(route.params.id as string, pageData)
    } else {
      await landingPagesStore.createLandingPage(pageData)
    }

    router.push('/landing-pages')
  } catch (error) {
    console.error('Error saving page:', error)
  } finally {
    saving.value = false
  }
}

// Watchers
watch(() => form.value.title, (newTitle: string) => {
  if (!isEditing.value && newTitle) {
    form.value.slug = generateSlug(newTitle)
  }
})

watch(() => form.value.htmlContent, () => {
  if (showPreview.value) {
    nextTick(() => {
      updatePreview()
    })
  }
})

watch(showPreview, (newValue: boolean) => {
  if (newValue) {
    nextTick(() => {
      updatePreview()
    })
  }
})

// Lifecycle
onMounted(async () => {
  const pageId = route.params.id as string
  
  if (pageId) {
    isEditing.value = true
    await landingPagesStore.fetchLandingPages()
    const page = landingPagesStore.landingPages.find((p: any) => p.id === pageId)
    
    if (page) {
      form.value = {
        title: page.title,
        slug: page.slug,
        htmlContent: page.htmlContent,
        isPublished: page.isPublished,
        hasContactForm: page.hasContactForm,
        contactFormConfig: page.contactFormConfig || form.value.contactFormConfig
      }
    }
  }

  // Initialize preview if it's visible
  if (showPreview.value) {
    nextTick(() => {
      updatePreview()
    })
  }
})

// Cleanup on unmount
onUnmounted(() => {
  // Iframe cleanup is automatic when component unmounts
})
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.prose p {
  margin-bottom: 1em;
}
</style>