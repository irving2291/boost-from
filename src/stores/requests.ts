import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RequestInformation, RequestStatus, RequestsSummary } from '../types'
import { REQUEST_STATUSES } from '../utils/constants'

export const useRequestsStore = defineStore('requests', () => {
  // State
  const requests = ref<RequestInformation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mock data for development
  const mockRequests: RequestInformation[] = [
    {
      id: '1',
      clientName: 'María González',
      company: 'TechSoft Solutions',
      email: 'maria@techsoft.com',
      phone: '+593 99 123 4567',
      status: 'NEW',
      priority: 'high',
      subject: 'Consulta sobre servicios',
      description: 'Necesito información sobre los servicios disponibles',
      createdAt: '2024-01-26T20:00:00Z',
      updatedAt: '2024-01-26T20:00:00Z',
      assignedTo: 'María García',
      tags: ['consulta', 'servicios'],
      notes: [],
      amount: 15000
    },
    {
      id: '2',
      clientName: 'Pedro Martín',
      company: 'Empresa Retail XYZ',
      email: 'pedro@retailxyz.com',
      phone: '+593 99 234 5678',
      status: 'NEW',
      priority: 'high',
      subject: 'Implementación de sistema',
      description: 'Necesitamos implementar un nuevo sistema de gestión',
      createdAt: '2024-01-26T08:00:00Z',
      updatedAt: '2024-01-26T08:00:00Z',
      assignedTo: 'Carlos Ruiz',
      tags: ['implementación', 'sistema'],
      notes: [],
      amount: 22000
    },
    {
      id: '3',
      clientName: 'Carlos Ruiz',
      company: 'Startup ABC',
      email: 'carlos@startupABC.com',
      phone: '+593 99 345 6789',
      status: 'NEW',
      priority: 'medium',
      subject: 'Desarrollo de aplicación',
      description: 'Queremos desarrollar una aplicación móvil',
      createdAt: '2024-01-26T16:00:00Z',
      updatedAt: '2024-01-26T16:00:00Z',
      assignedTo: 'Ana López',
      tags: ['desarrollo', 'móvil'],
      notes: [],
      amount: 8500
    },
    {
      id: '4',
      clientName: 'Laura Silva',
      company: 'Agencia Digital',
      email: 'laura@agenciadigital.com',
      phone: '+593 99 456 7890',
      status: 'NEW',
      priority: 'medium',
      subject: 'Rediseño de sitio web',
      description: 'Necesitamos rediseñar nuestro sitio web corporativo',
      createdAt: '2024-01-26T12:00:00Z',
      updatedAt: '2024-01-26T12:00:00Z',
      assignedTo: 'Pedro Martín',
      tags: ['diseño', 'web'],
      notes: [],
      amount: 12800
    },
    {
      id: '5',
      clientName: 'Ana López',
      company: 'Consultoría Legal',
      email: 'ana@consultorialegal.com',
      phone: '+593 99 567 8901',
      status: 'NEW',
      priority: 'low',
      subject: 'Sistema de gestión documental',
      description: 'Requerimos un sistema para gestionar documentos legales',
      createdAt: '2024-01-25T10:00:00Z',
      updatedAt: '2024-01-25T10:00:00Z',
      assignedTo: 'Laura Silva',
      tags: ['gestión', 'documentos'],
      notes: [],
      amount: 3200
    }
  ]

  // Getters
  const requestsByStatus = computed(() => {
    const grouped: Record<RequestStatus, RequestInformation[]> = {
      NEW: [],
      IN_PROGRESS: [],
      RECONTACT: [],
      WON: [],
      LOST: [],
      CLOSE: []
    }

    requests.value.forEach(request => {
      grouped[request.status].push(request)
    })

    return grouped
  })

  const summary = computed((): RequestsSummary => {
    const byStatus: Record<RequestStatus, number> = {
      NEW: 0,
      IN_PROGRESS: 0,
      RECONTACT: 0,
      WON: 0,
      LOST: 0,
      CLOSE: 0
    }

    requests.value.forEach(request => {
      byStatus[request.status]++
    })

    const total = requests.value.length
    const won = byStatus.WON
    const conversionRate = total > 0 ? won / total : 0

    return {
      byStatus,
      total,
      conversionRate,
      avgTimeToClose: 14 // Mock value
    }
  })

  // Actions
  const fetchRequests = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      requests.value = mockRequests
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error fetching requests'
    } finally {
      loading.value = false
    }
  }

  const updateRequestStatus = async (requestId: string, newStatus: RequestStatus) => {
    const request = requests.value.find(r => r.id === requestId)
    if (request) {
      request.status = newStatus
      request.updatedAt = new Date().toISOString()
    }
  }

  const addRequest = async (newRequest: Omit<RequestInformation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const request: RequestInformation = {
      ...newRequest,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    requests.value.push(request)
  }

  const deleteRequest = async (requestId: string) => {
    const index = requests.value.findIndex(r => r.id === requestId)
    if (index > -1) {
      requests.value.splice(index, 1)
    }
  }

  // Initialize with mock data
  if (requests.value.length === 0) {
    requests.value = mockRequests
  }

  return {
    // State
    requests,
    loading,
    error,
    // Getters
    requestsByStatus,
    summary,
    // Actions
    fetchRequests,
    updateRequestStatus,
    addRequest,
    deleteRequest
  }
})