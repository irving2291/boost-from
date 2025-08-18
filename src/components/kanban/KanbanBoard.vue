<template>
  <div class="h-full flex flex-col bg-slate-200">
    <!-- Header with title and new lead button -->
    <div class="flex items-center justify-between mb-6 flex-shrink-0 bg-slate-200 p-4">
      <h1 class="text-2xl font-bold text-charcoal">Pipeline de Ventas</h1>
      <button
        @click="handleAddRequest"
        class="bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 flex-shrink-0"
      >
        <PhPlus :size="16" />
        <span>Nuevo Lead</span>
      </button>
    </div>

    <!-- Kanban columns with horizontal scroll -->
    <div class="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-slate-200">
      <div
        class="flex gap-6 pb-4 h-full px-4"
        style="min-width: max-content;"
        @dragover="handleBoardDragOver"
        @drop="handleBoardDrop"
      >
        <KanbanColumn
          v-for="(status, index) in sortedStatuses"
          :key="status.id"
          :status="status"
          :requests="getRequestsByStatusCode(status.code)"
          :can-delete="canDeleteStatus(status)"
          @update-status="handleStatusUpdate"
          @add-request="handleAddRequestForStatus"
          @delete-status="handleDeleteStatus"
          @open-details="handleOpenDetails"
          @header-drag-start="handleColumnDragStart(status, index)"
          @header-drag-end="handleColumnDragEnd"
          class="flex-shrink-0"
          style="width: 320px;"
        />
        
        <!-- Add new status column -->
        <div class="flex-shrink-0 border rounded-lg p-6 flex flex-col items-center justify-center" style="width: 320px; min-height: 400px;">
          <button
            @click="showAddStatusModal = true"
            class="flex flex-col items-center space-y-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <PhPlus :size="32" />
            <span class="text-sm font-medium">Agregar Estado</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Status Modal -->
    <div v-if="showAddStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900">Nuevo Estado</h3>
          <button
            @click="showAddStatusModal = false"
            class="text-slate-400 hover:text-slate-600"
          >
            <PhX :size="20" />
          </button>
        </div>

        <form @submit.prevent="handleCreateStatus">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Código del Estado
              </label>
              <input
                v-model="newStatus.code"
                type="text"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="NUEVO_ESTADO"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <input
                v-model="newStatus.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nuevo Estado"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Color
              </label>
              <select
                v-model="newStatus.color"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="#EF4444">Rojo</option>
                <option value="#F59E0B">Amarillo</option>
                <option value="#10B981">Verde</option>
                <option value="#3B82F6">Azul</option>
                <option value="#8B5CF6">Púrpura</option>
                <option value="#06B6D4">Cian</option>
                <option value="#84CC16">Lima</option>
                <option value="#F97316">Naranja</option>
              </select>
            </div>

            <div class="flex items-center">
              <input
                v-model="newStatus.default"
                type="checkbox"
                id="isDefault"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label for="isDefault" class="ml-2 block text-sm text-slate-700">
                Estado por defecto
              </label>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showAddStatusModal = false"
              class="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="statusStore.loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ statusStore.loading ? 'Creando...' : 'Crear Estado' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Request Details Modal -->
    <RequestDetailsModal
      v-if="selectedRequest"
      :is-open="showRequestModal"
      :request="selectedRequest"
      @close="closeRequestModal"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PhPlus, PhX } from '@phosphor-icons/vue'
import KanbanColumn from './KanbanColumn.vue'
import RequestDetailsModal from './RequestDetailsModal.vue'
import { useRequestsStore } from '../../stores/requests'
import { useStatusStore } from '../../stores/status'
import type { RequestInformation, State } from '../../types/supabase'

const requestsStore = useRequestsStore()
const statusStore = useStatusStore()

const showAddStatusModal = ref(false)
const newStatus = ref({
  code: '',
  name: '',
  entity_type: 'request_information',
  default: false
})

// Modal state
const showRequestModal = ref(false)
const selectedRequest = ref<RequestInformation | null>(null)

// Drag and drop state
const draggedColumnIndex = ref<number | null>(null)
const draggedStatus = ref<State | null>(null)

const sortedStatuses = computed(() => statusStore.sortedStatuses)

const getRequestsByStatusCode = (statusCode: string) => {
  return requestsStore.requestsByStatus[statusCode] || []
}

const handleStatusUpdate = async (requestId: string, newStatusId: string) => {
  // Update the request with the new status ID
  await requestsStore.updateRequestStatus(requestId, newStatusId)
}

const handleAddRequest = () => {
  // TODO: Implement add request modal
  console.log('Add new lead')
}

const handleAddRequestForStatus = (status: State) => {
  // TODO: Implement add request modal for specific status
  console.log('Add request for status:', status.name)
}

const canDeleteStatus = (status: State): boolean => {
  // Can't delete if it's a default status or has requests
  if (status.default) return false
  const requests = getRequestsByStatusCode(status.code)
  return requests.length === 0
}

const handleDeleteStatus = async (status: State) => {
  if (!canDeleteStatus(status)) {
    alert('No se puede eliminar este estado porque tiene requests asignados o es un estado por defecto.')
    return
  }
  
  if (confirm(`¿Estás seguro de que quieres eliminar el estado "${status.name}"?`)) {
    await statusStore.deleteStatus(status.id)
  }
}

const handleCreateStatus = async () => {
  if (!newStatus.value.code || !newStatus.value.name) {
    alert('Por favor completa todos los campos requeridos.')
    return
  }

  const statusData = {
    code: newStatus.value.code,
    name: newStatus.value.name,
    entity_type: newStatus.value.entity_type,
    sort: statusStore.statuses.length + 1,
    default: newStatus.value.default
  }

  const result = await statusStore.createStatus(statusData)
  if (result) {
    showAddStatusModal.value = false
    // Reset form
    newStatus.value = {
      code: '',
      name: '',
      entity_type: 'request_information',
      default: false
    }
  }
}

// Drag and drop handlers for columns
const handleColumnDragStart = (status: State, index: number) => {
  draggedColumnIndex.value = index
  draggedStatus.value = status
}

const handleColumnDragEnd = () => {
  draggedColumnIndex.value = null
  draggedStatus.value = null
}

const handleBoardDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    const dragType = event.dataTransfer.getData('text/plain')
    if (dragType === 'column') {
      event.dataTransfer.dropEffect = 'move'
    }
  }
}

const handleBoardDrop = (event: DragEvent) => {
  event.preventDefault()
  
  const dragType = event.dataTransfer?.getData('text/plain')
  
  if (dragType === 'column' && draggedColumnIndex.value !== null) {
    // Find the drop target column
    const dropTarget = event.target as HTMLElement
    const columnElement = dropTarget.closest('.flex-shrink-0')
    
    if (!columnElement) return
    
    // Find all column elements
    const boardContainer = columnElement.parentElement
    if (!boardContainer) return
    
    const allColumns = Array.from(boardContainer.children).filter(el =>
      el.classList.contains('flex-shrink-0') && el.tagName !== 'DIV' ||
      (el.tagName === 'DIV' && el.querySelector('[draggable="true"]'))
    )
    
    const dropIndex = allColumns.indexOf(columnElement)
    
    if (dropIndex === -1 || dropIndex === draggedColumnIndex.value) return
    
    // Reorder the statuses
    statusStore.reorderStatuses(draggedColumnIndex.value, dropIndex)
  }
  
  // Reset drag state
  draggedColumnIndex.value = null
  draggedStatus.value = null
}

const handleOpenDetails = (request: RequestInformation) => {
  selectedRequest.value = request
  showRequestModal.value = true
}

const closeRequestModal = () => {
  showRequestModal.value = false
  selectedRequest.value = null
}

onMounted(async () => {
  // Fetch statuses first, then requests
  await statusStore.fetchStatuses('request_information')
  await requestsStore.fetchRequests()
})
</script>

<style scoped>
/* Custom scrollbar styling */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.7);
}

/* Firefox */
.custom-scrollbar:hover {
  scrollbar-color: rgba(148, 163, 184, 0.5) transparent;
}
</style>