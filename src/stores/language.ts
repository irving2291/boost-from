import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n, availableLanguages } from '../locales'
import type { MessageLanguages } from '../locales'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref<MessageLanguages>('es')

  const setLanguage = (language: MessageLanguages) => {
    currentLanguage.value = language
    i18n.global.locale.value = language
    localStorage.setItem('app-language', language)
    document.documentElement.lang = language
  }

  const initializeLanguage = () => {
    const savedLanguage = localStorage.getItem('app-language') as MessageLanguages
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      setLanguage('es')
    }
  }

  const getCurrentLanguageName = () => {
    const lang = availableLanguages.find(lang => lang.code === currentLanguage.value)
    return lang?.name || 'Español'
  }

  const getCurrentLanguageFlag = () => {
    const lang = availableLanguages.find(lang => lang.code === currentLanguage.value)
    return lang?.flag || '🇪🇸'
  }

  return {
    currentLanguage,
    setLanguage,
    initializeLanguage,
    getCurrentLanguageName,
    getCurrentLanguageFlag,
    availableLanguages
  }
})