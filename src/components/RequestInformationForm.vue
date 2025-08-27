<template>
  <div v-if="modelValue" class="request-form-modal">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50" @click="closeModal"></div>

    <!-- Modal -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Nuevo Lead</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Account Search Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Buscar Cliente Existente
              </label>
              <AccountSearch
                v-model="selectedAccount"
                @account-selected="handleAccountSelected"
                placeholder="Buscar por nombre, email o teléfono..."
              />
              <p class="text-xs text-gray-500 mt-1">
                Si el cliente existe, sus datos se cargarán automáticamente
              </p>
            </div>

            <!-- Personal Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  id="firstName"
                  v-model="formData.fistName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el nombre"
                />
              </div>

              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el apellido"
                />
              </div>
            </div>

            <!-- Contact Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cliente@email.com"
                />
              </div>

              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  id="phone"
                  v-model="formData.phone"
                  type="tel"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+593 99 123 4567"
                />
              </div>
            </div>

            <!-- Additional Information -->
            <div>
              <label for="company" class="block text-sm font-medium text-gray-700 mb-1">
                Empresa
              </label>
              <input
                id="company"
                v-model="formData.company"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de la empresa (opcional)"
              />
            </div>

            <!-- Lead Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <input
                  id="subject"
                  v-model="formData.subject"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Asunto del lead"
                />
              </div>

              <div>
                <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select
                  id="priority"
                  v-model="formData.priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detalles adicionales del lead..."
              ></textarea>
            </div>

            <!-- Amount (Optional) -->
            <div>
              <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
                Monto Estimado
              </label>
              <input
                id="amount"
                v-model.number="formData.amount"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span v-if="isSubmitting">Creando...</span>
            <span v-else>Crear Lead</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AccountSearch from './ui/AccountSearch.vue'
import { useRequestsStore } from '../stores/requests'
import type { Account, RequestInformation } from '../types'

// Props
interface Props {
  modelValue: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'request-created': []
}>()

// Reactive data
const selectedAccount = ref<Account | null>(null)
const isSubmitting = ref(false)

const formData = reactive({
  fistName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  amount: undefined as number | undefined
})

// Stores
const requestsStore = useRequestsStore()

// Methods
const handleAccountSelected = (account: Account) => {
  // Load account data into form
  formData.fistName = account.firstName || ''
  formData.lastName = account.lastName || ''
  formData.email = account.email
  formData.phone = account.phone
  formData.company = account.companyName || ''
}

const handleSubmit = async () => {
  if (!formData.fistName || !formData.lastName || !formData.email || !formData.phone) {
    alert('Por favor complete todos los campos obligatorios')
    return
  }

  isSubmitting.value = true

  try {
    // Create request data
    const requestData: Omit<RequestInformation, 'id' | 'createdAt' | 'updatedAt'> = {
      fistName: formData.fistName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      subject: formData.subject || undefined,
      description: formData.description || undefined,
      priority: formData.priority,
      amount: formData.amount,
      status: {
        id: 'new-status-id', // This should come from the status store
        code: 'NEW',
        name: 'Nuevo',
        organization: 'default',
        default: true
      }
    }

    // Add the request
    await requestsStore.addRequest(requestData)

    // Emit event to notify parent component
    emit('request-created')

    // Close modal and reset form
    closeModal()
    resetForm()
  } catch (error) {
    console.error('Error creating request:', error)
    alert('Error al crear el lead. Por favor intente nuevamente.')
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
}

const resetForm = () => {
  selectedAccount.value = null
  formData.fistName = ''
  formData.lastName = ''
  formData.email = ''
  formData.phone = ''
  formData.company = ''
  formData.subject = ''
  formData.description = ''
  formData.priority = 'medium'
  formData.amount = undefined
}
</script>