<template>
  <div class="flex flex-col rounded-lg border-2 bg-white transition-all duration-200 min-h-[600px]"
       :style="{ borderColor: status.color + '20' }">
    <!-- Column Header -->
    <div class="flex items-center justify-between p-4 rounded-t-lg border-b-2 bg-gray-50"
         :style="{ borderBottomColor: status.color + '20' }">
      <div class="flex items-center space-x-3">
        <h3 class="font-bold text-lg text-charcoal uppercase tracking-wide">
          {{ status.label }}
        </h3>
        <div class="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-sm font-semibold">
          {{ requests.length }}
        </div>
      </div>
      
      <button
        @click="handleAddRequest"
        class="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
      >
        <PhPlus :size="16" class="text-slate-600" />
      </button>
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
          <button
            @click="handleAddRequest"
            class="mt-2 text-xs text-slate-600 hover:text-slate-800 transition-colors"
          >
            Agregar lead
          </button>
        </div>
        
        <RequestCard
          v-for="request in requests"
          :key="request.id"
          :request="request"
          :status-color="status.color"
          @update-status="handleStatusUpdate"
        />
      </div>
    </div>

    <!-- Column Footer -->
    <div class="p-3 border-t border-slate-200">
      <button
        @click="handleAddRequest"
        class="w-full text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-50 py-2 rounded transition-colors flex items-center justify-center space-x-1"
      >
        <PhPlus :size="14" />
        <span>Agregar lead</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue'
import RequestCard from './RequestCard.vue'
import type { RequestInformation, StatusDefinition } from '../../types'

interface Props {
  status: StatusDefinition
  requests: RequestInformation[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updateStatus: [requestId: string, newStatusName: string]
  addRequest: [status: StatusDefinition]
}>()

const handleStatusUpdate = (requestId: string, newStatusName: string) => {
  emit('updateStatus', requestId, newStatusName)
}

const handleAddRequest = () => {
  emit('addRequest', props.status)
}
</script>