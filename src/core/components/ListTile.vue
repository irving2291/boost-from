<template>
  <div
    :class="tileClasses"
    @click="handleClick"
  >
    <div class="flex items-center space-x-4 flex-1 min-w-0">
      <!-- Avatar or Icon -->
      <div class="flex-shrink-0">
        <img
          v-if="item.avatar"
          :src="item.avatar"
          :alt="item.title"
          class="w-10 h-10 rounded-full object-cover"
        />
        <div
          v-else-if="item.icon"
          class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
        >
          <component
            :is="item.icon"
            class="w-5 h-5 text-gray-500 dark:text-gray-400"
          />
        </div>
        <div
          v-else
          class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
        >
          <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
            {{ getInitials(item.title) }}
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ item.title }}
          </p>
          
          <!-- Badge -->
          <span
            v-if="item.badge"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {{ item.badge }}
          </span>
        </div>
        
        <p
          v-if="item.subtitle"
          class="text-sm text-gray-500 dark:text-gray-400 truncate"
        >
          {{ item.subtitle }}
        </p>
        
        <p
          v-if="item.description"
          class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
        >
          {{ item.description }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div
      v-if="item.actions && item.actions.length > 0"
      class="flex items-center space-x-2 ml-4"
    >
      <button
        v-for="action in item.actions"
        :key="action.label"
        @click.stop="handleActionClick(action)"
        class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        :title="action.label"
      >
        <component
          v-if="action.icon"
          :is="action.icon"
          class="w-4 h-4"
        />
        <span v-else class="text-xs">{{ action.label }}</span>
      </button>
    </div>

    <!-- Chevron for clickable items -->
    <div
      v-if="clickable && !item.actions?.length"
      class="flex-shrink-0 ml-4"
    >
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ListTileProps, ListItem } from '../types'

const props = withDefaults(defineProps<ListTileProps>(), {
  clickable: true
})

const emit = defineEmits<{
  click: [item: ListItem]
  action: [action: string, item: ListItem]
}>()

const tileClasses = computed(() => {
  const baseClasses = 'flex items-center px-6 py-4 transition-colors'
  const clickableClasses = props.clickable 
    ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' 
    : ''
  
  const customClasses = props.className || ''
  
  return `${baseClasses} ${clickableClasses} ${customClasses}`.trim()
})

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.item)
  }
}

const handleActionClick = (action: any) => {
  if (action.action) {
    action.action()
  }
  emit('action', action.label, props.item)
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