<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Organizaciones</h1>
        <p class="text-gray-600 mt-1">Administra las organizaciones del sistema</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Nueva Organización
      </button>
    </div>

    <!-- Organizations Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Organizaciones</h2>
      </div>
      
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Cargando organizaciones...</p>
      </div>

      <div v-else-if="error" class="p-6 text-center text-red-600">
        <p>Error al cargar organizaciones: {{ error }}</p>
        <button 
          @click="fetchOrganizations"
          class="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Reintentar
        </button>
      </div>

      <div v-else-if="organizations.length === 0" class="p-6 text-center text-gray-500">
        <p>No hay organizaciones registradas</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuarios
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="org in organizations" :key="org.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ org.name }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ org.description || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  org.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ org.active ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ org.users_count || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(org.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  @click="editOrganization(org)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
                <button
                  @click="deleteOrganization(org)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ showEditModal ? 'Editar Organización' : 'Nueva Organización' }}
        </h3>
        
        <form @submit.prevent="saveOrganization" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
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
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'

interface Organization {
  id: string
  name: string
  description?: string
  active: boolean
  users_count?: number
  created_at: string
}

const authStore = useAuthStore()

const organizations = ref<Organization[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingOrg = ref<Organization | null>(null)

const formData = ref({
  name: '',
  description: '',
  active: true
})

const fetchOrganizations = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('https://boost.pitahayasoft.com/auth/organizations', {
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
  } finally {
    loading.value = false
  }
}

const saveOrganization = async () => {
  saving.value = true
  
  try {
    const url = editingOrg.value 
      ? `https://boost.pitahayasoft.com/auth/organizations/${editingOrg.value.id}`
      : 'https://boost.pitahayasoft.com/auth/organizations'
    
    const method = editingOrg.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData.value)
    })
    
    if (!response.ok) {
      throw new Error('Error al guardar organización')
    }
    
    await fetchOrganizations()
    closeModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al guardar'
  } finally {
    saving.value = false
  }
}

const editOrganization = (org: Organization) => {
  editingOrg.value = org
  formData.value = {
    name: org.name,
    description: org.description || '',
    active: org.active
  }
  showEditModal.value = true
}

const deleteOrganization = async (org: Organization) => {
  if (!confirm(`¿Estás seguro de eliminar la organización "${org.name}"?`)) {
    return
  }
  
  try {
    const response = await fetch(`https://boost.pitahayasoft.com/auth/organizations/${org.id}`, {
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
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar'
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingOrg.value = null
  formData.value = {
    name: '',
    description: '',
    active: true
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchOrganizations()
})
</script>