<template>
  <div class="assignee-selector">
    <!-- Assignee Display Button -->
    <button
      v-if="currentAssignee"
      @click="showSearch = true"
      class="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div class="flex-shrink-0">
        <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-xs font-medium text-blue-600">
            {{ getAssigneeInitials(currentAssignee) }}
          </span>
        </div>
      </div>
      <span class="text-sm text-gray-700">
        {{ getAssigneeDisplayName(currentAssignee) }}
      </span>
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- No Assignee State -->
    <button
      v-else
      @click="showSearch = true"
      class="flex items-center space-x-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      <span class="text-sm text-gray-500">
        Asignar responsable
      </span>
    </button>

    <!-- Search Modal -->
    <div v-if="showSearch" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Seleccionar Responsable
            </h3>
            <button
              @click="showSearch = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- User Search Component -->
          <UserSearch
            v-model="selectedAssignee"
            placeholder="Buscar usuario por nombre, email o rol..."
            @user-selected="onAssigneeSelected"
          />

          <!-- Current Selection -->
          <div v-if="selectedAssignee" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-600">
                    {{ getAssigneeInitials(selectedAssignee) }}
                  </span>
                </div>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">
                  {{ getAssigneeDisplayName(selectedAssignee) }}
                </p>
                <p class="text-sm text-gray-500">{{ selectedAssignee.email }}</p>
                <p class="text-sm text-gray-500">{{ selectedAssignee.role }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 mt-6">
            <button
              @click="showSearch = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="confirmAssigneeSelection"
              :disabled="!selectedAssignee"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserSearch from '../ui/UserSearch.vue'
import { useAssigneesStore } from '../../stores/assignees'
import type { Assignee } from '../../types'

// Props
interface Props {
  modelValue?: Assignee | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [assignee: Assignee | null]
  'assignee-changed': [assignee: Assignee | null]
}>()

// Reactive data
const currentAssignee = ref<Assignee | null>(props.modelValue)
const selectedAssignee = ref<Assignee | null>(null)
const showSearch = ref(false)

// Stores
const assigneesStore = useAssigneesStore()

// Methods
const getAssigneeDisplayName = (assignee: Assignee): string => {
  return `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() || 'Usuario sin nombre'
}

const getAssigneeInitials = (assignee: Assignee): string => {
  const first = assignee.firstName?.charAt(0).toUpperCase() || ''
  const last = assignee.lastName?.charAt(0).toUpperCase() || ''
  return first + last || 'U'
}

const onAssigneeSelected = (assignee: Assignee) => {
  selectedAssignee.value = assignee
}

const confirmAssigneeSelection = () => {
  if (selectedAssignee.value) {
    currentAssignee.value = selectedAssignee.value
    emit('update:modelValue', selectedAssignee.value)
    emit('assignee-changed', selectedAssignee.value)
    showSearch.value = false
  }
}

// Load current user's assignee on mount
onMounted(async () => {
  try {
    const assignee = await assigneesStore.fetchCurrentUserAssignee()
    if (assignee) {
      currentAssignee.value = assignee
      emit('update:modelValue', assignee)
      emit('assignee-changed', assignee)
    }
  } catch (error) {
    console.error('Error loading current user assignee:', error)
  }
})
</script>