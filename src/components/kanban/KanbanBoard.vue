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
        @dragover.prevent
        @drop="handleColumnDrop"
      >
        <KanbanColumn
          v-for="(status, index) in sortedStatuses"
          :key="status.id"
          :status="status"
          :requests="getRequestsByStatusName(status.name)"
          :can-delete="canDeleteStatus(status)"
          @update-status="handleStatusUpdate"
          @add-request="handleAddRequestForStatus"
          @delete-status="handleDeleteStatus"
          @open-details="handleOpenDetails"
          class="flex-shrink-0 cursor-move"
          style="width: 320px;"
          draggable="true"
          @dragstart="handleColumnDragStart($event, index)"
          @dragend="handleColumnDragEnd"
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
    <div v-if="showAddStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                Etiqueta
              </label>
              <input
                v-model="newStatus.label"
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
                v-model="newStatus.isDefault"
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
import type { RequestStatus, StatusDefinition, RequestInformation } from '../../types'

const requestsStore = useRequestsStore()
const statusStore = useStatusStore()

const showAddStatusModal = ref(false)
const newStatus = ref({
  code: '',
  label: '',
  color: '#3B82F6',
  isDefault: false
})

// Modal state
const showRequestModal = ref(false)
const selectedRequest = ref<RequestInformation | null>(null)

// Drag and drop state
const draggedColumnIndex = ref<number | null>(null)

const sortedStatuses = computed(() => statusStore.sortedStatuses)

const getRequestsByStatusName = (statusCode: string) => {
  return requestsStore.requestsByStatus[statusCode] || []
}

const handleStatusUpdate = async (requestId: string, newStatusCode: string) => {
  // Update the request with the new status code
  await requestsStore.updateRequestStatus(requestId, newStatusCode)
}

const handleAddRequest = () => {
  // TODO: Implement add request modal
  console.log('Add new lead')
}

const handleAddRequestForStatus = (status: StatusDefinition) => {
  // TODO: Implement add request modal for specific status
  console.log('Add request for status:', status.name)
}

const canDeleteStatus = (status: StatusDefinition): boolean => {
  // Can't delete if it's a default status or has requests
  if (status.isDefault) return false
  const requests = getRequestsByStatusName(status.name)
  return requests.length === 0
}

const handleDeleteStatus = async (status: StatusDefinition) => {
  if (!canDeleteStatus(status)) {
    alert('No se puede eliminar este estado porque tiene requests asignados o es un estado por defecto.')
    return
  }
  
  if (confirm(`¿Estás seguro de que quieres eliminar el estado "${status.label}"?`)) {
    await statusStore.deleteStatus(status.id)
  }
}

const handleCreateStatus = async () => {
  if (!newStatus.value.code || !newStatus.value.label) {
    alert('Por favor completa todos los campos requeridos.')
    return
  }

  const statusData = {
    name: newStatus.value.code,
    label: newStatus.value.label,
    color: newStatus.value.color,
    order: statusStore.statuses.length + 1,
    isDefault: newStatus.value.isDefault
  }

  const result = await statusStore.createStatus(statusData)
  if (result) {
    showAddStatusModal.value = false
    // Reset form
    newStatus.value = {
      code: '',
      label: '',
      color: '#3B82F6',
      isDefault: false
    }
  }
}

// Drag and drop handlers
const handleColumnDragStart = (event: DragEvent, index: number) => {
  draggedColumnIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

const handleColumnDragEnd = () => {
  draggedColumnIndex.value = null
}

const handleColumnDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (draggedColumnIndex.value === null) return
  
  // Get the drop target element
  const dropTarget = event.target as HTMLElement
  const columnElement = dropTarget.closest('[draggable="true"]')
  
  if (!columnElement) return
  
  // Find the index of the drop target
  const allColumns = Array.from(columnElement.parentElement?.children || [])
    .filter(el => el.getAttribute('draggable') === 'true')
  
  const dropIndex = allColumns.indexOf(columnElement)
  
  if (dropIndex === -1 || dropIndex === draggedColumnIndex.value) return
  
  // Reorder the statuses
  statusStore.reorderStatuses(draggedColumnIndex.value, dropIndex)
  
  draggedColumnIndex.value = null
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
  await statusStore.fetchStatuses()
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