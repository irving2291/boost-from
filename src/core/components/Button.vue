<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || busy"
    :type="htmlType"
    v-bind="$attrs"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="busy"
      :class="spinnerClasses"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    
    <!-- Button Content -->
    <span v-if="!busy || showTextWhileBusy" :class="{ 'ml-2': busy }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getButtonClasses, getSpinnerClasses } from '../utils'
import type { ButtonProps, ButtonType, ButtonSize } from '../types'

interface Props extends ButtonProps {
  htmlType?: 'button' | 'submit' | 'reset'
  showTextWhileBusy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'md',
  busy: false,
  disabled: false,
  outline: false,
  block: false,
  htmlType: 'button',
  showTextWhileBusy: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  return getButtonClasses(
    props.type,
    props.size,
    props.busy,
    props.disabled,
    props.outline,
    props.block
  ) + (props.className ? ` ${props.className}` : '')
})

const spinnerClasses = computed(() => {
  return getSpinnerClasses(props.size)
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.busy) {
    emit('click', event)
  }
}
</script>