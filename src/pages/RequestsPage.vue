<template>
  <Layout>
    <div class="h-full flex flex-col space-y-6">
      <!-- Kanban Board -->
      <div class="flex-1 min-h-0">
        <KanbanBoard />
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../components/layout/Layout.vue'
import KanbanBoard from '../components/kanban/KanbanBoard.vue'
</script>