<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowLeft, PhBuilding, PhUser, PhCheck } from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
import { useAccountsStore } from '../stores/accounts'
import type { CreateAccountRequest } from '../types'

const router = useRouter()
const accountsStore = useAccountsStore()

// Form state
const loading = ref(false)
const errors = ref<Record<string, string>>({})

const form = reactive<CreateAccountRequest>({
  type: 'person',
  firstName: '',
  lastName: '',
  companyName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  website: '',
  industry: '',
  source: '',
  tags: [],
  priority: 'medium',
  assignedTo: '',
  potentialValue: 0,
  notes: ''
})

// Methods
const goBack = () => {
  router.push('/accounts')
}

const validateForm = () => {
  errors.value = {}
  
  if (!form.email) {
    errors.value.email = 'El email es requerido'
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.value.email = 'El email no es válido'
  }
  
  if (!form.phone) {
    errors.value.phone = 'El teléfono es requerido'
  }
  
  if (form.type === 'person') {
    if (!form.firstName) {
      errors.value.firstName = 'El nombre es requerido'
    }
    if (!form.lastName) {
      errors.value.lastName = 'El apellido es requerido'
    }
  } else {
    if (!form.companyName) {
      errors.value.companyName = 'El nombre de la empresa es requerido'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    await accountsStore.createAccount(form)
    router.push('/accounts')
  } catch (error) {
    console.error('Error creating account:', error)
  } finally {
    loading.value = false
  }
}

const addTag = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const input = event.target as HTMLInputElement
    const tag = input.value.trim()
    if (tag && !form.tags?.includes(tag)) {
      form.tags?.push(tag)
      input.value = ''
    }
  }
}

const removeTag = (tagToRemove: string) => {
  form.tags = form.tags?.filter(tag => tag !== tagToRemove) || []
}
</script>

<template>
  <Layout>
    <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <button
          @click="goBack"
          class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <PhArrowLeft :size="16" class="mr-2" />
          Volver
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Nueva Cuenta</h1>
          <p class="text-gray-600 mt-1">Crear una nueva cuenta de cliente o prospecto</p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Account Type -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Tipo de Cuenta</h2>
        <div class="grid grid-cols-2 gap-4">
          <label class="relative">
            <input
              v-model="form.type"
              type="radio"
              value="person"
              class="sr-only"
            />
            <div
              :class="[
                'border-2 rounded-lg p-4 cursor-pointer transition-colors',
                form.type === 'person'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              ]"
            >
              <div class="flex items-center space-x-3">
                <PhUser :size="24" :class="form.type === 'person' ? 'text-blue-600' : 'text-gray-400'" />
                <div>
                  <h3 class="font-medium text-gray-900">Persona</h3>
                  <p class="text-sm text-gray-600">Cliente individual</p>
                </div>
              </div>
            </div>
          </label>
          
          <label class="relative">
            <input
              v-model="form.type"
              type="radio"
              value="company"
              class="sr-only"
            />
            <div
              :class="[
                'border-2 rounded-lg p-4 cursor-pointer transition-colors',
                form.type === 'company'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              ]"
            >
              <div class="flex items-center space-x-3">
                <PhBuilding :size="24" :class="form.type === 'company' ? 'text-blue-600' : 'text-gray-400'" />
                <div>
                  <h3 class="font-medium text-gray-900">Empresa</h3>
                  <p class="text-sm text-gray-600">Cliente corporativo</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Basic Information -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Información Básica</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Person fields -->
          <template v-if="form.type === 'person'">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                v-model="form.firstName"
                type="text"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                ]"
                placeholder="Ingresa el nombre"
              />
              <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                v-model="form.lastName"
                type="text"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                ]"
                placeholder="Ingresa el apellido"
              />
              <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
            </div>
          </template>
          
          <!-- Company fields -->
          <template v-else>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                v-model="form.companyName"
                type="text"
                :class="[
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                ]"
                placeholder="Ingresa el nombre de la empresa"
              />
              <p v-if="errors.companyName" class="mt-1 text-sm text-red-600">{{ errors.companyName }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Industria
              </label>
              <input
                v-model="form.industry"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Tecnología, Salud, etc."
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                v-model="form.website"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://ejemplo.com"
              />
            </div>
          </template>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              v-model="form.email"
              type="email"
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                errors.email ? 'border-red-500' : 'border-gray-300'
              ]"
              placeholder="correo@ejemplo.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              v-model="form.phone"
              type="tel"
              :class="[
                'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                errors.phone ? 'border-red-500' : 'border-gray-300'
              ]"
              placeholder="+593 99 999 9999"
            />
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
          </div>
        </div>
      </div>

      <!-- Address Information -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Información de Ubicación</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              v-model="form.address"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dirección completa"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
            <input
              v-model="form.city"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ciudad"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              País
            </label>
            <input
              v-model="form.country"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="País"
            />
          </div>
        </div>
      </div>

      <!-- CRM Information -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Información CRM</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <select
              v-model="form.priority"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fuente
            </label>
            <input
              v-model="form.source"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Referido, Web, Redes Sociales"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Valor Potencial
            </label>
            <input
              v-model.number="form.potentialValue"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <input
              type="text"
              @keydown="addTag"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Presiona Enter para agregar etiquetas"
            />
            <div v-if="form.tags && form.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(tag)"
                  class="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Notas adicionales sobre la cuenta..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end space-x-4">
        <button
          type="button"
          @click="goBack"
          class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PhCheck v-if="!loading" :size="16" class="mr-2" />
          <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {{ loading ? 'Creando...' : 'Crear Cuenta' }}
        </button>
      </div>
    </form>
    </div>
  </Layout>
</template>