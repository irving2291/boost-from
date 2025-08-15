<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { PhHouse, PhKanban, PhChartLine, PhGear, PhUsersThree, PhShield, PhBuildings, PhUsers, PhKey, PhChatCircle, PhFileText } from '@phosphor-icons/vue'
import Badge from '../ui/Badge.vue'
import { cn } from '../../utils'
import { useRequestsStore } from '../../stores/requests'
import { useAuthStore } from '../../stores/auth'
import { useOrganizationsStore } from '../../stores/organizations'
import { REQUEST_STATUSES, STATUS_LABELS } from '../../utils/constants'
import NavItem from './NavItem.vue'
import type { NavigationItem } from '../../types/navigation'

interface Props {
  currentPath?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentPath: '/dashboard',
  className: ''
})

const emit = defineEmits<{
  navigate: [path: string]
}>()

const requestsStore = useRequestsStore()
const authStore = useAuthStore()
const organizationsStore = useOrganizationsStore()

const summary = computed(() => requestsStore.summary)
const activeRequestsCount = computed(() => {
  const summaryData = summary.value
  if (!summaryData) return 0
  return REQUEST_STATUSES.reduce((total, status) => total + (summaryData.byStatus[status] || 0), 0)
})

const allNavigationItems = computed((): NavigationItem[] => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: PhHouse,
    path: '/dashboard',
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: PhUsersThree,
    children: [
      {
        id: 'requests',
        label: 'Requests',
        icon: PhKanban,
        path: '/requests',
        badge: activeRequestsCount.value,
      },
      {
        id: 'quotations',
        label: 'Cotizaciones',
        icon: PhFileText,
        path: '/quotations',
      },
      {
        id: 'chat',
        label: 'Comunicación',
        icon: PhChatCircle,
        path: '/chat',
      },
      {
        id: 'analytics',
        label: 'Analíticas',
        icon: PhChartLine,
        path: '/analytics',
      },
    ],
  },
  {
    id: 'admin',
    label: 'Administración',
    icon: PhShield,
    roles: ['admin', 'super-admin'],
    children: [
      {
        id: 'organizations',
        label: 'Organizaciones',
        icon: PhBuildings,
        path: '/admin/organizations',
        roles: ['admin', 'super-admin'],
      },
      {
        id: 'users',
        label: 'Usuarios',
        icon: PhUsers,
        path: '/admin/users',
        roles: ['admin', 'super-admin'],
      },
      {
        id: 'roles-permissions',
        label: 'Roles y Permisos',
        icon: PhKey,
        path: '/admin/roles-permissions',
        roles: ['admin', 'super-admin'],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: PhGear,
    path: '/settings',
  },
])

const navigationItems = computed(() => {
  const filterByRole = (items: NavigationItem[]): NavigationItem[] => {
    return items.filter(item => {
      // If item has roles requirement, check if user has any of those roles
      if (item.roles && item.roles.length > 0) {
        if (!authStore.hasAnyRole(item.roles)) {
          return false
        }
      }
      
      // If item has children, filter them recursively
      if (item.children) {
        const filteredChildren = filterByRole(item.children)
        // Only include parent if it has visible children or no role restrictions
        if (filteredChildren.length === 0 && item.roles && item.roles.length > 0) {
          return false
        }
        item.children = filteredChildren
      }
      
      return true
    })
  }
  
  return filterByRole([...allNavigationItems.value])
})

const isActive = (path: string) => props.currentPath === path

const handleNavigation = (path?: string) => {
  
  if (path) {
    emit('navigate', path)
  }
}

const handleLogoError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-org-logo.svg'
}

onMounted(() => {
  // Load organization data from localStorage on component mount
  organizationsStore.loadCurrentOrganizationFromStorage()
})
</script>

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
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <img
            v-if="organizationsStore.currentOrganization"
            :src="organizationsStore.getLogoUrl(organizationsStore.currentOrganization.logo_path)"
            :alt="`${organizationsStore.currentOrganization.name} logo`"
            class="h-10 w-10 rounded-full object-cover bg-gray-100"
            @error="handleLogoError"
          />
          <div
            v-else
            class="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center"
          >
            <PhBuildings :size="20" class="text-white" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-white truncate">
            {{ organizationsStore.currentOrganization?.name || 'CRM System' }}
          </h1>
          <p class="text-xs text-slate-400 mt-1 truncate">
            Gestión de Clientes
          </p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
     <nav class="flex-1 px-4 py-6 space-y-1">
      <template v-for="item in navigationItems" :key="item.id">
        <NavItem
          :item="item"
          :current-path="currentPath"
          @navigate="handleNavigation"
        />
      </template>
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
