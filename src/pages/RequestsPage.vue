<template>
  <Layout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Gestión de Requests</h1>
        <p class="text-slate-600 mt-1">
          Administra tus solicitudes de clientes en formato Kanban.
        </p>
      </div>

      <!-- Kanban Board -->
      <KanbanBoard />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../components/layout/Layout.vue'
import KanbanBoard from '../components/kanban/KanbanBoard.vue'
</script>