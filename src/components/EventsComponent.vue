<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { eventsService, type Event } from '../services/eventsService'
import { useOrganizationsStore } from '../stores/organizations'
import {
  PhPlus,
  PhPencil,
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

    events.value = response.items
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
  return `${getEventType(event.eventType)}`
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
  if (type === 'request_information_status.changed') {
    return 'Estado Cambiado'
  }
  return type
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
    <ol class="relative border-s border-gray-200 dark:border-gray-700">
      <li
        v-for="(event, index) in events"
        :key="event.pk"
        :class="['ms-6', index < events.length - 1 ? 'mb-10' : '']"
      >
        <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
          <component
            :is="getEventIcon(event.eventType)"
            :size="16"
            class="text-blue-800 dark:text-blue-300"
          />
        </span>
        <h3 class="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
          {{ getEventType(event.eventType) }}
          <span v-if="index === 0" class="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300 ms-3">Latest</span>
        </h3>
        <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{{ formatDate(event.ts) }}</time>
        <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{{ getEventDescription(event) }}</p>
        <div v-if="event.actor" class="text-sm text-gray-600 dark:text-gray-400">
          Por: {{ event.actor.username }}
        </div>
      </li>
    </ol>
  </div>
</template>
