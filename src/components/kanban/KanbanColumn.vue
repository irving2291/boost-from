<template>
  <div class="flex flex-col bg-gray-100 rounded-lg transition-all duration-200 min-h-[600px]">
    <!-- Column Header - Sticky -->
    <div class="sticky top-0 z-20 flex items-center justify-between p-4 bg-slate-300">
      <div class="flex items-center space-x-3">
        <h3 class="font-bold text-lg text-charcoal uppercase tracking-wide">
          {{ status.label }}
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
        >
          <PhPlus :size="16" class="text-slate-600" />
        </button>
        
        <button
          v-if="canDelete"
          @click="handleDeleteStatus"
          class="p-1 hover:bg-red-100 rounded transition-colors"
          title="Eliminar estado"
        >
          <PhTrash :size="16" class="text-red-500" />
        </button>
      </div>
    </div>

    <!-- Droppable Area -->
    <div class="flex-1 p-4 overflow-y-auto">
      <div class="space-y-4">
        <div v-if="requests.length === 0" class="text-center py-8">
          <div class="text-slate-400 mb-2">
            <PhPlus :size="32" class="mx-auto opacity-50" />
          </div>
          <p class="text-sm text-slate-500">
            No hay leads en {{ status.label.toLowerCase() }}
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
import { PhPlus, PhTrash } from '@phosphor-icons/vue'
import RequestCard from './RequestCard.vue'
import type { RequestInformation, StatusDefinition } from '../../types'

interface Props {
  status: StatusDefinition
  requests: RequestInformation[]
  canDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canDelete: false
})

const emit = defineEmits<{
  updateStatus: [requestId: string, newStatusName: string]
  addRequest: [status: StatusDefinition]
  deleteStatus: [status: StatusDefinition]
  openDetails: [request: RequestInformation]
}>()

const handleStatusUpdate = (requestId: string, newStatusName: string) => {
  emit('updateStatus', requestId, newStatusName)
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
</script>