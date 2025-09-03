<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-charcoal flex items-center">
        <PhBell :size="20" class="mr-2 text-blue-600" />
        Enviar Notificación
      </h3>
      <button
        v-if="!showForm"
        @click="showForm = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
      >
        <PhPlus :size="16" />
        <span>Nueva</span>
      </button>
    </div>

    <!-- Notification Form -->
    <div v-if="showForm" class="space-y-4">
      <form @submit.prevent="handleSendNotification">
        <!-- Notification Type Selection -->
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-2">Tipo de Notificación</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              type="button"
              v-for="type in notificationTypes"
              :key="type.value"
              @click="selectedTypes.includes(type.value) ? removeType(type.value) : addType(type.value)"
              :class="[
                'flex items-center justify-center p-3 border-2 rounded-lg transition-all',
                selectedTypes.includes(type.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              ]"
            >
              <component :is="type.icon" :size="20" class="mr-2" />
              <span class="text-sm font-medium">{{ type.label }}</span>
            </button>
          </div>
          <p v-if="selectedTypes.length === 0" class="text-red-500 text-sm mt-1">
            Selecciona al menos un tipo de notificación
          </p>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Título</label>
          <input
            v-model="notificationForm.title"
            type="text"
            required
            maxlength="100"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Nueva promoción disponible"
          />
          <p class="text-xs text-slate-500 mt-1">{{ notificationForm.title.length }}/100 caracteres</p>
        </div>

        <!-- Message/Comment -->
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Mensaje</label>
          <textarea
            v-model="notificationForm.message"
            required
            rows="4"
            maxlength="500"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe el mensaje que deseas enviar..."
          ></textarea>
          <p class="text-xs text-slate-500 mt-1">{{ notificationForm.message.length }}/500 caracteres</p>
        </div>

        <!-- Priority -->
        <div>
          <label class="block text-sm font-medium text-slate-600 mb-1">Prioridad</label>
          <select
            v-model="notificationForm.priority"
            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        <!-- Schedule Option -->
        <div>
          <label class="flex items-center space-x-2">
            <input
              v-model="notificationForm.scheduleForLater"
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-slate-600">Programar para más tarde</span>
          </label>
        </div>

        <!-- Schedule Date/Time -->
        <div v-if="notificationForm.scheduleForLater" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
            <input
              v-model="notificationForm.scheduledDate"
              type="date"
              :min="today"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1">Hora</label>
            <input
              v-model="notificationForm.scheduledTime"
              type="time"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="cancelNotification"
            class="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading || selectedTypes.length === 0"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <PhPaperPlaneTilt v-if="!loading" :size="16" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>{{ loading ? 'Enviando...' : (notificationForm.scheduleForLater ? 'Programar' : 'Enviar') }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Recent Notifications -->
    <div v-if="!showForm && recentNotifications.length > 0" class="space-y-3">
      <h4 class="text-sm font-medium text-slate-600">Notificaciones Recientes</h4>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="notification in recentNotifications"
          :key="notification.id"
          class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex-shrink-0">
            <div :class="[
              'w-2 h-2 rounded-full mt-2',
              notification.status === 'sent' ? 'bg-green-500' : 
              notification.status === 'scheduled' ? 'bg-yellow-500' : 'bg-red-500'
            ]"></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900">{{ notification.title }}</p>
            <p class="text-xs text-slate-500 truncate">{{ notification.message }}</p>
            <div class="flex items-center space-x-2 mt-1">
              <span class="text-xs text-slate-400">{{ formatDate(notification.createdAt) }}</span>
              <div class="flex space-x-1">
                <PhEnvelope v-if="notification.types.includes('email')" :size="12" class="text-slate-400" />
                <PhDeviceMobile v-if="notification.types.includes('sms')" :size="12" class="text-slate-400" />
                <PhWhatsappLogo v-if="notification.types.includes('whatsapp')" :size="12" class="text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!showForm && recentNotifications.length === 0" class="text-center py-8 text-slate-500">
      <PhBellSlash :size="48" class="mx-auto mb-3 opacity-50" />
      <p>No hay notificaciones enviadas</p>
      <p class="text-sm">Las notificaciones aparecerán aquí una vez enviadas</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PhBell, PhPlus, PhPaperPlaneTilt, PhEnvelope, PhDeviceMobile, PhWhatsappLogo,
  PhBellSlash
} from '@phosphor-icons/vue'
import { API_ENDPOINTS, createAuthHeaders, handleApiError } from '../../utils/api'
import { useAuthStore } from '../../stores/auth'
import { useOrganizationsStore } from '../../stores/organizations'

interface NotificationForm {
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduleForLater: boolean
  scheduledDate: string
  scheduledTime: string
}

interface NotificationHistory {
  id: string
  title: string
  message: string
  types: string[]
  status: 'sent' | 'scheduled' | 'failed'
  createdAt: string
}

interface Props {
  requestId: string
  clientEmail?: string
  clientPhone?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  notificationSent: [notification: any]
}>()

// State
const showForm = ref(false)
const loading = ref(false)
const selectedTypes = ref<string[]>([])
const recentNotifications = ref<NotificationHistory[]>([])

const notificationForm = ref<NotificationForm>({
  title: '',
  message: '',
  priority: 'medium',
  scheduleForLater: false,
  scheduledDate: '',
  scheduledTime: ''
})

// Notification types - Always available for activations
const notificationTypes = [
  {
    value: 'email',
    label: 'Email',
    icon: PhEnvelope,
    available: true
  },
  {
    value: 'sms',
    label: 'SMS',
    icon: PhDeviceMobile,
    available: true
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: PhWhatsappLogo,
    available: true
  }
]

// Computed
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Methods
const addType = (type: string) => {
  if (!selectedTypes.value.includes(type)) {
    selectedTypes.value.push(type)
  }
}

const removeType = (type: string) => {
  const index = selectedTypes.value.indexOf(type)
  if (index > -1) {
    selectedTypes.value.splice(index, 1)
  }
}

const handleSendNotification = async () => {
  if (selectedTypes.value.length === 0) {
    alert('Por favor selecciona al menos un tipo de notificación')
    return
  }

  loading.value = true

  try {
    const authStore = useAuthStore()
    const organizationsStore = useOrganizationsStore()
    const notificationData = {
      requestId: props.requestId,
      title: notificationForm.value.title,
      message: notificationForm.value.message,
      types: selectedTypes.value,
      priority: notificationForm.value.priority,
      scheduledFor: notificationForm.value.scheduleForLater
        ? `${notificationForm.value.scheduledDate}T${notificationForm.value.scheduledTime}:00Z`
        : null,
      recipients: {
        email: props.clientEmail || undefined,
        phone: props.clientPhone || undefined
      }
    }

    const response = await fetch(API_ENDPOINTS.CRM.NOTIFICATIONS, {
      method: 'POST',
      headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id),
      body: JSON.stringify(notificationData)
    })

    await handleApiError(response)
    const result = await response.json()

    // Add to recent notifications
    const newNotification: NotificationHistory = {
      id: result.id || Date.now().toString(),
      title: notificationForm.value.title,
      message: notificationForm.value.message,
      types: [...selectedTypes.value],
      status: notificationForm.value.scheduleForLater ? 'scheduled' : 'sent',
      createdAt: result.createdAt || new Date().toISOString()
    }

    recentNotifications.value.unshift(newNotification)

    // Keep only last 5 notifications
    if (recentNotifications.value.length > 5) {
      recentNotifications.value = recentNotifications.value.slice(0, 5)
    }

    emit('notificationSent', result)

    // Reset form
    resetForm()
    showForm.value = false

    alert(notificationForm.value.scheduleForLater
      ? 'Notificación programada exitosamente'
      : 'Notificación enviada exitosamente'
    )

  } catch (error) {
    console.error('Error sending notification:', error)
    alert('Error al enviar la notificación. Por favor intenta nuevamente.')
  } finally {
    loading.value = false
  }
}

const cancelNotification = () => {
  resetForm()
  showForm.value = false
}

const resetForm = () => {
  notificationForm.value = {
    title: '',
    message: '',
    priority: 'medium',
    scheduleForLater: false,
    scheduledDate: '',
    scheduledTime: ''
  }
  selectedTypes.value = []
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Load recent notifications from API
const loadRecentNotifications = async () => {
  try {
    const authStore = useAuthStore()
    const organizationsStore = useOrganizationsStore()
    const response = await fetch(`${API_ENDPOINTS.CRM.NOTIFICATIONS}?requestId=${props.requestId}&limit=5`, {
      headers: createAuthHeaders(authStore.token || undefined, organizationsStore.currentOrganization?.id)
    })

    if (response.ok) {
      const data = await response.json()
      recentNotifications.value = Array.isArray(data) ? data : data.data || []
    }
  } catch (error) {
    console.error('Error loading notifications:', error)
    // Fallback to empty array if API fails
    recentNotifications.value = []
  }
}

onMounted(async () => {
  await loadRecentNotifications()
})
</script>