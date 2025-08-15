<template>
  <div
    :class="[
      'flex',
      message.senderType === 'agent' ? 'justify-end' : 'justify-start'
    ]"
  >
    <div
      :class="[
        'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
        getBubbleClasses()
      ]"
    >
      <!-- Message Content -->
      <div v-if="message.messageType === 'text'" class="text-sm">
        {{ message.content }}
      </div>
      
      <!-- Image Message -->
      <div v-else-if="message.messageType === 'image'" class="space-y-2">
        <img
          :src="message.metadata?.imageUrl"
          :alt="message.content"
          class="rounded-lg max-w-full h-auto"
          @load="$emit('imageLoaded')"
        />
        <p v-if="message.content" class="text-sm">{{ message.content }}</p>
      </div>
      
      <!-- File Message -->
      <div v-else-if="message.messageType === 'file'" class="space-y-2">
        <div class="flex items-center space-x-2 p-2 bg-black bg-opacity-10 rounded">
          <PhFile :size="20" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">
              {{ message.metadata?.fileName || 'Archivo' }}
            </p>
            <p class="text-xs opacity-75">
              {{ formatFileSize(message.metadata?.fileSize) }}
            </p>
          </div>
          <button class="text-xs underline hover:no-underline">
            Descargar
          </button>
        </div>
        <p v-if="message.content" class="text-sm">{{ message.content }}</p>
      </div>
      
      <!-- Audio Message -->
      <div v-else-if="message.messageType === 'audio'" class="space-y-2">
        <div class="flex items-center space-x-2">
          <button
            @click="toggleAudio"
            class="p-2 rounded-full bg-black bg-opacity-10 hover:bg-opacity-20"
          >
            <PhPlay v-if="!isPlaying" :size="16" />
            <PhPause v-else :size="16" />
          </button>
          <div class="flex-1">
            <div class="h-1 bg-black bg-opacity-10 rounded-full">
              <div 
                class="h-full bg-current rounded-full transition-all duration-300"
                :style="{ width: `${audioProgress}%` }"
              />
            </div>
          </div>
          <span class="text-xs opacity-75">{{ formatDuration(audioDuration) }}</span>
        </div>
        <p v-if="message.content" class="text-sm">{{ message.content }}</p>
      </div>

      <!-- Message Info -->
      <div class="flex items-center justify-between mt-1 space-x-2">
        <div class="flex items-center space-x-1">
          <!-- Sender Type Indicator -->
          <span v-if="message.senderType === 'bot'" class="text-xs opacity-75">
            🤖
          </span>
          
          <!-- Platform Indicator -->
          <component 
            :is="getPlatformIcon()" 
            :size="12" 
            class="opacity-75" 
          />
        </div>
        
        <div class="flex items-center space-x-1">
          <!-- Timestamp -->
          <span class="text-xs opacity-75">
            {{ formatTime(message.timestamp) }}
          </span>
          
          <!-- Message Status (for agent messages) -->
          <div v-if="message.senderType === 'agent'" class="flex items-center">
            <PhCheck 
              v-if="message.status === 'sent'"
              :size="12" 
              class="opacity-75" 
            />
            <div v-else-if="message.status === 'delivered'" class="flex">
              <PhCheck :size="12" class="opacity-75 -mr-1" />
              <PhCheck :size="12" class="opacity-75" />
            </div>
            <div v-else-if="message.status === 'read'" class="flex text-blue-500">
              <PhCheck :size="12" class="-mr-1" />
              <PhCheck :size="12" />
            </div>
            <PhX 
              v-else-if="message.status === 'failed'"
              :size="12" 
              class="text-red-500" 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  PhFile, 
  PhPlay, 
  PhPause, 
  PhCheck, 
  PhX,
  PhWhatsappLogo,
  PhInstagramLogo,
  PhFacebookLogo,
  PhTelegramLogo,
  PhEnvelope,
  PhChatText
} from '@phosphor-icons/vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ChatMessage, Prospect } from '../../types'

interface Props {
  message: ChatMessage
  prospect?: Prospect
}

const props = defineProps<Props>()

const emit = defineEmits<{
  imageLoaded: []
}>()

// Local state for audio playback
const isPlaying = ref(false)
const audioProgress = ref(0)
const audioDuration = ref(0)

// Computed
const getBubbleClasses = () => {
  const baseClasses = 'shadow-sm'
  
  if (props.message.senderType === 'agent') {
    return `${baseClasses} bg-blue-600 text-white`
  } else if (props.message.senderType === 'bot') {
    return `${baseClasses} bg-purple-100 text-purple-900 border border-purple-200`
  } else {
    return `${baseClasses} bg-white text-slate-900 border border-slate-200`
  }
}

// Methods
const getPlatformIcon = () => {
  const platform = props.message.platform
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

const formatTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return format(date, 'HH:mm', { locale: es })
    } else {
      return format(date, 'dd/MM HH:mm', { locale: es })
    }
  } catch {
    return ''
  }
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return ''
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const toggleAudio = () => {
  // TODO: Implement audio playback
  isPlaying.value = !isPlaying.value
  console.log('Toggle audio playback')
}
</script>