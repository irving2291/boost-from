<template>
  <div class="flex flex-col h-full">
    <!-- Search and Filters -->
    <div class="p-4 border-b border-slate-200">
      <div class="relative">
        <PhMagnifyingGlass 
          :size="20" 
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar conversaciones..."
          class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <!-- Platform Filter -->
      <div class="flex flex-wrap gap-2 mt-3">
        <button
          v-for="platform in platforms"
          :key="platform.value"
          @click="togglePlatformFilter(platform.value)"
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            selectedPlatforms.includes(platform.value)
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
          ]"
        >
          <component :is="platform.icon" :size="14" class="inline mr-1" />
          {{ platform.label }}
        </button>
      </div>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading && filteredConversations.length === 0" class="p-4">
        <div class="animate-pulse space-y-3">
          <div v-for="i in 5" :key="i" class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-slate-200 rounded-full"></div>
            <div class="flex-1">
              <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="filteredConversations.length === 0" class="p-4 text-center text-slate-500">
        <PhChatCircle :size="48" class="mx-auto mb-3 text-slate-300" />
        <p class="font-medium">No hay conversaciones</p>
        <p class="text-sm">Las nuevas conversaciones aparecerán aquí</p>
      </div>

      <div v-else class="divide-y divide-slate-200">
        <ConversationCard
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          :conversation="conversation"
          :prospect="getProspectById(conversation.prospectId)"
          :is-active="conversation.id === activeConversationId"
          @click="$emit('selectConversation', conversation.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  PhMagnifyingGlass, 
  PhChatCircle,
  PhWhatsappLogo,
  PhInstagramLogo,
  PhFacebookLogo,
  PhTelegramLogo,
  PhEnvelope,
  PhChatText
} from '@phosphor-icons/vue'
import ConversationCard from './ConversationCard.vue'
import type { Conversation, Prospect } from '../../types'

interface Props {
  conversations: Conversation[]
  prospects: Prospect[]
  activeConversationId: string | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  selectConversation: [conversationId: string]
}>()

// Local state
const searchQuery = ref('')
const selectedPlatforms = ref<string[]>([])

// Platform configuration
const platforms = [
  { value: 'whatsapp', label: 'WhatsApp', icon: PhWhatsappLogo },
  { value: 'instagram', label: 'Instagram', icon: PhInstagramLogo },
  { value: 'facebook', label: 'Facebook', icon: PhFacebookLogo },
  { value: 'telegram', label: 'Telegram', icon: PhTelegramLogo },
  { value: 'email', label: 'Email', icon: PhEnvelope },
  { value: 'sms', label: 'SMS', icon: PhChatText }
]

// Computed
const filteredConversations = computed(() => {
  let filtered = props.conversations

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(conversation => {
      const prospect = getProspectById(conversation.prospectId)
      const prospectName = prospect?.name?.toLowerCase() || ''
      const prospectIdentifier = prospect?.identifier?.toLowerCase() || ''
      const lastMessageContent = conversation.lastMessage?.content?.toLowerCase() || ''
      
      return prospectName.includes(query) || 
             prospectIdentifier.includes(query) || 
             lastMessageContent.includes(query)
    })
  }

  // Filter by platform
  if (selectedPlatforms.value.length > 0) {
    filtered = filtered.filter(conversation => 
      selectedPlatforms.value.includes(conversation.platform)
    )
  }

  return filtered
})

// Methods
const getProspectById = (prospectId: string): Prospect | undefined => {
  return props.prospects.find(p => p.id === prospectId)
}

const togglePlatformFilter = (platform: string) => {
  const index = selectedPlatforms.value.indexOf(platform)
  if (index > -1) {
    selectedPlatforms.value.splice(index, 1)
  } else {
    selectedPlatforms.value.push(platform)
  }
}
</script>