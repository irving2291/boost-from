<template>
  <div class="account-search">
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
      <div
        v-for="account in searchResults"
        :key="account.id"
        @click="selectAccount(account)"
        class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
      >
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-blue-600">
                {{ getAccountInitials(account) }}
              </span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">
              {{ getAccountDisplayName(account) }}
            </p>
            <p class="text-sm text-gray-500">{{ account.email }}</p>
            <p class="text-sm text-gray-500">{{ account.phone }}</p>
          </div>
          <div class="flex-shrink-0">
            <span
              :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                account.status === 'client' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              ]"
            >
              {{ account.status === 'client' ? 'Cliente' : 'Prospecto' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 3" class="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <p class="text-sm text-gray-500 text-center">No se encontraron cuentas para "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useAccountsStore } from '../../stores/accounts'
import type { Account } from '../../types'

// Props
interface Props {
  placeholder?: string
  modelValue?: Account | null
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar cuenta por nombre, email o teléfono...'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [account: Account | null]
  'account-selected': [account: Account]
}>()

// Reactive data
const searchQuery = ref('')
const searchResults = ref<Account[]>([])
const isSearching = ref(false)
const showResults = ref(false)
const debounceTimer = ref<number | null>(null)

// Stores
const accountsStore = useAccountsStore()

// Computed
const selectedAccount = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

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
    return
  }

  isSearching.value = true
  showResults.value = true

  try {
    // Use the accounts store to search
    accountsStore.setFilters({ search: searchQuery.value })
    await accountsStore.fetchAccounts(1, 10) // Get first 10 results

    searchResults.value = accountsStore.filteredAccounts.slice(0, 5) // Limit to 5 results for UI
  } catch (error) {
    console.error('Error searching accounts:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

const selectAccount = (account: Account) => {
  selectedAccount.value = account
  searchQuery.value = getAccountDisplayName(account)
  showResults.value = false
  emit('account-selected', account)
}

const getAccountDisplayName = (account: Account): string => {
  if (account.type === 'company') {
    return account.companyName || 'Unnamed Company'
  }
  return `${account.firstName || ''} ${account.lastName || ''}`.trim() || 'Unnamed Person'
}

const getAccountInitials = (account: Account): string => {
  if (account.type === 'company') {
    return account.companyName?.charAt(0).toUpperCase() || 'C'
  }
  const first = account.firstName?.charAt(0).toUpperCase() || ''
  const last = account.lastName?.charAt(0).toUpperCase() || ''
  return first + last || 'P'
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newAccount) => {
  if (newAccount) {
    searchQuery.value = getAccountDisplayName(newAccount)
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