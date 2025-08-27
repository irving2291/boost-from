import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './index.css'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'
import { useLanguageStore } from './stores/language'
import { initializeApiInterceptor } from './utils/api'
import { i18n } from './locales'
import { setupCalendar, Calendar, DatePicker } from 'v-calendar';
import 'v-calendar/style.css';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Use plugin defaults (optional)
app.use(setupCalendar, {})

// Use the components
app.component('VCalendar', Calendar)
app.component('VDatePicker', DatePicker)

// Initialize API interceptor for token expiration handling
initializeApiInterceptor()

// Initialize auth store
const authStore = useAuthStore()
authStore.initializeAuth()

// Initialize theme after pinia is set up
const themeStore = useThemeStore()
themeStore.initializeTheme()

// Initialize language store
const languageStore = useLanguageStore()
languageStore.initializeLanguage()

app.mount('#app')