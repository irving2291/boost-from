<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="transform translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-full opacity-0"
    >
      <div
        v-if="showIndicator"
        :class="[
          'fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2',
          networkStatus.isOnline 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        ]"
      >
        <div 
          :class="[
            'w-2 h-2 rounded-full',
            networkStatus.isOnline ? 'bg-white' : 'bg-white animate-pulse'
          ]"
        />
        <span class="text-sm font-medium">
          {{ networkStatus.isOnline ? 'Conectado' : 'Sin conexión' }}
        </span>
        <PhWifiHigh v-if="networkStatus.isOnline" :size="16" />
        <PhWifiSlash v-else :size="16" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PhWifiHigh, PhWifiSlash } from '@phosphor-icons/vue'
import { useNetworkStore } from '../../stores/network'

const networkStore = useNetworkStore()
const showIndicator = ref(false)
let hideTimeout: NodeJS.Timeout | null = null

const networkStatus = computed(() => networkStore.networkStatus)

// Watch for network status changes
watch(
  () => networkStatus.value.isOnline,
  (isOnline, wasOnline) => {
    // Only show indicator when status changes
    if (wasOnline !== undefined && isOnline !== wasOnline) {
      showIndicator.value = true
      
      // Clear existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
      
      // Hide after 3 seconds
      hideTimeout = setTimeout(() => {
        showIndicator.value = false
      }, 3000)
    }
  }
)

// Show indicator when reconnecting
watch(
  () => networkStatus.value.isReconnecting,
  (isReconnecting) => {
    if (isReconnecting) {
      showIndicator.value = true
    }
  }
)
</script>