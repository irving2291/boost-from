<template>
  <Layout>
    <div class="p-8">
      <h1 class="text-2xl font-bold text-slate-900">Test Page - Sidebar Colapsable</h1>
      <p class="text-slate-600 mt-2">Esta página demuestra el funcionamiento del sidebar colapsable y el header fijo.</p>
      
      <div class="mt-8 space-y-6">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Funcionalidades Implementadas</h2>
          <ul class="space-y-2 text-slate-600">
            <li class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Sidebar colapsable con botón toggle
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Header fijo que se mantiene al hacer scroll
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Persistencia de preferencia en localStorage
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Transiciones suaves entre estados
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Tooltips en modo colapsado
            </li>
            <li class="flex items-center">
              <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Badges visibles en ambos modos
            </li>
          </ul>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Instrucciones de Prueba</h2>
          <ol class="space-y-2 text-slate-600 list-decimal list-inside">
            <li>Haz clic en el botón de menú (☰) en el sidebar para colapsar/expandir</li>
            <li>Observa cómo el header se ajusta automáticamente</li>
            <li>Recarga la página para verificar que se mantiene tu preferencia</li>
            <li>Haz scroll hacia abajo para ver que el header permanece fijo</li>
            <li>En modo colapsado, pasa el mouse sobre los iconos para ver los tooltips</li>
          </ol>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">Contenido de Prueba para Scroll</h2>
          <div class="space-y-4">
            <p class="text-slate-600">Este contenido adicional permite probar el scroll y verificar que el header permanece fijo.</p>
            <div class="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <span class="text-slate-700">Contenido de prueba 1</span>
            </div>
            <div class="h-32 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
              <span class="text-slate-700">Contenido de prueba 2</span>
            </div>
            <div class="h-32 bg-gradient-to-r from-yellow-100 to-red-100 rounded-lg flex items-center justify-center">
              <span class="text-slate-700">Contenido de prueba 3</span>
            </div>
            <div class="h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
              <span class="text-slate-700">Contenido de prueba 4</span>
            </div>
            <div class="h-32 bg-gradient-to-r from-indigo-100 to-cyan-100 rounded-lg flex items-center justify-center">
              <span class="text-slate-700">Contenido de prueba 5</span>
            </div>
          </div>
        </div>

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
      </div>

      <!-- Request Details Modal -->
      <RequestDetailsModal
        :is-open="showModal"
        :request="mockRequest"
        @close="closeModal"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Layout from '../components/layout/Layout.vue'
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