<template>
  <div v-if="isOpen && activation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <component :is="getTypeIcon(activation.type)" :size="24" class="text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-charcoal">{{ activation.title }}</h2>
            <div class="flex items-center space-x-3 mt-1">
              <span :class="[
                'px-2 py-1 rounded-full text-xs font-medium',
                getStatusColor(activation.status)
              ]">
                {{ getStatusLabel(activation.status) }}
              </span>
              <span :class="[
                'px-2 py-1 rounded text-xs font-medium',
                getPriorityColor(activation.priority)
              ]">
                {{ getPriorityLabel(activation.priority) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="editActivation"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PhPencil :size="16" />
            <span>Editar</span>
          </button>
          <button
            @click="closeModal"
            class="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <PhX :size="24" class="text-slate-600" />
          </button>
        </div>
      </div>

      <!-- Modal Content - Split Layout -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left Side - Activation Details -->
        <div class="w-1/2 p-6 overflow-y-auto border-r border-gray-200">
          <div class="space-y-6">
            <!-- Basic Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Información General</h3>
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-slate-600">Tipo:</label>
                  <div class="flex items-center space-x-2 mt-1">
                    <component :is="getTypeIcon(activation.type)" :size="16" class="text-gray-500" />
                    <span class="text-slate-800">{{ getTypeLabel(activation.type) }}</span>
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-slate-600">Descripción:</label>
                  <p class="text-slate-800 mt-1 whitespace-pre-wrap">{{ activation.description }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-slate-600">Audiencia Objetivo:</label>
                  <p class="text-slate-800 mt-1">{{ activation.targetAudience || 'Todos los clientes' }}</p>
                </div>
              </div>
            </div>

            <!-- Channels -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Canales de Comunicación</h3>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="channel in activation.channels"
                  :key="channel"
                  class="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border"
                >
                  <PhEnvelope v-if="channel === 'email'" :size="16" class="text-blue-500" />
                  <PhDeviceMobile v-else-if="channel === 'sms'" :size="16" class="text-green-500" />
                  <PhWhatsappLogo v-else-if="channel === 'whatsapp'" :size="16" class="text-green-600" />
                  <span class="text-sm font-medium">{{ getChannelLabel(channel) }}</span>
                </div>
              </div>
            </div>

            <!-- Schedule -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Programación</h3>
              <div class="space-y-2">
                <div class="flex items-center space-x-3">
                  <PhCalendar :size="20" class="text-slate-500" />
                  <div>
                    <p class="text-sm text-slate-600">
                      {{ activation.scheduledFor ? 'Programada para' : 'Sin programar' }}
                    </p>
                    <p class="text-slate-800">
                      {{ activation.scheduledFor ? formatDate(activation.scheduledFor) : 'Activación manual' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <PhClock :size="20" class="text-slate-500" />
                  <div>
                    <p class="text-sm text-slate-600">Creada</p>
                    <p class="text-slate-800">{{ formatDate(activation.createdAt) }}</p>
                  </div>
                </div>
                <div v-if="activation.updatedAt" class="flex items-center space-x-3">
                  <PhClockCounterClockwise :size="20" class="text-slate-500" />
                  <div>
                    <p class="text-sm text-slate-600">Última actualización</p>
                    <p class="text-slate-800">{{ formatDate(activation.updatedAt) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Acciones</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-if="activation.status === 'draft'"
                  @click="activateNow"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <PhPlay :size="16" />
                  <span>Activar Ahora</span>
                </button>
                <button
                  v-if="activation.status === 'active'"
                  @click="pauseActivation"
                  class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                >
                  <PhPause :size="16" />
                  <span>Pausar</span>
                </button>
                <button
                  v-if="['draft', 'scheduled', 'active'].includes(activation.status)"
                  @click="cancelActivation"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <PhStop :size="16" />
                  <span>Cancelar</span>
                </button>
                <button
                  @click="duplicateActivation"
                  class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <PhCopy :size="16" />
                  <span>Duplicar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Notification Panel -->
        <div class="w-1/2 p-6 overflow-y-auto">
          <NotificationPanel
            :request-id="activation.id"
            :client-email="'cliente@ejemplo.com'"
            :client-phone="'+593999999999'"
            @notification-sent="handleNotificationSent"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  PhX, PhPencil, PhCalendar, PhClock, PhClockCounterClockwise,
  PhEnvelope, PhDeviceMobile, PhWhatsappLogo,
  PhPlay, PhPause, PhStop, PhCopy,
  PhMegaphone, PhSpeakerHigh, PhBell, PhQuestion
} from '@phosphor-icons/vue'
import NotificationPanel from '../notifications/NotificationPanel.vue'
import { activationService, type Activation } from '../../services/activationService'

interface Props {
  isOpen: boolean
  activation?: Activation | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  edit: [activation: Activation]
}>()

// Methods
const closeModal = () => {
  emit('close')
}

const editActivation = () => {
  if (props.activation) {
    emit('edit', props.activation)
  }
}

const activateNow = async () => {
  if (!props.activation) return
  
  if (confirm('¿Estás seguro de que quieres activar esta activación ahora?')) {
    try {
      await activationService.changeActivationStatus(props.activation.id, 'active')
      // Update the activation status locally or emit an event to refresh
      if (props.activation) {
        props.activation.status = 'active'
      }
      alert('Activación activada exitosamente')
    } catch (error) {
      console.error('Error activating:', error)
      alert('Error al activar la activación. Por favor intenta nuevamente.')
    }
  }
}

const pauseActivation = async () => {
  if (!props.activation) return
  
  if (confirm('¿Estás seguro de que quieres pausar esta activación?')) {
    try {
      await activationService.changeActivationStatus(props.activation.id, 'draft')
      // Update the activation status locally or emit an event to refresh
      if (props.activation) {
        props.activation.status = 'draft'
      }
      alert('Activación pausada exitosamente')
    } catch (error) {
      console.error('Error pausing:', error)
      alert('Error al pausar la activación. Por favor intenta nuevamente.')
    }
  }
}

const cancelActivation = async () => {
  if (!props.activation) return
  
  if (confirm('¿Estás seguro de que quieres cancelar esta activación? Esta acción no se puede deshacer.')) {
    try {
      await activationService.changeActivationStatus(props.activation.id, 'cancelled')
      // Update the activation status locally or emit an event to refresh
      if (props.activation) {
        props.activation.status = 'cancelled'
      }
      alert('Activación cancelada exitosamente')
    } catch (error) {
      console.error('Error cancelling:', error)
      alert('Error al cancelar la activación. Por favor intenta nuevamente.')
    }
  }
}

const duplicateActivation = async () => {
  if (!props.activation) return
  
  try {
    const duplicateData = {
      title: `${props.activation.title} (Copia)`,
      description: props.activation.description,
      type: props.activation.type,
      priority: props.activation.priority,
      channels: [...props.activation.channels],
      targetAudience: props.activation.targetAudience
    }
    
    await activationService.createActivation(duplicateData)
    alert('Activación duplicada exitosamente')
    emit('close') // Close the modal after duplication
  } catch (error) {
    console.error('Error duplicating:', error)
    alert('Error al duplicar la activación. Por favor intenta nuevamente.')
  }
}

const handleNotificationSent = (notification: any) => {
  console.log('Notification sent from activation details:', notification)
}

// Helper methods
const getStatusColor = (status: string) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status: string) => {
  const labels = {
    draft: 'Borrador',
    scheduled: 'Programada',
    active: 'Activa',
    completed: 'Completada',
    cancelled: 'Cancelada'
  }
  return labels[status as keyof typeof labels] || status
}

const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-700'
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  }
  return labels[priority as keyof typeof labels] || priority
}

const getTypeLabel = (type: string) => {
  const labels = {
    promotion: 'Promoción',
    announcement: 'Anuncio',
    reminder: 'Recordatorio',
    survey: 'Encuesta'
  }
  return labels[type as keyof typeof labels] || type
}

const getTypeIcon = (type: string) => {
  const icons = {
    promotion: PhMegaphone,
    announcement: PhSpeakerHigh,
    reminder: PhBell,
    survey: PhQuestion
  }
  return icons[type as keyof typeof icons] || PhMegaphone
}

const getChannelLabel = (channel: string) => {
  const labels = {
    email: 'Email',
    sms: 'SMS',
    whatsapp: 'WhatsApp'
  }
  return labels[channel as keyof typeof labels] || channel
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* Custom scrollbar for modal content */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>