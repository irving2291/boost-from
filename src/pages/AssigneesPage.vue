<template>
  <Layout>
    <div class="h-full flex flex-col space-y-6 overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestión de Responsables</h1>
          <p class="text-gray-600">Administra los responsables de peticiones y reglas de asignación</p>
        </div>
        <div class="flex space-x-3">
          <button
            @click="showAssigneeModal = true"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Nuevo Responsable
          </button>
          <button
            @click="showRulesModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Configurar Reglas
          </button>
          <button
            @click="refreshData"
            :disabled="loading"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="bg-white p-4 rounded-lg shadow-sm border">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Desde:</label>
            <input
              v-model="dateFrom"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">Hasta:</label>
            <input
              v-model="dateTo"
              type="date"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            @click="applyFilters"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Aplicar Filtros
          </button>
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      <!-- Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Responsables</p>
              <p class="text-2xl font-bold text-gray-900">{{ assigneeMetrics.totalAssignees }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Activos</p>
              <p class="text-2xl font-bold text-gray-900">{{ assigneeMetrics.activeAssignees }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tasa Conversión Promedio</p>
              <p class="text-2xl font-bold text-gray-900">{{ (assigneeMetrics.avgConversionRate * 100).toFixed(1) }}%</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Peticiones Asignadas</p>
              <p class="text-2xl font-bold text-gray-900">{{ assigneeMetrics.totalRequestsAssigned }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Sin Asignar</p>
              <p class="text-2xl font-bold text-gray-900">{{ assigneeMetrics.unassignedRequests }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Assignees Table -->
      <div class="bg-white rounded-lg shadow-sm border flex-1 min-h-0 flex flex-col">
        <div class="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 class="text-lg font-semibold text-gray-900">Tabla de Conversión por Responsable</h2>
        </div>
        
        <div class="flex-1 overflow-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Peticiones
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completadas
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendientes
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa Conversión
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo Respuesta
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo Cierre
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="stat in assigneeStats" :key="stat.assigneeId" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-700">
                          {{ stat.assignee.firstName.charAt(0) }}{{ stat.assignee.lastName.charAt(0) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ stat.assignee.firstName }} {{ stat.assignee.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">{{ stat.assignee.role }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center">
                    {{ stat.totalRequests }}
                    <div 
                      v-if="realTimeStats[stat.assigneeId]?.newRequests > 0"
                      class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      +{{ realTimeStats[stat.assigneeId].newRequests }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center">
                    {{ stat.completedRequests }}
                    <div 
                      v-if="realTimeStats[stat.assigneeId]?.completedToday > 0"
                      class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      +{{ realTimeStats[stat.assigneeId].completedToday }} hoy
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ stat.pendingRequests }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="bg-green-600 h-2 rounded-full" 
                        :style="{ width: `${stat.conversionRate * 100}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium">{{ (stat.conversionRate * 100).toFixed(1) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ stat.avgResponseTime.toFixed(1) }}h
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ stat.avgCloseTime.toFixed(1) }}d
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                      stat.assignee.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ stat.assignee.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="openReassignModal(stat.assignee)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Reasignar
                  </button>
                  <button
                    @click="viewAssigneeDetails(stat.assignee)"
                    class="text-gray-600 hover:text-gray-900"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Assignment Rules Modal -->
      <div v-if="showRulesModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">Reglas de Asignación Automática</h3>
            <button
              @click="showRulesModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div v-for="rule in assignmentRules" :key="rule.id" class="border rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <h4 class="text-md font-semibold text-gray-900">{{ rule.name }}</h4>
                    <span 
                      :class="[
                        'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                        rule.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ rule.active ? 'Activa' : 'Inactiva' }}
                    </span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Prioridad {{ rule.priority }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{{ rule.description }}</p>
                  <div class="mt-2">
                    <span class="text-xs text-gray-500">Tipo: </span>
                    <span class="text-xs font-medium">{{ getAssignmentTypeLabel(rule.assignmentType) }}</span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="toggleRule(rule)"
                    :class="[
                      'px-3 py-1 text-xs rounded',
                      rule.active 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    ]"
                  >
                    {{ rule.active ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button
                    @click="editRule(rule)"
                    class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Editar
                  </button>
                  <button
                    @click="deleteRule(rule)"
                    class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
            
            <button
              @click="createNewRule"
              class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
            >
              + Agregar Nueva Regla
            </button>
          </div>
        </div>
      </div>

      <!-- Reassign Modal -->
      <div v-if="showReassignModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">Reasignar Peticiones</h3>
            <button
              @click="showReassignModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Reasignar peticiones de: {{ selectedAssignee?.firstName }} {{ selectedAssignee?.lastName }}
              </label>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nuevo responsable:</label>
              <select
                v-model="reassignToId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar responsable...</option>
                <option 
                  v-for="assignee in activeAssignees.filter(a => a.id !== selectedAssignee?.id)" 
                  :key="assignee.id" 
                  :value="assignee.id"
                >
                  {{ assignee.firstName }} {{ assignee.lastName }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Motivo (opcional):</label>
              <textarea
                v-model="reassignReason"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Motivo de la reasignación..."
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                @click="showReassignModal = false"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="performReassignment"
                :disabled="!reassignToId"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Reasignar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assignment Rule Form Modal -->
      <AssignmentRuleModal
        :is-open="showRuleFormModal"
        :rule="selectedRule"
        :available-assignees="activeAssignees"
        :loading="ruleFormLoading"
        @close="handleCloseRuleModal"
        @save="handleSaveRule"
      />

      <!-- Assignee Form Modal -->
      <AssigneeModal
        :is-open="showAssigneeModal"
        :loading="assigneeFormLoading"
        @close="handleCloseAssigneeModal"
        @save="handleSaveAssignee"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Layout from '../components/layout/Layout.vue'
import AssignmentRuleModal from '../components/assignees/AssignmentRuleModal.vue'
import AssigneeModal from '../components/assignees/AssigneeModal.vue'
import { useAssigneesStore } from '../stores/assignees'
import type { Assignee, AssignmentRule } from '../types'

const assigneesStore = useAssigneesStore()

// Reactive data
const dateFrom = ref('')
const dateTo = ref('')
const showRulesModal = ref(false)
const showRuleFormModal = ref(false)
const showReassignModal = ref(false)
const showAssigneeModal = ref(false)
const selectedAssignee = ref<Assignee | null>(null)
const selectedRule = ref<AssignmentRule | null>(null)
const reassignToId = ref('')
const reassignReason = ref('')
const ruleFormLoading = ref(false)
const assigneeFormLoading = ref(false)

// Computed properties
const loading = computed(() => assigneesStore.loading)
const assigneeStats = computed(() => assigneesStore.assigneeStats)
const assignmentRules = computed(() => assigneesStore.assignmentRules)
const assigneeMetrics = computed(() => assigneesStore.assigneeMetrics)
const activeAssignees = computed(() => assigneesStore.activeAssignees)
const realTimeStats = computed(() => assigneesStore.realTimeStats)

// Methods
const refreshData = async () => {
  await Promise.all([
    assigneesStore.fetchAssignees(),
    assigneesStore.fetchAssigneeStats(assigneesStore.filters),
    assigneesStore.fetchAssignmentRules()
  ])
}

const applyFilters = () => {
  const filters = {
    dateFrom: dateFrom.value || undefined,
    dateTo: dateTo.value || undefined
  }
  assigneesStore.updateFilters(filters)
}

const clearFilters = () => {
  dateFrom.value = ''
  dateTo.value = ''
  assigneesStore.updateFilters({})
}

const openReassignModal = (assignee: Assignee) => {
  selectedAssignee.value = assignee
  reassignToId.value = ''
  reassignReason.value = ''
  showReassignModal.value = true
}

const performReassignment = async () => {
  if (!selectedAssignee.value || !reassignToId.value) return
  
  // This would typically reassign all pending requests from the selected assignee
  // For now, we'll just close the modal and refresh data
  showReassignModal.value = false
  await refreshData()
}

const viewAssigneeDetails = (assignee: Assignee) => {
  // Navigate to assignee details or show detailed modal
  console.log('View details for:', assignee)
}

const toggleRule = async (rule: AssignmentRule) => {
  await assigneesStore.updateAssignmentRule(rule.id, { active: !rule.active })
}

const editRule = (rule: AssignmentRule) => {
  selectedRule.value = rule
  showRuleFormModal.value = true
}

const createNewRule = () => {
  selectedRule.value = null
  showRuleFormModal.value = true
}

const handleSaveRule = async (ruleData: Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>) => {
  ruleFormLoading.value = true
  
  try {
    if (selectedRule.value) {
      // Update existing rule
      await assigneesStore.updateAssignmentRule(selectedRule.value.id, ruleData)
    } else {
      // Create new rule
      await assigneesStore.createAssignmentRule(ruleData)
    }
    
    showRuleFormModal.value = false
    selectedRule.value = null
    await refreshData()
  } catch (error) {
    console.error('Error saving rule:', error)
  } finally {
    ruleFormLoading.value = false
  }
}

const handleCloseRuleModal = () => {
  showRuleFormModal.value = false
  selectedRule.value = null
}

const handleSaveAssignee = async (assigneeData: Omit<Assignee, 'id' | 'createdAt' | 'updatedAt'>) => {
  assigneeFormLoading.value = true

  try {
    await assigneesStore.createAssignee(assigneeData)
    showAssigneeModal.value = false
    await refreshData()
  } catch (error) {
    console.error('Error creating assignee:', error)
  } finally {
    assigneeFormLoading.value = false
  }
}

const handleCloseAssigneeModal = () => {
  showAssigneeModal.value = false
}

const deleteRule = async (rule: AssignmentRule) => {
  if (confirm(`¿Estás seguro de que quieres eliminar la regla "${rule.name}"?`)) {
    await assigneesStore.deleteAssignmentRule(rule.id)
    await refreshData()
  }
}

const getAssignmentTypeLabel = (type: string) => {
  const labels = {
    'round_robin': 'Rotación',
    'load_balanced': 'Balanceado por carga',
    'skill_based': 'Basado en habilidades',
    'manual': 'Manual',
    'random': 'Aleatorio'
  }
  return labels[type as keyof typeof labels] || type
}

// Set default date range (last 30 days)
const setDefaultDateRange = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))
  
  dateTo.value = today.toISOString().split('T')[0]
  dateFrom.value = thirtyDaysAgo.toISOString().split('T')[0]
}

// Lifecycle
onMounted(async () => {
  setDefaultDateRange()
  await refreshData()
  applyFilters()
})

// Watch for real-time updates (would be connected to Socket.IO)
watch(() => assigneesStore.realTimeStats, (newStats) => {
  // Handle real-time updates
  console.log('Real-time stats updated:', newStats)
}, { deep: true })
</script>