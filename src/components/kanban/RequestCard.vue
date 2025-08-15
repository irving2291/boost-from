<template>
  <div class="bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
       :style="{ borderLeftColor: statusColor }"
       @click="openModal">
    <!-- Header with name and priority -->
    <div class="p-4">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1 min-w-0">
          <h4 class="text-base font-semibold text-charcoal truncate">
            {{ getClientName(request) }}
          </h4>
          <p class="text-sm text-slate-light mt-1">
            {{ request.email }}
          </p>
        </div>
        
        <!-- Priority Badge -->
        <span v-if="request.priority" :class="[
          'px-2 py-1 text-xs rounded font-bold uppercase tracking-wide',
          getPriorityColor(request.priority)
        ]">
          {{ getPriorityLabel(request.priority) }}
        </span>
        <!-- Status Badge if no priority -->
        <span v-else class="px-2 py-1 text-xs rounded font-bold uppercase tracking-wide bg-blue-100 text-blue-700">
          {{ request.status.name }}
        </span>
      </div>

      <!-- Amount -->
      <div v-if="request.amount" class="mb-3">
        <span class="text-xl font-bold text-accent-green">
          ${{ formatAmount(request.amount) }}
        </span>
      </div>
      
      <!-- Contact Info -->
      <div class="mb-3">
        <p class="text-sm text-slate-600">
          📞 {{ request.phone }}
        </p>
      </div>

      <!-- Time info -->
      <div class="mb-4">
        <span class="text-sm text-slate-light">
          {{ getTimeInfo(request.createdAt) }}
        </span>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center justify-end space-x-2">
        <button class="p-2 hover:bg-gray-100 rounded transition-colors" title="Llamar">
          <PhPhone :size="16" class="text-slate-light" />
        </button>
        <button class="p-2 hover:bg-gray-100 rounded transition-colors" title="Email">
          <PhEnvelope :size="16" class="text-slate-light" />
        </button>
        <button class="p-2 hover:bg-gray-100 rounded transition-colors" title="Calendario">
          <PhCalendar :size="16" class="text-slate-light" />
        </button>
        <button class="p-2 hover:bg-gray-100 rounded transition-colors" title="Editar">
          <PhPencil :size="16" class="text-slate-light" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhEnvelope, PhPhone, PhCalendar, PhPencil } from '@phosphor-icons/vue'
import type { RequestInformation } from '../../types'

interface Props {
  request: RequestInformation
  statusColor: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updateStatus: [requestId: string, newStatusName: string]
  openDetails: [request: RequestInformation]
}>()

const getClientName = (request: RequestInformation) => {
  // Handle the API typo "fistName" instead of "firstName"
  const firstName = request.fistName || request.firstName || ''
  const lastName = request.lastName || ''
  return `${firstName} ${lastName}`.trim() || request.clientName || 'Sin nombre'
}

const getPriorityColor = (priority?: string) => {
  if (!priority) return 'bg-slate-100 text-slate-700'
  const colorMap = {
    high: 'bg-accent-red text-white',
    medium: 'bg-accent-yellow text-white',
    low: 'bg-accent-green text-white'
  }
  return colorMap[priority as keyof typeof colorMap] || 'bg-slate-100 text-slate-700'
}

const getPriorityLabel = (priority?: string) => {
  if (!priority) return 'Normal'
  const labelMap = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  }
  return labelMap[priority as keyof typeof labelMap] || priority
}

const formatAmount = (amount?: number) => {
  if (!amount) return '0'
  return amount.toLocaleString('es-ES')
}

const getTimeInfo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Hace menos de 1 hora'
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
  } else if (diffInHours < 48) {
    return 'Ayer'
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }
}

const openModal = () => {
  emit('openDetails', props.request)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>