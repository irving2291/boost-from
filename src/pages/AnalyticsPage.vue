<template>
  <Layout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Analíticas</h1>
        <p class="text-slate-600 mt-1">
          Visualiza métricas y tendencias de tu negocio.
        </p>
      </div>

      <!-- Analytics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Conversión Mensual</h3>
            <PhTrendUp :size="20" class="text-green-500" />
          </div>
          <p class="text-2xl font-bold text-slate-900">
            {{ conversionRate.toFixed(1) }}%
          </p>
          <p class="text-xs text-green-600 mt-1">
            Tasa de conversión actual
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Clientes Activos</h3>
            <PhUsers :size="20" class="text-blue-500" />
          </div>
          <p class="text-2xl font-bold text-blue-600">
            {{ activeRequests }}
          </p>
          <p class="text-xs text-blue-600 mt-1">
            Requests activos
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Revenue</h3>
            <PhCurrencyDollar :size="20" class="text-green-500" />
          </div>
          <p class="text-2xl font-bold text-green-600">
            ${{ totalRevenue.toLocaleString() }}
          </p>
          <p class="text-xs text-green-600 mt-1">
            Revenue total
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Tiempo Promedio</h3>
            <PhChartLine :size="20" class="text-slate-400" />
          </div>
          <p class="text-2xl font-bold text-slate-900">
            {{ avgTimeToClose }} días
          </p>
          <p class="text-xs text-slate-500 mt-1">
            Tiempo promedio de cierre
          </p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Chart -->
        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Revenue Mensual</h3>
          <div class="h-64 flex items-center justify-center text-slate-500">
            <p>Gráfico de revenue (Chart.js)</p>
          </div>
        </div>

        <!-- Conversion Funnel -->
        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">Embudo de Conversión</h3>
          <div class="h-64 flex items-center justify-center text-slate-500">
            <p>Embudo de conversión (Chart.js)</p>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="bg-white p-6 rounded-lg border border-slate-300">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Métricas de Rendimiento</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <p class="text-2xl font-bold text-blue-600">{{ totalRequests }}</p>
            <p class="text-sm text-slate-600">Total Requests</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-green-600">{{ totalQuotations }}</p>
            <p class="text-sm text-slate-600">Total Cotizaciones</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-purple-600">{{ quotationAcceptanceRate.toFixed(1) }}%</p>
            <p class="text-sm text-slate-600">Tasa Aceptación Cotizaciones</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PhTrendUp, PhUsers, PhCurrencyDollar, PhChartLine } from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
import { useRequestsStore } from '../stores/requests'
import { useStatusStore } from '../stores/status'
import { useQuotationsStore } from '../stores/quotations'

const requestsStore = useRequestsStore()
const statusStore = useStatusStore()
const quotationsStore = useQuotationsStore()

const loading = ref(false)

// Computed analytics
const totalRequests = computed(() => requestsStore.requests.length)
const activeRequests = computed(() => {
  return requestsStore.requests.filter(r =>
    !['won', 'lost', 'close'].includes(r.status.code)
  ).length
})

const conversionRate = computed(() => {
  const total = requestsStore.requests.length
  const won = requestsStore.requests.filter(r => r.status.code === 'won').length
  return total > 0 ? (won / total) * 100 : 0
})

const totalRevenue = computed(() => {
  return requestsStore.requests
    .filter(r => r.status.code === 'won' && r.amount)
    .reduce((sum, r) => sum + (r.amount || 0), 0)
})

const avgTimeToClose = computed(() => {
  const closedRequests = requestsStore.requests.filter(r =>
    ['won', 'lost'].includes(r.status.code)
  )
  
  if (closedRequests.length === 0) return 0
  
  const totalDays = closedRequests.reduce((sum, request) => {
    const created = new Date(request.createdAt)
    const updated = request.updatedAt ? new Date(request.updatedAt) : new Date()
    const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)
  
  return Math.round(totalDays / closedRequests.length)
})

const totalQuotations = computed(() => quotationsStore.quotations.length)
const acceptedQuotations = computed(() =>
  quotationsStore.quotations.filter(q => q.status === 'accepted').length
)

const quotationAcceptanceRate = computed(() => {
  const total = quotationsStore.quotations.length
  return total > 0 ? (acceptedQuotations.value / total) * 100 : 0
})

const fetchAnalyticsData = async () => {
  loading.value = true
  try {
    await Promise.all([
      statusStore.fetchStatuses(),
      quotationsStore.fetchQuotations()
    ])
  } catch (error) {
    console.error('Error fetching analytics data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnalyticsData()
})
</script>