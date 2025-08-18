<template>
  <div class="bg-white rounded-lg p-6 border border-slate-200">
    <h3 class="text-lg font-semibold text-slate-900 mb-4">Estado de Requests</h3>
    <div class="h-64">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { useStatusStore } from '../../stores/status'

Chart.register(...registerables)

interface Props {
  data: Record<string, number>
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null
const statusStore = useStatusStore()

// Generate colors and labels dynamically from status store
const chartData = computed(() => {
  return Object.entries(props.data)
    .filter(([_, count]) => count > 0) // Only show statuses with data
    .map(([statusCode, count]) => {
      const status = statusStore.statuses.find(s => s.name === statusCode)
      return {
        label: status?.label || statusCode,
        data: count,
        backgroundColor: status?.color || '#6B7280',
        borderColor: status?.color || '#6B7280'
      }
    })
})

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const data = chartData.value

  const config: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: data.map(item => item.label),
      datasets: [{
        data: data.map(item => item.data),
        backgroundColor: data.map(item => item.backgroundColor),
        borderColor: data.map(item => item.borderColor),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        }
      }
    }
  }

  chartInstance = new Chart(ctx, config)
}

const updateChart = () => {
  if (!chartInstance) return

  const data = chartData.value

  chartInstance.data.labels = data.map(item => item.label)
  chartInstance.data.datasets[0].data = data.map(item => item.data)
  chartInstance.data.datasets[0].backgroundColor = data.map(item => item.backgroundColor)
  chartInstance.data.datasets[0].borderColor = data.map(item => item.borderColor)
  chartInstance.update()
}

onMounted(() => {
  createChart()
})

watch(() => props.data, () => {
  updateChart()
}, { deep: true })

watch(() => chartData.value, () => {
  updateChart()
}, { deep: true })
</script>