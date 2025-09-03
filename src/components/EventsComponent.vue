<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { eventsService, type Event } from '../services/eventsService'
import { useOrganizationsStore } from '../stores/organizations'
import {
  PhPlus,
  PhPencil,
  PhArrowRight,
  PhUser,
  PhChat,
  PhCheck,
  PhX,
  PhClock
} from '@phosphor-icons/vue'

interface Props {
  entityId: string
}

const props = defineProps<Props>()

const organizationsStore = useOrganizationsStore()

const events = ref<Event[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const fetchEvents = async () => {
  try {
    loading.value = true
    error.value = null
    const tenantId = organizationsStore.currentOrganization?.id
    if (!tenantId) {
      error.value = 'No se pudo obtener el ID de la organización'
      return
    }
    const response = await eventsService.getEvents(props.entityId, tenantId, { perPage: 10 })

    events.value = response['items']
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al cargar eventos'
    console.error('Error fetching events:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getEventDescription = (event: Event) => {
  if (event.payload.note) {
    return event.payload.note
  }
  if (event.payload.channel) {
    return `Evento en canal ${event.payload.channel}`
  }
  return `${getEventType(event.eventType)} por ${event.actor.username}`
}

const getEventType = (type: string) => {
  if (type === 'request_information_status.created') {
    return 'Creado'
  }
  if (type === 'request_information_status.updated') {
    return 'Actualizado'
  }
  if (type === 'request_information_status.assigned') {
    return 'Asignado'
  }
  if (type === 'request_information_status.comment') {
    return 'Comentario'
  }
  if (type === 'request_information_status.completed') {
    return 'Completado'
  }
  if (type === 'request_information_status.cancelled') {
    return 'Cancelado'
  }
  return 'Otro'
}

const getEventIcon = (type: string) => {
  const eventType = getEventType(type)
  switch (eventType) {
    case 'Creado':
      return PhPlus
    case 'Actualizado':
      return PhPencil
    case 'Asignado':
      return PhUser
    case 'Comentario':
      return PhChat
    case 'Completado':
      return PhCheck
    case 'Cancelado':
      return PhX
    default:
      return PhClock
  }
}

onMounted(() => {
  fetchEvents()
})
</script>

<template>
  <div class="">
    <div v-if="loading" class="text-center py-8">
      <p class="text-slate-500">Cargando eventos...</p>
    </div>
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500">{{ error }}</p>
    </div>
    <div v-else-if="events.length === 0" class="text-center py-8">
      <p class="text-slate-500">No hay eventos para esta entidad</p>
    </div>
    <div v-else class="relative">
      <!-- Timeline line -->
      <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-300"></div>

      <div class="space-y-8">
        <div
          v-for="(event, index) in events"
          :key="event.pk"
          class="relative flex items-start space-x-2"
        >
          <!-- Timeline icon -->
          <div class="relative z-20 flex-shrink-0">
            <div class="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
              <component
                :is="getEventIcon(event.eventType)"
                :size="16"
                class="text-white"
              />
            </div>
            <!-- Connecting line for all but last item -->
            <div
              v-if="index < events.length - 1"
              class="absolute top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-blue-300 z-10"
            ></div>
          </div>

          <!-- Event content -->
          <div class="flex-1 min-w-0 pb-8">
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
              <h4 class="text-sm font-semibold text-gray-800">{{ getEventDescription(event) }}</h4>
              <div class="flex items-center space-x-4 text-xs text-slate-500">
                <span class="flex items-center space-x-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ formatDate(event.ts) }}</span>
                </span>
                <span v-if="event.actor" class="flex items-center space-x-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ event.actor.username }}</span>
                </span>
              </div>
              <div v-if="event.payload.note" class="mt-3 text-sm text-slate-600">
                {{ event.payload.note }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar if needed */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>