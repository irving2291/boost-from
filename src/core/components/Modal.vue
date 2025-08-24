<template>
  <!-- Modal Backdrop -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="handleBackdropClick"
        @keydown.esc="handleEscapeKey"
        tabindex="-1"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        <!-- Modal Container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-300"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="isOpen"
              :class="modalClasses"
              @click.stop
            >
              <!-- Header -->
              <div
                v-if="showHeader"
                class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
              >
                <div>
                  <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ title }}
                  </h3>
                  <slot name="header" />
                </div>
                <button
                  v-if="closable"
                  @click="handleClose"
                  class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div class="p-6">
                <slot />
              </div>

              <!-- Footer -->
              <div
                v-if="showFooter || $slots.footer"
                class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              >
                <slot name="footer">
                  <Button
                    v-if="showCancelButton"
                    type="secondary"
                    @click="handleCancel"
                  >
                    {{ cancelText }}
                  </Button>
                  <Button
                    v-if="showConfirmButton"
                    :type="confirmButtonType"
                    :busy="confirmLoading"
                    @click="handleConfirm"
                  >
                    {{ confirmText }}
                  </Button>
                </slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'
import { getModalClasses } from '../utils'
import type { ModalProps, ButtonType } from '../types'
import Button from './Button.vue'

interface Props extends ModalProps {
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelText?: string
  confirmText?: string
  confirmButtonType?: ButtonType
  confirmLoading?: boolean
  closeAfterConfirm?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  showHeader: true,
  showFooter: false,
  showCancelButton: true,
  showConfirmButton: true,
  cancelText: 'Cancelar',
  confirmText: 'Guardar',
  confirmButtonType: 'primary',
  confirmLoading: false,
  closeAfterConfirm: true
})

const emit = defineEmits<{
  close: []
  cancel: []
  confirm: []
  'update:isOpen': [value: boolean]
}>()

const modalClasses = computed(() => {
  const baseClasses = getModalClasses(props.size)
  return props.className ? `${baseClasses} ${props.className}` : baseClasses
})

const handleClose = () => {
  emit('update:isOpen', false)
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  handleClose()
}

const handleConfirm = () => {
  emit('confirm')
  if (props.closeAfterConfirm) {
    handleClose()
  }
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

const handleEscapeKey = () => {
  if (props.closeOnEscape) {
    handleClose()
  }
}

// Focus management
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    // Focus the modal container for keyboard navigation
    const modalElement = document.querySelector('[tabindex="-1"]') as HTMLElement
    modalElement?.focus()
  }
})
</script>