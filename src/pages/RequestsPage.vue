<template>
  <Layout>
    <div class="h-full flex flex-col space-y-6 overflow-hidden">
      <!-- Header with View Toggle -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Peticiones</h1>
          <p class="text-gray-600">Gestiona todas las peticiones del CRM</p>
        </div>
        <div class="flex items-center space-x-4">
          <!-- View Toggle -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="viewMode = 'kanban'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z"></path>
              </svg>
              Kanban
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              Lista
            </button>
          </div>
          
          <!-- Refresh Button -->
          <button
            @click="refreshData"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 min-h-0">
        <!-- Kanban View -->
        <div v-if="viewMode === 'kanban'" class="h-full">
          <KanbanBoard />
        </div>
        
        <!-- List View -->
        <div v-else class="h-full bg-white rounded-lg shadow-sm border flex flex-col">
          <div class="p-6 border-b border-gray-200 flex-shrink-0">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-900">Lista de Peticiones</h2>
              <div class="flex items-center space-x-4">
                <!-- Search -->
                <div class="relative">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Buscar peticiones..."
                    class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                
                <!-- Status Filter -->
                <select
                  v-model="statusFilter"
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option v-for="status in availableStatuses" :key="status.id" :value="status.name">
                    {{ status.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="flex-1 overflow-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="request in filteredRequests" :key="request.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ request.fistName }} {{ request.lastName }}
                    </div>
                    <div class="text-sm text-gray-500">{{ request.company || 'Sin empresa' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ request.email }}</div>
                    <div class="text-sm text-gray-500">{{ request.phone }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getStatusColor(request.status.code)
                      ]"
                    >
                      {{ request.status.name }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ request.assignedTo || 'Sin asignar' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(request.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ request.updatedAt ? formatDate(request.updatedAt) : '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="viewRequestDetails(request)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Ver
                    </button>
                    <button
                      @click="editRequest(request)"
                      class="text-gray-600 hover:text-gray-900"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Empty State -->
            <div v-if="filteredRequests.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No hay peticiones</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ searchQuery || statusFilter ? 'No se encontraron peticiones con los filtros aplicados.' : 'Aún no hay peticiones registradas.' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Layout from '../components/layout/Layout.vue'
import KanbanBoard from '../components/kanban/KanbanBoard.vue'
import { useRequestsStore } from '../stores/requests'
import { useStatusStore } from '../stores/status'
import type { RequestInformation } from '../types'

const requestsStore = useRequestsStore()
const statusStore = useStatusStore()

// Reactive data
const viewMode = ref<'kanban' | 'list'>('kanban')
const searchQuery = ref('')
const statusFilter = ref('')

// Computed properties
const loading = computed(() => requestsStore.loading)
const requests = computed(() => requestsStore.requests)
const availableStatuses = computed(() => statusStore.statuses)

const filteredRequests = computed(() => {
  let filtered = requests.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(request =>
      request.fistName.toLowerCase().includes(query) ||
      request.lastName.toLowerCase().includes(query) ||
      request.email.toLowerCase().includes(query) ||
      request.phone.toLowerCase().includes(query) ||
      (request.company && request.company.toLowerCase().includes(query))
    )
  }

  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(request => request.status.name === statusFilter.value)
  }

  return filtered
})

// Methods
const refreshData = async () => {
  await Promise.all([
    requestsStore.fetchRequests(),
    statusStore.fetchStatuses()
  ])
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (statusCode: string) => {
  // Map status codes to colors
  const colorMap: Record<string, string> = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'qualified': 'bg-purple-100 text-purple-800',
    'proposal': 'bg-orange-100 text-orange-800',
    'negotiation': 'bg-indigo-100 text-indigo-800',
    'won': 'bg-green-100 text-green-800',
    'lost': 'bg-red-100 text-red-800',
    'closed': 'bg-gray-100 text-gray-800'
  }
  
  return colorMap[statusCode] || 'bg-gray-100 text-gray-800'
}

const viewRequestDetails = (request: RequestInformation) => {
  // Open request details modal or navigate to details page
  console.log('View request details:', request)
}

const editRequest = (request: RequestInformation) => {
  // Open request edit modal or navigate to edit page
  console.log('Edit request:', request)
}

// Lifecycle
onMounted(async () => {
  await refreshData()
})

// Save view preference to localStorage
const saveViewPreference = () => {
  localStorage.setItem('requests_view_mode', viewMode.value)
}

// Load view preference from localStorage
const loadViewPreference = () => {
  const saved = localStorage.getItem('requests_view_mode')
  if (saved === 'kanban' || saved === 'list') {
    viewMode.value = saved
  }
}

// Initialize view preference
onMounted(() => {
  loadViewPreference()
})

// Watch for view mode changes and save preference
import { watch } from 'vue'
watch(viewMode, saveViewPreference)
</script>