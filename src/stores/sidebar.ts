import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const isCollapsed = ref(true) // Always collapsed

  // No need for localStorage since it's always collapsed
  const toggle = () => {
    // Do nothing - sidebar is always collapsed
  }

  const collapse = () => {
    // Already collapsed
  }

  const expand = () => {
    // Do nothing - sidebar is always collapsed
  }

  return {
    isCollapsed,
    toggle,
    collapse,
    expand
  }
})