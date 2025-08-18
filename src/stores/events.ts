import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'
import type { Event, EventInsert } from '../types/supabase'
import { useAuthStore } from './auth'

export const useEventsStore = defineStore('events', () => {
  // State
  const events = ref<Event[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const realtimeChannel = ref<any>(null)

  // Getters
  const eventsByEntity = computed(() => {
    return (entityType: string, entityId: string) => 
      events.value.filter(event => 
        event.entity_type === entityType && event.entity_id === entityId
      )
  })

  const recentEvents = computed(() => {
    return events.value
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50) // Last 50 events
  })

  // Actions
  const fetchEvents = async (entityType?: string, entityId?: string) => {
    loading.value = true
    error.value = null
    
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (entityType && entityId) {
        query = query
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
      }

      const { data, error: supabaseError } = await query
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      events.value = data || []
    } catch (err) {
      console.error('Error fetching events from Supabase:', err)
      error.value = err instanceof Error ? err.message : 'Error fetching events'
      events.value = []
    } finally {
      loading.value = false
    }
  }

  const createEvent = async (eventData: Omit<EventInsert, 'author_id'>) => {
    try {
      const authStore = useAuthStore()
      
      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      const { data, error: supabaseError } = await supabase
        .from('events')
        .insert({
          ...eventData,
          author_id: authStore.user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      // The event will be added via realtime subscription
      return data
    } catch (err) {
      console.error('Error creating event:', err)
      throw err
    }
  }

  const subscribeToEvents = (entityType?: string, entityId?: string) => {
    // Unsubscribe from previous channel if exists
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value)
    }

    // Create new channel
    let channelName = 'events'
    if (entityType && entityId) {
      channelName = `events:${entityType}:${entityId}`
    }

    realtimeChannel.value = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          ...(entityType && entityId && {
            filter: `entity_type=eq.${entityType} and entity_id=eq.${entityId}`
          })
        },
        (payload) => {
          console.log('New event received:', payload)
          const newEvent = payload.new as Event
          
          // Add to the beginning of the array (most recent first)
          events.value.unshift(newEvent)
          
          // Keep only the last 100 events to prevent memory issues
          if (events.value.length > 100) {
            events.value = events.value.slice(0, 100)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          ...(entityType && entityId && {
            filter: `entity_type=eq.${entityType} and entity_id=eq.${entityId}`
          })
        },
        (payload) => {
          console.log('Event updated:', payload)
          const updatedEvent = payload.new as Event
          
          // Update the event in the array
          const index = events.value.findIndex(event => event.id === updatedEvent.id)
          if (index > -1) {
            events.value[index] = updatedEvent
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'events',
          ...(entityType && entityId && {
            filter: `entity_type=eq.${entityType} and entity_id=eq.${entityId}`
          })
        },
        (payload) => {
          console.log('Event deleted:', payload)
          const deletedEvent = payload.old as Event
          
          // Remove the event from the array
          const index = events.value.findIndex(event => event.id === deletedEvent.id)
          if (index > -1) {
            events.value.splice(index, 1)
          }
        }
      )
      .subscribe()

    console.log(`Subscribed to realtime events for channel: ${channelName}`)
  }

  const unsubscribeFromEvents = () => {
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value)
      realtimeChannel.value = null
      console.log('Unsubscribed from realtime events')
    }
  }

  // Helper function to create common event types
  const createRequestEvent = async (requestId: string, description: string) => {
    return createEvent({
      entity_type: 'request_information',
      entity_id: requestId,
      decription: description
    })
  }

  const createQuotationEvent = async (quotationId: string, description: string) => {
    return createEvent({
      entity_type: 'quotation',
      entity_id: quotationId,
      decription: description
    })
  }

  const createOrganizationEvent = async (organizationId: string, description: string) => {
    return createEvent({
      entity_type: 'organization',
      entity_id: organizationId,
      decription: description
    })
  }

  return {
    // State
    events,
    loading,
    error,
    // Getters
    eventsByEntity,
    recentEvents,
    // Actions
    fetchEvents,
    createEvent,
    subscribeToEvents,
    unsubscribeFromEvents,
    // Helper functions
    createRequestEvent,
    createQuotationEvent,
    createOrganizationEvent
  }
})