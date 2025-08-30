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
            @change="handleOrgChange"
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
          @click="fetchUsers(paginationMeta.current_page)"
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
                    v-for="role in (Array.isArray(user.roles) ? user.roles : [])"
                    :key="role"
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    {{ role }}
                  </span>
                  <span v-if="!Array.isArray(user.roles) || user.roles.length === 0" class="text-sm text-gray-500">
                    Sin roles
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
                  v-if="canDeleteUser(user)"
                  @click="deleteUser(user)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
                <span
                  v-else
                  class="text-gray-400 cursor-not-allowed"
                  title="No se puede eliminar el último super administrador"
                >
                  Eliminar
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="paginationMeta.last_page > 1" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando {{ ((paginationMeta.current_page - 1) * paginationMeta.per_page) + 1 }} a
            {{ Math.min(paginationMeta.current_page * paginationMeta.per_page, paginationMeta.total) }}
            de {{ paginationMeta.total }} usuarios
          </div>

          <div class="flex items-center space-x-2">
            <!-- Previous button -->
            <button
              @click="goToPage(paginationMeta.current_page - 1)"
              :disabled="paginationMeta.current_page <= 1"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <!-- Page numbers -->
            <div class="flex space-x-1">
              <template v-for="page in getVisiblePages()" :key="page">
                <button
                  v-if="page !== '...'"
                  @click="goToPage(page as number)"
                  :class="[
                    'px-3 py-2 text-sm font-medium rounded-md',
                    page === paginationMeta.current_page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                <span v-else class="px-3 py-2 text-sm text-gray-500">...</span>
              </template>
            </div>

            <!-- Next button -->
            <button
              @click="goToPage(paginationMeta.current_page + 1)"
              :disabled="paginationMeta.current_page >= paginationMeta.last_page"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
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
              v-model="userFormData.organization_id"
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
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Gestionar Roles - {{ selectedUser?.name }}
        </h3>
        
        <div v-if="loadingUserRoles" class="p-6 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Cargando roles del usuario...</p>
        </div>
        
        <div v-else class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">Roles Actuales</h4>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in (Array.isArray(selectedUser?.roles) ? selectedUser.roles : [])"
                :key="role"
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
              >
                {{ role }}
              </span>
              <span v-if="!Array.isArray(selectedUser?.roles) || selectedUser.roles.length === 0" class="text-sm text-gray-500">
                Sin roles asignados
              </span>
            </div>
          </div>
          
          <div class="border rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-3">Roles Disponibles</h4>
            <div class="grid grid-cols-1 gap-2">
              {{ systemRoles }}
              <div v-for="role in systemRoles" :key="role.name" class="flex items-center justify-between p-2 border rounded">
                <div class="flex items-center">
                  <input
                    :id="`role-${role.name}`"
                    v-model="selectedUserRoles"
                    :value="role.name"
                    type="checkbox"
                    :disabled="loadingUserRoles || saving"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  >
                  <label :for="`role-${role.name}`" class="ml-2 block text-sm text-gray-900 capitalize">
                    {{ role.name }}
                    <span v-if="role.description" class="text-gray-500 text-xs block">
                      {{ role.description }}
                    </span>
                  </label>
                </div>
                <div class="text-xs text-gray-500">
                  {{ role.permissions?.length || 0 }} permisos
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 pt-6 border-t mt-6">
          <button
            type="button"
            @click="closeRolesModal"
            class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveUserRoles"
            :disabled="saving || loadingUserRoles"
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
import { API_ENDPOINTS } from '../../utils/api'

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

interface Role {
  name: string
  description?: string
  permissions?: string[]
  users_count?: number
}

interface PaginationMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
  sort: string
  dir: string
  search: string
  include: string[]
}

const authStore = useAuthStore()


const users = ref<User[]>([])
const organizations = ref<Organization[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)

const selectedOrgId = ref('')
const searchTerm = ref('')

// Pagination state
const paginationMeta = ref<PaginationMeta>({
  total: 0,
  per_page: 25,
  current_page: 1,
  last_page: 1,
  sort: 'id',
  dir: 'desc',
  search: '',
  include: []
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showRolesModal = ref(false)
const editingUser = ref<User | null>(null)
const selectedUser = ref<User | null>(null)

const userFormData = ref({
  name: '',
  email: '',
  password: '',
  organization_id: '',
  active: true
})

const systemRoles = ref<Role[]>([])
const availableRoles = ref<string[]>([])
const selectedUserRoles = ref<string[]>([])
const loadingUserRoles = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    paginationMeta.value.current_page = 1 // Reset to first page on search
    fetchUsers(1)
  }, 500)
}

const fetchOrganizations = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.ORGANIZATIONS.LIST, {
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

const fetchUsers = async (page: number = 1) => {
  loading.value = true
  error.value = null
  
  try {
    const params = new URLSearchParams()
    if (selectedOrgId.value) params.append('organization_id', selectedOrgId.value)
    if (searchTerm.value) params.append('search', searchTerm.value)
    params.append('page', page.toString())
    params.append('per_page', paginationMeta.value.per_page.toString())

    const url = `https://api.boost.pitahayasoft.com/v1/auth/users${params.toString() ? '?' + params.toString() : ''}`
    
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

    // Update pagination metadata
    if (data.meta) {
      paginationMeta.value = {
        ...paginationMeta.value,
        ...data.meta
      }
    }
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
      ? `https://api.boost.pitahayasoft.com/v1/auth/users/${editingUser.value.id}`
      : 'https://api.boost.pitahayasoft.com/v1/auth/users'
    
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
    
    await fetchUsers(paginationMeta.value.current_page)
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
    organization_id: user.organization?.id || '',
    active: user.active
  }
  showEditModal.value = true
}

const deleteUser = async (user: User) => {
  // Double-check if user can be deleted
  if (!canDeleteUser(user)) {
    alert('No se puede eliminar el último super administrador del sistema.')
    return
  }
  
  if (!confirm(`¿Estás seguro de eliminar el usuario "${user.name}"?`)) {
    return
  }
  
  try {
    const response = await fetch(`https://api.boost.pitahayasoft.com/v1/auth/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Error al eliminar usuario')
    }
    
    await fetchUsers(paginationMeta.value.current_page)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar'
  }
}

const manageUserRoles = async (user: User) => {
  selectedUser.value = user
  // Safely handle user.roles - ensure it's always an array
  const userRoles = Array.isArray(user.roles) ? user.roles : []
  selectedUserRoles.value = [...userRoles]
  showRolesModal.value = true
  loadingUserRoles.value = true

  try {
    // Fetch current user roles from API
    const response = await fetch(API_ENDPOINTS.RBAC.GRANTS.user(user.id), {
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      // Extract roles from grants response
      const roles = data.data?.roles || data.roles || []
      selectedUserRoles.value = Array.isArray(roles) ? roles.map((r: any) => r.name || r) : []
    }
  } catch (err) {
    console.error('Error fetching user roles:', err)
    // Fallback to user.roles if API call fails - safely handle it
    selectedUserRoles.value = [...userRoles]
  } finally {
    loadingUserRoles.value = false
  }
}

const saveUserRoles = async () => {
  if (!selectedUser.value) return

  saving.value = true

  try {
    // Safely handle selectedUser.value.roles
    const originalRoles = Array.isArray(selectedUser.value.roles) ? selectedUser.value.roles : []
    const original = new Set<string>(originalRoles)
    const selected = new Set<string>(selectedUserRoles.value)

    const toAdd = Array.from(selected).filter(r => !original.has(r))
    const toRemove = Array.from(original).filter(r => !selected.has(r))

    const requests: Promise<Response>[] = [
      // Attach new roles to user
      ...toAdd.map(role =>
        fetch(API_ENDPOINTS.RBAC.ASSIGN.userRole(selectedUser.value!.id, role), {
          method: 'POST',
          headers: {
            'Authorization': authStore.authHeader || '',
            'Content-Type': 'application/json'
          }
        })
      ),
      // Detach removed roles from user
      ...toRemove.map(role =>
        fetch(API_ENDPOINTS.RBAC.ASSIGN.userRole(selectedUser.value!.id, role), {
          method: 'DELETE',
          headers: {
            'Authorization': authStore.authHeader || '',
            'Content-Type': 'application/json'
          }
        })
      )
    ]

    if (requests.length > 0) {
      const responses = await Promise.all(requests)
      const failed = responses.find(r => !r.ok)
      if (failed) {
        const msg = await failed.text().catch(() => '')
        throw new Error(`Error al actualizar roles: ${failed.status} ${msg}`)
      }
    }

    await fetchUsers(paginationMeta.value.current_page)
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
    organization_id: '',
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

// Function to check if a user can be deleted
const canDeleteUser = (user: User): boolean => {
  // Check if user has super admin role
  const userRoles = Array.isArray(user.roles) ? user.roles : []
  const isSuperAdmin = userRoles.some(role =>
    role.toLowerCase().includes('super') && role.toLowerCase().includes('admin')
  )
  
  if (!isSuperAdmin) {
    return true // Non-super admin users can always be deleted
  }
  
  // Count total super admin users
  const superAdminCount = users.value.filter(u => {
    const roles = Array.isArray(u.roles) ? u.roles : []
    return roles.some(role =>
      role.toLowerCase().includes('super') && role.toLowerCase().includes('admin')
    )
  }).length
  
  // Don't allow deletion if this is the last super admin
  return superAdminCount > 1
}

const fetchAvailableRoles = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.RBAC.ROLES, {
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      const data = await response.json()
      const list: Role[] = (data.data || data) as Role[]
      systemRoles.value = list
      availableRoles.value = list.map(r => r.name).sort()
    }
  } catch (err) {
    console.error('Error fetching roles:', err)
  }
}

// Pagination functions
const handleOrgChange = () => {
  paginationMeta.value.current_page = 1
  fetchUsers(1)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= paginationMeta.value.last_page) {
    paginationMeta.value.current_page = page
    fetchUsers(page)
  }
}

const getVisiblePages = (): (number | string)[] => {
  const current = paginationMeta.value.current_page
  const last = paginationMeta.value.last_page
  const pages: (number | string)[] = []

  if (last <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= last; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (current <= 4) {
      // Show pages 2-5 and ellipsis
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
    } else if (current >= last - 3) {
      // Show ellipsis and last 4 pages
      pages.push('...')
      for (let i = last - 4; i <= last - 1; i++) {
        pages.push(i)
      }
    } else {
      // Show ellipsis, current-1, current, current+1, ellipsis
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
    }

    // Always show last page (if not already shown)
    if (last > 1) {
      pages.push(last)
    }
  }

  return pages
}

onMounted(() => {
  fetchOrganizations()
  fetchUsers()
  fetchAvailableRoles()
})
</script>