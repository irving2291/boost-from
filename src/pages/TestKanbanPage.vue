<template>
  <Layout>
    <div class="h-full flex flex-col space-y-6">
      <!-- Test Kanban Board -->
      <div class="flex-1 min-h-0">
        <TestKanbanBoard />
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import Layout from '../components/layout/Layout.vue'
import TestKanbanBoard from '../components/kanban/TestKanbanBoard.vue'
</script>