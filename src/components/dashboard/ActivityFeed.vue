<template>
  <div class="bg-white rounded-lg p-6 border border-slate-200">
    <h3 class="text-lg font-semibold text-slate-900 mb-4">Actividad Reciente</h3>
    <div class="space-y-4">
      <div 
        v-for="activity in activities" 
        :key="activity.id"
        class="flex items-start space-x-3"
      >
        <div :class="getActivityIconClasses(activity.type)">
          <component :is="getActivityIcon(activity.type)" :size="16" class="text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-slate-900">
            <span class="font-medium">{{ activity.user }}</span>
            {{ activity.action }}
            <span class="font-medium">{{ activity.target }}</span>
          </p>
          <p class="text-xs text-slate-500 mt-1">
            {{ formatDate(activity.timestamp) }}
          </p>
        </div>
      </div>
      <div v-if="activities.length === 0" class="text-center py-8">
        <div class="text-slate-400 mb-2">
          <PhClock :size="48" class="mx-auto" />
        </div>
        <p class="text-sm text-slate-500">No hay actividad reciente</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  PhPlus, 
  PhPencil, 
  PhCheck, 
  PhX, 
  PhClock,
  PhUser
} from '@phosphor-icons/vue'
import { formatDate } from '../../utils'

interface Activity {
  id: string
  type: 'created' | 'updated' | 'completed' | 'cancelled'
  user: string
  action: string
  target: string
  timestamp: string
}

interface Props {
  activities: Activity[]
}

defineProps<Props>()

const getActivityIcon = (type: Activity['type']) => {
  const icons = {
    created: PhPlus,
    updated: PhPencil,
    completed: PhCheck,
    cancelled: PhX
  }
  return icons[type] || PhUser
}

const getActivityIconClasses = (type: Activity['type']) => {
  const baseClasses = 'flex items-center justify-center w-8 h-8 rounded-full'
  const typeClasses = {
    created: 'bg-blue-500',
    updated: 'bg-yellow-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
  }
  return `${baseClasses} ${typeClasses[type] || 'bg-slate-500'}`
}
</script>