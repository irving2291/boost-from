<template>
  <div class="flex flex-col h-full">
    <!-- Panel Header -->
    <div class="flex-shrink-0 border-b border-slate-200 bg-white px-4 py-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-slate-900">
          {{ prospect?.isClient ? 'Información del Cliente' : 'Información del Prospecto' }}
        </h3>
        
        <!-- Convert to Client Button -->
        <button
          v-if="!prospect?.isClient"
          @click="showConvertModal = true"
          class="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Convertir a Cliente
        </button>
      </div>
    </div>

    <!-- Panel Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Prospect Basic Info -->
      <div class="p-4 border-b border-slate-200">
        <div class="flex items-center space-x-3 mb-4">
          <div
            :class="[
              'w-16 h-16 rounded-full flex items-center justify-center text-white font-medium text-lg',
              prospect?.isClient ? 'bg-green-500' : 'bg-slate-500'
            ]"
          >
            <img
              v-if="prospect?.avatar"
              :src="prospect.avatar"
              :alt="prospect.name || prospect.identifier"
              class="w-full h-full rounded-full object-cover"
            />
            <span v-else>
              {{ getInitials(prospect?.name || prospect?.identifier || '?') }}
            </span>
          </div>
          
          <div class="flex-1">
            <h4 class="font-medium text-slate-900">
              {{ prospect?.name || 'Sin nombre' }}
            </h4>
            <p class="text-sm text-slate-600">{{ prospect?.identifier }}</p>
            <div class="flex items-center space-x-2 mt-1">
              <span
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  prospect?.isClient 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ prospect?.isClient ? 'Cliente' : 'Prospecto' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Accordion Sections -->
      <div class="space-y-1">
        <!-- Client Data Section (only if converted) -->
        <Disclosure v-if="client" v-slot="{ open }" defaultOpen>
          <DisclosureButton class="flex w-full justify-between items-center px-4 py-3 text-left text-sm font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span class="flex items-center space-x-2">
              <PhUser :size="16" />
              <span>Datos del Cliente</span>
            </span>
            <PhCaretDown
              :size="16"
              :class="open ? 'rotate-180 transform' : ''"
              class="transition-transform duration-200"
            />
          </DisclosureButton>
          <DisclosurePanel class="px-4 py-3 bg-white border-b border-slate-200">
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">
                    Nombre
                  </label>
                  <input
                    v-model="editableClient.firstName"
                    type="text"
                    class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    @blur="updateClientData"
                  />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-700 mb-1">
                    Apellido
                  </label>
                  <input
                    v-model="editableClient.lastName"
                    type="text"
                    class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    @blur="updateClientData"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  v-model="editableClient.email"
                  type="email"
                  class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @blur="updateClientData"
                />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  v-model="editableClient.phone"
                  type="tel"
                  class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @blur="updateClientData"
                />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">
                  Empresa
                </label>
                <input
                  v-model="editableClient.company"
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @blur="updateClientData"
                />
              </div>
            </div>
          </DisclosurePanel>
        </Disclosure>

        <!-- Notes Section -->
        <Disclosure v-slot="{ open }">
          <DisclosureButton class="flex w-full justify-between items-center px-4 py-3 text-left text-sm font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span class="flex items-center space-x-2">
              <PhNotePencil :size="16" />
              <span>Notas</span>
              <span v-if="client?.notes?.length" class="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                {{ client.notes.length }}
              </span>
            </span>
            <PhCaretDown
              :size="16"
              :class="open ? 'rotate-180 transform' : ''"
              class="transition-transform duration-200"
            />
          </DisclosureButton>
          <DisclosurePanel class="px-4 py-3 bg-white border-b border-slate-200">
            <!-- Add Note Form -->
            <div class="mb-4">
              <textarea
                v-model="newNote"
                placeholder="Agregar una nota..."
                rows="3"
                class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                :disabled="!newNote.trim() || loading"
                @click="handleAddNote"
                class="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Agregar Nota
              </button>
            </div>
            
            <!-- Notes List -->
            <div v-if="client?.notes?.length" class="space-y-3">
              <div
                v-for="note in client.notes"
                :key="note.id"
                class="p-3 bg-slate-50 rounded-lg"
              >
                <p class="text-sm text-slate-900 mb-2">{{ note.content }}</p>
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>{{ note.author }}</span>
                  <span>{{ formatDate(note.createdAt) }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-4 text-slate-500">
              <PhNotePencil :size="32" class="mx-auto mb-2 text-slate-300" />
              <p class="text-sm">No hay notas</p>
            </div>
          </DisclosurePanel>
        </Disclosure>

        <!-- Quotes Section -->
        <Disclosure v-if="client" v-slot="{ open }">
          <DisclosureButton class="flex w-full justify-between items-center px-4 py-3 text-left text-sm font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span class="flex items-center space-x-2">
              <PhReceipt :size="16" />
              <span>Cotizaciones</span>
              <span v-if="client.quotes?.length" class="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                {{ client.quotes.length }}
              </span>
            </span>
            <PhCaretDown
              :size="16"
              :class="open ? 'rotate-180 transform' : ''"
              class="transition-transform duration-200"
            />
          </DisclosureButton>
          <DisclosurePanel class="px-4 py-3 bg-white border-b border-slate-200">
            <div v-if="client.quotes?.length" class="space-y-3">
              <div
                v-for="quote in client.quotes"
                :key="quote.id"
                class="p-3 border border-slate-200 rounded-lg"
              >
                <div class="flex items-start justify-between mb-2">
                  <h5 class="font-medium text-slate-900">{{ quote.title }}</h5>
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full',
                      getQuoteStatusColor(quote.status)
                    ]"
                  >
                    {{ getQuoteStatusLabel(quote.status) }}
                  </span>
                </div>
                <p class="text-sm text-slate-600 mb-2">{{ quote.description }}</p>
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-green-600">
                    {{ formatCurrency(quote.amount, quote.currency) }}
                  </span>
                  <span class="text-slate-500">
                    {{ formatDate(quote.createdAt) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-4 text-slate-500">
              <PhReceipt :size="32" class="mx-auto mb-2 text-slate-300" />
              <p class="text-sm">No hay cotizaciones</p>
            </div>
          </DisclosurePanel>
        </Disclosure>
      </div>
    </div>

    <!-- Convert to Client Modal -->
    <TransitionRoot appear :show="showConvertModal" as="template">
      <Dialog as="div" @close="showConvertModal = false" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-slate-900">
                  Convertir a Cliente
                </DialogTitle>
                <div class="mt-2">
                  <p class="text-sm text-slate-500">
                    Completa la información para convertir este prospecto en cliente.
                  </p>
                </div>

                <div class="mt-4 space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        v-model="convertForm.firstName"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-1">
                        Apellido *
                      </label>
                      <input
                        v-model="convertForm.lastName"
                        type="text"
                        required
                        class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <input
                      v-model="convertForm.email"
                      type="email"
                      required
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      v-model="convertForm.phone"
                      type="tel"
                      required
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">
                      Empresa
                    </label>
                    <input
                      v-model="convertForm.company"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div class="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-lg hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                    @click="showConvertModal = false"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    :disabled="!isConvertFormValid || loading"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    @click="handleConvertToClient"
                  >
                    Convertir
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { 
  PhUser, 
  PhNotePencil, 
  PhReceipt, 
  PhCaretDown 
} from '@phosphor-icons/vue'
import { 
  Disclosure, 
  DisclosureButton, 
  DisclosurePanel,
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild
} from '@headlessui/vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Prospect, Client } from '../../types'

interface Props {
  prospect?: Prospect
  client?: Client
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  convertToClient: [clientData: Partial<Client>]
  addNote: [content: string]
  updateClient: [clientData: Partial<Client>]
}>()

// Local state
const showConvertModal = ref(false)
const newNote = ref('')
const editableClient = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: ''
})

const convertForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: ''
})

// Computed
const isConvertFormValid = computed(() => {
  return convertForm.firstName.trim() && 
         convertForm.lastName.trim() && 
         convertForm.email.trim() && 
         convertForm.phone.trim()
})

// Methods
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
  } catch {
    return dateString
  }
}

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount)
}

const getQuoteStatusLabel = (status: string): string => {
  const labels = {
    draft: 'Borrador',
    sent: 'Enviada',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    expired: 'Expirada'
  }
  return labels[status as keyof typeof labels] || status
}

const getQuoteStatusColor = (status: string): string => {
  const colors = {
    draft: 'bg-slate-100 text-slate-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-yellow-100 text-yellow-800'
  }
  return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-800'
}

const handleAddNote = () => {
  if (!newNote.value.trim()) return
  
  emit('addNote', newNote.value.trim())
  newNote.value = ''
}

const handleConvertToClient = () => {
  if (!isConvertFormValid.value) return
  
  emit('convertToClient', { ...convertForm })
  showConvertModal.value = false
  
  // Reset form
  Object.assign(convertForm, {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: ''
  })
}

const updateClientData = () => {
  if (!props.client) return
  
  const hasChanges = Object.keys(editableClient).some(key => {
    return editableClient[key as keyof typeof editableClient] !== 
           props.client![key as keyof Client]
  })
  
  if (hasChanges) {
    emit('updateClient', { ...editableClient })
  }
}

// Watch for client changes to update editable form
watch(() => props.client, (newClient) => {
  if (newClient) {
    Object.assign(editableClient, {
      firstName: newClient.firstName || '',
      lastName: newClient.lastName || '',
      email: newClient.email || '',
      phone: newClient.phone || '',
      company: newClient.company || ''
    })
  }
}, { immediate: true })

// Initialize convert form with prospect data
watch(() => props.prospect, (newProspect) => {
  if (newProspect && !newProspect.isClient) {
    convertForm.email = newProspect.identifierType === 'email' ? newProspect.identifier : ''
    convertForm.phone = newProspect.identifierType === 'phone' ? newProspect.identifier : ''
  }
}, { immediate: true })
</script>