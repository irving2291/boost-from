<template>
  <div class="flex flex-col bg-gray-100 rounded-lg transition-all duration-200 min-h-[600px]">
    <!-- Column Header - Sticky and Draggable -->
    <div
      class="sticky top-0 z-20 flex items-center justify-between p-4 bg-slate-300 cursor-move"
      draggable="true"
      @dragstart="handleHeaderDragStart"
      @dragend="handleHeaderDragEnd"
    >
      <div class="flex items-center space-x-3">
        <h3 class="font-bold text-lg text-charcoal uppercase tracking-wide">
          {{ status.name }}
        </h3>
        <div class="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-semibold">
          {{ requests.length }}
        </div>
      </div>
      
      <div class="flex items-center space-x-1">
        <button
          @click="handleAddRequest"
          class="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
          title="Agregar lead"
          @dragstart.stop
        >
          <PhPlus :size="16" class="text-slate-600" />
        </button>
        
        <button
          v-if="canDelete"
          @click="handleDeleteStatus"
          class="p-1 hover:bg-red-100 rounded transition-colors"
          title="Eliminar estado"
          @dragstart.stop
        >
          <PhTrash :size="16" class="text-red-500" />
        </button>
      </div>
    </div>

    <!-- Droppable Area for Cards -->
    <div
      class="flex-1 p-4 overflow-y-auto"
      @dragover="handleCardDragOver"
      @drop="handleCardDrop"
      @dragenter="handleCardDragEnter"
      @dragleave="handleCardDragLeave"
      :class="{ 'bg-blue-50 border-2 border-dashed border-blue-300': isDragOver }"
    >
      <div class="space-y-4">
        <div v-if="requests.length === 0" class="text-center py-8">
          <div class="text-slate-400 mb-2">
            <PhPlus :size="32" class="mx-auto opacity-50" />
          </div>
          <p class="text-sm text-slate-500">
            No hay leads en {{ status.name?.toLowerCase() || 'este estado' }}
          </p>
        </div>
        
        <RequestCard
          v-for="request in requests"
          :key="request.id"
          :request="request"
          :status-color="status.color"
          @update-status="handleStatusUpdate"
          @open-details="handleOpenDetails"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PhPlus, PhTrash } from '@phosphor-icons/vue'
import RequestCard from './RequestCard.vue'
import type { RequestInformation, State } from '../../types/supabase'

interface Props {
  status: State
  requests: RequestInformation[]
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canDelete: false
})

const emit = defineEmits<{
  updateStatus: [requestId: string, newStatusId: string]
  addRequest: [status: State]
  deleteStatus: [status: State]
  openDetails: [request: RequestInformation]
  headerDragStart: [status: State]
  headerDragEnd: []
}>()

// Drag and drop state
const isDragOver = ref(false)

const handleStatusUpdate = (requestId: string, newStatusId: string) => {
  emit('updateStatus', requestId, newStatusId)
}

const handleAddRequest = () => {
  emit('addRequest', props.status)
}

const handleDeleteStatus = () => {
  emit('deleteStatus', props.status)
}

const handleOpenDetails = (request: RequestInformation) => {
  emit('openDetails', request)
}

// Header drag and drop handlers
const handleHeaderDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', 'column')
    event.dataTransfer.setData('application/json', JSON.stringify(props.status))
  }
  emit('headerDragStart', props.status)
}

const handleHeaderDragEnd = () => {
  emit('headerDragEnd')
}

// Card drag and drop handlers
const handleCardDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleCardDragEnter = (event: DragEvent) => {
  event.preventDefault()
  const dragType = event.dataTransfer?.getData('text/plain')
  if (dragType === 'request-card') {
    isDragOver.value = true
  }
}

const handleCardDragLeave = (event: DragEvent) => {
  // Only remove drag over state if we're leaving the drop zone entirely
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false
  }
}

const handleCardDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  const dragType = event.dataTransfer?.getData('text/plain')
  if (dragType === 'request-card') {
    const requestData = event.dataTransfer?.getData('application/json')
    if (requestData) {
      try {
        const request = JSON.parse(requestData) as RequestInformation
        // Only update if the status is different
        if (request.status_id !== props.status.id) {
          emit('updateStatus', request.id, props.status.id)
        }
      } catch (error) {
        console.error('Error parsing dropped request data:', error)
      }
    }
  }
}
</script>