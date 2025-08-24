<template>
  <div class="relative" ref="dropdownRef">
    <!-- Trigger Button -->
    <button
      @click="toggleDropdown"
      :disabled="disabled"
      :class="triggerClasses"
      type="button"
    >
      <span class="flex-1 text-left truncate">
        {{ selectedLabel || placeholder }}
      </span>
      <svg
        :class="[
          'w-5 h-5 transition-transform duration-200',
          isOpen ? 'rotate-180' : ''
        ]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-1"
    >
      <div
        v-if="isOpen"
        :class="dropdownClasses"
      >
        <!-- Search Input -->
        <div v-if="searchable" class="p-2 border-b border-gray-200 dark:border-gray-700">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar..."
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            @click.stop
          />
        </div>

        <!-- Items List -->
        <div class="max-h-60 overflow-y-auto">
          <template v-for="(item, index) in filteredItems" :key="index">
            <!-- Divider -->
            <hr v-if="item.divider" class="my-1 border-gray-200 dark:border-gray-700" />
            
            <!-- Item -->
            <button
              v-else
              @click="selectItem(item)"
              :disabled="item.disabled"
              :class="getItemClasses(item)"
              type="button"
            >
              <!-- Icon -->
              <span v-if="item.icon" class="mr-3">
                <i :class="item.icon" />
              </span>
              
              <!-- Label -->
              <span class="flex-1 text-left">{{ item.label }}</span>
              
              <!-- Selected Indicator -->
              <svg
                v-if="isSelected(item)"
                class="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </template>
          
          <!-- Empty State -->
          <div
            v-if="filteredItems.length === 0"
            class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center"
          >
            No se encontraron resultados
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getDropdownClasses, getDropdownItemClasses } from '../utils'
import type { DropdownProps, DropdownItem } from '../types'

interface Props extends DropdownProps {
  modelValue?: any
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Seleccionar...',
  disabled: false,
  searchable: false,
  multiple: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  change: [value: any]
  open: []
  close: []
}>()

const dropdownRef = ref<HTMLElement>()
const isOpen = ref(false)
const searchQuery = ref('')

const selectedLabel = computed(() => {
  if (!props.modelValue) return ''
  
  if (props.multiple) {
    const selectedItems = props.items.filter(item => 
      Array.isArray(props.modelValue) && props.modelValue.includes(item.value)
    )
    return selectedItems.length > 0 
      ? `${selectedItems.length} seleccionado${selectedItems.length > 1 ? 's' : ''}`
      : ''
  }
  
  const selectedItem = props.items.find(item => item.value === props.modelValue)
  return selectedItem?.label || ''
})

const filteredItems = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.items
  }
  
  return props.items.filter(item => 
    item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const triggerClasses = computed(() => {
  const baseClasses = 'relative w-full flex items-center justify-between px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
  
  if (props.disabled) {
    return `${baseClasses} opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800`
  }
  
  return `${baseClasses} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600`
})

const dropdownClasses = computed(() => {
  const baseClasses = getDropdownClasses()
  return props.className ? `${baseClasses} ${props.className}` : baseClasses
})

const toggleDropdown = () => {
  if (props.disabled) return
  
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    emit('open')
    searchQuery.value = ''
  } else {
    emit('close')
  }
}

const selectItem = (item: DropdownItem) => {
  if (item.disabled) return
  
  let newValue
  
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? props.modelValue : []
    if (currentValue.includes(item.value)) {
      newValue = currentValue.filter(v => v !== item.value)
    } else {
      newValue = [...currentValue, item.value]
    }
  } else {
    newValue = item.value
    isOpen.value = false
    emit('close')
  }
  
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const isSelected = (item: DropdownItem) => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(item.value)
  }
  return props.modelValue === item.value
}

const getItemClasses = (item: DropdownItem) => {
  const isActive = isSelected(item)
  return getDropdownItemClasses(isActive, item.disabled)
}

const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>