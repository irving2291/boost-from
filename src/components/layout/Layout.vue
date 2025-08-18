<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Fixed Sidebar -->
    <div
      :class="[
        'flex-shrink-0 transition-all duration-300 ease-in-out',
        sidebarStore.isCollapsed ? 'w-16' : 'w-64'
      ]"
    >
      <div
        :class="[
          'fixed left-0 top-0 h-full z-10 transition-all duration-300 ease-in-out',
          sidebarStore.isCollapsed ? 'w-16' : 'w-64'
        ]"
      >
        <Sidebar
          :current-path="currentPath"
          @navigate="handleNavigation"
        />
      </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Fixed Header -->
      <div class="flex-shrink-0 bg-white border-b border-slate-200 z-30 fixed top-0 right-0 transition-all duration-300 ease-in-out"
           :style="{ left: sidebarStore.isCollapsed ? '64px' : '256px' }">
        <Header />
      </div>
      
      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto"
            :style="{ marginTop: '73px' }">
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
import { useSidebarStore } from '../../stores/sidebar'

const route = useRoute()
const router = useRouter()
const sidebarStore = useSidebarStore()

const currentPath = computed(() => route.path)

const handleNavigation = (path: string) => {
  router.push(path)
}
</script>