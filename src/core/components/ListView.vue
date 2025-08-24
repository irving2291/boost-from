<template>
  <div :class="containerClasses">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <svg class="animate-spin h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span class="ml-2 text-gray-500 dark:text-gray-400">Cargando...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {{ empty || 'No hay elementos para mostrar' }}
      </p>
    </div>

    <!-- Items List -->
    <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
      <ListTile
        v-for="item in items"
        :key="item.id"
        :item="item"
        :clickable="clickable"
        @click="handleItemClick(item)"
        @action="handleItemAction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ListTile from './ListTile.vue'
import type { ListViewProps, ListItem } from '../types'

interface Props extends ListViewProps {
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  clickable: true
})

const emit = defineEmits<{
  itemClick: [item: ListItem]
  itemAction: [action: string, item: ListItem]
}>()

const containerClasses = computed(() => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'
  return props.className ? `${baseClasses} ${props.className}` : baseClasses
})

const handleItemClick = (item: ListItem) => {
  if (props.clickable) {
    emit('itemClick', item)
  }
}

const handleItemAction = (action: string, item: ListItem) => {
  emit('itemAction', action, item)
}
</script>