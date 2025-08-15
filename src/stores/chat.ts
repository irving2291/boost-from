import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import type { 
  ChatMessage, 
  Conversation, 
  Prospect, 
  Client, 
  ChatSettings,
  SocketConfig 
} from '../types'

export const useChatStore = defineStore('chat', () => {
  // State
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const conversations = ref<Conversation[]>([])
  const prospects = ref<Prospect[]>([])
  const clients = ref<Client[]>([])
  const messages = ref<Record<string, ChatMessage[]>>({})
  const activeConversationId = ref<string | null>(null)
  const selectedProspect = ref<Prospect | null>(null)
  const selectedClient = ref<Client | null>(null)
  const settings = ref<ChatSettings>({
    botEnabled: false,
    autoResponse: false,
    workingHours: {
      enabled: false,
      start: '09:00',
      end: '18:00',
      timezone: 'America/Guayaquil'
    },
    notifications: {
      sound: true,
      desktop: true,
      email: false
    }
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeConversation = computed(() => 
    conversations.value.find(c => c.id === activeConversationId.value)
  )

  const activeMessages = computed(() => 
    activeConversationId.value ? messages.value[activeConversationId.value] || [] : []
  )

  const unreadConversationsCount = computed(() => 
    conversations.value.reduce((count, conv) => count + conv.unreadCount, 0)
  )

  const sortedConversations = computed(() => 
    [...conversations.value].sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    )
  )

  // Socket connection
  const connectSocket = (config: SocketConfig) => {
    if (socket.value?.connected) {
      return
    }

    socket.value = io(config.url, config.options)

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('Socket connected')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('Socket disconnected')
    })

    socket.value.on('new_message', (message: ChatMessage) => {
      handleNewMessage(message)
    })

    socket.value.on('conversation_updated', (conversation: Conversation) => {
      updateConversation(conversation)
    })

    socket.value.on('prospect_updated', (prospect: Prospect) => {
      updateProspect(prospect)
    })

    socket.value.on('typing', (data: { conversationId: string, isTyping: boolean }) => {
      // Handle typing indicators
      console.log('Typing indicator:', data)
    })
  }

  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  // Message handling
  const handleNewMessage = (message: ChatMessage) => {
    if (!messages.value[message.conversationId]) {
      messages.value[message.conversationId] = []
    }
    
    messages.value[message.conversationId].push(message)
    
    // Update conversation last message and activity
    const conversation = conversations.value.find(c => c.id === message.conversationId)
    if (conversation) {
      conversation.lastMessage = message
      conversation.lastActivity = message.timestamp
      if (message.senderType === 'prospect') {
        conversation.unreadCount++
      }
    }
  }

  const sendMessage = async (conversationId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    if (!socket.value?.connected) {
      throw new Error('Socket not connected')
    }

    const message: Partial<ChatMessage> = {
      conversationId,
      content,
      messageType,
      senderType: 'agent',
      timestamp: new Date().toISOString(),
      status: 'sent'
    }

    socket.value.emit('send_message', message)
  }

  const markAsRead = (conversationId: string) => {
    const conversation = conversations.value.find(c => c.id === conversationId)
    if (conversation && conversation.unreadCount > 0) {
      conversation.unreadCount = 0
      socket.value?.emit('mark_as_read', { conversationId })
    }
  }

  // Conversation management
  const setActiveConversation = (conversationId: string | null) => {
    if (activeConversationId.value && activeConversationId.value !== conversationId) {
      markAsRead(activeConversationId.value)
    }
    
    activeConversationId.value = conversationId
    
    if (conversationId) {
      loadMessages(conversationId)
      const conversation = conversations.value.find(c => c.id === conversationId)
      if (conversation) {
        const prospect = prospects.value.find(p => p.id === conversation.prospectId)
        setSelectedProspect(prospect || null)
      }
    } else {
      setSelectedProspect(null)
    }
  }

  const updateConversation = (updatedConversation: Conversation) => {
    const index = conversations.value.findIndex(c => c.id === updatedConversation.id)
    if (index !== -1) {
      conversations.value[index] = updatedConversation
    } else {
      conversations.value.push(updatedConversation)
    }
  }

  // Prospect management
  const setSelectedProspect = (prospect: Prospect | null) => {
    selectedProspect.value = prospect
    
    if (prospect?.isClient && prospect.clientId) {
      const client = clients.value.find(c => c.id === prospect.clientId)
      setSelectedClient(client || null)
    } else {
      setSelectedClient(null)
    }
  }

  const updateProspect = (updatedProspect: Prospect) => {
    const index = prospects.value.findIndex(p => p.id === updatedProspect.id)
    if (index !== -1) {
      prospects.value[index] = updatedProspect
    } else {
      prospects.value.push(updatedProspect)
    }
  }

  const convertProspectToClient = async (prospectId: string, clientData: Partial<Client>) => {
    try {
      loading.value = true
      // This would typically make an API call
      socket.value?.emit('convert_prospect', { prospectId, clientData })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to convert prospect'
    } finally {
      loading.value = false
    }
  }

  // Client management
  const setSelectedClient = (client: Client | null) => {
    selectedClient.value = client
  }

  const updateClient = (updatedClient: Client) => {
    const index = clients.value.findIndex(c => c.id === updatedClient.id)
    if (index !== -1) {
      clients.value[index] = updatedClient
    } else {
      clients.value.push(updatedClient)
    }
  }

  const addClientNote = async (clientId: string, content: string) => {
    try {
      loading.value = true
      socket.value?.emit('add_client_note', { clientId, content })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add note'
    } finally {
      loading.value = false
    }
  }

  // Data loading
  const loadConversations = async () => {
    try {
      loading.value = true
      socket.value?.emit('load_conversations')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load conversations'
    } finally {
      loading.value = false
    }
  }

  const loadMessages = async (conversationId: string) => {
    if (messages.value[conversationId]) {
      return // Already loaded
    }

    try {
      socket.value?.emit('load_messages', { conversationId })
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const loadProspects = async () => {
    try {
      loading.value = true
      socket.value?.emit('load_prospects')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load prospects'
    } finally {
      loading.value = false
    }
  }

  const loadClients = async () => {
    try {
      loading.value = true
      socket.value?.emit('load_clients')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load clients'
    } finally {
      loading.value = false
    }
  }

  // Settings
  const updateSettings = (newSettings: Partial<ChatSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    socket.value?.emit('update_chat_settings', settings.value)
  }

  const toggleBot = () => {
    updateSettings({ botEnabled: !settings.value.botEnabled })
  }

  // Cleanup
  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    disconnectSocket()
    conversations.value = []
    prospects.value = []
    clients.value = []
    messages.value = {}
    activeConversationId.value = null
    selectedProspect.value = null
    selectedClient.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    socket,
    isConnected,
    conversations,
    prospects,
    clients,
    messages,
    activeConversationId,
    selectedProspect,
    selectedClient,
    settings,
    loading,
    error,

    // Getters
    activeConversation,
    activeMessages,
    unreadConversationsCount,
    sortedConversations,

    // Actions
    connectSocket,
    disconnectSocket,
    sendMessage,
    markAsRead,
    setActiveConversation,
    updateConversation,
    setSelectedProspect,
    updateProspect,
    convertProspectToClient,
    setSelectedClient,
    updateClient,
    addClientNote,
    loadConversations,
    loadMessages,
    loadProspects,
    loadClients,
    updateSettings,
    toggleBot,
    clearError,
    reset
  }
})