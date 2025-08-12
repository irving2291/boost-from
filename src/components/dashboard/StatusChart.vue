<template>
  <div class="bg-white rounded-lg p-6 border border-slate-200">
    <h3 class="text-lg font-semibold text-slate-900 mb-4">Estado de Requests</h3>
    <div class="h-64">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import { RequestStatus } from '../../types'

Chart.register(...registerables)

interface Props {
  data: Record<RequestStatus, number>
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const statusColors = {
  pending: '#F59E0B',
  in_progress: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444'
}

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado'
}

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const chartData = Object.entries(props.data).map(([status, count]) => ({
    label: statusLabels[status as RequestStatus],
    data: count,
    backgroundColor: statusColors[status as RequestStatus],
    borderColor: statusColors[status as RequestStatus],
    borderWidth: 2
  }))

  const config: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: chartData.map(item => item.label),
      datasets: [{
        data: chartData.map(item => item.data),
        backgroundColor: chartData.map(item => item.backgroundColor),
        borderColor: chartData.map(item => item.borderColor),
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

  const chartData = Object.entries(props.data).map(([status, count]) => ({
    label: statusLabels[status as RequestStatus],
    data: count,
    backgroundColor: statusColors[status as RequestStatus]
  }))

  chartInstance.data.labels = chartData.map(item => item.label)
  chartInstance.data.datasets[0].data = chartData.map(item => item.data)
  chartInstance.data.datasets[0].backgroundColor = chartData.map(item => item.backgroundColor)
  chartInstance.update()
}

onMounted(() => {
  createChart()
})

watch(() => props.data, () => {
  updateChart()
}, { deep: true })
</script>