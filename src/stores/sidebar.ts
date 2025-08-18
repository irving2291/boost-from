import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSidebarStore = defineStore('sidebar', () => {
  const isCollapsed = ref(false)
  
  // Cargar preferencia desde localStorage al inicializar
  const loadPreference = () => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      isCollapsed.value = JSON.parse(saved)
    }
  }
  
  // Guardar preferencia en localStorage
  const savePreference = () => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed.value))
  }
  
  // Toggle del estado del sidebar
  const toggle = () => {
    isCollapsed.value = !isCollapsed.value
    savePreference()
  }
  
  // Colapsar sidebar
  const collapse = () => {
    isCollapsed.value = true
    savePreference()
  }
  
  // Expandir sidebar
  const expand = () => {
    isCollapsed.value = false
    savePreference()
  }
  
  // Inicializar cargando la preferencia
  loadPreference()
  
  return {
    isCollapsed,
    toggle,
    collapse,
    expand,
    loadPreference
  }
})