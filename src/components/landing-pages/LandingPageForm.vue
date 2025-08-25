<template>
  <div class="space-y-6">
    <!-- Basic Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('landingPages.title') }} *
        </label>
        <input
          v-model="form.title"
          type="text"
          :placeholder="t('landingPages.titlePlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('landingPages.slug') }} *
        </label>
        <input
          v-model="form.slug"
          type="text"
          :placeholder="t('landingPages.slugPlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p class="text-xs text-gray-500 mt-1">
          {{ t('landingPages.slugHelp') }}
        </p>
      </div>
    </div>

    <!-- HTML Content -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ t('landingPages.htmlContent') }} *
      </label>
      <div class="border border-gray-300 rounded-lg overflow-hidden">
        <div class="bg-gray-50 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
          <span class="text-sm text-gray-600">{{ t('landingPages.htmlEditor') }}</span>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              @click="showPreview = !showPreview"
              :class="[
                'px-3 py-1 text-xs rounded-md transition-colors',
                showPreview
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ showPreview ? t('landingPages.hidePreview') : t('landingPages.showPreview') }}
            </button>
          </div>
        </div>
        
        <div class="grid" :class="showPreview ? 'grid-cols-2' : 'grid-cols-1'">
          <!-- HTML Editor -->
          <div class="relative">
            <textarea
              v-model="form.htmlContent"
              :placeholder="t('landingPages.htmlPlaceholder')"
              class="w-full h-96 p-4 font-mono text-sm border-0 focus:outline-none focus:ring-0 resize-none"
              required
            ></textarea>
          </div>
          
          <!-- Preview -->
          <div v-if="showPreview" class="border-l border-gray-300 bg-white">
            <div class="h-96 overflow-auto p-4">
              <div v-html="form.htmlContent" class="prose max-w-none"></div>
            </div>
          </div>
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-1">
        {{ t('landingPages.htmlHelp') }}
      </p>
    </div>

    <!-- Contact Form Configuration -->
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-900">{{ t('landingPages.contactForm') }}</h3>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('landingPages.formTitle') }}
            </label>
            <input
              v-model="form.contactFormConfig.title"
              type="text"
              :placeholder="t('landingPages.formTitlePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('landingPages.submitButtonText') }}
            </label>
            <input
              v-model="form.contactFormConfig.submitButtonText"
              type="text"
              :placeholder="t('landingPages.submitButtonPlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('landingPages.formDescription') }}
          </label>
          <textarea
            v-model="form.contactFormConfig.description"
            :placeholder="t('landingPages.formDescriptionPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('landingPages.successMessage') }}
          </label>
          <textarea
            v-model="form.contactFormConfig.successMessage"
            :placeholder="t('landingPages.successMessagePlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
          ></textarea>
        </div>

        <!-- Form Fields Preview -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('landingPages.formFields') }}
          </label>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">{{ t('landingPages.defaultFields') }}:</p>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• {{ t('landingPages.firstName') }} ({{ t('common.required') }})</li>
              <li>• {{ t('landingPages.lastName') }} ({{ t('common.required') }})</li>
              <li>• {{ t('landingPages.email') }} ({{ t('common.required') }})</li>
              <li>• {{ t('landingPages.phone') }} ({{ t('common.optional') }})</li>
              <li>• {{ t('landingPages.message') }} ({{ t('common.required') }})</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Publishing Options -->
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <h3 class="text-sm font-medium text-gray-900">{{ t('landingPages.publishingOptions') }}</h3>
        <p class="text-xs text-gray-500">{{ t('landingPages.publishingHelp') }}</p>
      </div>
      <label class="flex items-center">
        <input
          v-model="form.isPublished"
          type="checkbox"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="ml-2 text-sm text-gray-700">{{ t('landingPages.publishImmediately') }}</span>
      </label>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        type="button"
        @click="handleSave"
        :disabled="!isFormValid"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { LandingPage, ContactFormConfig } from '../../types/landing-pages'

const { t } = useI18n()

interface Props {
  page?: LandingPage | null
}

interface Emits {
  (e: 'save', data: Partial<LandingPage>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive data
const showPreview = ref(false)

const form = ref({
  title: '',
  slug: '',
  htmlContent: '',
  isPublished: false,
  hasContactForm: true,
  contactFormConfig: {
    title: 'Formulario de Contacto',
    description: 'Déjanos tus datos y te contactaremos pronto',
    submitButtonText: 'Enviar Mensaje',
    successMessage: '¡Gracias! Hemos recibido tu mensaje y te contactaremos pronto.',
    fields: [
      {
        id: 'firstName',
        name: 'firstName',
        label: 'Nombre',
        type: 'text' as const,
        required: true,
        placeholder: 'Tu nombre'
      },
      {
        id: 'lastName',
        name: 'lastName',
        label: 'Apellido',
        type: 'text' as const,
        required: true,
        placeholder: 'Tu apellido'
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        required: true,
        placeholder: 'tu@email.com'
      },
      {
        id: 'phone',
        name: 'phone',
        label: 'Teléfono',
        type: 'phone' as const,
        required: false,
        placeholder: '+593 99 999 9999'
      },
      {
        id: 'message',
        name: 'message',
        label: 'Mensaje',
        type: 'textarea' as const,
        required: true,
        placeholder: 'Cuéntanos en qué podemos ayudarte'
      }
    ]
  } as ContactFormConfig
})

// Computed properties
const isFormValid = computed(() => {
  return form.value.title.trim() !== '' &&
         form.value.slug.trim() !== '' &&
         form.value.htmlContent.trim() !== ''
})

// Methods
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const handleSave = () => {
  if (!isFormValid.value) return

  const data: Partial<LandingPage> = {
    title: form.value.title.trim(),
    slug: form.value.slug.trim(),
    htmlContent: form.value.htmlContent.trim(),
    isPublished: form.value.isPublished,
    hasContactForm: form.value.hasContactForm,
    contactFormConfig: form.value.hasContactForm ? form.value.contactFormConfig : undefined,
    createdBy: 'current-user', // This should come from auth store
    organizationId: 'current-org' // This should come from organization store
  }

  emit('save', data)
}

// Watchers
watch(() => form.value.title, (newTitle) => {
  if (!props.page && newTitle) {
    form.value.slug = generateSlug(newTitle)
  }
})

// Initialize form with existing page data
onMounted(() => {
  if (props.page) {
    form.value = {
      title: props.page.title,
      slug: props.page.slug,
      htmlContent: props.page.htmlContent,
      isPublished: props.page.isPublished,
      hasContactForm: props.page.hasContactForm,
      contactFormConfig: props.page.contactFormConfig || form.value.contactFormConfig
    }
  }
})
</script>