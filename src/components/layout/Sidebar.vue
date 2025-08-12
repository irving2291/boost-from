<template>
  <aside 
    :class="cn(
      'text-white w-64 min-h-screen flex flex-col',
      'border-r border-slate-500 shadow-inner',
      className
    )"
    :style="{ background: 'linear-gradient(to bottom, #4A5568, #2D3748)' }"
  >
    <!-- Logo/Brand -->
    <div class="p-6 border-b border-slate-300 border-opacity-30">
      <h1 class="text-xl font-bold text-white">
        CRM System
      </h1>
      <p class="text-sm text-slate-400 mt-1">
        Gestión de Clientes
      </p>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6">
      <ul class="space-y-2">
        <li v-for="item in navigationItems" :key="item.id">
          <button
            @click="handleNavigation(item.path)"
            :class="cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200',
              'hover:bg-slate-600 hover:bg-opacity-40 focus:outline-none focus:ring-2 focus:ring-slate-400',
              isActive(item.path) && 'text-white',
              !isActive(item.path) && 'text-slate-200 hover:text-white'
            )"
            :style="isActive(item.path) ? { background: 'linear-gradient(to right, #5A6578, #4A5568)' } : undefined"
          >
            <div class="flex items-center space-x-3">
              <span :class="cn(
                'transition-colors duration-200',
                isActive(item.path) ? 'text-white' : 'text-slate-200'
              )">
                <component :is="item.icon" :size="20" />
              </span>
              <span class="font-medium">
                {{ item.label }}
              </span>
            </div>
            
            <Badge
              v-if="item.badge !== undefined && item.badge > 0"
              variant="secondary"
              size="sm"
              class="bg-slate-600 bg-opacity-70 text-white border-slate-500"
            >
              {{ item.badge }}
            </Badge>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Status Summary -->
    <div v-if="summary" class="p-4 border-t border-slate-300 border-opacity-30">
      <h3 class="text-sm font-medium text-slate-100 mb-3">
        Estado de Requests
      </h3>
      <div class="space-y-2">
        <div 
          v-for="status in REQUEST_STATUSES" 
          :key="status"
          v-show="(summary.byStatus[status] || 0) > 0"
          class="flex items-center justify-between text-xs"
        >
          <span class="text-slate-200">
            {{ STATUS_LABELS[status] }}
          </span>
          <span class="text-white font-medium">
            {{ summary.byStatus[status] || 0 }}
          </span>
        </div>
      </div>
      
      <!-- Conversion Rate -->
      <div v-if="summary.conversionRate > 0" class="mt-3 pt-3 border-t border-slate-300 border-opacity-30">
        <div class="flex items-center justify-between text-xs">
          <span class="text-slate-200">
            Tasa de Conversión
          </span>
          <span class="text-green-300 font-medium">
            {{ (summary.conversionRate * 100).toFixed(1) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t border-slate-300 border-opacity-30">
      <p class="text-xs text-slate-200 text-center">
        © 2024 CRM System
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PhHouse, PhKanban, PhChartLine, PhGear } from '@phosphor-icons/vue'
import Badge from '../ui/Badge.vue'
import { cn } from '../../utils'
import { useRequestsStore } from '../../stores/requests'
import { REQUEST_STATUSES, STATUS_LABELS } from '../../utils/constants'

interface Props {
  currentPath?: string
  className?: string
}

interface NavigationItem {
  id: string
  label: string
  icon: any
  path: string
  badge?: number
}

const props = withDefaults(defineProps<Props>(), {
  currentPath: '/dashboard',
  className: ''
})

const emit = defineEmits<{
  navigate: [path: string]
}>()

const requestsStore = useRequestsStore()

const summary = computed(() => requestsStore.summary)
const activeRequestsCount = computed(() => {
  const summaryData = summary.value
  if (!summaryData) return 0
  return REQUEST_STATUSES.reduce((total, status) => total + (summaryData.byStatus[status] || 0), 0)
})

const navigationItems = computed((): NavigationItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: PhHouse,
    path: '/dashboard',
  },
  {
    id: 'requests',
    label: 'Requests',
    icon: PhKanban,
    path: '/requests',
    badge: activeRequestsCount.value,
  },
  {
    id: 'analytics',
    label: 'Analíticas',
    icon: PhChartLine,
    path: '/analytics',
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: PhGear,
    path: '/settings',
  },
])

const isActive = (path: string) => props.currentPath === path

const handleNavigation = (path: string) => {
  emit('navigate', path)
}
</script>