<template>
  <Layout>
    <div class="h-full flex flex-col space-y-6 overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Activaciones</h1>
          <p class="text-gray-600">Gestiona promociones y comunicaciones con clientes</p>
        </div>
        <div class="flex items-center space-x-4">
          <!-- Create Activation Button -->
          <button
            @click="showCreateModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <PhPlus :size="16" />
            <span>Nueva Activación</span>
          </button>
          
          <!-- Refresh Button -->
          <button
            @click="refreshData"
            :disabled="loading"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <PhArrowClockwise v-if="!loading" :size="16" class="inline mr-2" />
            <div v-else class="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent inline mr-2"></div>
            Actualizar
          </button>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Search -->
          <div class="flex-1 min-w-64">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar activaciones..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <PhMagnifyingGlass class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="scheduled">Programada</option>
            <option value="active">Activa</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>

          <!-- Type Filter -->
          <select
            v-model="typeFilter"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="promotion">Promoción</option>
            <option value="announcement">Anuncio</option>
            <option value="reminder">Recordatorio</option>
            <option value="survey">Encuesta</option>
          </select>
        </div>
      </div>

      <!-- Activations Grid -->
      <div class="flex-1 overflow-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="activation in filteredActivations"
            :key="activation.id"
            class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            @click="viewActivation(activation)"
          >
            <!-- Card Header -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ activation.title }}</h3>
                  <p class="text-sm text-gray-600 line-clamp-2">{{ activation.description }}</p>
                </div>
                <div class="ml-3">
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(activation.status)
                  ]">
                    {{ getStatusLabel(activation.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Content -->
            <div class="p-4">
              <div class="space-y-3">
                <!-- Type and Priority -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <component :is="getTypeIcon(activation.type)" :size="16" class="text-gray-500" />
                    <span class="text-sm text-gray-600">{{ getTypeLabel(activation.type) }}</span>
                  </div>
                  <span :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    getPriorityColor(activation.priority)
                  ]">
                    {{ getPriorityLabel(activation.priority) }}
                  </span>
                </div>

                <!-- Target Audience -->
                <div class="flex items-center space-x-2">
                  <PhUsers :size="16" class="text-gray-500" />
                  <span class="text-sm text-gray-600">
                    {{ activation.targetAudience || 'Todos los clientes' }}
                  </span>
                </div>

                <!-- Schedule -->
                <div class="flex items-center space-x-2">
                  <PhCalendar :size="16" class="text-gray-500" />
                  <span class="text-sm text-gray-600">
                    {{ activation.scheduledFor ? formatDate(activation.scheduledFor) : 'Sin programar' }}
                  </span>
                </div>

                <!-- Channels -->
                <div class="flex items-center space-x-2">
                  <div class="flex space-x-1">
                    <PhEnvelope v-if="activation.channels.includes('email')" :size="16" class="text-blue-500" />
                    <PhDeviceMobile v-if="activation.channels.includes('sms')" :size="16" class="text-green-500" />
                    <PhWhatsappLogo v-if="activation.channels.includes('whatsapp')" :size="16" class="text-green-600" />
                  </div>
                  <span class="text-sm text-gray-600">
                    {{ activation.channels.length }} canal{{ activation.channels.length !== 1 ? 'es' : '' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">
                  Creado {{ formatDate(activation.createdAt) }}
                </span>
                <div class="flex space-x-2">
                  <button
                    @click.stop="editActivation(activation)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    @click.stop="duplicateActivation(activation)"
                    class="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Duplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredActivations.length === 0" class="text-center py-12">
          <PhMegaphone :size="64" class="mx-auto text-gray-300 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No hay activaciones</h3>
          <p class="text-gray-500 mb-4">
            {{ searchQuery || statusFilter || typeFilter 
              ? 'No se encontraron activaciones con los filtros aplicados.' 
              : 'Crea tu primera activación para comunicarte con tus clientes.' 
            }}
          </p>
          <button
            v-if="!searchQuery && !statusFilter && !typeFilter"
            @click="showCreateModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Crear Activación
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Activation Modal -->
    <ActivationModal
      :is-open="showCreateModal || showEditModal"
      :activation="selectedActivation"
      @close="closeModal"
      @saved="handleActivationSaved"
    />

    <!-- Activation Details Modal -->
    <ActivationDetailsModal
      :is-open="showDetailsModal"
      :activation="selectedActivation"
      @close="closeDetailsModal"
      @edit="editFromDetails"
    />
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PhPlus, PhArrowClockwise, PhMagnifyingGlass, PhUsers, PhCalendar,
  PhEnvelope, PhDeviceMobile, PhWhatsappLogo, PhMegaphone,
  PhSpeakerHigh, PhBell, PhChartBar, PhQuestion
} from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
import ActivationModal from '../components/activations/ActivationModal.vue'
import ActivationDetailsModal from '../components/activations/ActivationDetailsModal.vue'

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

// State
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const selectedActivation = ref<Activation | null>(null)

// Mock data - replace with actual API calls
const activations = ref<Activation[]>([
  {
    id: '1',
    title: 'Promoción Black Friday',
    description: 'Descuentos especiales del 50% en todos nuestros servicios durante el Black Friday',
    type: 'promotion',
    status: 'scheduled',
    priority: 'high',
    channels: ['email', 'sms', 'whatsapp'],
    targetAudience: 'Clientes activos',
    scheduledFor: '2024-11-29T09:00:00Z',
    createdAt: '2024-11-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Encuesta de Satisfacción',
    description: 'Queremos conocer tu opinión sobre nuestros servicios',
    type: 'survey',
    status: 'active',
    priority: 'medium',
    channels: ['email'],
    targetAudience: 'Clientes con servicios completados',
    createdAt: '2024-11-10T14:30:00Z'
  }
])

// Computed
const filteredActivations = computed(() => {
  let filtered = activations.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(activation =>
      activation.title.toLowerCase().includes(query) ||
      activation.description.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(activation => activation.status === statusFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter(activation => activation.type === typeFilter.value)
  }

  return filtered
})

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    loading.value = false
  }
}

const viewActivation = (activation: Activation) => {
  selectedActivation.value = activation
  showDetailsModal.value = true
}

const editActivation = (activation: Activation) => {
  selectedActivation.value = activation
  showEditModal.value = true
}

const editFromDetails = (activation: Activation) => {
  showDetailsModal.value = false
  selectedActivation.value = activation
  showEditModal.value = true
}

const duplicateActivation = (activation: Activation) => {
  const duplicated = {
    ...activation,
    id: Date.now().toString(),
    title: `${activation.title} (Copia)`,
    status: 'draft' as const,
    createdAt: new Date().toISOString()
  }
  activations.value.unshift(duplicated)
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedActivation.value = null
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedActivation.value = null
}

const handleActivationSaved = (activation: Activation) => {
  if (showEditModal.value) {
    // Update existing
    const index = activations.value.findIndex(a => a.id === activation.id)
    if (index !== -1) {
      activations.value[index] = activation
    }
  } else {
    // Add new
    activations.value.unshift(activation)
  }
  closeModal()
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>