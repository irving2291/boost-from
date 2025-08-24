import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { getFromStorage, setToStorage } from '../utils'
import type { Theme } from '../core/types'

export const useThemeStore = defineStore('theme', () => {
  // State
  const currentTheme = ref<Theme>(getFromStorage('theme', 'light'))
  
  // Getters
  const isDark = computed(() => currentTheme.value === 'dark')
  const isLight = computed(() => currentTheme.value === 'light')
  
  // Actions
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    setToStorage('theme', theme)
    applyTheme(theme)
  }
  
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }
  
  const applyTheme = (theme: Theme) => {
    const html = document.documentElement
    
    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  const initializeTheme = () => {
    // Check for system preference if no stored theme
    if (!localStorage.getItem('theme')) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = systemPrefersDark ? 'dark' : 'light'
      setTheme(initialTheme)
    } else {
      applyTheme(currentTheme.value)
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
      }
    })
  }
  
  // Watch for theme changes and apply them
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })
  
  return {
    // State
    currentTheme,
    
    // Getters
    isDark,
    isLight,
    
    // Actions
    setTheme,
    toggleTheme,
    initializeTheme
  }
})