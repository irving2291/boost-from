import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NetworkStatus } from '../types'

export const useNetworkStore = defineStore('network', () => {
  // State
  const isOnline = ref(navigator.onLine)
  const isReconnecting = ref(false)

  // Getters
  const networkStatus = computed((): NetworkStatus => ({
    isOnline: isOnline.value,
    isReconnecting: isReconnecting.value
  }))

  // Actions
  const setOnline = (online: boolean) => {
    isOnline.value = online
    if (online) {
      isReconnecting.value = false
    }
  }

  const setReconnecting = (reconnecting: boolean) => {
    isReconnecting.value = reconnecting
  }

  // Initialize event listeners
  const initializeNetworkListeners = () => {
    window.addEventListener('online', () => setOnline(true))
    window.addEventListener('offline', () => setOnline(false))
  }

  return {
    // State
    isOnline,
    isReconnecting,
    // Getters
    networkStatus,
    // Actions
    setOnline,
    setReconnecting,
    initializeNetworkListeners
  }
})