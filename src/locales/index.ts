import { createI18n } from 'vue-i18n'
import es from './es.json'
import en from './en.json'
import pt from './pt.json'

export type MessageLanguages = keyof typeof messages
export type MessageSchema = typeof messages['es']

const messages = {
  es,
  en,
  pt
}

// Get saved language from localStorage or default to Spanish
const savedLanguage = localStorage.getItem('app-language') || 'es'

export const i18n = createI18n<[MessageSchema], MessageLanguages>({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'es',
  messages,
  globalInjection: true
})

export const availableLanguages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' }
]

export default i18n