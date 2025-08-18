<template>
  <div class="h-screen flex flex-col bg-slate-200">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6 flex-shrink-0 bg-slate-200 p-4">
      <h1 class="text-2xl font-bold text-charcoal">Test Drag & Drop - Pipeline de Ventas</h1>
      <button
        @click="addMockRequest"
        class="bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 flex-shrink-0"
      >
        <span>Agregar Request Mock</span>
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
          :requests="getRequestsByStatusName(status.name)"
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
            @click="addMockStatus"
            class="flex flex-col items-center space-y-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <span class="text-4xl">+</span>
            <span class="text-sm font-medium">Agregar Estado</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div class="bg-white p-4 border-t">
      <h3 class="font-bold mb-2">Debug Info:</h3>
      <p class="text-sm">Total Statuses: {{ mockStatuses.length }}</p>
      <p class="text-sm">Total Requests: {{ mockRequests.length }}</p>
      <p class="text-sm">Dragged Column: {{ draggedColumnIndex }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KanbanColumn from '../components/kanban/KanbanColumn.vue'
import type { RequestInformation, StatusDefinition } from '../types'

// Mock data
const mockStatuses = ref<StatusDefinition[]>([
  {
    id: 'nuevos',
    name: 'NUEVOS',
    label: 'Nuevos',
    color: '#EF4444',
    order: 1,
    sort: 1,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'contactados',
    name: 'CONTACTADOS',
    label: 'Contactados',
    color: '#F59E0B',
    order: 2,
    sort: 2,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'calificados',
    name: 'CALIFICADOS',
    label: 'Calificados',
    color: '#10B981',
    order: 3,
    sort: 3,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'propuesta',
    name: 'PROPUESTA',
    label: 'Propuesta',
    color: '#3B82F6',
    order: 4,
    sort: 4,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
])

const mockRequests = ref<RequestInformation[]>([
  {
    id: '1',
    fistName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    phone: '+593987654321',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: {
      id: 'nuevos',
      code: 'NUEVOS',
      name: 'Nuevos',
      organization: 'test',
      default: true
    },
    priority: 'high',
    amount: 5000
  },
  {
    id: '2',
    fistName: 'María',
    lastName: 'González',
    email: 'maria@example.com',
    phone: '+593987654322',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: {
      id: 'nuevos',
      code: 'NUEVOS',
      name: 'Nuevos',
      organization: 'test',
      default: true
    },
    priority: 'medium',
    amount: 3000
  },
  {
    id: '3',
    fistName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos@example.com',
    phone: '+593987654323',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: {
      id: 'contactados',
      code: 'CONTACTADOS',
      name: 'Contactados',
      organization: 'test',
      default: true
    },
    priority: 'low',
    amount: 2000
  }
])

// Drag and drop state
const draggedColumnIndex = ref<number | null>(null)
const draggedStatus = ref<StatusDefinition | null>(null)

const sortedStatuses = computed(() => {
  return [...mockStatuses.value].sort((a, b) => {
    const sortA = a.sort !== undefined ? a.sort : a.order
    const sortB = b.sort !== undefined ? b.sort : b.order
    return sortA - sortB
  })
})

const getRequestsByStatusName = (statusCode: string) => {
  return mockRequests.value.filter(request => request.status.code === statusCode)
}

const canDeleteStatus = (status: StatusDefinition): boolean => {
  if (status.isDefault) return false
  const requests = getRequestsByStatusName(status.name)
  return requests.length === 0
}

// Handlers
const handleStatusUpdate = (requestId: string, newStatusCode: string) => {
  console.log('Updating request status:', requestId, 'to', newStatusCode)
  const request = mockRequests.value.find(r => r.id === requestId)
  if (request) {
    request.status.code = newStatusCode
    request.updatedAt = new Date().toISOString()
  }
}

const handleAddRequestForStatus = (status: StatusDefinition) => {
  console.log('Add request for status:', status.name)
}

const handleDeleteStatus = (status: StatusDefinition) => {
  console.log('Delete status:', status.name)
  const index = mockStatuses.value.findIndex(s => s.id === status.id)
  if (index > -1) {
    mockStatuses.value.splice(index, 1)
  }
}

const handleOpenDetails = (request: RequestInformation) => {
  console.log('Open details for request:', request.id)
}

// Drag and drop handlers for columns
const handleColumnDragStart = (status: StatusDefinition, index: number) => {
  console.log('Column drag start:', status.label, index)
  draggedColumnIndex.value = index
  draggedStatus.value = status
}

const handleColumnDragEnd = () => {
  console.log('Column drag end')
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
    console.log('Column drop detected')
    // Find the drop target column
    const dropTarget = event.target as HTMLElement
    const columnElement = dropTarget.closest('.flex-shrink-0')
    
    if (!columnElement) return
    
    // Find all column elements
    const boardContainer = columnElement.parentElement
    if (!boardContainer) return
    
    const allColumns = Array.from(boardContainer.children).filter(el => 
      el.classList.contains('flex-shrink-0') && el.querySelector('[draggable="true"]')
    )
    
    const dropIndex = allColumns.indexOf(columnElement)
    
    if (dropIndex === -1 || dropIndex === draggedColumnIndex.value) return
    
    console.log('Reordering from', draggedColumnIndex.value, 'to', dropIndex)
    
    // Reorder the statuses
    reorderStatuses(draggedColumnIndex.value, dropIndex)
  }
  
  // Reset drag state
  draggedColumnIndex.value = null
  draggedStatus.value = null
}

const reorderStatuses = (fromIndex: number, toIndex: number) => {
  const currentOrder = sortedStatuses.value
  const newOrder = [...currentOrder]
  const [movedStatus] = newOrder.splice(fromIndex, 1)
  newOrder.splice(toIndex, 0, movedStatus)
  
  // Update sort values for all affected statuses
  newOrder.forEach((status, index) => {
    const originalStatus = mockStatuses.value.find(s => s.id === status.id)
    if (originalStatus) {
      originalStatus.sort = index + 1
      originalStatus.order = index + 1
    }
  })
  
  console.log('New order:', newOrder.map(s => s.label))
}

// Mock data generators
const addMockRequest = () => {
  const names = ['Ana', 'Luis', 'Sofia', 'Diego', 'Carmen']
  const lastNames = ['López', 'Martín', 'Herrera', 'Vega', 'Morales']
  const priorities = ['high', 'medium', 'low']
  
  const firstName = names[Math.floor(Math.random() * names.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const priority = priorities[Math.floor(Math.random() * priorities.length)]
  
  const newRequest: RequestInformation = {
    id: Date.now().toString(),
    fistName: firstName,
    lastName: lastName,
    email: `${firstName.toLowerCase()}@example.com`,
    phone: `+59398765${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: {
      id: 'nuevos',
      code: 'NUEVOS',
      name: 'Nuevos',
      organization: 'test',
      default: true
    },
    priority: priority as 'high' | 'medium' | 'low',
    amount: Math.floor(Math.random() * 10000) + 1000
  }
  
  mockRequests.value.push(newRequest)
}

const addMockStatus = () => {
  const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#06B6D4']
  const statusNames = ['SEGUIMIENTO', 'REUNION', 'CIERRE', 'PERDIDOS']
  
  const availableNames = statusNames.filter(name => 
    !mockStatuses.value.some(s => s.name === name)
  )
  
  if (availableNames.length === 0) return
  
  const name = availableNames[0]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const nextOrder = Math.max(...mockStatuses.value.map(s => s.order)) + 1
  
  const newStatus: StatusDefinition = {
    id: name.toLowerCase(),
    name: name,
    label: name.charAt(0) + name.slice(1).toLowerCase(),
    color: color,
    order: nextOrder,
    sort: nextOrder,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockStatuses.value.push(newStatus)
}
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