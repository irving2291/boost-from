<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PhHouse, PhKanban, PhChartLine, PhGear, PhUsersThree, PhShield, PhBuildings, PhUsers, PhKey, PhChatCircle, PhFileText, PhUserCheck, PhAddressBook, PhMegaphone } from '@phosphor-icons/vue'
import { cn } from '../../utils'
import { useRequestsStore } from '../../stores/requests'
import { useAuthStore } from '../../stores/auth'
import { useOrganizationsStore } from '../../stores/organizations'
import { useSidebarStore } from '../../stores/sidebar'
import { REQUEST_STATUSES } from '../../utils/constants'
import { getStatusLabel } from '../../utils/i18n-helpers'
import NavItem from './NavItem.vue'
import type { NavigationItem } from '../../types/navigation'

const { t } = useI18n()

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
const sidebarStore = useSidebarStore()

const summary = computed(() => requestsStore.summary)
const activeRequestsCount = computed(() => {
  const summaryData = summary.value
  if (!summaryData) return 0
  return REQUEST_STATUSES.reduce((total, status) => total + (summaryData.byStatus[status] || 0), 0)
})

const allNavigationItems = computed((): NavigationItem[] => [
  {
    id: 'dashboard',
    label: t('navigation.dashboard'),
    icon: PhHouse,
    path: '/dashboard',
  },
  {
    id: 'crm',
    label: t('navigation.crm'),
    icon: PhUsersThree,
    children: [
      {
        id: 'requests',
        label: t('navigation.requests'),
        icon: PhKanban,
        path: '/requests',
        badge: activeRequestsCount.value,
      },
      {
        id: 'assignees',
        label: t('navigation.assignees'),
        icon: PhUserCheck,
        path: '/assignees',
      },
      {
        id: 'quotations',
        label: t('navigation.quotations'),
        icon: PhFileText,
        path: '/quotations',
      },
      {
        id: 'activations',
        label: t('navigation.activations'),
        icon: PhMegaphone,
        path: '/activations',
      },
      {
        id: 'accounts',
        label: t('navigation.accounts'),
        icon: PhAddressBook,
        path: '/accounts',
      },
      {
        id: 'chat',
        label: t('navigation.chat'),
        icon: PhChatCircle,
        path: '/chat',
      },
      {
        id: 'analytics',
        label: t('navigation.analytics'),
        icon: PhChartLine,
        path: '/analytics',
      },
      {
        id: 'landing-pages',
        label: t('navigation.landingPages'),
        icon: PhFileText,
        path: '/landing-pages',
      },
    ],
  },
  {
    id: 'admin',
    label: t('navigation.administration'),
    icon: PhShield,
    roles: ['admin', 'super-admin'],
    children: [
      {
        id: 'organizations',
        label: t('navigation.organizations'),
        icon: PhBuildings,
        path: '/admin/organizations',
        roles: ['admin', 'super-admin'],
      },
      {
        id: 'users',
        label: t('navigation.users'),
        icon: PhUsers,
        path: '/admin/users',
        roles: ['admin', 'super-admin'],
      },
      {
        id: 'roles-permissions',
        label: t('navigation.rolesPermissions'),
        icon: PhKey,
        path: '/admin/roles-permissions',
        roles: ['admin', 'super-admin'],
      },
    ],
  },
  {
    id: 'settings',
    label: t('navigation.settings'),
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
      'text-white h-screen flex flex-col transition-all duration-300 ease-in-out',
      'shadow-inner z-[9999]',
      sidebarStore.isCollapsed ? 'w-16' : 'w-64',
      className
    )"
    :style="{ background: 'linear-gradient(to bottom, #4A5568, #2D3748)' }"
  >
    <!-- Logo/Brand - Fixed Header -->
    <!-- <div class="p-6 flex-shrink-0">
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
        <div
          v-if="!sidebarStore.isCollapsed"
          class="flex-1 min-w-0 transition-opacity duration-300"
        >
          <h1 class="text-lg font-bold text-white truncate">
            {{ organizationsStore.currentOrganization?.name || t('common.crmSystem') }}
          </h1>
          <p class="text-xs text-slate-400 mt-1 truncate">
            {{ t('common.clientManagement') }}
          </p>
        </div>
      </div>
    </div> -->

    <!-- Scrollable Content Area -->
    <div class="flex-1">
      <!-- Navigation -->
      <nav class="px-4 py-6 space-y-1">
        <template v-for="item in navigationItems" :key="item.id">
          <NavItem
            :item="item"
            :current-path="currentPath"
            :is-collapsed="sidebarStore.isCollapsed"
            @navigate="handleNavigation"
          />
        </template>
      </nav>
    </div>
  </aside>
</template>
