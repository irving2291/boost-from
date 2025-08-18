<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PhPlus, PhFunnel, PhMagnifyingGlass, PhBuilding, PhUser, PhStar, PhPhone, PhEnvelope, PhEye, PhPencil, PhTrash } from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
import { useAccountsStore } from '../stores/accounts'
import type { Account, AccountFilters } from '../types'
import Badge from '../components/ui/Badge.vue'

const router = useRouter()
const accountsStore = useAccountsStore()

// Local state
const searchQuery = ref('')
const showFilters = ref(false)
const selectedAccounts = ref<string[]>([])
const loading = ref(false)

// Filters
const typeFilter = ref<'all' | 'person' | 'company'>('all')
const statusFilter = ref<'all' | 'client' | 'prospect'>('all')
const priorityFilter = ref<'low' | 'medium' | 'high' | undefined>(undefined)

// Computed
const filteredAccounts = computed(() => accountsStore.filteredAccounts)
const pagination = computed(() => accountsStore.pagination)
const stats = computed(() => accountsStore.stats)

// Methods
const loadAccounts = async (page = 1) => {
  loading.value = true
  try {
    await accountsStore.fetchAccounts(page, pagination.value.perPage)
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  const filters: Partial<AccountFilters> = {
    search: searchQuery.value,
    type: typeFilter.value,
    status: statusFilter.value,
    priority: priorityFilter.value
  }
  accountsStore.setFilters(filters)
  loadAccounts(1)
}

const clearFilters = () => {
  searchQuery.value = ''
  typeFilter.value = 'all'
  statusFilter.value = 'all'
  priorityFilter.value = undefined
  accountsStore.clearFilters()
  loadAccounts(1)
}

const viewAccount = (accountId: string) => {
  router.push(`/accounts/${accountId}`)
}

const editAccount = (accountId: string) => {
  router.push(`/accounts/${accountId}/edit`)
}

const createAccount = () => {
  router.push('/accounts/new')
}

const deleteAccount = async (accountId: string) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
    try {
      await accountsStore.deleteAccount(accountId)
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }
}

const convertToClient = async (accountId: string) => {
  try {
    await accountsStore.convertProspectToClient(accountId)
  } catch (error) {
    console.error('Error converting prospect to client:', error)
  }
}

const getAccountDisplayName = (account: Account) => {
  return accountsStore.getAccountDisplayName(account)
}

const getAccountInitials = (account: Account) => {
  return accountsStore.getAccountInitials(account)
}

const getStatusColor = (status: string) => {
  return status === 'client' ? 'green' : 'blue'
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'red'
    case 'medium': return 'yellow'
    case 'low': return 'default'
    default: return 'default'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-EC')
}

// Watchers
watch([searchQuery, typeFilter, statusFilter, priorityFilter], () => {
  applyFilters()
})

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadAccounts(),
    accountsStore.fetchStats()
  ])
})
</script>

<template>
  <Layout>
    <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Cuentas</h1>
        <p class="text-gray-600 mt-1">Gestiona clientes y prospectos</p>
      </div>
      <button
        @click="createAccount"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <PhPlus :size="20" class="mr-2" />
        Nueva Cuenta
      </button>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Cuentas</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalAccounts }}</p>
          </div>
          <PhUser :size="24" class="text-blue-500" />
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Clientes</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.totalClients }}</p>
          </div>
          <PhStar :size="24" class="text-green-500" />
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Prospectos</p>
            <p class="text-2xl font-bold text-blue-600">{{ stats.totalProspects }}</p>
          </div>
          <PhStar :size="24" class="text-blue-500" />
        </div>
      </div>
      <div class="bg-white p-4 rounded-lg border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Tasa Conversión</p>
            <p class="text-2xl font-bold text-purple-600">{{ (stats.conversionRate * 100).toFixed(1) }}%</p>
          </div>
          <PhBuilding :size="24" class="text-purple-500" />
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <PhMagnifyingGlass :size="20" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar cuentas..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- Filter Toggle -->
        <button
          @click="showFilters = !showFilters"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <PhFunnel :size="20" class="mr-2" />
          Filtros
        </button>
      </div>

      <!-- Expanded Filters -->
      <div v-if="showFilters" class="mt-4 pt-4 border-t border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              v-model="typeFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="person">Personas</option>
              <option value="company">Empresas</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              v-model="statusFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="client">Clientes</option>
              <option value="prospect">Prospectos</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select
              v-model="priorityFilter"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="undefined">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="clearFilters"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Accounts Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuenta
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Responsable
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Actividad
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                Cargando cuentas...
              </td>
            </tr>
            <tr v-else-if="filteredAccounts.length === 0">
              <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                No se encontraron cuentas
              </td>
            </tr>
            <tr
              v-else
              v-for="account in filteredAccounts"
              :key="account.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      v-if="!account.avatar"
                      class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700"
                    >
                      {{ getAccountInitials(account) }}
                    </div>
                    <img
                      v-else
                      :src="account.avatar"
                      :alt="getAccountDisplayName(account)"
                      class="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getAccountDisplayName(account) }}
                    </div>
                    <div class="text-sm text-gray-500 flex items-center space-x-2">
                      <PhEnvelope :size="14" />
                      <span>{{ account.email }}</span>
                    </div>
                    <div class="text-sm text-gray-500 flex items-center space-x-2">
                      <PhPhone :size="14" />
                      <span>{{ account.phone }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <PhBuilding v-if="account.type === 'company'" :size="16" class="text-gray-400 mr-2" />
                  <PhUser v-else :size="16" class="text-gray-400 mr-2" />
                  <span class="text-sm text-gray-900 capitalize">
                    {{ account.type === 'company' ? 'Empresa' : 'Persona' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :color="getStatusColor(account.status)">
                  {{ account.status === 'client' ? 'Cliente' : 'Prospecto' }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge :color="getPriorityColor(account.priority)">
                  {{ account.priority === 'high' ? 'Alta' : account.priority === 'medium' ? 'Media' : 'Baja' }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ account.assignedToName || 'Sin asignar' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCurrency(account.totalValue) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ account.lastContactDate ? formatDate(account.lastContactDate) : 'Nunca' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="viewAccount(account.id)"
                    class="text-blue-600 hover:text-blue-900 transition-colors"
                    title="Ver detalles"
                  >
                    <PhEye :size="16" />
                  </button>
                  <button
                    @click="editAccount(account.id)"
                    class="text-gray-600 hover:text-gray-900 transition-colors"
                    title="Editar"
                  >
                    <PhPencil :size="16" />
                  </button>
                  <button
                    v-if="account.status === 'prospect'"
                    @click="convertToClient(account.id)"
                    class="text-green-600 hover:text-green-900 transition-colors"
                    title="Convertir a cliente"
                  >
                    <PhStar :size="16" />
                  </button>
                  <button
                    @click="deleteAccount(account.id)"
                    class="text-red-600 hover:text-red-900 transition-colors"
                    title="Eliminar"
                  >
                    <PhTrash :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              :disabled="pagination.page <= 1"
              @click="loadAccounts(pagination.page - 1)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              :disabled="pagination.page >= pagination.pages"
              @click="loadAccounts(pagination.page + 1)"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ (pagination.page - 1) * pagination.perPage + 1 }}</span>
                a
                <span class="font-medium">{{ Math.min(pagination.page * pagination.perPage, pagination.total) }}</span>
                de
                <span class="font-medium">{{ pagination.total }}</span>
                resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  :disabled="pagination.page <= 1"
                  @click="loadAccounts(pagination.page - 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  v-for="page in Math.min(pagination.pages, 5)"
                  :key="page"
                  @click="loadAccounts(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === pagination.page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  :disabled="pagination.page >= pagination.pages"
                  @click="loadAccounts(pagination.page + 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </Layout>
</template>