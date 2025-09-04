<template>
  <Layout>
    <div class="h-full flex flex-col space-y-6 overflow-hidden">
      <!-- Header with View Toggle -->
      <div class="flex justify-end items-center">
        <div class="flex items-center space-x-4">
          <!-- Date Range Filter -->
          <div class="flex items-center space-x-2">
            <DateRangePicker
              v-model="dateRange"
              @change="handleDateRangeChange"
            />
          </div>

          <!-- Assignee Selector -->
          <div class="flex items-center space-x-2">
            <AssigneeSelector
              v-model="currentAssignee"
              @assignee-changed="handleAssigneeChanged"
              @update:modelValue="handleAssigneeLoaded"
            />
          </div>
          
          <!-- View Tabs -->
          <div class="flex bg-gray-100 rounded-lg p-0">
            <button
              @click="viewMode = 'kanban'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none',
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z"></path>
              </svg>
              {{ t('requests.kanbanView') }}
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none',
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              {{ t('requests.listView') }}
            </button>
            <button
              @click="viewMode = 'analytics'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none',
                viewMode === 'analytics'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Analíticas
            </button>
          </div>
          
          <!-- Refresh Button -->
          <button
            @click="refreshData"
            :disabled="loading"
            class="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none disabled:opacity-50"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ t('requests.refresh') }}
          </button>

          <button
            @click="handleAddRequest"
            class="bg-accent-blue hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg focus:outline-none transition-colors flex items-center space-x-2 flex-shrink-0"
          >
            <PhPlus :size="16" />
            <span>Nuevo Lead</span>
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
        <div v-else-if="viewMode === 'list'" class="h-full bg-white rounded-lg shadow-sm border flex flex-col">
          <div class="p-6 border-b border-gray-200 flex-shrink-0">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-900">{{ t('requests.listTitle') }}</h2>
            </div>
          </div>
          
          <div class="flex-1 overflow-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- Existing Request Rows -->
                <tr v-for="request in filteredRequests" :key="request.id" class="hover:bg-gray-50">
                  <td class="px-4 py-2 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ request.fistName }} {{ request.lastName }}
                    </div>
                    <div class="text-xs text-gray-500">{{ request.company || 'Sin empresa' }}</div>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ request.email }}</div>
                    <div class="text-xs text-gray-500">{{ request.phone }}</div>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        getStatusColor(request.status.code)
                      ]"
                    >
                      {{ request.status.name }}
                    </span>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {{ request.assignedTo || 'Sin asignar' }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(request.createdAt) }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {{ request.updatedAt ? formatDate(request.updatedAt) : '-' }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="viewRequestDetails(request)"
                      class="text-blue-600 hover:text-blue-900 mr-3 text-xs"
                    >
                      Ver
                    </button>
                    <button
                      @click="editRequest(request)"
                      class="text-gray-600 hover:text-gray-900 text-xs"
                    >
                      Editar
                    </button>
                  </td>
                </tr>

                <!-- Inline Form Row (appears at bottom) -->
                <tr v-if="showInlineForm" class="bg-blue-50 border-blue-200">
                  <td class="px-4 py-2 whitespace-nowrap">
                    <div class="flex space-x-1">
                      <input
                        v-model="inlineFormData.fistName"
                        type="text"
                        placeholder="Nombre *"
                        class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <input
                        v-model="inlineFormData.lastName"
                        type="text"
                        placeholder="Apellido *"
                        class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <input
                      v-model="inlineFormData.email"
                      type="email"
                      placeholder="Email *"
                      class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Nuevo
                    </span>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    <AssigneeSelector
                      v-model="inlineAssignee"
                      @assignee-changed="handleInlineAssigneeChanged"
                      class="text-xs"
                      placeholder="Seleccionar responsable..."
                    />
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(new Date().toISOString()) }}
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="submitInlineForm"
                      :disabled="isSubmittingInline"
                      class="text-green-600 hover:text-green-900 mr-2 disabled:opacity-50 text-xs"
                    >
                      <svg v-if="isSubmittingInline" class="animate-spin -ml-1 mr-2 h-3 w-3 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ isSubmittingInline ? 'Creando...' : 'Guardar' }}
                    </button>
                    <button
                      @click="hideInlineFormRow"
                      class="text-red-600 hover:text-red-900 text-xs"
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>

                <!-- Add New Row Button (in client column) -->
                <tr v-if="!showInlineForm" class="border-t-2 border-dotted border-gray-300 hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-600">
                    <button
                      @click="showInlineFormRow"
                      class="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <PhPlus :size="14" class="mr-2" />
                      <span class="border-b border-dotted border-gray-400 pb-1">Agregar Nuevo Lead</span>
                    </button>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-400">-</td>
                  <td class="px-4 py-3 text-sm text-gray-400">-</td>
                  <td class="px-4 py-3 text-sm text-gray-400">-</td>
                  <td class="px-4 py-3 text-sm text-gray-400">-</td>
                  <td class="px-4 py-3 text-sm text-gray-400">-</td>
                  <td class="px-4 py-3 text-sm text-gray-400">-</td>
                </tr>
              </tbody>
            </table>
            
            <!-- Empty State -->
            <div v-if="filteredRequests.length === 0" class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">{{ t('requests.noRequests') }}</h3>
              <p class="mt-1 text-sm text-gray-500">
                {{ dateRange.from || dateRange.to ? t('requests.noRequestsFiltered') : t('requests.noRequestsYet') }}
              </p>
              <div class="mt-6">
                <button
                  @click="showInlineFormRow"
                  class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <PhPlus :size="14" class="mr-2" />
                  <span class="border-b border-dotted border-gray-400 pb-1">Agregar Nuevo Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics View -->
        <div v-else class="h-full bg-white rounded-lg shadow-sm border flex flex-col">
          <div class="p-6 border-b border-gray-200 flex-shrink-0">
            <div class="flex justify-between items-center">
              <h2 class="text-lg font-semibold text-gray-900">Analíticas de Requests</h2>
            </div>
          </div>

          <div class="flex-1 overflow-auto p-6">
            <!-- Analytics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div class="bg-white p-6 rounded-lg border border-slate-300">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-medium text-slate-600">Conversión Mensual</h3>
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                </div>
                <p class="text-2xl font-bold text-slate-900">
                  {{ conversionRate.toFixed(1) }}%
                </p>
                <p class="text-xs text-green-600 mt-1">
                  Tasa de conversión actual
                </p>
              </div>

              <div class="bg-white p-6 rounded-lg border border-slate-300">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-medium text-slate-600">Requests Activos</h3>
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                  </svg>
                </div>
                <p class="text-2xl font-bold text-blue-600">
                  {{ activeRequests }}
                </p>
                <p class="text-xs text-blue-600 mt-1">
                  Requests activos
                </p>
              </div>

              <div class="bg-white p-6 rounded-lg border border-slate-300">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-medium text-slate-600">Revenue</h3>
                  <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <p class="text-2xl font-bold text-green-600">
                  ${{ totalRevenue.toLocaleString() }}
                </p>
                <p class="text-xs text-green-600 mt-1">
                  Revenue total
                </p>
              </div>

              <div class="bg-white p-6 rounded-lg border border-slate-300">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-medium text-slate-600">Tiempo Promedio</h3>
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <p class="text-2xl font-bold text-slate-900">
                  {{ avgTimeToClose }} días
                </p>
                <p class="text-xs text-slate-500 mt-1">
                  Tiempo promedio de cierre
                </p>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="bg-white p-6 rounded-lg border border-slate-300">
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Métricas de Rendimiento</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                  <p class="text-2xl font-bold text-blue-600">{{ totalRequests }}</p>
                  <p class="text-sm text-slate-600">Total Requests</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-green-600">{{ completedRequests }}</p>
                  <p class="text-sm text-slate-600">Requests Completados</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-bold text-purple-600">{{ pendingRequests }}</p>
                  <p class="text-sm text-slate-600">Requests Pendientes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Request Information Form Modal -->
      <RequestInformationForm
        v-model="showFormModal"
        @request-created="handleRequestCreated"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import Layout from '../components/layout/Layout.vue'
import KanbanBoard from '../components/kanban/KanbanBoard.vue'
import DateRangePicker from '../components/ui/DateRangePicker.vue'
import AssigneeSelector from '../components/assignees/AssigneeSelector.vue'
import RequestInformationForm from '../components/RequestInformationForm.vue'
import { useRequestsStore } from '../stores/requests'
import { useStatusStore } from '../stores/status'
import { useAssigneesStore } from '../stores/assignees'
import type { RequestInformation, Assignee } from '../types'

const { t } = useI18n()
const requestsStore = useRequestsStore()
const statusStore = useStatusStore()
const assigneesStore = useAssigneesStore()

// Reactive data
const viewMode = ref<'kanban' | 'list' | 'analytics'>('kanban')
const dateRange = ref<{ from?: string; to?: string }>({})
const currentAssignee = ref<Assignee | null>(null)
const showFormModal = ref(false)
const showInlineForm = ref(false)
const isSubmittingInline = ref(false)
const inlineAssignee = ref<Assignee | null>(null)

// Inline form data
const inlineFormData = reactive({
  fistName: '',
  lastName: '',
  email: '',
  assignedTo: undefined as string | undefined
})

// Computed properties
const loading = computed(() => requestsStore.loading)
const requests = computed(() => requestsStore.requests)
const availableStatuses = computed(() => statusStore.statuses)

const filteredRequests = computed(() => {
  // Use the same data source as kanban - no additional client-side filtering
  // Date range and assignee filters are already applied at the store level
  return requests.value
})

// Analytics computed properties
const totalRequests = computed(() => requestsStore.requests.length)

const activeRequests = computed(() => {
  return requestsStore.requests.filter(r =>
    !['won', 'lost', 'closed'].includes(r.status.code)
  ).length
})

const conversionRate = computed(() => {
  const total = requestsStore.requests.length
  const won = requestsStore.requests.filter(r => r.status.code === 'won').length
  return total > 0 ? (won / total) * 100 : 0
})

const totalRevenue = computed(() => {
  return requestsStore.requests
    .filter(r => r.status.code === 'won' && r.amount)
    .reduce((sum, r) => sum + (r.amount || 0), 0)
})

const avgTimeToClose = computed(() => {
  const closedRequests = requestsStore.requests.filter(r =>
    ['won', 'lost'].includes(r.status.code)
  )

  if (closedRequests.length === 0) return 0

  const totalDays = closedRequests.reduce((sum, request) => {
    const created = new Date(request.createdAt)
    const updated = request.updatedAt ? new Date(request.updatedAt) : new Date()
    const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)

  return Math.round(totalDays / closedRequests.length)
})

const completedRequests = computed(() => {
  const statusStore = useStatusStore()
  const completedStatuses = statusStore.statuses.filter(s =>
    s.name.toLowerCase().includes('ganado') ||
    s.name.toLowerCase().includes('won') ||
    s.name.toLowerCase().includes('cerrado') ||
    s.name.toLowerCase().includes('completed')
  )

  return requestsStore.requests.filter(request =>
    completedStatuses.some(status => status.name === request.status.code)
  ).length
})

const pendingRequests = computed(() => {
  const statusStore = useStatusStore()
  const pendingStatuses = statusStore.statuses.filter(s =>
    s.name.toLowerCase().includes('nuevo') ||
    s.name.toLowerCase().includes('new') ||
    s.name.toLowerCase().includes('pendiente') ||
    s.name.toLowerCase().includes('pending')
  )

  return requestsStore.requests.filter(request =>
    pendingStatuses.some(status => status.name === request.status.code)
  ).length
})

// Methods
const refreshData = async () => {
  // Load statuses first
  await statusStore.fetchStatuses()

  // Load requests for current assignee
  await loadRequestsForAssignee(currentAssignee.value)
}

const loadRequestsForAssignee = async (assignee: Assignee | null) => {
  if (assignee) {
    await requestsStore.fetchRequestsByAssigneeAndPeriod(
      assignee.id,
      dateRange.value?.from,
      dateRange.value?.to
    )
  } else {
    // If no assignee, clear requests
    console.log('No assignee available for loading requests')
  }
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

const handleAddRequest = () => {
  showFormModal.value = true
}

const handleDateRangeChange = async (value: { from?: string; to?: string }) => {
  dateRange.value = value
  // Save to localStorage
  localStorage.setItem('requests_date_range', JSON.stringify(value))

  // Reload requests with new date range using current assignee
  await loadRequestsForAssignee(currentAssignee.value)
}

const handleRequestCreated = async () => {
  // Refresh the requests data after a new request is created
  await loadRequestsForAssignee(currentAssignee.value)
}

const handleAssigneeLoaded = async (assignee: Assignee | null) => {
  // Handle when AssigneeSelector loads assignee automatically on mount
  console.log('RequestsPage: Assignee loaded automatically:', assignee)

  // Update current assignee and load requests for the first time
  currentAssignee.value = assignee
  if (assignee) {
    console.log('RequestsPage: Loading requests for assignee:', assignee)
    await loadRequestsForAssignee(assignee)
  } else {
    console.log('RequestsPage: No assignee loaded, requests will not be loaded')
  }
}

const handleAssigneeChanged = async (assignee: Assignee | null) => {
  currentAssignee.value = assignee
  await loadRequestsForAssignee(assignee)
}

// Inline form methods
const showInlineFormRow = () => {
  showInlineForm.value = true
  // Start with empty assignee for inline form
  inlineAssignee.value = null
  inlineFormData.assignedTo = undefined
}

const hideInlineFormRow = () => {
  showInlineForm.value = false
  resetInlineForm()
}

const resetInlineForm = () => {
  inlineFormData.fistName = ''
  inlineFormData.lastName = ''
  inlineFormData.email = ''
  inlineFormData.assignedTo = undefined
  inlineAssignee.value = null
}

const handleInlineAssigneeChanged = (assignee: Assignee | null) => {
  inlineAssignee.value = assignee
  inlineFormData.assignedTo = assignee?.id
}

const submitInlineForm = async () => {
  // Validation
  if (!inlineFormData.fistName || !inlineFormData.lastName || !inlineFormData.email) {
    alert('Por favor complete todos los campos obligatorios: nombre, apellido y email')
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(inlineFormData.email)) {
    alert('Por favor ingrese un email válido')
    return
  }

  isSubmittingInline.value = true

  try {
    // Create request data
    const requestData: Omit<RequestInformation, 'id' | 'createdAt' | 'updatedAt'> = {
      fistName: inlineFormData.fistName,
      lastName: inlineFormData.lastName,
      email: inlineFormData.email,
      phone: '', // Empty phone as it's not required in inline form
      assignedTo: inlineFormData.assignedTo,
      status: {
        id: 'new-status-id',
        code: 'NEW',
        name: 'Nuevo',
        organization: 'default',
        default: true
      }
    }

    // Add the request
    await requestsStore.addRequest(requestData)

    // Hide form and reset
    hideInlineFormRow()

    // Refresh the requests data
    await loadRequestsForAssignee(currentAssignee.value)
  } catch (error) {
    console.error('Error creating request:', error)
    alert('Error al crear el lead. Por favor intente nuevamente.')
  } finally {
    isSubmittingInline.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Load assignee first, then requests will be loaded by refreshData
  await refreshData()
})

// Save view preference to localStorage
const saveViewPreference = () => {
  localStorage.setItem('requests_view_mode', viewMode.value)
}

// Load view preference from localStorage
const loadViewPreference = () => {
  const saved = localStorage.getItem('requests_view_mode')
  if (saved === 'kanban' || saved === 'list' || saved === 'analytics') {
    viewMode.value = saved
  }
}

// Load date range preference from localStorage
const loadDateRangePreference = () => {
  const saved = localStorage.getItem('requests_date_range')
  if (saved) {
    try {
      dateRange.value = JSON.parse(saved)
    } catch (error) {
      console.error('Error loading date range preference:', error)
    }
  }
}

// Initialize preferences
onMounted(() => {
  loadViewPreference()
  loadDateRangePreference()
})

// Watch for view mode changes and save preference
watch(viewMode, saveViewPreference)
</script>