<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/vue'
import { PhCaretDown, PhCaretRight } from '@phosphor-icons/vue'
import type { NavigationItem } from '../../types/navigation'

interface Props {
  item: NavigationItem
  currentPath?: string
  isCollapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentPath: '',
  isCollapsed: false
})

const route = useRoute()

const emit = defineEmits<{
  navigate: [path: string]
}>()

const isActive = computed(() => {
  if (props.item.path) {
    return props.currentPath === props.item.path || route.path === props.item.path
  }
  // For parent items, check if any child is active
  if (props.item.children) {
    return props.item.children.some(child =>
      child.path && (props.currentPath === child.path || route.path === child.path)
    )
  }
  return false
})

const handleNavigation = (path?: string) => {
  if (path) {
    emit('navigate', path)
  }
}

const handleChildNavigation = (path: string) => {
  emit('navigate', path)
}

const tooltipPosition = ref('50%')

const updateTooltipPosition = (element: HTMLElement) => {
  if (!element) return

  const rect = element.getBoundingClientRect()
  const tooltipHeight = 200 // estimated height
  const viewportHeight = window.innerHeight

  // If tooltip would go above viewport
  if (rect.top - tooltipHeight / 2 < 0) {
    tooltipPosition.value = '10px'
  }
  // If tooltip would go below viewport
  else if (rect.bottom + tooltipHeight / 2 > viewportHeight) {
    tooltipPosition.value = `${viewportHeight - tooltipHeight - 10}px`
  }
  // Default center position
  else {
    tooltipPosition.value = '50%'
  }
}

const handleMouseEnter = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  updateTooltipPosition(target)
}
</script>

<template>
  <!-- Simple item without children -->
  <div
    v-if="!item.children?.length"
    class="relative group"
  >
    <a
      :class="[
        'flex w-full items-center py-2 px-3 text-sm font-medium rounded-md transition-colors relative',
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-white hover:bg-opacity-40 hover:bg-gray-900',
        isCollapsed ? 'justify-center' : ''
      ]"
      href="#"
      @click.prevent="handleNavigation(item.path)"
      :title="isCollapsed ? item.label : ''"
    >
      <component :is="item.icon" :class="['h-5 w-5 shrink-0', isCollapsed ? '' : 'mr-3']" />
      <span
        v-if="!isCollapsed"
        class="flex-1 transition-opacity duration-300"
      >
        {{ item.label }}
      </span>
      <span
        v-if="item.badge && item.badge > 0 && !isCollapsed"
        class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
      >
        {{ item.badge }}
      </span>
      <!-- Badge for collapsed mode -->
      <span
        v-if="item.badge && item.badge > 0 && isCollapsed"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{ item.badge > 99 ? '99+' : item.badge }}
      </span>
    </a>
    
    <!-- Tooltip for collapsed mode -->
    <div
      v-if="isCollapsed"
      class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap"
      style="top: 50%; transform: translateY(-50%)"
    >
      {{ item.label }}
      <span
        v-if="item.badge && item.badge > 0"
        class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1"
      >
        {{ item.badge }}
      </span>
    </div>
  </div>

  <!-- Parent item with children -->
  <div
    v-else
    class="relative group"
    @mouseenter="handleMouseEnter"
  >
    <Disclosure v-slot="{ open }" :default-open="isActive && !isCollapsed">
      <DisclosureButton
        :class="[
          'flex w-full text-left items-center py-2 px-3 font-medium rounded-md transition-colors',
          isActive
            ? 'bg-blue-600 bg-opacity-20 text-white'
            : 'text-white hover:bg-opacity-40 hover:bg-gray-900',
          isCollapsed ? 'justify-center' : ''
        ]"
        :title="isCollapsed ? item.label : ''"
      >
        <component :is="item.icon" :class="['h-5 w-5 shrink-0', isCollapsed ? '' : 'mr-3']" />
        <span
          v-if="!isCollapsed"
          class="flex-1 transition-opacity duration-300"
        >
          {{ item.label }}
        </span>
        <PhCaretDown
          v-if="open && !isCollapsed"
          class="w-4 h-4 transition-transform"
        />
        <PhCaretRight
          v-else-if="!isCollapsed"
          class="w-4 h-4 transition-transform"
        />
      </DisclosureButton>
      
      <!-- Children panel (only show when not collapsed) -->
      <DisclosurePanel
        v-if="!isCollapsed"
        class="ml-6 mt-1 space-y-1"
      >
        <NavItem
          v-for="child in item.children"
          :item="child"
          :key="child.id"
          :current-path="currentPath"
          :is-collapsed="false"
          @navigate="handleChildNavigation"
        />
      </DisclosurePanel>
    </Disclosure>
    
    <!-- Tooltip for collapsed parent items -->
    <div
      v-if="isCollapsed"
      class="absolute bg-gray-700 left-full ml-2 px-3 py-2 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
      :style="{
        top: tooltipPosition,
        transform: tooltipPosition === '50%' ? 'translateY(-50%)' : 'none',
        maxHeight: '80vh',
        overflowY: 'auto',
        whiteSpace: 'nowrap'
      }"
    >
      <div class="font-medium text-slate-100 mb-2">{{ item.label }}</div>
      <div v-if="item.children" class="space-y-1">
        <div
          v-for="child in item.children"
          :key="child.id"
          :class="[
            'flex items-center text-xs cursor-pointer px-2 py-1 rounded transition-colors',
            child.path && (props.currentPath === child.path || route.path === child.path || route.path.startsWith(child.path + '/'))
              ? 'bg-blue-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          ]"
          @click="handleChildNavigation(child.path || '')"
        >
          <component :is="child.icon" class="h-4 w-4 mr-2 shrink-0" />
          {{ child.label }}
        </div>
      </div>
    </div>
  </div>
</template>