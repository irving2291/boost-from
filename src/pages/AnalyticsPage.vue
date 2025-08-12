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
            24.5%
          </p>
          <p class="text-xs text-green-600 mt-1">
            +2.1% vs mes anterior
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Clientes Activos</h3>
            <PhUsers :size="20" class="text-blue-500" />
          </div>
          <p class="text-2xl font-bold text-blue-600">
            1,247
          </p>
          <p class="text-xs text-blue-600 mt-1">
            +15 nuevos esta semana
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Revenue</h3>
            <PhCurrencyDollar :size="20" class="text-green-500" />
          </div>
          <p class="text-2xl font-bold text-green-600">
            $45,230
          </p>
          <p class="text-xs text-green-600 mt-1">
            +8.2% vs mes anterior
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-slate-600">Tiempo Promedio</h3>
            <PhChartLine :size="20" class="text-slate-400" />
          </div>
          <p class="text-2xl font-bold text-slate-900">
            12.4 días
          </p>
          <p class="text-xs text-slate-500 mt-1">
            Para cerrar requests
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
            <p class="text-2xl font-bold text-blue-600">87%</p>
            <p class="text-sm text-slate-600">Satisfacción del Cliente</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-green-600">4.2</p>
            <p class="text-sm text-slate-600">Rating Promedio</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-purple-600">92%</p>
            <p class="text-sm text-slate-600">Tasa de Retención</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { PhTrendUp, PhUsers, PhCurrencyDollar, PhChartLine } from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
</script>