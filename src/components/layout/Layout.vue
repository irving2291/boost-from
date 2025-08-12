<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <Sidebar 
      :current-path="currentPath"
      @navigate="handleNavigation"
    />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <Header />
      
      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <div class="max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>

    <!-- Network Status Indicator -->
    <NetworkIndicator />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import NetworkIndicator from './NetworkIndicator.vue'

const route = useRoute()
const router = useRouter()

const currentPath = computed(() => route.path)

const handleNavigation = (path: string) => {
  router.push(path)
}
</script>