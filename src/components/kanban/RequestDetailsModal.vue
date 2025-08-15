<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-accent-blue rounded-full flex items-center justify-center">
            <PhUser :size="24" class="text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-charcoal">
              {{ getClientName(request) }}
            </h2>
            <p class="text-slate-600">{{ request.email }}</p>
          </div>
        </div>
        <button
          @click="closeModal"
          class="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <PhX :size="24" class="text-slate-600" />
        </button>
      </div>

      <!-- Modal Content - Split Layout -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left Side - Request Information -->
        <div class="w-1/2 p-6 overflow-y-auto border-r border-gray-200">
          <div class="space-y-6">
            <!-- Status and Priority -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Estado y Prioridad</h3>
              <div class="flex items-center space-x-4">
                <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  {{ request.status.name }}
                </span>
                <span v-if="request.priority" :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  getPriorityColor(request.priority)
                ]">
                  {{ getPriorityLabel(request.priority) }}
                </span>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Información de Contacto</h3>
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <PhEnvelope :size="20" class="text-slate-500" />
                  <span class="text-slate-700">{{ request.email }}</span>
                </div>
                <div class="flex items-center space-x-3">
                  <PhPhone :size="20" class="text-slate-500" />
                  <span class="text-slate-700">{{ request.phone }}</span>
                </div>
                <div v-if="request.company" class="flex items-center space-x-3">
                  <PhBuilding :size="20" class="text-slate-500" />
                  <span class="text-slate-700">{{ request.company }}</span>
                </div>
              </div>
            </div>

            <!-- Request Details -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Detalles de la Solicitud</h3>
              <div class="space-y-3">
                <div v-if="request.subject">
                  <label class="text-sm font-medium text-slate-600">Asunto:</label>
                  <p class="text-slate-800 mt-1">{{ request.subject }}</p>
                </div>
                <div v-if="request.description">
                  <label class="text-sm font-medium text-slate-600">Descripción:</label>
                  <p class="text-slate-800 mt-1 whitespace-pre-wrap">{{ request.description }}</p>
                </div>
                <div v-if="request.amount">
                  <label class="text-sm font-medium text-slate-600">Monto Estimado:</label>
                  <p class="text-2xl font-bold text-accent-green mt-1">
                    ${{ formatAmount(request.amount) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Cronología</h3>
              <div class="space-y-2">
                <div class="flex items-center space-x-3">
                  <PhCalendar :size="20" class="text-slate-500" />
                  <div>
                    <p class="text-sm text-slate-600">Creado</p>
                    <p class="text-slate-800">{{ formatDate(request.createdAt) }}</p>
                  </div>
                </div>
                <div v-if="request.updatedAt" class="flex items-center space-x-3">
                  <PhClock :size="20" class="text-slate-500" />
                  <div>
                    <p class="text-sm text-slate-600">Última actualización</p>
                    <p class="text-slate-800">{{ formatDate(request.updatedAt) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div v-if="request.tags && request.tags.length > 0" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-charcoal mb-3">Etiquetas</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in request.tags"
                  :key="tag"
                  class="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Quotation Management -->
        <div class="w-1/2 p-6 overflow-y-auto bg-gray-50">
          <div class="space-y-6">
            <!-- Quotations Header -->
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-charcoal">Cotizaciones</h3>
              <button
                v-if="!hasApprovedQuotation"
                @click="showCreateForm = !showCreateForm"
                class="bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <PhPlus :size="16" />
                <span>Nueva Cotización</span>
              </button>
              <div v-else class="text-sm text-slate-600 bg-green-100 px-3 py-1 rounded-full">
                ✓ Cotización aprobada
              </div>
            </div>

            <!-- Create Quotation Form -->
            <div v-if="showCreateForm && !hasApprovedQuotation" class="bg-white rounded-lg p-4 border border-gray-200">
              <h4 class="text-lg font-semibold text-charcoal mb-4">Crear Nueva Cotización</h4>
              <form @submit.prevent="handleCreateQuotation">
                <div class="space-y-4">
                  <!-- Quotation Details -->
                  <div v-for="(detail, index) in newQuotation.details" :key="index" class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <h5 class="font-medium text-slate-700">Ítem {{ index + 1 }}</h5>
                      <button
                        v-if="newQuotation.details.length > 1"
                        type="button"
                        @click="removeDetail(index)"
                        class="text-red-500 hover:text-red-700"
                      >
                        <PhTrash :size="16" />
                      </button>
                    </div>
                    <div class="grid grid-cols-1 gap-3">
                      <div>
                        <label class="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
                        <textarea
                          v-model="detail.description"
                          required
                          rows="2"
                          class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Descripción del servicio o producto"
                        ></textarea>
                      </div>
                      <div class="grid grid-cols-3 gap-3">
                        <div>
                          <label class="block text-sm font-medium text-slate-600 mb-1">Cantidad</label>
                          <input
                            v-model.number="detail.quantity"
                            type="number"
                            min="1"
                            required
                            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            @input="calculateDetailTotal(detail)"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-slate-600 mb-1">Precio Unitario</label>
                          <input
                            v-model.number="detail.unitPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            @input="calculateDetailTotal(detail)"
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-slate-600 mb-1">Total</label>
                          <input
                            :value="detail.total"
                            type="number"
                            readonly
                            class="w-full px-3 py-2 border border-slate-300 rounded-md bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Add Detail Button -->
                  <button
                    type="button"
                    @click="addDetail"
                    class="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <PhPlus :size="20" class="mx-auto mb-1" />
                    <span class="text-sm">Agregar ítem</span>
                  </button>

                  <!-- Total -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                      <span class="text-lg font-semibold text-charcoal">Total:</span>
                      <span class="text-2xl font-bold text-accent-green">
                        ${{ formatAmount(quotationTotal) }}
                      </span>
                    </div>
                  </div>

                  <!-- Form Actions -->
                  <div class="flex justify-end space-x-3">
                    <button
                      type="button"
                      @click="cancelCreateQuotation"
                      class="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      :disabled="quotationsStore.loading"
                      class="px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      {{ quotationsStore.loading ? 'Creando...' : 'Crear Cotización' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <!-- Existing Quotations List -->
            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-charcoal">
                Cotizaciones Existentes ({{ requestQuotations.length }})
              </h4>
              
              <div v-if="requestQuotations.length === 0" class="text-center py-8 text-slate-500">
                <PhFileText :size="48" class="mx-auto mb-3 opacity-50" />
                <p>No hay cotizaciones para esta solicitud</p>
              </div>

              <div v-else class="space-y-3">
                <div
                  v-for="quotation in requestQuotations"
                  :key="quotation.id"
                  class="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                      <span :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getQuotationStatusColor(quotation.status)
                      ]">
                        {{ getQuotationStatusLabel(quotation.status) }}
                      </span>
                      <span class="text-sm text-slate-600">
                        {{ formatDate(quotation.createdAt || '') }}
                      </span>
                    </div>
                    <div class="text-lg font-bold text-accent-green">
                      ${{ formatAmount(getQuotationTotal(quotation)) }}
                    </div>
                  </div>

                  <!-- Quotation Details -->
                  <div class="space-y-2">
                    <div
                      v-for="(detail, index) in quotation.details"
                      :key="index"
                      class="flex justify-between items-center text-sm border-b border-gray-100 pb-2"
                    >
                      <div class="flex-1">
                        <p class="font-medium text-slate-700">{{ detail.description }}</p>
                        <p class="text-slate-500">
                          {{ detail.quantity }} × ${{ formatAmount(detail.unitPrice) }}
                        </p>
                      </div>
                      <div class="font-medium text-slate-700">
                        ${{ formatAmount(detail.total) }}
                      </div>
                    </div>
                  </div>

                  <!-- Quotation Actions -->
                  <div v-if="quotation.status === 'creating'" class="flex justify-end space-x-2 mt-4">
                    <button
                      @click="updateQuotationStatus(quotation.id!, 'sent')"
                      class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Enviar
                    </button>
                    <button
                      @click="deleteQuotation(quotation.id!)"
                      class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div v-else-if="quotation.status === 'sent'" class="flex justify-end space-x-2 mt-4">
                    <button
                      @click="updateQuotationStatus(quotation.id!, 'accepted')"
                      class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Aprobar
                    </button>
                    <button
                      @click="updateQuotationStatus(quotation.id!, 'rejected')"
                      class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
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
  PhX, PhUser, PhEnvelope, PhPhone, PhBuilding, PhCalendar, PhClock,
  PhPlus, PhTrash, PhFileText
} from '@phosphor-icons/vue'
import type { RequestInformation, Quotation, QuotationDetail, CreateQuotationRequest } from '../../types'
import { useQuotationsStore } from '../../stores/quotations'

interface Props {
  isOpen: boolean
  request: RequestInformation
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const quotationsStore = useQuotationsStore()

// State
const showCreateForm = ref(false)
const newQuotation = ref<CreateQuotationRequest>({
  requestInformationId: props.request.id,
  details: [
    {
      description: '',
      unitPrice: 0,
      quantity: 1,
      total: 0
    }
  ],
  status: 'creating'
})

// Computed
const requestQuotations = computed(() => {
  return quotationsStore.getQuotationsByRequestId(props.request.id)
})

const hasApprovedQuotation = computed(() => {
  return requestQuotations.value.some(q => q.status === 'accepted')
})

const quotationTotal = computed(() => {
  return newQuotation.value.details.reduce((sum, detail) => sum + detail.total, 0)
})

// Methods
const closeModal = () => {
  emit('close')
}

const getClientName = (request: RequestInformation) => {
  const firstName = request.fistName || request.firstName || ''
  const lastName = request.lastName || ''
  return `${firstName} ${lastName}`.trim() || request.clientName || 'Sin nombre'
}

const getPriorityColor = (priority?: string) => {
  if (!priority) return 'bg-slate-100 text-slate-700'
  const colorMap = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  }
  return colorMap[priority as keyof typeof colorMap] || 'bg-slate-100 text-slate-700'
}

const getPriorityLabel = (priority?: string) => {
  if (!priority) return 'Normal'
  const labelMap = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  }
  return labelMap[priority as keyof typeof labelMap] || priority
}

const formatAmount = (amount?: number) => {
  if (!amount) return '0'
  return amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getQuotationStatusColor = (status: Quotation['status']) => {
  const colorMap = {
    creating: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  }
  return colorMap[status]
}

const getQuotationStatusLabel = (status: Quotation['status']) => {
  const labelMap = {
    creating: 'Creando',
    sent: 'Enviada',
    accepted: 'Aprobada',
    rejected: 'Rechazada'
  }
  return labelMap[status]
}

const getQuotationTotal = (quotation: Quotation) => {
  return quotation.details.reduce((sum, detail) => sum + detail.total, 0)
}

const calculateDetailTotal = (detail: QuotationDetail) => {
  detail.total = detail.quantity * detail.unitPrice
}

const addDetail = () => {
  newQuotation.value.details.push({
    description: '',
    unitPrice: 0,
    quantity: 1,
    total: 0
  })
}

const removeDetail = (index: number) => {
  if (newQuotation.value.details.length > 1) {
    newQuotation.value.details.splice(index, 1)
  }
}

const handleCreateQuotation = async () => {
  // Validate form
  const isValid = newQuotation.value.details.every(detail => 
    detail.description.trim() && detail.quantity > 0 && detail.unitPrice > 0
  )

  if (!isValid) {
    alert('Por favor completa todos los campos de la cotización')
    return
  }

  // Calculate totals
  newQuotation.value.details.forEach(calculateDetailTotal)

  const result = await quotationsStore.createQuotation(newQuotation.value)
  
  if (result) {
    showCreateForm.value = false
    resetForm()
  }
}

const cancelCreateQuotation = () => {
  showCreateForm.value = false
  resetForm()
}

const resetForm = () => {
  newQuotation.value = {
    requestInformationId: props.request.id,
    details: [
      {
        description: '',
        unitPrice: 0,
        quantity: 1,
        total: 0
      }
    ],
    status: 'creating'
  }
}

const updateQuotationStatus = async (quotationId: string, status: Quotation['status']) => {
  await quotationsStore.updateQuotationStatus(quotationId, status)
}

const deleteQuotation = async (quotationId: string) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
    await quotationsStore.deleteQuotation(quotationId)
  }
}

// Watch for request changes
watch(() => props.request.id, (newId) => {
  newQuotation.value.requestInformationId = newId
  resetForm()
})

// Load quotations when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    quotationsStore.fetchQuotationByRequestId(props.request.id)
  }
})

onMounted(() => {
  if (props.isOpen) {
    quotationsStore.fetchQuotationByRequestId(props.request.id)
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