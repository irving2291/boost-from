<template>
  <Layout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Cotizaciones</h1>
          <p class="text-slate-600 mt-1">
            Gestiona las cotizaciones de tus clientes potenciales.
          </p>
        </div>
        <button
          @click="showCreateModal = true"
          class="bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <PhPlus :size="16" />
          <span>Nueva Cotización</span>
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-slate-600">Total</h3>
            <PhFileText :size="20" class="text-slate-400" />
          </div>
          <p class="text-2xl font-bold text-slate-900">
            {{ quotations.length }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-slate-600">En Creación</h3>
            <PhClock :size="20" class="text-yellow-500" />
          </div>
          <p class="text-2xl font-bold text-yellow-600">
            {{ quotationsByStatus.creating.length }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-slate-600">Enviadas</h3>
            <PhPaperPlaneTilt :size="20" class="text-blue-500" />
          </div>
          <p class="text-2xl font-bold text-blue-600">
            {{ quotationsByStatus.sent.length }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg border border-slate-300">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-slate-600">Aceptadas</h3>
            <PhCheckCircle :size="20" class="text-green-500" />
          </div>
          <p class="text-2xl font-bold text-green-600">
            {{ quotationsByStatus.accepted.length }}
          </p>
        </div>
      </div>

      <!-- Quotations Table -->
      <div class="bg-white rounded-lg border border-slate-300 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-900">Lista de Cotizaciones</h2>
        </div>
        
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-flex items-center space-x-2 text-slate-500">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-500"></div>
            <span>Cargando cotizaciones...</span>
          </div>
        </div>

        <div v-else-if="error" class="p-8 text-center text-red-600">
          <PhWarning :size="24" class="mx-auto mb-2" />
          <p>{{ error }}</p>
          <button 
            @click="fetchQuotations"
            class="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Reintentar
          </button>
        </div>

        <div v-else-if="quotations.length === 0" class="p-8 text-center text-slate-500">
          <PhFileText :size="48" class="mx-auto mb-4 text-slate-300" />
          <p class="text-lg font-medium mb-2">No hay cotizaciones</p>
          <p class="text-sm">Crea tu primera cotización para comenzar.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-slate-200">
              <tr v-for="quotation in quotations" :key="quotation.id" class="hover:bg-slate-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  #{{ quotation.id?.slice(-6) || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {{ getRequestInfo(quotation.requestInformationId) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  ${{ calculateTotal(quotation.details).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Badge :variant="getStatusVariant(quotation.status)">
                    {{ getStatusLabel(quotation.status) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {{ formatDate(quotation.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="viewQuotation(quotation)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Ver detalles"
                    >
                      <PhEye :size="16" />
                    </button>
                    <button
                      @click="editQuotation(quotation)"
                      class="text-slate-600 hover:text-slate-900"
                      title="Editar"
                    >
                      <PhPencil :size="16" />
                    </button>
                    <button
                      @click="deleteQuotation(quotation)"
                      class="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <PhTrash :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Quotation Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900">Nueva Cotización</h3>
          <button
            @click="showCreateModal = false"
            class="text-slate-400 hover:text-slate-600"
          >
            <PhX :size="20" />
          </button>
        </div>

        <form @submit.prevent="handleCreateQuotation">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Request ID
              </label>
              <input
                v-model="newQuotation.requestInformationId"
                type="text"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ID del request"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                Detalles de la Cotización
              </label>
              <div class="space-y-3">
                <div v-for="(detail, index) in newQuotation.details" :key="index" class="flex items-center space-x-2">
                  <input
                    v-model="detail.description"
                    type="text"
                    placeholder="Descripción"
                    class="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    v-model.number="detail.quantity"
                    type="number"
                    placeholder="Cant."
                    min="1"
                    class="w-20 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    v-model.number="detail.unitPrice"
                    type="number"
                    placeholder="Precio"
                    min="0"
                    step="0.01"
                    class="w-24 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span class="w-24 text-sm text-slate-600">
                    ${{ (detail.quantity * detail.unitPrice).toFixed(2) }}
                  </span>
                  <button
                    type="button"
                    @click="removeDetail(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <PhTrash :size="16" />
                  </button>
                </div>
              </div>
              <button
                type="button"
                @click="addDetail"
                class="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <PhPlus :size="14" />
                <span>Agregar detalle</span>
              </button>
            </div>

            <div class="border-t pt-4">
              <div class="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>${{ calculateNewQuotationTotal().toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ loading ? 'Creando...' : 'Crear Cotización' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  PhPlus, PhFileText, PhClock, PhPaperPlaneTilt, PhCheckCircle, 
  PhWarning, PhEye, PhPencil, PhTrash, PhX 
} from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
import Badge from '../components/ui/Badge.vue'
import { useQuotationsStore } from '../stores/quotations'
import { useRequestsStore } from '../stores/requests'
import type { CreateQuotationRequest, QuotationDetail, Quotation } from '../types'

const quotationsStore = useQuotationsStore()
const requestsStore = useRequestsStore()

const showCreateModal = ref(false)
const newQuotation = ref<CreateQuotationRequest>({
  requestInformationId: '',
  details: [
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ],
  status: 'creating'
})

// Computed properties
const quotations = computed(() => quotationsStore.quotations)
const quotationsByStatus = computed(() => quotationsStore.quotationsByStatus)
const loading = computed(() => quotationsStore.loading)
const error = computed(() => quotationsStore.error)

// Methods
const fetchQuotations = async () => {
  await quotationsStore.fetchQuotations()
}

const getRequestInfo = (requestId: string) => {
  const request = requestsStore.requests.find(r => r.id === requestId)
  return request ? `${request.clientName} - ${request.subject}` : `Request #${requestId.slice(-6)}`
}

const calculateTotal = (details: QuotationDetail[]) => {
  return details.reduce((sum, detail) => sum + (detail.quantity * detail.unitPrice), 0)
}

const calculateNewQuotationTotal = () => {
  return newQuotation.value.details.reduce((sum, detail) => sum + (detail.quantity * detail.unitPrice), 0)
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

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const addDetail = () => {
  newQuotation.value.details.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  })
}

const removeDetail = (index: number) => {
  if (newQuotation.value.details.length > 1) {
    newQuotation.value.details.splice(index, 1)
  }
}

const handleCreateQuotation = async () => {
  // Calculate totals for each detail
  newQuotation.value.details.forEach(detail => {
    detail.total = detail.quantity * detail.unitPrice
  })

  const result = await quotationsStore.createQuotation(newQuotation.value)
  if (result) {
    showCreateModal.value = false
    // Reset form
    newQuotation.value = {
      requestInformationId: '',
      details: [
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0
        }
      ],
      status: 'creating'
    }
  }
}

const viewQuotation = (quotation: Quotation) => {
  // TODO: Implement view quotation modal
  console.log('View quotation:', quotation)
}

const editQuotation = (quotation: Quotation) => {
  // TODO: Implement edit quotation modal
  console.log('Edit quotation:', quotation)
}

const deleteQuotation = async (quotation: Quotation) => {
  if (quotation.id && confirm('¿Estás seguro de que quieres eliminar esta cotización?')) {
    await quotationsStore.deleteQuotation(quotation.id)
  }
}

onMounted(async () => {
  await fetchQuotations()
  await requestsStore.fetchRequests()
})
</script>