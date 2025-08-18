import { io, Socket } from 'socket.io-client'
import type { SocketEvent, RealTimeStats } from '../types'
import { useAuthStore } from '../stores/auth'
import { useAssigneesStore } from '../stores/assignees'
import { useRequestsStore } from '../stores/requests'

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor() {
    this.connect()
  }

  private connect() {
    const authStore = useAuthStore()
    
    if (!authStore.token) {
      console.warn('No auth token available for socket connection')
      return
    }

    // Get socket URL from environment or use default
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001'

    this.socket = io(socketUrl, {
      auth: {
        token: authStore.token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        this.reconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.reconnect()
    })

    // CRM Events
    this.socket.on('request_assigned', (data) => {
      this.handleRequestAssigned(data)
    })

    this.socket.on('request_status_changed', (data) => {
      this.handleRequestStatusChanged(data)
    })

    this.socket.on('assignee_stats_updated', (data) => {
      this.handleAssigneeStatsUpdated(data)
    })

    this.socket.on('new_request', (data) => {
      this.handleNewRequest(data)
    })

    // Real-time metrics updates
    this.socket.on('real_time_stats', (data) => {
      this.handleRealTimeStats(data)
    })

    // Join user-specific room for personalized updates
    this.socket.emit('join_user_room')
  }

  private handleRequestAssigned(data: any) {
    console.log('Request assigned:', data)
    
    // Update assignee stats
    const assigneesStore = useAssigneesStore()
    assigneesStore.fetchAssigneeStats(assigneesStore.filters)
    
    // Show notification
    this.showNotification('Petición asignada', `Nueva petición asignada a ${data.assigneeName}`)
  }

  private handleRequestStatusChanged(data: any) {
    console.log('Request status changed:', data)
    
    // Update requests store
    const requestsStore = useRequestsStore()
    requestsStore.fetchRequests()
    
    // Update assignee stats
    const assigneesStore = useAssigneesStore()
    assigneesStore.fetchAssigneeStats(assigneesStore.filters)
  }

  private handleAssigneeStatsUpdated(data: any) {
    console.log('Assignee stats updated:', data)
    
    // Update assignee stats
    const assigneesStore = useAssigneesStore()
    assigneesStore.fetchAssigneeStats(assigneesStore.filters)
  }

  private handleNewRequest(data: any) {
    console.log('New request received:', data)
    
    // Update requests store
    const requestsStore = useRequestsStore()
    requestsStore.fetchRequests()
    
    // Show notification
    this.showNotification('Nueva petición', `Nueva petición de ${data.clientName}`)
  }

  private handleRealTimeStats(data: RealTimeStats) {
    console.log('Real-time stats update:', data)
    
    // Update real-time stats in assignees store
    const assigneesStore = useAssigneesStore()
    assigneesStore.updateRealTimeStats(data)
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private showNotification(title: string, message: string) {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/vite.svg',
        tag: 'crm-notification'
      })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/vite.svg',
            tag: 'crm-notification'
          })
        }
      })
    }
  }

  // Public methods
  public emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  public off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false
  }

  public getSocketId(): string | undefined {
    return this.socket?.id
  }

  // Request notifications permission
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  // Subscribe to assignee updates
  public subscribeToAssigneeUpdates(assigneeId: string) {
    this.emit('subscribe_assignee_updates', { assigneeId })
  }

  // Unsubscribe from assignee updates
  public unsubscribeFromAssigneeUpdates(assigneeId: string) {
    this.emit('unsubscribe_assignee_updates', { assigneeId })
  }

  // Subscribe to request updates
  public subscribeToRequestUpdates(requestId: string) {
    this.emit('subscribe_request_updates', { requestId })
  }

  // Unsubscribe from request updates
  public unsubscribeFromRequestUpdates(requestId: string) {
    this.emit('unsubscribe_request_updates', { requestId })
  }

  // Send typing indicator for chat
  public sendTyping(conversationId: string, isTyping: boolean) {
    this.emit('typing', { conversationId, isTyping })
  }

  // Mark message as read
  public markMessageAsRead(messageId: string) {
    this.emit('message_read', { messageId })
  }
}

// Create singleton instance
let socketService: SocketService | null = null

export const getSocketService = (): SocketService => {
  if (!socketService) {
    socketService = new SocketService()
  }
  return socketService
}

export const useSocket = () => {
  return getSocketService()
}

// Export types for use in components
export type { SocketEvent, RealTimeStats }