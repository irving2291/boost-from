<template>
  <Layout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p class="text-slate-600 mt-1">
          Bienvenido al sistema CRM. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Requests"
          :value="summary.total"
          :change="5.2"
          :icon="PhChartLine"
          variant="default"
        />
        
        <KPICard
          title="En Proceso"
          :value="inProgressRequests"
          :change="-2.1"
          :icon="PhClock"
          variant="warning"
        />
        
        <KPICard
          title="Completados"
          :value="completedRequests"
          :change="12.5"
          :icon="PhTrendUp"
          variant="success"
        />
        
        <KPICard
          title="Pendientes"
          :value="pendingRequests"
          :change="-8.3"
          :icon="PhClock"
          variant="danger"
        />
      </div>

      <!-- Charts and Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Status Distribution Chart -->
        <StatusChart :data="summary.byStatus" />
        
        <!-- Activity Feed -->
        <ActivityFeed :activities="recentActivities" />
      </div>

      <!-- Additional Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Tiempo Promedio</h3>
            <PhChartLine :size="20" class="text-slate-400" />
          </div>
          <p class="text-2xl font-bold text-slate-900">
            14 días
          </p>
          <p class="text-xs text-slate-500 mt-1">
            Para cerrar requests
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Nuevos Hoy</h3>
            <PhTrendUp :size="20" class="text-green-500" />
          </div>
          <p class="text-2xl font-bold text-green-600">
            {{ newToday }}
          </p>
          <p class="text-xs text-slate-500 mt-1">
            Requests nuevos
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Pendientes</h3>
            <PhClock :size="20" class="text-yellow-500" />
          </div>
          <p class="text-2xl font-bold text-yellow-600">
            {{ pendingRequests }}
          </p>
          <p class="text-xs text-slate-500 mt-1">
            Requieren seguimiento
          </p>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { PhChartLine, PhTrendUp, PhClock } from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
import KPICard from '../components/dashboard/KPICard.vue'
import StatusChart from '../components/dashboard/StatusChart.vue'
import ActivityFeed from '../components/dashboard/ActivityFeed.vue'
import { useRequestsStore } from '../stores/requests'
import { useStatusStore } from '../stores/status'

const requestsStore = useRequestsStore()
const statusStore = useStatusStore()

const summary = computed(() => requestsStore.summary)
const loading = computed(() => requestsStore.loading)
const newToday = computed(() => requestsStore.newToday)
const pendingRequests = computed(() => requestsStore.pendingRequests)
const inProgressRequests = computed(() => requestsStore.inProgressRequests)
const completedRequests = computed(() => requestsStore.completedRequests)

// Load data on component mount
onMounted(async () => {
  await statusStore.fetchStatuses('request_information')
  await requestsStore.fetchRequests()
})

const recentActivities = computed(() => [
  {
    id: '1',
    type: 'created' as const,
    user: 'Juan Pérez',
    action: 'creó el request',
    target: 'REQ-001',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    type: 'updated' as const,
    user: 'María García',
    action: 'actualizó el request',
    target: 'REQ-002',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
])
</script>