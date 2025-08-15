<template>
  <Layout>
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isEditing ? 'Editar Organización' : 'Nueva Organización' }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ isEditing ? 'Modifica los datos y configuraciones de la organización' : 'Crea una nueva organización' }}
            </p>
          </div>
        </div>
        <div class="flex space-x-3">
          <button
            @click="goBack"
            class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveOrganization"
            :disabled="saving"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="saveOrganization" class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Información Básica</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de la organización"
              >
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción de la organización"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="formData.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@ejemplo.com"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+593 99 999 9999"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input
                v-model="formData.address"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección completa"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
              <input
                v-model="formData.city"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ciudad"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">País</label>
              <input
                v-model="formData.country"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="País"
              >
            </div>

            <div class="flex items-center">
              <input
                v-model="formData.active"
                type="checkbox"
                id="active"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label for="active" class="ml-2 block text-sm text-gray-900">
                Organización activa
              </label>
            </div>
          </div>
        </div>

        <!-- Meta/Facebook Integration -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-medium text-gray-900">Integración con Meta</h2>
              <p class="text-sm text-gray-600 mt-1">Configura la conexión con Facebook, WhatsApp e Instagram</p>
            </div>
            <button
              type="button"
              @click="showMetaConfig = !showMetaConfig"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {{ showMetaConfig ? 'Ocultar' : 'Mostrar' }} configuración
            </button>
          </div>

          <div v-show="showMetaConfig" class="space-y-6">
            <!-- Platform Toggles -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex items-center p-4 border border-gray-200 rounded-lg">
                <input
                  v-model="formData.meta_config.whatsapp_enabled"
                  type="checkbox"
                  id="whatsapp_enabled"
                  class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                >
                <label for="whatsapp_enabled" class="ml-3 flex items-center">
                  <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </label>
              </div>

              <div class="flex items-center p-4 border border-gray-200 rounded-lg">
                <input
                  v-model="formData.meta_config.facebook_enabled"
                  type="checkbox"
                  id="facebook_enabled"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label for="facebook_enabled" class="ml-3 flex items-center">
                  <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </label>
              </div>

              <div class="flex items-center p-4 border border-gray-200 rounded-lg">
                <input
                  v-model="formData.meta_config.instagram_enabled"
                  type="checkbox"
                  id="instagram_enabled"
                  class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                >
                <label for="instagram_enabled" class="ml-3 flex items-center">
                  <svg class="w-5 h-5 text-pink-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.875 2.026-1.297 3.323-1.297s2.448.422 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.404c-.49 0-.928-.422-.928-.928 0-.49.438-.928.928-.928.49 0 .928.438.928.928 0 .506-.438.928-.928.928zm-4.262 1.364c-1.297 0-2.346 1.049-2.346 2.346s1.049 2.346 2.346 2.346 2.346-1.049 2.346-2.346-1.049-2.346-2.346-2.346z"/>
                  </svg>
                  Instagram
                </label>
              </div>
            </div>

            <!-- Meta App Configuration -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">App ID</label>
                <input
                  v-model="formData.meta_config.app_id"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID de la aplicación de Meta"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">App Secret</label>
                <input
                  v-model="formData.meta_config.app_secret"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Secreto de la aplicación"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                <input
                  v-model="formData.meta_config.access_token"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Token de acceso"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Verify Token</label>
                <input
                  v-model="formData.meta_config.verify_token"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Token de verificación del webhook"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number ID (WhatsApp)</label>
                <input
                  v-model="formData.meta_config.phone_number_id"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID del número de teléfono de WhatsApp"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Business Account ID</label>
                <input
                  v-model="formData.meta_config.business_account_id"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID de la cuenta de negocio"
                >
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  v-model="formData.meta_config.webhook_url"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://tu-dominio.com/webhook"
                >
              </div>
            </div>

            <!-- Test Connection -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-medium text-gray-900">Probar Conexión</h3>
                  <p class="text-sm text-gray-600 mt-1">Verifica que la configuración sea correcta</p>
                </div>
                <button
                  type="button"
                  @click="testMetaConnection"
                  :disabled="testingConnection"
                  class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ testingConnection ? 'Probando...' : 'Probar' }}
                </button>
              </div>
              
              <div v-if="connectionTestResult" class="mt-3 p-3 rounded-lg" :class="[
                connectionTestResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                <p class="text-sm">{{ connectionTestResult.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '../../components/layout/Layout.vue'
import { useOrganizationsStore } from '../../stores/organizations'
import type { Organization, MetaConfig } from '../../types'

const route = useRoute()
const router = useRouter()
const organizationsStore = useOrganizationsStore()

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const showMetaConfig = ref(false)
const testingConnection = ref(false)
const connectionTestResult = ref<{ success: boolean; message: string } | null>(null)

const isEditing = ref(false)
const organizationId = ref<string | null>(null)

const formData = reactive({
  name: '',
  description: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  active: true,
  meta_config: {
    app_id: '',
    app_secret: '',
    access_token: '',
    verify_token: '',
    webhook_url: '',
    phone_number_id: '',
    business_account_id: '',
    whatsapp_enabled: false,
    facebook_enabled: false,
    instagram_enabled: false
  } as MetaConfig
})

const loadOrganization = async () => {
  if (!organizationId.value) return

  loading.value = true
  error.value = null

  try {
    const organization = await organizationsStore.fetchOrganizationById(organizationId.value)
    if (organization) {
      // Fill form with organization data
      formData.name = organization.name
      formData.description = organization.description || ''
      formData.email = organization.email || ''
      formData.phone = organization.phone || ''
      formData.address = organization.address || ''
      formData.city = organization.city || ''
      formData.country = organization.country || ''
      formData.active = organization.active

      // Fill Meta config if exists
      if (organization.meta_config) {
        Object.assign(formData.meta_config, organization.meta_config)
        showMetaConfig.value = true
      }
    } else {
      error.value = 'Organización no encontrada'
    }
  } catch (err) {
    error.value = 'Error al cargar la organización'
    console.error('Error loading organization:', err)
  } finally {
    loading.value = false
  }
}

const saveOrganization = async () => {
  saving.value = true
  error.value = null

  try {
    let success = false
    const organizationData = {
      name: formData.name,
      description: formData.description,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      active: formData.active,
      meta_config: formData.meta_config
    }

    if (isEditing.value && organizationId.value) {
      success = await organizationsStore.updateOrganization(organizationId.value, organizationData)
    } else {
      success = await organizationsStore.createOrganization(organizationData)
    }

    if (success) {
      router.push('/admin/organizations')
    } else {
      error.value = organizationsStore.error || 'Error al guardar la organización'
    }
  } catch (err) {
    error.value = 'Error al guardar la organización'
    console.error('Error saving organization:', err)
  } finally {
    saving.value = false
  }
}

const testMetaConnection = async () => {
  testingConnection.value = true
  connectionTestResult.value = null

  try {
    // Simulate connection test - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock result - replace with actual test logic
    const hasRequiredFields = !!(formData.meta_config.app_id && formData.meta_config.app_secret)
    
    connectionTestResult.value = {
      success: hasRequiredFields,
      message: hasRequiredFields
        ? 'Conexión exitosa con Meta'
        : 'Faltan campos requeridos (App ID y App Secret)'
    }
  } catch (err) {
    connectionTestResult.value = {
      success: false,
      message: 'Error al probar la conexión'
    }
  } finally {
    testingConnection.value = false
  }
}

const goBack = () => {
  router.push('/admin/organizations')
}

onMounted(() => {
  const id = route.params.id as string
  if (id && id !== 'new') {
    isEditing.value = true
    organizationId.value = id
    loadOrganization()
  }
})
</script>