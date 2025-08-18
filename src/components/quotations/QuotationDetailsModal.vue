<template>
  <!-- Sidebar Modal -->
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-hidden">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="closeModal"></div>
    
    <!-- Sidebar -->
    <div class="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
      <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center">
              <PhFileText :size="24" class="text-white" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-charcoal">
                Cotización #{{ quotation.id?.slice(-6) || 'N/A' }}
              </h2>
              <p class="text-slate-600">{{ getRequestInfo(quotation.requestInformationId) }}</p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <PhX :size="24" class="text-slate-600" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-6">
            <!-- Status and Total -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Información General</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-slate-600">Estado:</label>
                  <div class="mt-1">
                    <Badge :variant="getStatusVariant(quotation.status)">
                      {{ getStatusLabel(quotation.status) }}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label class="text-sm font-medium text-slate-600">Total:</label>
                  <p class="text-2xl font-bold text-accent-green mt-1">
                    ${{ formatAmount(calculateTotal(quotation.details)) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Cronología</h3>
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <PhCalendar :size="20" class="text-slate-500" />
                  <div>
                    <p class="text-sm text-slate-600">Creada</p>
                    <p class="text-slate-800">{{ formatDate(quotation.createdAt) }}</p>
                  </div>
                </div>
                <div v-if="quotation.updatedAt" class="flex items-center space-x-3">
                  <PhClock :size="20" class="text-slate-500" />
                  <div>
                    <p class="text-sm text-slate-600">Última actualización</p>
                    <p class="text-slate-800">{{ formatDate(quotation.updatedAt) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quotation Details -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-4">Detalles de la Cotización</h3>
              <div class="space-y-4">
                <div
                  v-for="(detail, index) in quotation.details"
                  :key="index"
                  class="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-slate-700">Ítem {{ index + 1 }}</h4>
                    <div class="text-lg font-bold text-accent-green">
                      ${{ formatAmount(detail.total) }}
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <div>
                      <label class="text-sm font-medium text-slate-600">Descripción:</label>
                      <p class="text-slate-800 mt-1">{{ detail.description }}</p>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <label class="font-medium text-slate-600">Cantidad:</label>
                        <p class="text-slate-800">{{ detail.quantity }}</p>
                      </div>
                      <div>
                        <label class="font-medium text-slate-600">Precio Unitario:</label>
                        <p class="text-slate-800">${{ formatAmount(detail.unitPrice) }}</p>
                      </div>
                      <div>
                        <label class="font-medium text-slate-600">Subtotal:</label>
                        <p class="text-slate-800 font-semibold">${{ formatAmount(detail.total) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Summary -->
            <div class="bg-accent-blue bg-opacity-10 rounded-lg p-4 border border-accent-blue border-opacity-20">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-charcoal">Total General:</span>
                <span class="text-3xl font-bold text-accent-blue">
                  ${{ formatAmount(calculateTotal(quotation.details)) }}
                </span>
              </div>
            </div>

            <!-- Request Information -->
            <div v-if="requestInfo" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Información del Request</h3>
              <div class="space-y-3">
                <div v-if="requestInfo.clientName">
                  <label class="text-sm font-medium text-slate-600">Cliente:</label>
                  <p class="text-slate-800">{{ requestInfo.clientName }}</p>
                </div>
                <div v-if="requestInfo.subject">
                  <label class="text-sm font-medium text-slate-600">Asunto:</label>
                  <p class="text-slate-800">{{ requestInfo.subject }}</p>
                </div>
                <div v-if="requestInfo.email">
                  <label class="text-sm font-medium text-slate-600">Email:</label>
                  <p class="text-slate-800">{{ requestInfo.email }}</p>
                </div>
                <div v-if="requestInfo.phone">
                  <label class="text-sm font-medium text-slate-600">Teléfono:</label>
                  <p class="text-slate-800">{{ requestInfo.phone }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="border-t border-gray-200 p-6 bg-gray-50">
          <div class="flex justify-between items-center">
            <div class="text-sm text-slate-600">
              Estado: <span class="font-medium">{{ getStatusLabel(quotation.status) }}</span>
            </div>
            <div class="flex space-x-3">
              <button
                v-if="quotation.status === 'creating'"
                @click="updateStatus('sent')"
                :disabled="loading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {{ loading ? 'Enviando...' : 'Enviar Cotización' }}
              </button>
              <button
                v-if="quotation.status === 'sent'"
                @click="updateStatus('accepted')"
                :disabled="loading"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {{ loading ? 'Aprobando...' : 'Aprobar' }}
              </button>
              <button
                v-if="quotation.status === 'sent'"
                @click="updateStatus('rejected')"
                :disabled="loading"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {{ loading ? 'Rechazando...' : 'Rechazar' }}
              </button>
              <button
                @click="closeModal"
                class="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  PhX, PhFileText, PhCalendar, PhClock
} from '@phosphor-icons/vue'
import Badge from '../ui/Badge.vue'
import type { Quotation, QuotationDetail, RequestInformation } from '../../types'
import { useQuotationsStore } from '../../stores/quotations'
import { useRequestsStore } from '../../stores/requests'

interface Props {
  isOpen: boolean
  quotation: Quotation
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updated: []
}>()

const quotationsStore = useQuotationsStore()
const requestsStore = useRequestsStore()

// State
const loading = ref(false)

// Computed
const requestInfo = computed(() => {
  return requestsStore.requests.find(r => r.id === props.quotation.requestInformationId)
})

// Methods
const closeModal = () => {
  emit('close')
}

const getRequestInfo = (requestId: string) => {
  const request = requestsStore.requests.find(r => r.id === requestId)
  return request ? `${request.clientName} - ${request.subject}` : `Request #${requestId.slice(-6)}`
}

const calculateTotal = (details: QuotationDetail[]) => {
  return details.reduce((sum, detail) => sum + (detail.quantity * detail.unitPrice), 0)
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'creating': return 'secondary'
    case 'sent': return 'default'
    case 'accepted': return 'outline'
    case 'rejected': return 'destructive'
    default: return 'default'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'creating': return 'En Creación'
    case 'sent': return 'Enviada'
    case 'accepted': return 'Aceptada'
    case 'rejected': return 'Rechazada'
    default: return status
  }
}

const formatAmount = (amount?: number) => {
  if (!amount) return '0.00'
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateStatus = async (status: Quotation['status']) => {
  if (!props.quotation.id) return
  
  loading.value = true
  try {
    const success = await quotationsStore.updateQuotationStatus(props.quotation.id, status)
    if (success) {
      emit('updated')
    }
  } finally {
    loading.value = false
  }
}

// Load request information when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && !requestInfo.value) {
    requestsStore.fetchRequests()
  }
})

onMounted(() => {
  if (props.isOpen && !requestInfo.value) {
    requestsStore.fetchRequests()
  }
})
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