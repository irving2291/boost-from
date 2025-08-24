<template>
  <div :class="containerClasses" role="group">
    <Button
      v-for="(button, index) in buttons"
      :key="button.value || index"
      :type="getButtonType(button)"
      :size="size"
      :disabled="button.disabled || disabled"
      :busy="button.busy"
      :class="getButtonClasses(index)"
      @click="handleButtonClick(button, index)"
    >
      <component
        v-if="button.icon"
        :is="button.icon"
        :size="getIconSize()"
        :class="{ 'mr-2': button.label }"
      />
      {{ button.label }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from './Button.vue'
import type { ButtonSize, ButtonType } from '../types'

interface GroupButtonItem {
  label?: string
  value: any
  icon?: any
  disabled?: boolean
  busy?: boolean
  type?: ButtonType
}

interface Props {
  buttons: GroupButtonItem[]
  modelValue?: any
  size?: ButtonSize
  type?: ButtonType
  disabled?: boolean
  multiple?: boolean
  vertical?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  type: 'secondary',
  disabled: false,
  multiple: false,
  vertical: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  change: [value: any, button: GroupButtonItem, index: number]
  click: [button: GroupButtonItem, index: number]
}>()

const containerClasses = computed(() => {
  const baseClasses = props.vertical 
    ? 'inline-flex flex-col' 
    : 'inline-flex'
  
  return props.className ? `${baseClasses} ${props.className}` : baseClasses
})

const getButtonType = (button: GroupButtonItem): ButtonType => {
  // If button has specific type, use it
  if (button.type) return button.type
  
  // If button is selected, use primary type
  if (isSelected(button)) return 'primary'
  
  // Otherwise use the group's default type
  return props.type
}

const getButtonClasses = (index: number): string => {
  const isFirst = index === 0
  const isLast = index === props.buttons.length - 1
  const isMiddle = !isFirst && !isLast
  
  if (props.vertical) {
    // Vertical button group
    if (isFirst) {
      return 'rounded-b-none border-b-0'
    } else if (isLast) {
      return 'rounded-t-none'
    } else if (isMiddle) {
      return 'rounded-none border-b-0'
    }
  } else {
    // Horizontal button group
    if (isFirst) {
      return 'rounded-r-none border-r-0'
    } else if (isLast) {
      return 'rounded-l-none'
    } else if (isMiddle) {
      return 'rounded-none border-r-0'
    }
  }
  
  return ''
}

const getIconSize = (): number => {
  const sizeMap = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20
  }
  return sizeMap[props.size]
}

const isSelected = (button: GroupButtonItem): boolean => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(button.value)
  }
  return props.modelValue === button.value
}

const handleButtonClick = (button: GroupButtonItem, index: number) => {
  if (button.disabled || props.disabled) return
  
  let newValue
  
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? props.modelValue : []
    if (currentValue.includes(button.value)) {
      newValue = currentValue.filter(v => v !== button.value)
    } else {
      newValue = [...currentValue, button.value]
    }
  } else {
    // For single selection, toggle if same value is clicked
    newValue = props.modelValue === button.value ? null : button.value
  }
  
  emit('update:modelValue', newValue)
  emit('change', newValue, button, index)
  emit('click', button, index)
}
</script>

<style scoped>
/* Ensure buttons are properly connected */
.inline-flex > :deep(button:not(:first-child):not(:last-child)) {
  border-radius: 0;
}

.inline-flex > :deep(button:first-child:not(:only-child)) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.inline-flex > :deep(button:last-child:not(:only-child)) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.inline-flex.flex-col > :deep(button:not(:first-child):not(:last-child)) {
  border-radius: 0;
}

.inline-flex.flex-col > :deep(button:first-child:not(:only-child)) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.inline-flex.flex-col > :deep(button:last-child:not(:only-child)) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>