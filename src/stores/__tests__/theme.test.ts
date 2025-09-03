import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '../theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with light theme by default', () => {
    const themeStore = useThemeStore()

    expect(themeStore.currentTheme).toBe('light')
    expect(themeStore.isLight).toBe(true)
    expect(themeStore.isDark).toBe(false)
  })

  it('should set theme correctly', () => {
    const themeStore = useThemeStore()

    themeStore.setTheme('dark')
    expect(themeStore.currentTheme).toBe('dark')
    expect(themeStore.isDark).toBe(true)
    expect(themeStore.isLight).toBe(false)

    themeStore.setTheme('light')
    expect(themeStore.currentTheme).toBe('light')
    expect(themeStore.isLight).toBe(true)
    expect(themeStore.isDark).toBe(false)
  })

  it('should toggle theme correctly', () => {
    const themeStore = useThemeStore()

    // Start with light theme
    expect(themeStore.currentTheme).toBe('light')

    // Toggle to dark
    themeStore.toggleTheme()
    expect(themeStore.currentTheme).toBe('dark')

    // Toggle back to light
    themeStore.toggleTheme()
    expect(themeStore.currentTheme).toBe('light')
  })

  it('should persist theme to localStorage', () => {
    const themeStore = useThemeStore()

    // Mock localStorage
    const mockSetItem = vi.fn()
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: mockSetItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })

    themeStore.setTheme('dark')

    expect(mockSetItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should load theme from localStorage on initialization', () => {
    // Mock localStorage with saved theme
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'dark'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })

    const themeStore = useThemeStore()

    expect(themeStore.currentTheme).toBe('dark')
    expect(themeStore.isDark).toBe(true)
  })

  it('should handle system theme preference', () => {
    // Mock matchMedia for system preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const themeStore = useThemeStore()
    themeStore.setTheme('system')

    expect(themeStore.currentTheme).toBe('system')
    expect(themeStore.isDark).toBe(true) // Based on mocked system preference
  })
})