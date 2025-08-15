<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Fixed Sidebar -->
    <div class="w-64 flex-shrink-0">
      <div class="fixed left-0 top-0 h-full w-64 z-10">
        <Sidebar
          :current-path="currentPath"
          @navigate="handleNavigation"
        />
      </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Fixed Header -->
      <div class="flex-shrink-0 bg-white border-b border-slate-200 z-10 relative">
        <Header />
      </div>
      
      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-hidden">
        <div class="h-full">
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