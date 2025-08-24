<template>
  <div :class="containerClasses">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input Container -->
    <div class="relative">
      <!-- Prefix Icon -->
      <div
        v-if="$slots.prefix"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <slot name="prefix" />
      </div>

      <!-- Input Element -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Suffix Icon -->
      <div
        v-if="$slots.suffix || showClearButton"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <!-- Clear Button -->
        <button
          v-if="showClearButton && modelValue"
          @click="clearInput"
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Custom Suffix -->
        <slot name="suffix" />
      </div>
    </div>

    <!-- Help Text -->
    <p
      v-if="helpText && !error"
      class="mt-1 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ helpText }}
    </p>

    <!-- Error Message -->
    <p
      v-if="error"
      class="mt-1 text-sm text-red-600 dark:text-red-400"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getInputClasses } from '../utils'
import type { InputProps } from '../types'

interface Props extends InputProps {
  modelValue?: string | number
  showClearButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  showClearButton: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  input: [event: Event]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  clear: []
}>()

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

const containerClasses = computed(() => {
  const baseClasses = 'w-full'
  return props.className ? `${baseClasses} ${props.className}` : baseClasses
})

const inputClasses = computed(() => {
  const baseClasses = getInputClasses(props.error, props.disabled)
  
  // Add padding for prefix/suffix icons
  let paddingClasses = ''
  if (props.$slots?.prefix) {
    paddingClasses += ' pl-10'
  }
  if (props.$slots?.suffix || props.showClearButton) {
    paddingClasses += ' pr-10'
  }
  
  return `${baseClasses}${paddingClasses}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  // Convert to number if input type is number
  if (props.type === 'number' && value !== '') {
    value = parseFloat(value)
    if (isNaN(value)) {
      value = target.value // Keep original value if not a valid number
    }
  }
  
  emit('update:modelValue', value)
  emit('input', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const clearInput = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>