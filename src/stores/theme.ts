import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('light')

  const isLight = computed(() => {
    if (currentTheme.value === 'system') {
      return !window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return currentTheme.value === 'light'
  })

  const isDark = computed(() => {
    if (currentTheme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return currentTheme.value === 'dark'
  })

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem('theme', theme)

    // Apply theme to document
    const root = document.documentElement
    if (theme === 'dark' || (theme === 'system' && isDark.value)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    const newTheme = isLight.value ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'system' : 'light')
    }
  }

  return {
    currentTheme,
    isLight,
    isDark,
    setTheme,
    toggleTheme,
    initializeTheme,
  }
})