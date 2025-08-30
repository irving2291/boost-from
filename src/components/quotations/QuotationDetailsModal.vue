<template>
  <Modal
    :is-open="isOpen"
    :title="`Cotización #${quotation.id?.slice(-6) || 'N/A'}`"
    size="xl"
    :show-footer="true"
    @close="closeModal"
  >
    <template #header>
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center">
          <PhFileText :size="24" class="text-white" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-charcoal dark:text-white">
            Cotización #{{ quotation.id?.slice(-6) || 'N/A' }}
          </h2>
          <p class="text-slate-600 dark:text-slate-400">{{ getRequestInfo(quotation.requestInformationId) }}</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Status and Total -->
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold text-charcoal dark:text-white">Información General</h3>
        </template>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Estado:</label>
            <div class="mt-1">
              <Badge :variant="getStatusVariant(quotation.status)">
                {{ getStatusLabel(quotation.status) }}
              </Badge>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Total:</label>
            <p class="text-2xl font-bold text-accent-green mt-1">
              ${{ formatAmount(calculateTotal(quotation.details)) }}
            </p>
          </div>
        </div>
      </Card>

      <!-- Timeline -->
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold text-charcoal dark:text-white">Cronología</h3>
        </template>
        <div class="space-y-3">
          <div class="flex items-center space-x-3">
            <PhCalendar :size="20" class="text-slate-500 dark:text-slate-400" />
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Creada</p>
              <p class="text-slate-800 dark:text-slate-200">{{ formatDate(quotation.createdAt) }}</p>
            </div>
          </div>
          <div v-if="quotation.updatedAt" class="flex items-center space-x-3">
            <PhClock :size="20" class="text-slate-500 dark:text-slate-400" />
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">Última actualización</p>
              <p class="text-slate-800 dark:text-slate-200">{{ formatDate(quotation.updatedAt) }}</p>
            </div>
          </div>
        </div>
      </Card>

      <!-- Quotation Details -->
      <Card>
        <template #header>
          <h3 class="text-lg font-semibold text-charcoal dark:text-white">Detalles de la Cotización</h3>
        </template>
        <div class="space-y-4">
          <div
            v-for="(detail, index) in quotation.details"
            :key="index"
            class="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-medium text-slate-700 dark:text-slate-300">Ítem {{ index + 1 }}</h4>
              <div class="text-lg font-bold text-accent-green">
                ${{ formatAmount(detail.total) }}
              </div>
            </div>
            
            <div class="space-y-2">
              <div>
                <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Descripción:</label>
                <p class="text-slate-800 dark:text-slate-200 mt-1">{{ detail.description }}</p>
              </div>
              
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <label class="font-medium text-slate-600 dark:text-slate-400">Cantidad:</label>
                  <p class="text-slate-800 dark:text-slate-200">{{ detail.quantity }}</p>
                </div>
                <div>
                  <label class="font-medium text-slate-600 dark:text-slate-400">Precio Unitario:</label>
                  <p class="text-slate-800 dark:text-slate-200">${{ formatAmount(detail.unitPrice) }}</p>
                </div>
                <div>
                  <label class="font-medium text-slate-600 dark:text-slate-400">Subtotal:</label>
                  <p class="text-slate-800 dark:text-slate-200 font-semibold">${{ formatAmount(detail.total) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Total Summary -->
      <div class="bg-accent-blue bg-opacity-10 dark:bg-accent-blue dark:bg-opacity-20 rounded-lg p-4 border border-accent-blue border-opacity-20 dark:border-opacity-30">
        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold text-charcoal dark:text-white">Total General:</span>
          <span class="text-3xl font-bold text-accent-blue">
            ${{ formatAmount(calculateTotal(quotation.details)) }}
          </span>
        </div>
      </div>

      <!-- Request Information -->
      <Card v-if="requestInfo">
        <template #header>
          <h3 class="text-lg font-semibold text-charcoal dark:text-white">Información del Request</h3>
        </template>
        <div class="space-y-3">
          <div v-if="requestInfo.clientName">
            <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Cliente:</label>
            <p class="text-slate-800 dark:text-slate-200">{{ requestInfo.clientName }}</p>
          </div>
          <div v-if="requestInfo.subject">
            <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Asunto:</label>
            <p class="text-slate-800 dark:text-slate-200">{{ requestInfo.subject }}</p>
          </div>
          <div v-if="requestInfo.email">
            <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Email:</label>
            <p class="text-slate-800 dark:text-slate-200">{{ requestInfo.email }}</p>
          </div>
          <div v-if="requestInfo.phone">
            <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Teléfono:</label>
            <p class="text-slate-800 dark:text-slate-200">{{ requestInfo.phone }}</p>
          </div>
        </div>
      </Card>

    </div>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <div class="text-sm text-slate-600 dark:text-slate-400">
          Estado: <span class="font-medium">{{ getStatusLabel(quotation.status) }}</span>
        </div>
        <div class="flex space-x-3">
          <Button
            v-if="quotation.status === 'creating'"
            type="primary"
            :busy="loading"
            @click="updateStatus('sent')"
          >
            {{ loading ? 'Enviando...' : 'Enviar Cotización' }}
          </Button>
          <Button
            v-if="quotation.status === 'sent'"
            type="success"
            :busy="loading"
            @click="updateStatus('accepted')"
          >
            {{ loading ? 'Aprobando...' : 'Aprobar' }}
          </Button>
          <Button
            v-if="quotation.status === 'sent'"
            type="danger"
            :busy="loading"
            @click="updateStatus('rejected')"
          >
            {{ loading ? 'Rechazando...' : 'Rechazar' }}
          </Button>
          <Button
            type="secondary"
            @click="closeModal"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  PhX, PhFileText, PhCalendar, PhClock
} from '@phosphor-icons/vue'
import Badge from '../ui/Badge.vue'
import { Modal, Button, Card } from '../../core'
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
    // Request info loading removed
  }
})

onMounted(() => {
  if (props.isOpen && !requestInfo.value) {
    // Request info loading removed
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