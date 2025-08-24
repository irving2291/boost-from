import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './index.css'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'
import { initializeApiInterceptor } from './utils/api'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize API interceptor for token expiration handling
initializeApiInterceptor()

// Initialize auth store
const authStore = useAuthStore()
authStore.initializeAuth()

// Initialize theme after pinia is set up
const themeStore = useThemeStore()
themeStore.initializeTheme()

app.mount('#app')