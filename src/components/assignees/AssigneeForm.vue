<template>
  <div class="assignee-form">
    <form @submit.prevent="saveAssignee" class="space-y-6">
      <!-- Basic Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            v-model="form.firstName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el nombre"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Apellido *
          </label>
          <input
            v-model="form.lastName"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingrese el apellido"
          />
        </div>
      </div>

      <!-- Contact Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+593 99 999 9999"
          />
        </div>
      </div>

      <!-- Role and Department -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Rol *
          </label>
          <select
            v-model="form.role"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar rol...</option>
            <option value="admin">Administrador</option>
            <option value="manager">Gerente</option>
            <option value="sales">Ventas</option>
            <option value="support">Soporte</option>
            <option value="analyst">Analista</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Departamento
          </label>
          <select
            v-model="form.department"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar departamento...</option>
            <option value="sales">Ventas</option>
            <option value="marketing">Marketing</option>
            <option value="support">Soporte</option>
            <option value="operations">Operaciones</option>
            <option value="finance">Finanzas</option>
            <option value="hr">Recursos Humanos</option>
            <option value="it">Tecnología</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>

      <!-- Avatar URL -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          URL del Avatar
        </label>
        <input
          v-model="form.avatar"
          type="url"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://ejemplo.com/avatar.jpg"
        />
      </div>

      <!-- Active Status -->
      <div class="flex items-center">
        <input
          v-model="form.active"
          type="checkbox"
          id="active"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="active" class="ml-2 text-sm text-gray-700">
          Usuario activo
        </label>
        <p class="text-xs text-gray-500 ml-2">Los usuarios inactivos no podrán ser asignados a nuevas peticiones</p>
      </div>

      <!-- User Search Integration -->
      <div v-if="!isEditing" class="border-t pt-6">
        <h4 class="text-lg font-medium text-gray-900 mb-4">Buscar Usuario Existente</h4>
        <p class="text-sm text-gray-600 mb-4">
          Si el usuario ya existe en el sistema, puedes buscarlo y seleccionar para crear el responsable:
        </p>
        <UserSearch
          v-model="selectedUser"
          placeholder="Buscar usuario por nombre, email o rol..."
          @user-selected="onUserSelected"
        />
        <div v-if="selectedUser" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-blue-600">
                  {{ getUserInitials(selectedUser) }}
                </span>
              </div>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ selectedUser.firstName }} {{ selectedUser.lastName }}
              </p>
              <p class="text-sm text-gray-500">{{ selectedUser.email }}</p>
              <p class="text-sm text-gray-500">{{ selectedUser.role }}</p>
            </div>
            <button
              type="button"
              @click="clearSelectedUser"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="!isFormValid || loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isEditing ? 'Actualizar' : 'Crear' }} Responsable
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UserSearch from '../ui/UserSearch.vue'
import type { Assignee } from '../../types'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  active: boolean
  role: string
  department: string
}

interface Props {
  assignee?: Assignee | null
  loading?: boolean
}

interface Emits {
  (e: 'save', assignee: Omit<Assignee, 'id' | 'createdAt' | 'updatedAt'>): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  assignee: null,
  loading: false
})

const emit = defineEmits<Emits>()

// Form data
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: '',
  active: true,
  role: '',
  department: ''
})

// User search integration
const selectedUser = ref<Assignee | null>(null)

// Computed
const isEditing = computed(() => !!props.assignee)

const isFormValid = computed(() => {
  return form.value.firstName.trim() !== '' &&
         form.value.lastName.trim() !== '' &&
         form.value.email.trim() !== '' &&
         form.value.role !== ''
})

// Methods
const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    active: true,
    role: '',
    department: ''
  }
  selectedUser.value = null
}

const loadAssignee = (assignee: Assignee) => {
  form.value = {
    firstName: assignee.firstName,
    lastName: assignee.lastName,
    email: assignee.email,
    phone: assignee.phone || '',
    avatar: assignee.avatar || '',
    active: assignee.active,
    role: assignee.role,
    department: assignee.department || ''
  }
}

const onUserSelected = (user: Assignee) => {
  selectedUser.value = user
  // Pre-fill form with selected user data
  form.value.firstName = user.firstName
  form.value.lastName = user.lastName
  form.value.email = user.email
  form.value.phone = user.phone || ''
  form.value.avatar = user.avatar || ''
  form.value.role = user.role
  form.value.department = user.department || ''
  form.value.active = user.active
}

const clearSelectedUser = () => {
  selectedUser.value = null
  resetForm()
}

const getUserInitials = (user: Assignee): string => {
  const first = user.firstName?.charAt(0).toUpperCase() || ''
  const last = user.lastName?.charAt(0).toUpperCase() || ''
  return first + last || 'U'
}

const saveAssignee = () => {
  if (!isFormValid.value) return

  const assigneeData = {
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim(),
    email: form.value.email.trim(),
    phone: form.value.phone?.trim() || undefined,
    avatar: form.value.avatar?.trim() || undefined,
    active: form.value.active,
    role: form.value.role,
    department: form.value.department?.trim() || undefined
  }

  emit('save', assigneeData)
}

// Watchers
watch(() => props.assignee, (assignee: Assignee | null) => {
  if (assignee) {
    loadAssignee(assignee)
  } else {
    resetForm()
  }
}, { immediate: true })
</script>