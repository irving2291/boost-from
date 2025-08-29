<template>
  <div class="assignee-selector">
    <!-- Assignee Display Button - Editable for crm-manager -->
    <button
      v-if="currentAssignee && canEditAssignee"
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

    <!-- Assignee Display - Read-only for non-crm-manager -->
    <div
      v-else-if="currentAssignee && !canEditAssignee"
      class="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
      title="Solo los usuarios con rol crm-manager pueden editar el responsable"
    >
      <div class="flex-shrink-0">
        <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
          <span class="text-xs font-medium text-gray-500">
            {{ getAssigneeInitials(currentAssignee) }}
          </span>
        </div>
      </div>
      <span class="text-sm text-gray-500">
        {{ getAssigneeDisplayName(currentAssignee) }}
      </span>
      <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>
    </div>

    <!-- No Assignee State - Editable for crm-manager -->
    <button
      v-else-if="!currentAssignee && canEditAssignee"
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

    <!-- No Assignee State - Read-only for non-crm-manager -->
    <div
      v-else
      class="flex items-center space-x-2 px-3 py-2 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
      title="Solo los usuarios con rol crm-manager pueden asignar responsable"
    >
      <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>
      <span class="text-sm text-gray-400">
        Sin asignar
      </span>
    </div>

    <!-- Search Modal - Only show for crm-manager users -->
    <div v-if="showSearch && canEditAssignee" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
import { ref, onMounted, watch, computed } from 'vue'
import UserSearch from '../ui/UserSearch.vue'
import { useAssigneesStore } from '../../stores/assignees'
import { useAuthStore } from '../../stores/auth'
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
const authStore = useAuthStore()

// Computed properties
const canEditAssignee = computed(() => {
  return authStore.hasRole('crm-manager')
})

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

// Watch for changes to modelValue from parent
watch(() => props.modelValue, (newAssignee: Assignee | null) => {
  currentAssignee.value = newAssignee
  // Also update selectedAssignee for the UserSearch component
  selectedAssignee.value = newAssignee
})

// Load current user's assignee on mount
onMounted(async () => {
  try {
    console.log('AssigneeSelector: Loading current user assignee...')
    const assignee = await assigneesStore.fetchCurrentUserAssignee()
    console.log(assignee)
    console.log('AssigneeSelector: Fetched assignee:', assignee)

    if (assignee) {
      console.log('AssigneeSelector: Setting assignee:', assignee)
      currentAssignee.value = assignee
      selectedAssignee.value = assignee  // Also set selectedAssignee for UserSearch
      emit('update:modelValue', assignee)
      emit('assignee-changed', assignee)
    } else {
      console.log('AssigneeSelector: No assignee found for current user')
    }
  } catch (error) {
    console.error('AssigneeSelector: Error loading current user assignee:', error)
  }
})
</script>