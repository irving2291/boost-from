<template>
  <div
    :class="[
      'p-4 cursor-pointer transition-colors hover:bg-slate-100',
      isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
    ]"
    @click="$emit('click')"
  >
    <div class="flex items-start space-x-3">
      <!-- Avatar -->
      <div class="relative flex-shrink-0">
        <div
          :class="[
            'w-12 h-12 rounded-full flex items-center justify-center text-white font-medium',
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
        
        <!-- Platform Icon -->
        <div
          :class="[
            'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center',
            getPlatformColor(conversation.platform)
          ]"
        >
          <component :is="getPlatformIcon(conversation.platform)" :size="12" class="text-white" />
        </div>
        
        <!-- Client Status Indicator -->
        <div
          v-if="conversation.isClientConverted"
          class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
          title="Cliente convertido"
        >
          <PhCheck :size="10" class="text-white" />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-medium text-slate-900 truncate">
            {{ prospect?.name || prospect?.identifier || 'Desconocido' }}
          </h3>
          <span class="text-xs text-slate-500 flex-shrink-0 ml-2">
            {{ formatTime(conversation.lastActivity) }}
          </span>
        </div>
        
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-600 truncate">
            <span v-if="conversation.lastMessage?.senderType === 'agent'" class="text-blue-600">
              Tú: 
            </span>
            <span v-else-if="conversation.lastMessage?.senderType === 'bot'" class="text-purple-600">
              Bot: 
            </span>
            {{ conversation.lastMessage?.content || 'Sin mensajes' }}
          </p>
          
          <!-- Unread Badge -->
          <div
            v-if="conversation.unreadCount > 0"
            class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2"
          >
            {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
          </div>
        </div>
        
        <!-- Tags -->
        <div v-if="conversation.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="tag in conversation.tags.slice(0, 2)"
            :key="tag"
            class="inline-block px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded"
          >
            {{ tag }}
          </span>
          <span
            v-if="conversation.tags.length > 2"
            class="inline-block px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded"
          >
            +{{ conversation.tags.length - 2 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  PhCheck,
  PhWhatsappLogo,
  PhInstagramLogo,
  PhFacebookLogo,
  PhTelegramLogo,
  PhEnvelope,
  PhChatText
} from '@phosphor-icons/vue'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Conversation, Prospect } from '../../types'

interface Props {
  conversation: Conversation
  prospect?: Prospect
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false
})

const emit = defineEmits<{
  click: []
}>()

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

const formatTime = (timestamp: string): string => {
  try {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: es 
    })
  } catch {
    return 'Hace un momento'
  }
}
</script>