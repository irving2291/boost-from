<template>
  <div :class="cardClasses">
    <!-- Header -->
    <div
      v-if="title || subtitle || $slots.header"
      class="px-6 py-4 border-b border-gray-200 dark:border-gray-700"
    >
      <slot name="header">
        <div v-if="title || subtitle">
          <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ subtitle }}
          </p>
        </div>
      </slot>
    </div>

    <!-- Body -->
    <div class="px-6 py-4">
      <slot />
    </div>

    <!-- Footer -->
    <div
      v-if="$slots.footer"
      class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getCardClasses } from '../utils'
import type { CardProps } from '../types'

const props = withDefaults(defineProps<CardProps>(), {
  shadow: true,
  border: true,
  hover: false
})

const cardClasses = computed(() => {
  const baseClasses = getCardClasses(props.shadow, props.border, props.hover)
  return props.className ? `${baseClasses} ${props.className}` : baseClasses
})
</script>