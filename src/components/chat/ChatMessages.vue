<template>
  <div class="flex flex-col h-full">
    <!-- Chat Header -->
    <div class="flex-shrink-0 border-b border-slate-200 bg-white px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <!-- Prospect Avatar -->
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
              getPlatformColor(conversation.platform)
            ]"
          >
            <img
              v-if="prospect?.avatar"
              :src="prospect.avatar"
              :alt="prospect.name || prospect.identifier"
              class="w-full h-full rounded-full object-cover"
            />
            <span v-else class="text-sm">
              {{ getInitials(prospect?.name || prospect?.identifier || '?') }}
            </span>
          </div>
          
          <div>
            <h2 class="font-semibold text-slate-900">
              {{ prospect?.name || prospect?.identifier || 'Desconocido' }}
            </h2>
            <div class="flex items-center space-x-2 text-sm text-slate-500">
              <component :is="getPlatformIcon(conversation.platform)" :size="16" />
              <span>{{ getPlatformLabel(conversation.platform) }}</span>
              <span v-if="conversation.isClientConverted" class="text-green-600 font-medium">
                • Cliente
              </span>
            </div>
          </div>
        </div>
        
        <!-- Chat Options -->
        <div class="flex items-center space-x-2">
          <!-- Bot Toggle -->
          <div class="flex items-center space-x-2">
            <label class="text-sm text-slate-600">Bot:</label>
            <Switch
              :checked="botEnabled"
              @update:checked="$emit('toggleBot')"
              class="data-[checked]:bg-blue-600"
            >
              <span class="sr-only">Activar bot</span>
            </Switch>
          </div>
          
          <!-- More Options -->
          <Menu as="div" class="relative">
            <MenuButton class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <PhDotsThreeVertical :size="20" />
            </MenuButton>
            <MenuItems class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
              <MenuItem v-slot="{ active }">
                <button
                  :class="[
                    'w-full text-left px-4 py-2 text-sm',
                    active ? 'bg-slate-100' : ''
                  ]"
                  @click="handleArchiveConversation"
                >
                  Archivar conversación
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  :class="[
                    'w-full text-left px-4 py-2 text-sm',
                    active ? 'bg-slate-100' : ''
                  ]"
                  @click="handleBlockProspect"
                >
                  Bloquear contacto
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>

    <!-- Messages Area -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
    >
      <div v-if="loading && messages.length === 0" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-500">
        <PhChatCircle :size="64" class="mb-4 text-slate-300" />
        <p class="text-lg font-medium">No hay mensajes</p>
        <p class="text-sm">Envía el primer mensaje para comenzar la conversación</p>
      </div>
      
      <div v-else>
        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :prospect="prospect"
        />
      </div>
      
      <!-- Typing Indicator -->
      <div v-if="isTyping" class="flex items-center space-x-2 text-slate-500">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
        <span class="text-sm">{{ prospect?.name || 'Contacto' }} está escribiendo...</span>
      </div>
    </div>

    <!-- Message Input -->
    <div class="flex-shrink-0 border-t border-slate-200 bg-white p-4">
      <div class="flex items-end space-x-3">
        <!-- Attachment Button -->
        <button
          class="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          @click="handleAttachment"
        >
          <PhPaperclip :size="20" />
        </button>
        
        <!-- Message Input -->
        <div class="flex-1">
          <textarea
            v-model="messageText"
            ref="messageInput"
            placeholder="Escribe un mensaje..."
            rows="1"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @keydown="handleKeydown"
            @input="handleInput"
          />
        </div>
        
        <!-- Send Button -->
        <button
          :disabled="!messageText.trim() || loading"
          :class="[
            'p-2 rounded-lg transition-colors',
            messageText.trim() && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          ]"
          @click="handleSendMessage"
        >
          <PhPaperPlaneTilt :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { 
  PhDotsThreeVertical,
  PhChatCircle,
  PhPaperclip,
  PhPaperPlaneTilt,
  PhWhatsappLogo,
  PhInstagramLogo,
  PhFacebookLogo,
  PhTelegramLogo,
  PhEnvelope,
  PhChatText
} from '@phosphor-icons/vue'
import { Menu, MenuButton, MenuItems, MenuItem, Switch } from '@headlessui/vue'
import MessageBubble from './MessageBubble.vue'
import type { Conversation, ChatMessage, Prospect } from '../../types'

interface Props {
  conversation: Conversation
  messages: ChatMessage[]
  prospect?: Prospect
  botEnabled: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  sendMessage: [content: string, messageType?: 'text' | 'image' | 'file']
  toggleBot: []
}>()

// Local state
const messageText = ref('')
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()
const isTyping = ref(false)

// Methods
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getPlatformIcon = (platform: string) => {
  const icons = {
    whatsapp: PhWhatsappLogo,
    instagram: PhInstagramLogo,
    facebook: PhFacebookLogo,
    telegram: PhTelegramLogo,
    email: PhEnvelope,
    sms: PhChatText
  }
  return icons[platform as keyof typeof icons] || PhChatText
}

const getPlatformColor = (platform: string): string => {
  const colors = {
    whatsapp: 'bg-green-500',
    instagram: 'bg-pink-500',
    facebook: 'bg-blue-600',
    telegram: 'bg-blue-400',
    email: 'bg-gray-500',
    sms: 'bg-purple-500'
  }
  return colors[platform as keyof typeof colors] || 'bg-gray-500'
}

const getPlatformLabel = (platform: string): string => {
  const labels = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    facebook: 'Facebook',
    telegram: 'Telegram',
    email: 'Email',
    sms: 'SMS'
  }
  return labels[platform as keyof typeof labels] || platform
}

const handleSendMessage = () => {
  const content = messageText.value.trim()
  if (!content) return
  
  emit('sendMessage', content)
  messageText.value = ''
  
  // Auto-resize textarea
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

const handleInput = () => {
  // Auto-resize textarea
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
  }
}

const handleAttachment = () => {
  // TODO: Implement file attachment
  console.log('Attachment clicked')
}

const handleArchiveConversation = () => {
  // TODO: Implement archive functionality
  console.log('Archive conversation')
}

const handleBlockProspect = () => {
  // TODO: Implement block functionality
  console.log('Block prospect')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Watch for new messages and scroll to bottom
watch(() => props.messages.length, () => {
  scrollToBottom()
})

onMounted(() => {
  scrollToBottom()
})
</script>