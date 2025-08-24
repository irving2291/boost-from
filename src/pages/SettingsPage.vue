<template>
  <Layout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Configuración</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">
          Administra la configuración del sistema y preferencias.
        </p>
      </div>

      <!-- Settings Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Appearance Settings -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold">Apariencia</h3>
          </template>
          
          <div class="space-y-6">
            <!-- Quick Dark Mode Toggle -->
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <h4 class="text-sm font-medium text-slate-700 dark:text-slate-300">Modo Oscuro</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cambio rápido entre modo claro y oscuro
                </p>
              </div>
              <Switch
                v-model="isDarkModeEnabled"
                @change="handleQuickThemeToggle"
                color="blue"
                size="md"
              />
            </div>

            <!-- Advanced Theme Selection -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Configuración Avanzada de Tema
              </label>
              <GroupButton
                v-model="selectedTheme"
                :buttons="themeOptions"
                @change="handleThemeChange"
              />
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                El tema seleccionado se guardará automáticamente y se aplicará en toda la aplicación.
              </p>
            </div>
          </div>
        </Card>

        <!-- General Settings -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold">Configuración General</h3>
          </template>
          
          <div class="space-y-4">
            <Input
              v-model="companyName"
              label="Nombre de la Empresa"
              placeholder="Ingresa el nombre de la empresa"
            />
            
            <Input
              v-model="contactEmail"
              type="email"
              label="Email de Contacto"
              placeholder="contacto@empresa.com"
            />
            
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Zona Horaria
              </label>
              <Dropdown
                v-model="selectedTimezone"
                :items="timezoneOptions"
                placeholder="Selecciona una zona horaria"
              />
            </div>
          </div>
        </Card>

        <!-- Notification Settings -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold">Notificaciones</h3>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Email Notifications</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Recibir notificaciones por email</p>
              </div>
              <input
                v-model="notifications.email"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Push Notifications</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Notificaciones en el navegador</p>
              </div>
              <input
                v-model="notifications.push"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-700 dark:text-slate-300">SMS Notifications</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Notificaciones por SMS</p>
              </div>
              <input
                v-model="notifications.sms"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </Card>

        <!-- User Management -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold">Gestión de Usuarios</h3>
          </template>
          
          <div class="space-y-4">
            <ListView :items="usersList" @item-click="handleUserClick" />
            <Button type="primary" block @click="addUser">
              Agregar Usuario
            </Button>
          </div>
        </Card>

        <!-- System Info -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold">Información del Sistema</h3>
          </template>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-slate-600 dark:text-slate-400">Versión:</span>
              <span class="text-sm font-medium text-slate-900 dark:text-slate-100">1.0.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-600 dark:text-slate-400">Última Actualización:</span>
              <span class="text-sm font-medium text-slate-900 dark:text-slate-100">15 Ene 2024</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-600 dark:text-slate-400">Base de Datos:</span>
              <span class="text-sm font-medium text-green-600">Conectada</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-600 dark:text-slate-400">Almacenamiento:</span>
              <span class="text-sm font-medium text-slate-900 dark:text-slate-100">2.3 GB / 10 GB</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-600 dark:text-slate-400">Tema Actual:</span>
              <span class="text-sm font-medium text-slate-900 dark:text-slate-100 capitalize">
                {{ themeStore.currentTheme }}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-4">
        <Button type="secondary" @click="cancelChanges">
          Cancelar
        </Button>
        <Button type="primary" :busy="saving" @click="saveChanges">
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </Button>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { PhSun, PhMoon, PhDesktop } from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
import { Button, Card, Input, Dropdown, ListView, GroupButton, Switch } from '../core'
import { useThemeStore } from '../stores/theme'
import type { DropdownItem, ListItem } from '../core/types'

const themeStore = useThemeStore()

// Theme settings
const selectedTheme = ref(getInitialTheme())
const isDarkModeEnabled = ref(themeStore.isDark)

const themeOptions = [
  {
    label: 'Claro',
    value: 'light',
    icon: PhSun
  },
  {
    label: 'Oscuro',
    value: 'dark',
    icon: PhMoon
  },
  {
    label: 'Sistema',
    value: 'system',
    icon: PhDesktop
  }
]

// General settings
const companyName = ref('CRM System')
const contactEmail = ref('contact@crmsystem.com')
const selectedTimezone = ref('UTC-5')

const timezoneOptions: DropdownItem[] = [
  { label: 'UTC-5 (Ecuador)', value: 'UTC-5' },
  { label: 'UTC-3 (Argentina)', value: 'UTC-3' },
  { label: 'UTC-6 (México)', value: 'UTC-6' },
  { label: 'UTC-0 (GMT)', value: 'UTC-0' },
  { label: 'UTC+1 (Europa Central)', value: 'UTC+1' }
]

// Notification settings
const notifications = ref({
  email: true,
  push: false,
  sms: false
})

// User management
const usersList: ListItem[] = [
  {
    id: 1,
    title: 'María García',
    subtitle: 'maria@empresa.com',
    description: 'Administrador',
    badge: 'Admin',
    actions: [
      { label: 'Editar', action: () => console.log('Editar usuario') }
    ]
  },
  {
    id: 2,
    title: 'Carlos Ruiz',
    subtitle: 'carlos@empresa.com',
    description: 'Usuario estándar',
    badge: 'Usuario',
    actions: [
      { label: 'Editar', action: () => console.log('Editar usuario') }
    ]
  }
]

// Loading states
const saving = ref(false)

// Functions
function getInitialTheme() {
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme) {
    return storedTheme === themeStore.currentTheme ? storedTheme : 'system'
  }
  return 'system'
}

function handleQuickThemeToggle(isDark: boolean) {
  console.log('Toggle rápido de tema:', isDark ? 'dark' : 'light')
  
  const newTheme = isDark ? 'dark' : 'light'
  themeStore.setTheme(newTheme)
  
  // Update advanced selection to match
  selectedTheme.value = newTheme
  
  showNotification(`Modo ${isDark ? 'oscuro' : 'claro'} activado`)
}

function handleThemeChange(value: string) {
  console.log('Cambiando tema a:', value)
  
  if (value === 'system') {
    // Remove stored preference to use system default
    localStorage.removeItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    themeStore.setTheme(systemPrefersDark ? 'dark' : 'light')
    // Update switch to reflect system preference
    isDarkModeEnabled.value = systemPrefersDark
  } else {
    themeStore.setTheme(value as 'light' | 'dark')
    // Update switch to match selection
    isDarkModeEnabled.value = value === 'dark'
  }
  
  // Show confirmation
  showNotification('Tema actualizado correctamente')
}

function handleUserClick(user: ListItem) {
  console.log('Usuario seleccionado:', user)
}

function addUser() {
  console.log('Agregar nuevo usuario')
}

function cancelChanges() {
  // Reset form values
  companyName.value = 'CRM System'
  contactEmail.value = 'contact@crmsystem.com'
  selectedTimezone.value = 'UTC-5'
  notifications.value = {
    email: true,
    push: false,
    sms: false
  }
  showNotification('Cambios cancelados')
}

async function saveChanges() {
  saving.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Save settings to localStorage
    const settings = {
      companyName: companyName.value,
      contactEmail: contactEmail.value,
      timezone: selectedTimezone.value,
      notifications: notifications.value,
      theme: selectedTheme.value,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem('app_settings', JSON.stringify(settings))
    
    showNotification('Configuración guardada correctamente')
  } catch (error) {
    console.error('Error saving settings:', error)
    showNotification('Error al guardar la configuración', 'error')
  } finally {
    saving.value = false
  }
}

function showNotification(message: string, type: 'success' | 'error' = 'success') {
  // Simple notification - in a real app you'd use a toast library
  console.log(`${type.toUpperCase()}: ${message}`)
}

// Watch theme store changes to update switch
watch(() => themeStore.currentTheme, (newTheme) => {
  isDarkModeEnabled.value = newTheme === 'dark'
}, { immediate: true })

// Load saved settings on mount
onMounted(() => {
  const savedSettings = localStorage.getItem('app_settings')
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings)
      companyName.value = settings.companyName || companyName.value
      contactEmail.value = settings.contactEmail || contactEmail.value
      selectedTimezone.value = settings.timezone || selectedTimezone.value
      notifications.value = { ...notifications.value, ...settings.notifications }
    } catch (error) {
      console.error('Error loading saved settings:', error)
    }
  }
  
  // Sync initial theme state
  isDarkModeEnabled.value = themeStore.isDark
})
</script>