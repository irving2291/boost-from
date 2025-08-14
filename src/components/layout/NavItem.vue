<script setup lang="ts">
import { computed } from 'vue'
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
}

const props = withDefaults(defineProps<Props>(), {
  currentPath: ''
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
</script>

<template>
  <a
    v-if="!item.children?.length"
    :class="[
      'flex w-full items-center py-2 px-3 text-sm font-medium rounded-md transition-colors',
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-white hover:bg-opacity-40 hover:bg-gray-900'
    ]"
    href="#"
    @click.prevent="handleNavigation(item.path)"
  >
    <component :is="item.icon" class="h-5 w-5 shrink-0 mr-3" />
    <span class="flex-1">{{ item.label }}</span>
    <span
      v-if="item.badge && item.badge > 0"
      class="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center"
    >
      {{ item.badge }}
    </span>
  </a>

  <Disclosure v-else v-slot="{ open }" :default-open="isActive">
    <DisclosureButton
      :class="[
        'flex w-full text-left items-center py-2 px-3 font-medium rounded-md transition-colors',
        isActive
          ? 'bg-blue-600 bg-opacity-20 text-white'
          : 'text-white hover:bg-opacity-40 hover:bg-gray-900'
      ]"
    >
      <component :is="item.icon" class="h-5 w-5 shrink-0 mr-3" />
      <span class="flex-1">{{ item.label }}</span>
      <PhCaretDown v-if="open" class="w-4 h-4 transition-transform" />
      <PhCaretRight v-else class="w-4 h-4 transition-transform" />
    </DisclosureButton>
    <DisclosurePanel class="ml-6 mt-1 space-y-1">
      <NavItem
        v-for="child in item.children"
        :item="child"
        :key="child.id"
        :current-path="currentPath"
        @navigate="handleChildNavigation"
      />
    </DisclosurePanel>
  </Disclosure>
</template>