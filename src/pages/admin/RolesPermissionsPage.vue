<template>
  <Layout>
    <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Roles y Permisos</h1>
        <p class="text-gray-600 mt-1">Gestiona roles y permisos del sistema</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'roles'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'roles'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Roles
        </button>
        <button
          @click="activeTab = 'permissions'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === 'permissions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          Permisos
        </button>
      </nav>
    </div>

    <!-- Roles Tab -->
    <div v-if="activeTab === 'roles'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">Gestión de Roles</h2>
        <button
          @click="showCreateRoleModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Nuevo Rol
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loadingRoles" class="p-6 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Cargando roles...</p>
        </div>

        <div v-else-if="roles.length === 0" class="p-6 text-center text-gray-500">
          <p>No hay roles configurados</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permisos
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuarios
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="role in roles" :key="role.name" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 capitalize">{{ role.name }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ role.description || '-' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="permission in getRolePermissionsPreview(role)"
                      :key="permission"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                    >
                      {{ permission }}
                    </span>
                    <span
                      v-if="getRolePermissionCount(role) > 3"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
                    >
                      +{{ getRolePermissionCount(role) - 3 }} más
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ role.users_count || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    @click="editRole(role)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    @click="manageRolePermissions(role)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Permisos
                  </button>
                  <button
                    v-if="!['admin', 'super-admin'].includes(role.name)"
                    @click="deleteRole(role)"
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
    </div>

    <!-- Permissions Tab -->
    <div v-if="activeTab === 'permissions'" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-900">Gestión de Permisos</h2>
        <button
          @click="showCreatePermissionModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Nuevo Permiso
        </button>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loadingPermissions" class="p-6 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-2 text-gray-600">Cargando permisos...</p>
        </div>

        <div v-else-if="permissions.length === 0" class="p-6 text-center text-gray-500">
          <p>No hay permisos configurados</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permiso
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="permission in permissions" :key="permission.name" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ permission.name }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ permission.description || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {{ permission.category || 'General' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="role in permission.roles"
                      :key="role"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {{ role }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    @click="editPermission(permission)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    @click="deletePermission(permission)"
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
    </div>

    <!-- Create/Edit Role Modal -->
    <div v-if="showCreateRoleModal || showEditRoleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ showEditRoleModal ? 'Editar Rol' : 'Nuevo Rol' }}
        </h3>
        
        <form @submit.prevent="saveRole" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
            <input
              v-model="roleFormData.name"
              type="text"
              required
              :disabled="showEditRoleModal"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              v-model="roleFormData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeRoleModal"
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

    <!-- Create/Edit Permission Modal -->
    <div v-if="showCreatePermissionModal || showEditPermissionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ showEditPermissionModal ? 'Editar Permiso' : 'Nuevo Permiso' }}
        </h3>
        
        <form @submit.prevent="savePermission" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Permiso</label>
            <input
              v-model="permissionFormData.name"
              type="text"
              required
              :disabled="showEditPermissionModal"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              v-model="permissionFormData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <input
              v-model="permissionFormData.category"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closePermissionModal"
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

    <!-- Role Permissions Modal -->
    <div v-if="showRolePermissionsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Permisos del Rol - {{ selectedRole?.name }}
        </h3>
        
        <div class="space-y-4">
          <div v-if="loadingRoleGrants" class="p-6 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-2 text-gray-600">Cargando permisos del rol...</p>
          </div>
          <template v-else>
            <div v-for="category in permissionCategories" :key="category" class="border rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3 capitalize">{{ category }}</h4>
              <div class="grid grid-cols-1 gap-2">
                <div
                  v-for="permission in getPermissionsByCategory(category)"
                  :key="permission.name"
                  class="flex items-center"
                >
                  <input
                    :id="`perm-${permission.name}`"
                    v-model="selectedRolePermissions"
                    :value="permission.name"
                    type="checkbox"
                    :disabled="loadingRoleGrants || saving"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  >
                  <label :for="`perm-${permission.name}`" class="ml-2 block text-sm text-gray-900">
                    {{ permission.name }}
                    <span v-if="permission.description" class="text-gray-500">
                      - {{ permission.description }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </template>
        </div>
        
        <div class="flex justify-end space-x-3 pt-6 border-t mt-6">
          <button
            type="button"
            @click="closeRolePermissionsModal"
            class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveRolePermissions"
            :disabled="saving || loadingRoleGrants"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {{ saving ? 'Guardando...' : 'Guardar Permisos' }}
          </button>
        </div>
      </div>
    </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Layout from '../../components/layout/Layout.vue'
import { useAuthStore } from '../../stores/auth'
import { API_ENDPOINTS } from '../../utils/api'

interface Role {
  name: string
  description?: string
  permissions: string[]
  users_count?: number
}

interface Permission {
  name: string
  description?: string
  category?: string
  roles: string[]
}

const authStore = useAuthStore()

const activeTab = ref<'roles' | 'permissions'>('roles')

const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const loadingRoles = ref(false)
const loadingPermissions = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)

const showCreateRoleModal = ref(false)
const showEditRoleModal = ref(false)
const showCreatePermissionModal = ref(false)
const showEditPermissionModal = ref(false)
const showRolePermissionsModal = ref(false)

const editingRole = ref<Role | null>(null)
const editingPermission = ref<Permission | null>(null)
const selectedRole = ref<Role | null>(null)

const roleFormData = ref({
  name: '',
  description: ''
})

const permissionFormData = ref({
  name: '',
  description: '',
  category: ''
})

const selectedRolePermissions = ref<string[]>([])
const loadingRoleGrants = ref(false)

const permissionCategories = computed(() => {
  const categories = new Set(permissions.value.map(p => p.category || 'General'))
  return Array.from(categories).sort()
})

const getPermissionsByCategory = (category: string) => {
  return permissions.value.filter(p => (p.category || 'General') === category)
}

// Helpers to safely handle roles that may not include permissions array
const getRolePermissionCount = (role: Role): number => {
  const perms = (role as any)?.permissions
  return Array.isArray(perms) ? perms.length : 0
}

const getRolePermissionsPreview = (role: Role): string[] => {
  const perms = (role as any)?.permissions
  return Array.isArray(perms) ? perms.slice(0, 3) : []
}

// Extract ability names from variable grant payload shapes
const extractAbilityNamesFromGrants = (payload: any): string[] => {
  const data = payload?.data ?? payload
  if (!data) return []
  // Direct array of strings
  if (Array.isArray(data) && data.every((i: any) => typeof i === 'string')) return data

  const abilities = data.abilities ?? data.permissions ?? data
  if (Array.isArray(abilities)) {
    if (abilities.every((i: any) => typeof i === 'string')) return abilities
    return abilities
      .map((a: any) => a?.name ?? a?.ability ?? a?.slug ?? (typeof a === 'string' ? a : null))
      .filter((n: any) => typeof n === 'string') as string[]
  }
  return []
}

const fetchRoles = async () => {
  loadingRoles.value = true
  
  try {
    const response = await fetch(API_ENDPOINTS.RBAC.ROLES, {
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Error al cargar roles')
    }
    
    const data = await response.json()
    roles.value = data.data || data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loadingRoles.value = false
  }
}

const fetchPermissions = async () => {
  loadingPermissions.value = true
  
  try {
    const response = await fetch(API_ENDPOINTS.RBAC.ABILITIES, {
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Error al cargar permisos')
    }
    
    const data = await response.json()
    permissions.value = data.data || data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido'
  } finally {
    loadingPermissions.value = false
  }
}

const saveRole = async () => {
  saving.value = true
  
  try {
    const url = editingRole.value
      ? `${API_ENDPOINTS.RBAC.ROLES}/${editingRole.value.name}`
      : API_ENDPOINTS.RBAC.ROLES
    
    const method = editingRole.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(roleFormData.value)
    })
    
    if (!response.ok) {
      throw new Error('Error al guardar rol')
    }
    
    await fetchRoles()
    closeRoleModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al guardar'
  } finally {
    saving.value = false
  }
}

const savePermission = async () => {
  saving.value = true
  
  try {
    const url = editingPermission.value
      ? `${API_ENDPOINTS.RBAC.ABILITIES}/${editingPermission.value.name}`
      : API_ENDPOINTS.RBAC.ABILITIES
    
    const method = editingPermission.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(permissionFormData.value)
    })
    
    if (!response.ok) {
      throw new Error('Error al guardar permiso')
    }
    
    await fetchPermissions()
    closePermissionModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al guardar'
  } finally {
    saving.value = false
  }
}

const editRole = (role: Role) => {
  editingRole.value = role
  roleFormData.value = {
    name: role.name,
    description: role.description || ''
  }
  showEditRoleModal.value = true
}

const editPermission = (permission: Permission) => {
  editingPermission.value = permission
  permissionFormData.value = {
    name: permission.name,
    description: permission.description || '',
    category: permission.category || ''
  }
  showEditPermissionModal.value = true
}

const deleteRole = async (role: Role) => {
  if (!confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
    return
  }
  
  try {
    const response = await fetch(`${API_ENDPOINTS.RBAC.ROLES}/${role.name}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Error al eliminar rol')
    }
    
    await fetchRoles()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar'
  }
}

const deletePermission = async (permission: Permission) => {
  if (!confirm(`¿Estás seguro de eliminar el permiso "${permission.name}"?`)) {
    return
  }
  
  try {
    const response = await fetch(`${API_ENDPOINTS.RBAC.ABILITIES}/${permission.name}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Error al eliminar permiso')
    }
    
    await fetchPermissions()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al eliminar'
  }
}

const manageRolePermissions = async (role: Role) => {
  selectedRole.value = role
  selectedRolePermissions.value = []
  showRolePermissionsModal.value = true
  loadingRoleGrants.value = true

  try {
    const response = await fetch(API_ENDPOINTS.RBAC.GRANTS.role(role.name), {
      headers: {
        'Authorization': authStore.authHeader || '',
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const payload = await response.json()
      const abilities = extractAbilityNamesFromGrants(payload)
      selectedRolePermissions.value = abilities
    } else {
      // Fallback to existing role permissions if backend doesn't provide grants
      const perms = (role as any)?.permissions
      selectedRolePermissions.value = Array.isArray(perms) ? [...perms] : []
    }
  } catch (e) {
    const perms = (role as any)?.permissions
    selectedRolePermissions.value = Array.isArray(perms) ? [...perms] : []
  } finally {
    loadingRoleGrants.value = false
  }
}

const saveRolePermissions = async () => {
  if (!selectedRole.value) return

  saving.value = true

  try {
    const original = new Set<string>(selectedRole.value.permissions || [])
    const selected = new Set<string>(selectedRolePermissions.value)

    const toAdd = Array.from(selected).filter(a => !original.has(a))
    const toRemove = Array.from(original).filter(a => !selected.has(a))

    // Perform attach/detach operations according to Bouncer-style endpoints
    const requests: Promise<Response>[] = [
      // Attach new abilities to role
      ...toAdd.map(ability =>
        fetch(API_ENDPOINTS.RBAC.ASSIGN.roleAbility(selectedRole.value!.name, ability), {
          method: 'POST',
          headers: {
            'Authorization': authStore.authHeader || '',
            'Content-Type': 'application/json'
          }
        })
      ),
      // Detach removed abilities from role
      ...toRemove.map(ability =>
        fetch(API_ENDPOINTS.RBAC.ASSIGN.roleAbility(selectedRole.value!.name, ability), {
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
        throw new Error(`Error al actualizar permisos del rol: ${failed.status} ${msg}`)
      }
    }

    await fetchRoles()
    closeRolePermissionsModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al actualizar permisos'
  } finally {
    saving.value = false
  }
}

const closeRoleModal = () => {
  showCreateRoleModal.value = false
  showEditRoleModal.value = false
  editingRole.value = null
  roleFormData.value = {
    name: '',
    description: ''
  }
}

const closePermissionModal = () => {
  showCreatePermissionModal.value = false
  showEditPermissionModal.value = false
  editingPermission.value = null
  permissionFormData.value = {
    name: '',
    description: '',
    category: ''
  }
}

const closeRolePermissionsModal = () => {
  showRolePermissionsModal.value = false
  selectedRole.value = null
  selectedRolePermissions.value = []
}

onMounted(() => {
  fetchRoles()
  fetchPermissions()
})
</script>