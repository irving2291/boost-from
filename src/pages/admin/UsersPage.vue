<template>
  <Layout>
    <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p class="text-gray-600 mt-1">Administra los usuarios por organización</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Nuevo Usuario
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-64">
          <label class="block text-sm font-medium text-gray-700 mb-1">Organización</label>
          <select
            v-model="selectedOrgId"
            @change="fetchUsers"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las organizaciones</option>
            <option v-for="org in organizations" :key="org.id" :value="org.id">
              {{ org.name }}
            </option>
          </select>
        </div>
        <div class="flex-1 min-w-64">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="searchTerm"
            @input="debouncedSearch"
            type="text"
            placeholder="Buscar por nombre o email..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Usuarios</h2>
      </div>
      
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Cargando usuarios...</p>
      </div>

      <div v-else-if="error" class="p-6 text-center text-red-600">
        <p>Error al cargar usuarios: {{ error }}</p>
        <button 
          @click="fetchUsers"
          class="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Reintentar
        </button>
      </div>

      <div v-else-if="users.length === 0" class="p-6 text-center text-gray-500">
        <p>No hay usuarios registrados</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organización
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Roles
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último acceso
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ user.organization?.name || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="role in user.roles"
                    :key="role"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    {{ role }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ user.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.last_login ? formatDate(user.last_login) : 'Nunca' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  @click="editUser(user)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Editar
                </button>
                <button
                  @click="manageUserRoles(user)"
                  class="text-green-600 hover:text-green-900"
                >
                  Roles
                </button>
                <button
                  @click="deleteUser(user)"
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

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ showEditModal ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h3>
        
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              v-model="userFormData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="userFormData.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          
          <div v-if="!showEditModal">
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              v-model="userFormData.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Organización</label>
            <select
              v-model="userFormData.org_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar organización</option>
              <option v-for="org in organizations" :key="org.id" :value="org.id">
                {{ org.name }}
              </option>
            </select>
          </div>
          
          <div class="flex items-center">
            <input
              v-model="userFormData.active"
              type="checkbox"
              id="userActive"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label for="userActive" class="ml-2 block text-sm text-gray-900">
              Usuario activo
            </label>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeUserModal"
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

    <!-- Roles Management Modal -->
    <div v-if="showRolesModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Gestionar Roles - {{ selectedUser?.name }}
        </h3>
        
        <div class="space-y-3">
          <div v-for="role in availableRoles" :key="role" class="flex items-center">
            <input
              :id="`role-${role}`"
              v-model="selectedUserRoles"
              :value="role"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label :for="`role-${role}`" class="ml-2 block text-sm text-gray-900 capitalize">
              {{ role }}
            </label>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            @click="closeRolesModal"
            class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveUserRoles"
            :disabled="saving"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : 'Guardar Roles' }}
          </button>
        </div>
      </div>
    </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Layout from '../../components/layout/Layout.vue'
import { useAuthStore } from '../../stores/auth'

interface User {
  id: string
  name: string
  email: string
  active: boolean
  roles: string[]
  permissions: string[]
  organization?: {
    id: string
    name: string
  }
  last_login?: string
}

interface Organization {
  id: string
  name: string
}

const authStore = useAuthStore()

const users = ref<User[]>([])
const organizations = ref<Organization[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)

const selectedOrgId = ref('')
const searchTerm = ref('')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showRolesModal = ref(false)
const editingUser = ref<User | null>(null)
const selectedUser = ref<User | null>(null)

const userFormData = ref({
  name: '',
  email: '',
  password: '',
  org_id: '',
  active: true
})

const availableRoles = ref(['admin', 'user', 'manager', 'viewer'])
const selectedUserRoles = ref<string[]>([])

let searchTimeout: number | null = null

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    fetchUsers()
  }, 500)
}

const fetchOrganizations = async () => {
  try {
    const response = await fetch('https://boost.pitahayasoft.com/api/v1/auth/organizations', {
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      organizations.value = data.data || data
    }
  } catch (err) {
    console.error('Error fetching organizations:', err)
  }
}

const fetchUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params = new URLSearchParams()
    if (selectedOrgId.value) params.append('org_id', selectedOrgId.value)
    if (searchTerm.value) params.append('search', searchTerm.value)
    
    const url = `https://boost.pitahayasoft.com/api/v1/auth/users${params.toString() ? '?' + params.toString() : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Error al cargar usuarios')
    }
    
    const data = await response.json()
    users.value = data.data || data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
}

const saveUser = async () => {
  saving.value = true
  
  try {
    const url = editingUser.value 
      ? `https://boost.pitahayasoft.com/api/v1/auth/users/${editingUser.value.id}`
      : 'https://boost.pitahayasoft.com/api/v1/auth/users'
    
    const method = editingUser.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userFormData.value)
    })
    
    if (!response.ok) {
      throw new Error('Error al guardar usuario')
    }
    
    await fetchUsers()
    closeUserModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al guardar'
  } finally {
    saving.value = false
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  userFormData.value = {
    name: user.name,
    email: user.email,
    password: '',
    org_id: user.organization?.id || '',
    active: user.active
  }
  showEditModal.value = true
}

const deleteUser = async (user: User) => {
  if (!confirm(`¿Estás seguro de eliminar el usuario "${user.name}"?`)) {
    return
  }
  
  try {
    const response = await fetch(`https://boost.pitahayasoft.com/api/v1/auth/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Error al eliminar usuario')
    }
    
    await fetchUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar'
  }
}

const manageUserRoles = (user: User) => {
  selectedUser.value = user
  selectedUserRoles.value = [...user.roles]
  showRolesModal.value = true
}

const saveUserRoles = async () => {
  if (!selectedUser.value) return
  
  saving.value = true
  
  try {
    const response = await fetch(`https://boost.pitahayasoft.com/api/v1/auth/users/${selectedUser.value.id}/roles`, {
      method: 'PUT',
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roles: selectedUserRoles.value })
    })
    
    if (!response.ok) {
      throw new Error('Error al actualizar roles')
    }
    
    await fetchUsers()
    closeRolesModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al actualizar roles'
  } finally {
    saving.value = false
  }
}

const closeUserModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingUser.value = null
  userFormData.value = {
    name: '',
    email: '',
    password: '',
    org_id: '',
    active: true
  }
}

const closeRolesModal = () => {
  showRolesModal.value = false
  selectedUser.value = null
  selectedUserRoles.value = []
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
  fetchUsers()
})
</script>