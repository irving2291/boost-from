<template>
  <div class="relative">
    <!-- Date Range Input Button -->
    <button
      ref="triggerRef"
      @click="toggleCalendar"
      class="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    >
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <span class="text-gray-700">
        {{ displayText }}
      </span>
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Clear Button -->
    <button
      v-if="selectedRange.start || selectedRange.end"
      @click="clearDates"
      class="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      :title="t('dateRange.clear')"
    >
      <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <!-- Calendar Popover -->
    <div
      v-if="showCalendar"
      ref="popoverRef"
      class="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg"
    >
      <div class="p-4">
        <VCalendar
          v-model.range="selectedRange"
          :locale="calendarLocale"
          :attributes="attributes"
          @dayclick="handleDayClick"
          is-range
          color="blue"
          :min-date="minDate"
          :max-date="maxDate"
        />
        
        <!-- Quick Actions -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex flex-wrap gap-2">
            <button
              @click="setQuickRange('today')"
              class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {{ t('dateRange.today') }}
            </button>
            <button
              @click="setQuickRange('yesterday')"
              class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {{ t('dateRange.yesterday') }}
            </button>
            <button
              @click="setQuickRange('thisWeek')"
              class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {{ t('dateRange.thisWeek') }}
            </button>
            <button
              @click="setQuickRange('lastWeek')"
              class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {{ t('dateRange.lastWeek') }}
            </button>
            <button
              @click="setQuickRange('thisMonth')"
              class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {{ t('dateRange.thisMonth') }}
            </button>
            <button
              @click="setQuickRange('lastMonth')"
              class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {{ t('dateRange.lastMonth') }}
            </button>
          </div>
          
          <!-- Apply/Cancel Buttons -->
          <div class="flex justify-end space-x-2 mt-4">
            <button
              @click="cancelSelection"
              class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="applySelection"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {{ t('common.apply') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="showCalendar"
      @click="toggleCalendar"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Calendar as VCalendar } from 'v-calendar'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns'
import { es, enUS, ptBR } from 'date-fns/locale'

const { t, locale } = useI18n()

interface Props {
  modelValue?: {
    from?: string
    to?: string
  }
  minDate?: Date
  maxDate?: Date
}

interface Emits {
  (e: 'update:modelValue', value: { from?: string; to?: string }): void
  (e: 'change', value: { from?: string; to?: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
  minDate: undefined,
  maxDate: undefined
})

const emit = defineEmits<Emits>()

// Refs
const triggerRef = ref<HTMLButtonElement>()
const popoverRef = ref<HTMLDivElement>()
const showCalendar = ref(false)

// Calendar locale mapping
const calendarLocale = computed(() => {
  const localeMap: Record<string, string> = {
    'es': 'es',
    'en': 'en-US',
    'pt': 'pt-BR'
  }
  return localeMap[locale.value] || 'en-US'
})

// Date range state
const selectedRange = ref<{ start?: Date; end?: Date }>({})
const tempRange = ref<{ start?: Date; end?: Date }>({})

// Initialize from props
const initializeRange = () => {
  const range: { start?: Date; end?: Date } = {}
  if (props.modelValue.from) {
    range.start = new Date(props.modelValue.from)
  }
  if (props.modelValue.to) {
    range.end = new Date(props.modelValue.to)
  }
  selectedRange.value = range
  tempRange.value = { ...range }
}

// Display text
const displayText = computed(() => {
  if (!selectedRange.value.start && !selectedRange.value.end) {
    return t('dateRange.selectRange')
  }
  
  const dateLocale = locale.value === 'es' ? es : locale.value === 'pt' ? ptBR : enUS
  
  if (selectedRange.value.start && selectedRange.value.end) {
    const startStr = format(selectedRange.value.start, 'dd/MM/yyyy', { locale: dateLocale })
    const endStr = format(selectedRange.value.end, 'dd/MM/yyyy', { locale: dateLocale })
    return `${startStr} - ${endStr}`
  } else if (selectedRange.value.start) {
    return format(selectedRange.value.start, 'dd/MM/yyyy', { locale: dateLocale })
  } else if (selectedRange.value.end) {
    return format(selectedRange.value.end, 'dd/MM/yyyy', { locale: dateLocale })
  }
  
  return t('dateRange.selectRange')
})

// Calendar attributes for styling
const attributes = computed(() => [
  {
    key: 'today',
    highlight: {
      color: 'gray',
      fillMode: 'outline'
    },
    dates: new Date()
  }
])

// Methods
const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
  if (showCalendar.value) {
    tempRange.value = { ...selectedRange.value }
  }
}

const handleDayClick = (day: any) => {
  // v-calendar handles range selection automatically
  tempRange.value = { ...selectedRange.value }
}

const setQuickRange = (type: string) => {
  const today = new Date()
  let start: Date
  let end: Date

  switch (type) {
    case 'today':
      start = end = today
      break
    case 'yesterday':
      start = end = subDays(today, 1)
      break
    case 'thisWeek':
      start = startOfWeek(today, { weekStartsOn: 1 })
      end = endOfWeek(today, { weekStartsOn: 1 })
      break
    case 'lastWeek':
      const lastWeek = subWeeks(today, 1)
      start = startOfWeek(lastWeek, { weekStartsOn: 1 })
      end = endOfWeek(lastWeek, { weekStartsOn: 1 })
      break
    case 'thisMonth':
      start = startOfMonth(today)
      end = endOfMonth(today)
      break
    case 'lastMonth':
      const lastMonth = subMonths(today, 1)
      start = startOfMonth(lastMonth)
      end = endOfMonth(lastMonth)
      break
    default:
      return
  }

  selectedRange.value = { start, end }
  applySelection()
}

const applySelection = () => {
  const value = {
    from: selectedRange.value.start ? format(selectedRange.value.start, 'yyyy-MM-dd') : undefined,
    to: selectedRange.value.end ? format(selectedRange.value.end, 'yyyy-MM-dd') : undefined
  }
  
  emit('update:modelValue', value)
  emit('change', value)
  showCalendar.value = false
}

const cancelSelection = () => {
  selectedRange.value = { ...tempRange.value }
  showCalendar.value = false
}

const clearDates = () => {
  selectedRange.value = {}
  const value = { from: undefined, to: undefined }
  emit('update:modelValue', value)
  emit('change', value)
}

// Watch for external changes
watch(() => props.modelValue, () => {
  initializeRange()
}, { deep: true })

// Watch for range changes from calendar
watch(selectedRange, (newRange: { start?: Date; end?: Date }) => {
  tempRange.value = { ...newRange }
}, { deep: true })

// Initialize on mount
onMounted(() => {
  initializeRange()
})

// Close calendar on outside click
const handleClickOutside = (event: MouseEvent) => {
  if (showCalendar.value &&
      triggerRef.value &&
      popoverRef.value &&
      !triggerRef.value.contains(event.target as Node) &&
      !popoverRef.value.contains(event.target as Node)) {
    cancelSelection()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom styles for v-calendar if needed */
:deep(.vc-container) {
  border: none;
  background: transparent;
}

:deep(.vc-header) {
  padding: 0.5rem;
}

:deep(.vc-weeks) {
  padding: 0;
}

:deep(.vc-day) {
  min-height: 32px;
}
</style>