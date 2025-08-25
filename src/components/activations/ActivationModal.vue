<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 class="text-2xl font-bold text-charcoal">
            {{ activation ? 'Editar Activación' : 'Nueva Activación' }}
          </h2>
          <p class="text-slate-600">{{ activation ? 'Modifica los detalles de la activación' : 'Crea una nueva activación para comunicarte con tus clientes' }}</p>
        </div>
        <button
          @click="closeModal"
          class="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <PhX :size="24" class="text-slate-600" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-charcoal mb-4">Información Básica</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Title -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-600 mb-1">Título *</label>
                <input
                  v-model="form.title"
                  type="text"
                  required
                  maxlength="100"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Promoción Black Friday"
                />
              </div>

              <!-- Type -->
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Tipo *</label>
                <select
                  v-model="form.type"
                  required
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="promotion">Promoción</option>
                  <option value="announcement">Anuncio</option>
                  <option value="reminder">Recordatorio</option>
                  <option value="survey">Encuesta</option>
                </select>
              </div>

              <!-- Priority -->
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Prioridad</label>
                <select
                  v-model="form.priority"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-600 mb-1">Descripción *</label>
                <textarea
                  v-model="form.description"
                  required
                  rows="3"
                  maxlength="500"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe los detalles de la activación..."
                ></textarea>
                <p class="text-xs text-slate-500 mt-1">{{ form.description.length }}/500 caracteres</p>
              </div>
            </div>
          </div>

          <!-- Channels -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-charcoal mb-4">Canales de Comunicación</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer">
                <input
                  v-model="form.channels"
                  type="checkbox"
                  value="email"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <PhEnvelope :size="20" class="text-blue-600" />
                <span class="font-medium">Email</span>
              </label>
              
              <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer">
                <input
                  v-model="form.channels"
                  type="checkbox"
                  value="sms"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <PhDeviceMobile :size="20" class="text-green-600" />
                <span class="font-medium">SMS</span>
              </label>
              
              <label class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-white cursor-pointer">
                <input
                  v-model="form.channels"
                  type="checkbox"
                  value="whatsapp"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <PhWhatsappLogo :size="20" class="text-green-600" />
                <span class="font-medium">WhatsApp</span>
              </label>
            </div>
            <p v-if="form.channels.length === 0" class="text-red-500 text-sm mt-2">
              Selecciona al menos un canal de comunicación
            </p>
          </div>

          <!-- Target Audience -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-charcoal mb-4">Audiencia Objetivo</h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Segmento de clientes</label>
                <select
                  v-model="form.targetAudience"
                  class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los clientes</option>
                  <option value="Clientes activos">Clientes activos</option>
                  <option value="Clientes nuevos">Clientes nuevos</option>
                  <option value="Clientes inactivos">Clientes inactivos</option>
                  <option value="Clientes VIP">Clientes VIP</option>
                  <option value="Clientes con servicios completados">Clientes con servicios completados</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Scheduling -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-charcoal mb-4">Programación</h3>
            <div class="space-y-4">
              <label class="flex items-center space-x-2">
                <input
                  v-model="form.scheduleForLater"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-slate-600">Programar para más tarde</span>
              </label>

              <div v-if="form.scheduleForLater" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
                  <input
                    v-model="form.scheduledDate"
                    type="date"
                    :min="today"
                    class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-600 mb-1">Hora</label>
                  <input
                    v-model="form.scheduledTime"
                    type="time"
                    class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="text-lg font-semibold text-charcoal mb-4">Estado</h3>
            <div>
              <label class="block text-sm font-medium text-slate-600 mb-1">Estado inicial</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Borrador</option>
                <option value="scheduled" :disabled="!form.scheduleForLater">Programada</option>
                <option value="active">Activa</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          type="button"
          @click="closeModal"
          class="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          :disabled="loading || !isFormValid"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>{{ loading ? 'Guardando...' : (activation ? 'Actualizar' : 'Crear') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  PhX, PhEnvelope, PhDeviceMobile, PhWhatsappLogo
} from '@phosphor-icons/vue'

interface Activation {
  id: string
  title: string
  description: string
  type: 'promotion' | 'announcement' | 'reminder' | 'survey'
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  channels: string[]
  targetAudience?: string
  scheduledFor?: string
  createdAt: string
  updatedAt?: string
}

interface Props {
  isOpen: boolean
  activation?: Activation | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: [activation: Activation]
}>()

// State
const loading = ref(false)
const form = ref({
  title: '',
  description: '',
  type: '',
  priority: 'medium' as const,
  channels: [] as string[],
  targetAudience: '',
  scheduleForLater: false,
  scheduledDate: '',
  scheduledTime: '',
  status: 'draft' as const
})

// Computed
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return form.value.title.trim() && 
         form.value.description.trim() && 
         form.value.type && 
         form.value.channels.length > 0
})

// Methods
const closeModal = () => {
  emit('close')
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    type: '',
    priority: 'medium',
    channels: [],
    targetAudience: '',
    scheduleForLater: false,
    scheduledDate: '',
    scheduledTime: '',
    status: 'draft'
  }
}

const loadActivation = () => {
  if (props.activation) {
    form.value = {
      title: props.activation.title,
      description: props.activation.description,
      type: props.activation.type,
      priority: props.activation.priority,
      channels: [...props.activation.channels],
      targetAudience: props.activation.targetAudience || '',
      scheduleForLater: !!props.activation.scheduledFor,
      scheduledDate: props.activation.scheduledFor ? props.activation.scheduledFor.split('T')[0] : '',
      scheduledTime: props.activation.scheduledFor ? props.activation.scheduledFor.split('T')[1]?.substring(0, 5) || '' : '',
      status: props.activation.status
    }
  } else {
    resetForm()
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true

  try {
    const activationData: Activation = {
      id: props.activation?.id || Date.now().toString(),
      title: form.value.title,
      description: form.value.description,
      type: form.value.type as Activation['type'],
      status: form.value.scheduleForLater && form.value.scheduledDate && form.value.scheduledTime 
        ? 'scheduled' 
        : form.value.status,
      priority: form.value.priority,
      channels: [...form.value.channels],
      targetAudience: form.value.targetAudience || undefined,
      scheduledFor: form.value.scheduleForLater && form.value.scheduledDate && form.value.scheduledTime
        ? `${form.value.scheduledDate}T${form.value.scheduledTime}:00Z`
        : undefined,
      createdAt: props.activation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('saved', activationData)
  } catch (error) {
    console.error('Error saving activation:', error)
    alert('Error al guardar la activación. Por favor intenta nuevamente.')
  } finally {
    loading.value = false
  }
}

// Watch for activation changes
watch(() => props.activation, loadActivation, { immediate: true })

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadActivation()
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadActivation()
  }
})
</script>