<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">DateRangePicker Test</h1>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Test DateRangePicker Component</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Date Range:
            </label>
            <DateRangePicker
              v-model="dateRange"
              @change="handleDateChange"
            />
          </div>
          
          <div class="mt-6 p-4 bg-gray-100 rounded">
            <h3 class="font-medium text-gray-900 mb-2">Selected Range:</h3>
            <pre class="text-sm text-gray-600">{{ JSON.stringify(dateRange, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DateRangePicker from '../components/ui/DateRangePicker.vue'

const dateRange = ref<{ from?: string; to?: string }>({})

const handleDateChange = (value: { from?: string; to?: string }) => {
  console.log('Date range changed:', value)
}
</script>