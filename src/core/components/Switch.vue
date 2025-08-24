<template>
  <div class="flex items-center">
    <button
      :class="switchClasses"
      :disabled="disabled"
      @click="toggle"
      type="button"
      role="switch"
      :aria-checked="modelValue"
    >
      <span
        :class="thumbClasses"
        class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
      />
    </button>
    
    <label
      v-if="label"
      :for="switchId"
      class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
      @click="toggle"
    >
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: boolean
  disabled?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md',
  color: 'blue'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const switchId = ref(`switch-${Math.random().toString(36).substr(2, 9)}`)

const switchClasses = computed(() => {
  const baseClasses = 'relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-14'
  }
  
  const colorClasses = {
    blue: 'focus:ring-blue-500',
    green: 'focus:ring-green-500',
    purple: 'focus:ring-purple-500',
    red: 'focus:ring-red-500',
    yellow: 'focus:ring-yellow-500'
  }
  
  const stateClasses = props.modelValue
    ? getActiveClasses()
    : 'bg-gray-200 dark:bg-gray-700'
  
  const disabledClasses = props.disabled
    ? 'opacity-50 cursor-not-allowed'
    : ''
  
  return [
    baseClasses,
    sizeClasses[props.size],
    colorClasses[props.color],
    stateClasses,
    disabledClasses,
    props.className
  ].filter(Boolean).join(' ')
})

const thumbClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }
  
  const positionClasses = props.modelValue
    ? getThumbActivePosition()
    : 'translate-x-0'
  
  return [
    sizeClasses[props.size],
    positionClasses
  ].join(' ')
})

const getActiveClasses = () => {
  const colorMap = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  }
  return colorMap[props.color]
}

const getThumbActivePosition = () => {
  const positionMap = {
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-7'
  }
  return positionMap[props.size]
}

const toggle = () => {
  if (props.disabled) return
  
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>