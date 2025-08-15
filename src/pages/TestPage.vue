<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-slate-900">Test Page</h1>
    <p class="text-slate-600 mt-2">Esta es una página de prueba para verificar que Vue.js funciona correctamente.</p>
    
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">Test RequestDetailsModal</h2>
      <button
        @click="openModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Abrir Modal de Detalles de Request
      </button>
    </div>

    <div class="mt-8">
      <h2 class="text-xl font-semibold text-slate-800 mb-4">Test KanbanBoard Component</h2>
      <div class="h-96 border border-gray-300 rounded-lg">
        <KanbanBoard />
      </div>
    </div>

    <!-- Request Details Modal -->
    <RequestDetailsModal
      :is-open="showModal"
      :request="mockRequest"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RequestDetailsModal from '../components/kanban/RequestDetailsModal.vue'
import KanbanBoard from '../components/kanban/KanbanBoard.vue'
import type { RequestInformation } from '../types'

// Mock data for testing
const mockRequest: RequestInformation = {
  id: '1',
  fistName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  phone: '+593 99 123 4567',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-16T14:20:00Z',
  status: {
    id: '1',
    code: 'new',
    name: 'Nuevo',
    organization: 'test-org',
    default: true
  },
  company: 'Empresa ABC S.A.',
  priority: 'high',
  subject: 'Solicitud de cotización para sistema CRM',
  description: 'Necesitamos un sistema CRM completo para gestionar nuestros clientes y ventas. El sistema debe incluir:\n\n- Gestión de contactos\n- Pipeline de ventas\n- Reportes y analytics\n- Integración con WhatsApp\n- Dashboard ejecutivo\n\nPresupuesto aproximado: $15,000 - $25,000',
  amount: 20000,
  tags: ['CRM', 'Software', 'Urgente', 'Empresa Grande']
}

const showModal = ref(false)

const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}
</script>