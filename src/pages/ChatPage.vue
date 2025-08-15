<template>
  <Layout>
    <div class="h-full flex flex-col">
      <!-- Page Header -->
      <div class="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Comunicación</h1>
            <p class="text-slate-600 mt-1">
              Chat en tiempo real con prospectos y clientes
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Connection Status -->
            <div class="flex items-center space-x-2">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                ]"
              />
              <span class="text-sm text-slate-600">
                {{ isConnected ? 'Conectado' : 'Desconectado' }}
              </span>
            </div>
            
            <!-- Unread Count -->
            <Badge
              v-if="unreadConversationsCount > 0"
              variant="destructive"
              class="px-2 py-1"
            >
              {{ unreadConversationsCount }} sin leer
            </Badge>
          </div>
        </div>
      </div>

      <!-- Main Chat Interface -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left Panel - Conversations -->
        <div class="w-80 border-r border-slate-200 bg-slate-50 flex flex-col">
          <ConversationsList 
            :conversations="sortedConversations"
            :prospects="prospects"
            :active-conversation-id="activeConversationId"
            :loading="loading"
            @select-conversation="handleSelectConversation"
          />
        </div>

        <!-- Center Panel - Messages -->
        <div class="flex-1 flex flex-col bg-white">
          <ChatMessages
            v-if="activeConversation"
            :conversation="activeConversation"
            :messages="activeMessages"
            :prospect="selectedProspect"
            :bot-enabled="settings.botEnabled"
            :loading="loading"
            @send-message="handleSendMessage"
            @toggle-bot="handleToggleBot"
          />
          <div 
            v-else 
            class="flex-1 flex items-center justify-center text-slate-500"
          >
            <div class="text-center">
              <PhChatCircle :size="64" class="mx-auto mb-4 text-slate-300" />
              <p class="text-lg font-medium">Selecciona una conversación</p>
              <p class="text-sm">Elige un prospecto para comenzar a chatear</p>
            </div>
          </div>
        </div>

        <!-- Right Panel - Client Info -->
        <div 
          v-if="selectedProspect"
          class="w-96 border-l border-slate-200 bg-slate-50 flex flex-col"
        >
          <ClientPanel
            :prospect="selectedProspect"
            :client="selectedClient"
            :loading="loading"
            @convert-to-client="handleConvertToClient"
            @add-note="handleAddNote"
            @update-client="handleUpdateClient"
          />
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PhChatCircle } from '@phosphor-icons/vue'
import Layout from '../components/layout/Layout.vue'
import Badge from '../components/ui/Badge.vue'
import ConversationsList from '../components/chat/ConversationsList.vue'
import ChatMessages from '../components/chat/ChatMessages.vue'
import ClientPanel from '../components/chat/ClientPanel.vue'
import { useChatStore } from '../stores/chat'
import type { Client } from '../types'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

// Computed properties from store
const isConnected = computed(() => chatStore.isConnected)
const conversations = computed(() => chatStore.conversations)
const sortedConversations = computed(() => chatStore.sortedConversations)
const prospects = computed(() => chatStore.prospects)
const activeConversationId = computed(() => chatStore.activeConversationId)
const activeConversation = computed(() => chatStore.activeConversation)
const activeMessages = computed(() => chatStore.activeMessages)
const selectedProspect = computed(() => chatStore.selectedProspect)
const selectedClient = computed(() => chatStore.selectedClient)
const settings = computed(() => chatStore.settings)
const unreadConversationsCount = computed(() => chatStore.unreadConversationsCount)
const loading = computed(() => chatStore.loading)

// Socket configuration - ready for URL injection
const socketConfig = {
  url: import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001', // Default fallback
  options: {
    transports: ['websocket'],
    timeout: 20000,
    forceNew: false
  }
}

// Event handlers
const handleSelectConversation = (conversationId: string) => {
  chatStore.setActiveConversation(conversationId)
  
  // Update URL to include conversation ID
  if (conversationId !== route.params.conversationId) {
    router.push(`/chat/${conversationId}`)
  }
}

const handleSendMessage = async (content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
  if (!activeConversationId.value) return
  
  try {
    await chatStore.sendMessage(activeConversationId.value, content, messageType)
  } catch (error) {
    console.error('Failed to send message:', error)
    // TODO: Show error notification
  }
}

const handleToggleBot = () => {
  chatStore.toggleBot()
}

const handleConvertToClient = async (clientData: Partial<Client>) => {
  if (!selectedProspect.value) return
  
  try {
    await chatStore.convertProspectToClient(selectedProspect.value.id, clientData)
    // TODO: Show success notification
  } catch (error) {
    console.error('Failed to convert prospect:', error)
    // TODO: Show error notification
  }
}

const handleAddNote = async (content: string) => {
  if (!selectedClient.value) return
  
  try {
    await chatStore.addClientNote(selectedClient.value.id, content)
    // TODO: Show success notification
  } catch (error) {
    console.error('Failed to add note:', error)
    // TODO: Show error notification
  }
}

const handleUpdateClient = (clientData: Partial<Client>) => {
  if (!selectedClient.value) return
  
  const updatedClient = { ...selectedClient.value, ...clientData }
  chatStore.updateClient(updatedClient)
}

// Watch for route changes to handle direct conversation links
watch(
  () => route.params.conversationId,
  (conversationId) => {
    if (conversationId && typeof conversationId === 'string') {
      chatStore.setActiveConversation(conversationId)
    } else if (!conversationId && activeConversationId.value) {
      // Clear active conversation if no ID in route
      chatStore.setActiveConversation(null)
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(async () => {
  // Connect to socket
  chatStore.connectSocket(socketConfig)
  
  // Load initial data
  await Promise.all([
    chatStore.loadConversations(),
    chatStore.loadProspects(),
    chatStore.loadClients()
  ])
  
  // Handle conversation ID from route
  const conversationId = route.params.conversationId
  if (conversationId && typeof conversationId === 'string') {
    chatStore.setActiveConversation(conversationId)
  }
})

onUnmounted(() => {
  chatStore.disconnectSocket()
})
</script>