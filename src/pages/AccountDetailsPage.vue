<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PhArrowLeft,
  PhPencil,
  PhTrash,
  PhPlus,
  PhBuilding,
  PhUser,
  PhEnvelope,
  PhPhone,
  PhMapPin,
  PhGlobe,
  PhStar,
  PhCalendar,
  PhCurrencyDollar,
  PhChatCircle,
  PhFileText,
  PhClipboardText,
  PhActivity
} from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
import { useAccountsStore } from '../stores/accounts'
import type { Account } from '../types'
import Badge from '../components/ui/Badge.vue'

const route = useRoute()
const router = useRouter()
const accountsStore = useAccountsStore()

// Local state
const loading = ref(false)
const activeTab = ref('overview')

// Computed
const account = computed(() => accountsStore.currentAccount)
const accountRequests = computed(() => accountsStore.accountRequests)
const accountQuotations = computed(() => accountsStore.accountQuotations)
const accountConversations = computed(() => accountsStore.accountConversations)
const accountNotes = computed(() => accountsStore.accountNotes)
const accountActivities = computed(() => accountsStore.accountActivities)

// Methods
const loadAccountData = async (accountId: string) => {
  loading.value = true
  try {
    await Promise.all([
      accountsStore.fetchAccountById(accountId),
      accountsStore.fetchAccountRequests(accountId),
      accountsStore.fetchAccountQuotations(accountId),
      accountsStore.fetchAccountConversations(accountId),
      accountsStore.fetchAccountNotes(accountId),
      accountsStore.fetchAccountActivities(accountId)
    ])
  } catch (error) {
    console.error('Error loading account data:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/accounts')
}

const editAccount = () => {
  if (account.value) {
    router.push(`/accounts/${account.value.id}/edit`)
  }
}

const deleteAccount = async () => {
  if (!account.value) return
  
  if (confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
    try {
      await accountsStore.deleteAccount(account.value.id)
      router.push('/accounts')
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }
}

const convertToClient = async () => {
  if (!account.value) return
  
  try {
    await accountsStore.convertProspectToClient(account.value.id)
  } catch (error) {
    console.error('Error converting prospect to client:', error)
  }
}

const getAccountDisplayName = (acc: Account) => {
  return accountsStore.getAccountDisplayName(acc)
}

const getAccountInitials = (acc: Account) => {
  return accountsStore.getAccountInitials(acc)
}

const getStatusColor = (status: string) => {
  return status === 'client' ? 'green' : 'blue'
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'red'
    case 'medium': return 'yellow'
    case 'low': return 'default'
    default: return 'default'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('es-EC')
}

// Lifecycle
onMounted(() => {
  const accountId = route.params.id as string
  if (accountId) {
    loadAccountData(accountId)
  }
})
</script>

<template>
  <Layout>
    <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="goBack"
          class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <PhArrowLeft :size="16" class="mr-2" />
          Volver
        </button>
        <div v-if="account">
          <h1 class="text-2xl font-bold text-gray-900">
            {{ getAccountDisplayName(account) }}
          </h1>
          <div class="flex items-center space-x-2 mt-1">
            <Badge :color="getStatusColor(account.status)">
              {{ account.status === 'client' ? 'Cliente' : 'Prospecto' }}
            </Badge>
            <Badge :color="getPriorityColor(account.priority)">
              {{ account.priority === 'high' ? 'Alta' : account.priority === 'medium' ? 'Media' : 'Baja' }}
            </Badge>
          </div>
        </div>
      </div>
      <div v-if="account" class="flex items-center space-x-2">
        <button
          v-if="account.status === 'prospect'"
          @click="convertToClient"
          class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PhStar :size="16" class="mr-2" />
          Convertir a Cliente
        </button>
        <button
          @click="editAccount"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <PhPencil :size="16" class="mr-2" />
          Editar
        </button>
        <button
          @click="deleteAccount"
          class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <PhTrash :size="16" class="mr-2" />
          Eliminar
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Account Details -->
    <div v-else-if="account" class="space-y-6">
      <!-- Account Info Card -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-start space-x-6">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div
              v-if="!account.avatar"
              class="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center text-xl font-medium text-gray-700"
            >
              {{ getAccountInitials(account) }}
            </div>
            <img
              v-else
              :src="account.avatar"
              :alt="getAccountDisplayName(account)"
              class="h-20 w-20 rounded-full object-cover"
            />
          </div>

          <!-- Basic Info -->
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex items-center space-x-2">
                <PhBuilding v-if="account.type === 'company'" :size="20" class="text-gray-400" />
                <PhUser v-else :size="20" class="text-gray-400" />
                <span class="text-sm text-gray-600">
                  {{ account.type === 'company' ? 'Empresa' : 'Persona' }}
                </span>
              </div>
              
              <div class="flex items-center space-x-2">
                <PhEnvelope :size="20" class="text-gray-400" />
                <a :href="`mailto:${account.email}`" class="text-blue-600 hover:text-blue-800">
                  {{ account.email }}
                </a>
              </div>
              
              <div class="flex items-center space-x-2">
                <PhPhone :size="20" class="text-gray-400" />
                <a :href="`tel:${account.phone}`" class="text-blue-600 hover:text-blue-800">
                  {{ account.phone }}
                </a>
              </div>
              
              <div v-if="account.address" class="flex items-center space-x-2">
                <PhMapPin :size="20" class="text-gray-400" />
                <span class="text-gray-700">{{ account.address }}</span>
              </div>
              
              <div v-if="account.website" class="flex items-center space-x-2">
                <PhGlobe :size="20" class="text-gray-400" />
                <a :href="account.website" target="_blank" class="text-blue-600 hover:text-blue-800">
                  {{ account.website }}
                </a>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <span class="text-sm text-gray-600">Responsable:</span>
                <p class="font-medium text-gray-900">{{ account.assignedToName || 'Sin asignar' }}</p>
              </div>
              
              <div>
                <span class="text-sm text-gray-600">Valor Total:</span>
                <p class="font-medium text-gray-900">{{ formatCurrency(account.totalValue) }}</p>
              </div>
              
              <div v-if="account.potentialValue">
                <span class="text-sm text-gray-600">Valor Potencial:</span>
                <p class="font-medium text-gray-900">{{ formatCurrency(account.potentialValue) }}</p>
              </div>
              
              <div>
                <span class="text-sm text-gray-600">Creado:</span>
                <p class="font-medium text-gray-900">{{ formatDate(account.createdAt) }}</p>
              </div>
              
              <div v-if="account.lastContactDate">
                <span class="text-sm text-gray-600">Último Contacto:</span>
                <p class="font-medium text-gray-900">{{ formatDate(account.lastContactDate) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="account.tags && account.tags.length > 0" class="mt-6 pt-6 border-t border-gray-200">
          <span class="text-sm text-gray-600 mb-2 block">Etiquetas:</span>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="tag in account.tags" :key="tag" color="default">
              {{ tag }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg border border-gray-200">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6">
            <button
              @click="activeTab = 'overview'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <PhActivity :size="16" class="inline mr-2" />
              Resumen
            </button>
            <button
              @click="activeTab = 'requests'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <PhClipboardText :size="16" class="inline mr-2" />
              Solicitudes ({{ accountRequests.length }})
            </button>
            <button
              @click="activeTab = 'quotations'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'quotations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <PhFileText :size="16" class="inline mr-2" />
              Cotizaciones ({{ accountQuotations.length }})
            </button>
            <button
              @click="activeTab = 'conversations'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'conversations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <PhChatCircle :size="16" class="inline mr-2" />
              Conversaciones ({{ accountConversations.length }})
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600">Solicitudes</p>
                    <p class="text-2xl font-bold text-gray-900">{{ account.requestsCount }}</p>
                  </div>
                  <PhClipboardText :size="24" class="text-blue-500" />
                </div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600">Cotizaciones</p>
                    <p class="text-2xl font-bold text-gray-900">{{ account.quotationsCount }}</p>
                  </div>
                  <PhFileText :size="24" class="text-green-500" />
                </div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600">Conversaciones</p>
                    <p class="text-2xl font-bold text-gray-900">{{ account.conversationsCount }}</p>
                  </div>
                  <PhChatCircle :size="24" class="text-purple-500" />
                </div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm text-gray-600">Valor Total</p>
                    <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(account.totalValue) }}</p>
                  </div>
                  <PhCurrencyDollar :size="24" class="text-yellow-500" />
                </div>
              </div>
            </div>

            <!-- Recent Activities -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
              <div v-if="accountActivities.length === 0" class="text-center py-8 text-gray-500">
                No hay actividades recientes
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="activity in accountActivities.slice(0, 5)"
                  :key="activity.id"
                  class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">{{ activity.description }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ activity.performedByName }} • {{ formatDateTime(activity.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Requests Tab -->
          <div v-else-if="activeTab === 'requests'">
            <div v-if="accountRequests.length === 0" class="text-center py-8 text-gray-500">
              No hay solicitudes para esta cuenta
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="request in accountRequests"
                :key="request.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ request.subject }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ request.description }}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <Badge :color="request.status === 'WON' ? 'green' : 'blue'">
                        {{ request.status }}
                      </Badge>
                      <span class="text-sm text-gray-500">{{ formatDate(request.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p v-if="request.amount" class="font-medium text-gray-900">
                      {{ formatCurrency(request.amount) }}
                    </p>
                    <p class="text-sm text-gray-500">{{ request.assignedToName || 'Sin asignar' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quotations Tab -->
          <div v-else-if="activeTab === 'quotations'">
            <div v-if="accountQuotations.length === 0" class="text-center py-8 text-gray-500">
              No hay cotizaciones para esta cuenta
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="quotation in accountQuotations"
                :key="quotation.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ quotation.title }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ quotation.description }}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <Badge :color="quotation.status === 'accepted' ? 'green' : 'blue'">
                        {{ quotation.status }}
                      </Badge>
                      <span class="text-sm text-gray-500">{{ formatDate(quotation.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">{{ formatCurrency(quotation.amount) }}</p>
                    <p class="text-sm text-gray-500">{{ quotation.assignedToName || 'Sin asignar' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Conversations Tab -->
          <div v-else-if="activeTab === 'conversations'">
            <div v-if="accountConversations.length === 0" class="text-center py-8 text-gray-500">
              No hay conversaciones para esta cuenta
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="conversation in accountConversations"
                :key="conversation.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-medium text-gray-900">{{ conversation.subject || 'Conversación' }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ conversation.lastMessage }}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <Badge :color="conversation.status === 'active' ? 'green' : 'default'">
                        {{ conversation.status }}
                      </Badge>
                      <Badge color="blue">{{ conversation.platform }}</Badge>
                      <span class="text-sm text-gray-500">{{ formatDateTime(conversation.lastActivity) }}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-500">{{ conversation.messageCount }} mensajes</p>
                    <p class="text-sm text-gray-500">{{ conversation.assignedToName || 'Sin asignar' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">No se pudo cargar la información de la cuenta</p>
      <button
        @click="goBack"
        class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        Volver a Cuentas
      </button>
      </div>
    </div>
  </Layout>
</template>