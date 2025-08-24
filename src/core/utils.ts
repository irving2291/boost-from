import { cn } from '../utils'
import type { ButtonType, ButtonSize, Theme } from './types'

// Button utilities
export function getButtonClasses(type: ButtonType = 'primary', size: ButtonSize = 'md', busy = false, disabled = false, outline = false, block = false) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const typeClasses = {
    primary: outline 
      ? 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20'
      : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: outline
      ? 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
      : 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700',
    success: outline
      ? 'border-2 border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-500 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20'
      : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700',
    danger: outline
      ? 'border-2 border-red-500 text-red-500 hover:bg-red-50 focus:ring-red-500 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900/20'
      : 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
    warning: outline
      ? 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-500 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-yellow-900/20'
      : 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700',
    info: outline
      ? 'border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 focus:ring-cyan-500 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-900/20'
      : 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-500 dark:bg-cyan-600 dark:hover:bg-cyan-700',
    light: outline
      ? 'border-2 border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
    dark: outline
      ? 'border-2 border-gray-800 text-gray-800 hover:bg-gray-50 focus:ring-gray-700 dark:border-gray-200 dark:text-gray-200 dark:hover:bg-gray-800'
      : 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-700 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-100'
  }
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  
  const blockClass = block ? 'w-full' : ''
  const busyClass = busy ? 'cursor-wait' : ''
  
  return cn(
    baseClasses,
    typeClasses[type],
    sizeClasses[size],
    blockClass,
    busyClass
  )
}

// Modal utilities
export function getModalClasses(size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md') {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }
  
  return cn(
    'relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all',
    sizeClasses[size]
  )
}

// Input utilities
export function getInputClasses(error?: string, disabled = false) {
  const baseClasses = 'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white'
  
  const stateClasses = error
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 dark:border-red-600 dark:text-red-400'
    : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-white'
  
  const disabledClass = disabled
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400'
    : 'bg-white dark:bg-gray-700'
  
  return cn(baseClasses, stateClasses, disabledClass)
}

// Card utilities
export function getCardClasses(shadow = true, border = true, hover = false) {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg transition-all duration-200'
  const shadowClass = shadow ? 'shadow-sm' : ''
  const borderClass = border ? 'border border-gray-200 dark:border-gray-700' : ''
  const hoverClass = hover ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : ''
  
  return cn(baseClasses, shadowClass, borderClass, hoverClass)
}

// Theme utilities
export function getThemeClasses(theme: Theme) {
  return theme === 'dark' ? 'dark' : ''
}

// Spinner component for busy states
export function getSpinnerClasses(size: ButtonSize = 'md') {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  }
  
  return cn('animate-spin', sizeClasses[size])
}

// Dropdown utilities
export function getDropdownClasses() {
  return cn(
    'absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none'
  )
}

export function getDropdownItemClasses(active = false, disabled = false) {
  const baseClasses = 'cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors'
  
  if (disabled) {
    return cn(baseClasses, 'text-gray-400 cursor-not-allowed dark:text-gray-600')
  }
  
  if (active) {
    return cn(baseClasses, 'text-white bg-blue-600 dark:bg-blue-700')
  }
  
  return cn(baseClasses, 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700')
}