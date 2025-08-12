<template>
  <div :class="cardClasses">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-slate-600 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-slate-900">{{ value }}</p>
        <div v-if="change" class="flex items-center mt-2">
          <component 
            :is="changeIcon" 
            :class="changeIconClasses"
            :size="16"
          />
          <span :class="changeTextClasses" class="text-sm font-medium ml-1">
            {{ Math.abs(change) }}%
          </span>
          <span class="text-xs text-slate-500 ml-1">vs último mes</span>
        </div>
      </div>
      <div :class="iconContainerClasses">
        <component :is="icon" :size="24" class="text-white" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PhTrendUp, PhTrendDown } from '@phosphor-icons/vue'
import { cn } from '../../utils'

interface Props {
  title: string
  value: string | number
  change?: number
  icon: any
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const cardClasses = computed(() => cn(
  'bg-white rounded-lg p-6 border border-slate-200',
  props.className
))

const iconContainerClasses = computed(() => {
  const baseClasses = 'p-3 rounded-lg'
  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }
  return cn(baseClasses, variantClasses[props.variant])
})

const changeIcon = computed(() => {
  if (!props.change) return null
  return props.change > 0 ? PhTrendUp : PhTrendDown
})

const changeIconClasses = computed(() => {
  if (!props.change) return ''
  return props.change > 0 ? 'text-green-600' : 'text-red-600'
})

const changeTextClasses = computed(() => {
  if (!props.change) return ''
  return props.change > 0 ? 'text-green-600' : 'text-red-600'
})
</script>