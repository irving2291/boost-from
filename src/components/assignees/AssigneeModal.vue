<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">
          {{ isEditing ? 'Editar Responsable' : 'Crear Nuevo Responsable' }}
        </h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <AssigneeForm
        :assignee="assignee"
        :loading="loading"
        @save="handleSave"
        @cancel="closeModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AssigneeForm from './AssigneeForm.vue'
import type { Assignee } from '../../types'

interface Props {
  isOpen: boolean
  assignee?: Assignee | null
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', assignee: Omit<Assignee, 'id' | 'createdAt' | 'updatedAt'>): void
}

const props = withDefaults(defineProps<Props>(), {
  assignee: null,
  loading: false
})

const emit = defineEmits<Emits>()

// Computed
const isEditing = computed(() => !!props.assignee)

// Methods
const handleSave = (assigneeData: Omit<Assignee, 'id' | 'createdAt' | 'updatedAt'>) => {
  emit('save', assigneeData)
}

const closeModal = () => {
  emit('close')
}

// Watchers
watch(() => props.isOpen, (isOpen: boolean) => {
  if (!isOpen) {
    // Reset form when modal closes
  }
})
</script>