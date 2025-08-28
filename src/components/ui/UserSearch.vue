<template>
  <div class="user-search">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        @input="handleInput"
      />
      <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>

      <!-- Loading indicator -->
      <div v-if="isSearching" class="absolute right-3 top-2.5">
        <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="showResults && searchResults.length > 0" class="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      <!-- Results Header -->
      <div class="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <p class="text-xs text-gray-600">
          {{ hasMoreResults ? 'Primeros 25 resultados' : `${totalResults} resultado${totalResults !== 1 ? 's' : ''}` }}
        </p>
      </div>

      <!-- Results List -->
      <div
        v-for="user in searchResults"
        :key="user.id"
        @click="selectUser(user)"
        class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
      >
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-blue-600">
                {{ getUserInitials(user) }}
              </span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">
              {{ getUserDisplayName(user) }}
            </p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
            <p class="text-sm text-gray-500">{{ user.role }}</p>
          </div>
          <div class="flex-shrink-0">
            <span
              :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]"
            >
              {{ user.active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 3" class="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <p class="text-sm text-gray-500 text-center">No se encontraron usuarios para "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useAssigneesStore } from '../../stores/assignees'
import type { Assignee, ApiUser, UserSearchResponse } from '../../types'

// Props
interface Props {
  placeholder?: string
  modelValue?: Assignee | null
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar usuario por nombre, email o rol...'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [user: Assignee | null]
  'user-selected': [user: Assignee]
}>()

// Reactive data
const searchQuery = ref('')
const searchResults = ref<Assignee[]>([])
const isSearching = ref(false)
const showResults = ref(false)
const debounceTimer = ref<number | null>(null)
const totalResults = ref(0)

// Stores
const assigneesStore = useAssigneesStore()

// Computed
const selectedUser = computed({
  get: () => props.modelValue,
  set: (value: Assignee | null) => emit('update:modelValue', value)
})

const hasMoreResults = computed(() => totalResults.value > 25)

// Methods
const handleInput = () => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  debounceTimer.value = setTimeout(() => {
    performSearch()
  }, 1500) // 1.5 seconds debounce
}

const performSearch = async () => {
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    showResults.value = false
    totalResults.value = 0
    return
  }

  isSearching.value = true
  showResults.value = true

  try {
    // Use the assignees store to search users
    await assigneesStore.searchUsers(searchQuery.value)

    // Get the raw API response and map it to Assignee format
    const rawResponse = assigneesStore.searchResults

    // Check if rawResponse exists and is an array
    if (!rawResponse || !Array.isArray(rawResponse)) {
      console.warn('Invalid search results format:', rawResponse)
      searchResults.value = []
      totalResults.value = 0
      return
    }

    // Map API users to Assignee format and limit to 25 results
    const mappedResults = rawResponse.map(mapApiUserToAssignee).slice(0, 25)

    searchResults.value = mappedResults
    totalResults.value = rawResponse.length
  } catch (error) {
    console.error('Error searching users:', error)
    searchResults.value = []
    totalResults.value = 0
  } finally {
    isSearching.value = false
  }
}

const mapApiUserToAssignee = (apiUser: any): Assignee => {
  // Split the name into first and last name
  const nameParts = apiUser.name?.split(' ') || []
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  return {
    id: apiUser.id,
    firstName,
    lastName,
    email: apiUser.email,
    phone: '', // API doesn't provide phone
    avatar: undefined, // API doesn't provide avatar
    active: true, // Assume active by default
    role: 'user', // Default role
    department: undefined, // API doesn't provide department
    createdAt: apiUser.created_at,
    updatedAt: apiUser.created_at
  }
}

const selectUser = (user: Assignee) => {
  selectedUser.value = user
  searchQuery.value = getUserDisplayName(user)
  showResults.value = false
  emit('user-selected', user)
}

const getUserDisplayName = (user: Assignee): string => {
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario sin nombre'
}

const getUserInitials = (user: Assignee): string => {
  const first = user.firstName?.charAt(0).toUpperCase() || ''
  const last = user.lastName?.charAt(0).toUpperCase() || ''
  return first + last || 'U'
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newUser: Assignee | null) => {
  if (newUser) {
    searchQuery.value = getUserDisplayName(newUser)
  } else {
    searchQuery.value = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})
</script>