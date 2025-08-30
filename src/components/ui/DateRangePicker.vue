<template>
  <div class="relative border rounded-lg">
    <!-- Date Range Input Button -->
    <button
      ref="triggerRef"
      @click="toggleCalendar"
      class="min-w-[240px] flex items-center space-x-2 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none transition-colors"
    >
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </svg>
      <span class="text-gray-700">
        {{ displayText }}
      </span>
      <svg v-if="!(selectedRange.start || selectedRange.end)" class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Clear Button -->
    <button
      v-if="selectedRange.start || selectedRange.end"
      @click="clearDates"
      class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
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
        <VDatePicker
          v-model="singleDateModel"
          :locale="calendarLocale"
          :attributes="attributes"
          :min-date="minDate"
          :max-date="maxDate"
          color="blue"
          is-expanded
          :columns="2"
          @update:model-value="handleDateClick"
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
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { es, enUS, ptBR } from 'date-fns/locale'

interface DateRange {
  start?: Date | null
  end?: Date | null
}

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
const selectedRange = ref<DateRange>({})

// Initialize with current month by default
const initializeWithCurrentMonth = () => {
  const today = new Date()
  // Use local timezone dates to avoid timezone issues
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { start, end }
}

// Single date model for v-calendar
const singleDateModel = ref<Date | null>(null)

// Initialize from props or set current month as default
const initializeRange = () => {
  if (props.modelValue.from || props.modelValue.to) {
    // Use provided values with proper date parsing
    const range: DateRange = {}
    if (props.modelValue.from) {
      const fromDate = new Date(props.modelValue.from + 'T00:00:00')
      range.start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
    }
    if (props.modelValue.to) {
      const toDate = new Date(props.modelValue.to + 'T00:00:00')
      range.end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
    }
    selectedRange.value = range
  } else {
    // Set current month as default
    selectedRange.value = initializeWithCurrentMonth()
    emitRangeChange()
  }
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
const attributes = computed(() => {
  const attrs = [
    {
      key: 'today',
      highlight: {
        color: 'gray',
        fillMode: 'outline'
      },
      dates: new Date()
    }
  ]

  // Add range highlighting
  if (selectedRange.value.start && selectedRange.value.end) {
    attrs.push({
      key: 'selected-range',
      highlight: {
        color: 'blue',
        fillMode: 'solid'
      },
      dates: {
        start: selectedRange.value.start,
        end: selectedRange.value.end
      } as any
    })
  } else if (selectedRange.value.start) {
    // Highlight just the start date if only start is selected
    attrs.push({
      key: 'selected-start',
      highlight: {
        color: 'blue',
        fillMode: 'solid'
      },
      dates: selectedRange.value.start as any
    })
  }

  return attrs
})

// Emit range change immediately
const emitRangeChange = () => {
  const value = {
    from: selectedRange.value.start ? format(selectedRange.value.start, 'yyyy-MM-dd') : undefined,
    to: selectedRange.value.end ? format(selectedRange.value.end, 'yyyy-MM-dd') : undefined
  }
  
  emit('update:modelValue', value)
  emit('change', value)
}

// Methods
const toggleCalendar = () => {
  showCalendar.value = !showCalendar.value
}

const handleDateClick = (date: Date | null) => {
  console.log('handleDateClick called with:', date)
  
  if (date instanceof Date) {
    console.log('Date details:', {
      year: date.getFullYear(),
      month: date.getMonth(),
      date: date.getDate(),
      fullDate: date.toISOString()
    })
    
    // Normalize the date to avoid timezone issues
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    console.log('Normalized date:', normalizedDate.toISOString())
    
    if (!selectedRange.value.start || (selectedRange.value.start && selectedRange.value.end)) {
      // First click or reset - start new range
      console.log('Starting new range with:', normalizedDate)
      selectedRange.value = { start: normalizedDate, end: null }
      singleDateModel.value = null // Clear the single date model
    } else {
      // Second click - complete the range
      console.log('Completing range with:', normalizedDate)
      if (normalizedDate.getTime() === selectedRange.value.start.getTime()) {
        // Same date clicked - make it a single day range
        selectedRange.value = { start: normalizedDate, end: normalizedDate }
      } else if (normalizedDate < selectedRange.value.start) {
        selectedRange.value = { start: normalizedDate, end: selectedRange.value.start }
      } else {
        selectedRange.value = { start: selectedRange.value.start, end: normalizedDate }
      }
      emitRangeChange()
      singleDateModel.value = null // Clear the single date model
    }
  }
}

const setQuickRange = (type: string) => {
  const today = new Date()
  let start: Date
  let end: Date

  switch (type) {
    case 'today':
      start = end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      break
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      start = end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
      break
    case 'thisWeek':
      start = startOfWeek(today, { weekStartsOn: 1 })
      end = endOfWeek(today, { weekStartsOn: 1 })
      // Ensure local timezone
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      end = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      break
    case 'lastWeek':
      const lastWeek = subWeeks(today, 1)
      start = startOfWeek(lastWeek, { weekStartsOn: 1 })
      end = endOfWeek(lastWeek, { weekStartsOn: 1 })
      // Ensure local timezone
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      end = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      break
    case 'thisMonth':
      start = new Date(today.getFullYear(), today.getMonth(), 1)
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      break
    case 'lastMonth':
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      start = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)
      end = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
      break
    default:
      return
  }

  selectedRange.value = { start, end }
  emitRangeChange()
  showCalendar.value = false
}

const clearDates = () => {
  selectedRange.value = {}
  emitRangeChange()
}

// Watch for external changes
watch(() => props.modelValue, () => {
  initializeRange()
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
    showCalendar.value = false
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
/* Custom styles for v-calendar */
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

:deep(.vc-day-content) {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

:deep(.vc-day-content:hover) {
  background-color: #f3f4f6;
}

:deep(.vc-highlight) {
  background-color: #3b82f6 !important;
  color: white !important;
}

:deep(.vc-highlight-start) {
  border-radius: 6px 0 0 6px !important;
}

:deep(.vc-highlight-end) {
  border-radius: 0 6px 6px 0 !important;
}

:deep(.vc-highlight-start.vc-highlight-end) {
  border-radius: 6px !important;
}

:deep(.vc-day.is-today .vc-day-content) {
  background-color: #e5e7eb;
  font-weight: 600;
}
</style>