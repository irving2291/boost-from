<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { eventsService, type Event } from '../services/eventsService'
import { useOrganizationsStore } from '../stores/organizations'

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
  return `Evento ${event.eventType} por ${event.actor.username}`
}

onMounted(() => {
  fetchEvents()
})
</script>

<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <h3 class="text-lg font-semibold text-charcoal mb-3">Eventos</h3>
    <div v-if="loading" class="text-center py-4">
      <p class="text-slate-500">Cargando eventos...</p>
    </div>
    <div v-else-if="error" class="text-center py-4">
      <p class="text-red-500">{{ error }}</p>
    </div>
    <div v-else-if="events.length === 0" class="text-center py-4">
      <p class="text-slate-500">No hay eventos para esta entidad</p>
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="event in events"
        :key="event.pk"
        class="flex items-start space-x-3 p-3 bg-white rounded-md border border-gray-200"
      >
        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-slate-700">{{ getEventDescription(event) }}</p>
          <p class="text-xs text-slate-500 mt-1 justify-between flex items-center">
            <span>{{ formatDate(event.ts) }}</span>
            <span v-if="event.eventType" class="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {{ event.eventType }}
            </span>
          </p>
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