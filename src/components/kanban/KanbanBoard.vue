<template>
  <div class="h-full">
    <!-- Header with title and new lead button -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-charcoal">Pipeline de Ventas</h1>
      <button
        @click="handleAddRequest"
        class="bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
      >
        <PhPlus :size="16" />
        <span>Nuevo Lead</span>
      </button>
    </div>

    <!-- Kanban columns -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 h-full">
      <KanbanColumn
        v-for="status in sortedStatuses"
        :key="status.id"
        :status="status"
        :requests="getRequestsByStatusName(status.name)"
        @update-status="handleStatusUpdate"
        @add-request="handleAddRequestForStatus"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { PhPlus } from '@phosphor-icons/vue'
import KanbanColumn from './KanbanColumn.vue'
import { useRequestsStore } from '../../stores/requests'
import { useStatusStore } from '../../stores/status'
import type { RequestStatus, StatusDefinition } from '../../types'

const requestsStore = useRequestsStore()
const statusStore = useStatusStore()

const sortedStatuses = computed(() => statusStore.sortedStatuses)

const getRequestsByStatusName = (statusName: string) => {
  // Map new status names to old status for compatibility
  const statusMapping: Record<string, RequestStatus> = {
    'NUEVOS': 'NEW',
    'CONTACTADOS': 'NEW',
    'CALIFICADOS': 'NEW',
    'PROPUESTA': 'IN_PROGRESS',
    'NEGOCIACION': 'IN_PROGRESS',
    'GANADOS': 'WON'
  }
  
  const mappedStatus = statusMapping[statusName] || 'NEW'
  return requestsStore.requestsByStatus[mappedStatus] || []
}

const handleStatusUpdate = async (requestId: string, newStatusName: string) => {
  // Map new status names back to old status for now
  const statusMapping: Record<string, RequestStatus> = {
    'NUEVOS': 'NEW',
    'CONTACTADOS': 'NEW',
    'CALIFICADOS': 'NEW',
    'PROPUESTA': 'IN_PROGRESS',
    'NEGOCIACION': 'IN_PROGRESS',
    'GANADOS': 'WON'
  }
  
  const mappedStatus = statusMapping[newStatusName] || 'NEW'
  await requestsStore.updateRequestStatus(requestId, mappedStatus)
}

const handleAddRequest = () => {
  // TODO: Implement add request modal
  console.log('Add new lead')
}

const handleAddRequestForStatus = (status: StatusDefinition) => {
  // TODO: Implement add request modal for specific status
  console.log('Add request for status:', status.name)
}

onMounted(() => {
  statusStore.fetchStatuses()
})
</script>