<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-lg font-semibold text-charcoal mb-4">Gestionar Estados</h3>
    
    <!-- Current statuses list -->
    <div class="mb-6">
      <h4 class="text-sm font-medium text-slate-dark mb-3">Estados Actuales</h4>
      <div class="space-y-2">
        <div 
          v-for="status in sortedStatuses" 
          :key="status.id"
          class="flex items-center justify-between p-3 border rounded-lg"
          :style="{ borderLeftColor: status.color, borderLeftWidth: '4px' }"
        >
          <div class="flex items-center space-x-3">
            <div 
              class="w-4 h-4 rounded-full"
              :style="{ backgroundColor: status.color }"
            ></div>
            <div>
              <span class="font-medium text-charcoal">{{ status.label }}</span>
              <span class="text-xs text-slate-light ml-2">({{ status.name }})</span>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-light">Orden: {{ status.order }}</span>
            <button
              v-if="!status.isDefault"
              @click="deleteStatus(status.id)"
              class="text-accent-red hover:bg-red-50 p-1 rounded transition-colors"
              title="Eliminar estado"
            >
              <PhTrash :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add new status form -->
    <div class="border-t pt-4">
      <h4 class="text-sm font-medium text-slate-dark mb-3">Agregar Nuevo Estado</h4>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-dark mb-1">
              Nombre del Estado
            </label>
            <input
              v-model="newStatus.name"
              type="text"
              placeholder="ej: SEGUIMIENTO"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label class="block text-xs font-medium text-slate-dark mb-1">
              Etiqueta
            </label>
            <input
              v-model="newStatus.label"
              type="text"
              placeholder="ej: Seguimiento"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-dark mb-1">
              Color
            </label>
            <div class="flex items-center space-x-2">
              <input
                v-model="newStatus.color"
                type="color"
                class="w-12 h-10 border border-slate-300 rounded cursor-pointer"
              />
              <input
                v-model="newStatus.color"
                type="text"
                placeholder="#3B82F6"
                class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-slate-dark mb-1">
              Orden
            </label>
            <input
              v-model.number="newStatus.order"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              required
            />
          </div>
        </div>

        <div class="flex items-center justify-between pt-4">
          <button
            type="button"
            @click="resetForm"
            class="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-accent-blue hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creando...' : 'Crear Estado' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PhTrash } from '@phosphor-icons/vue'
import { useStatusStore } from '../../stores/status'
import type { StatusDefinition } from '../../types'

const statusStore = useStatusStore()

const loading = computed(() => statusStore.loading)
const error = computed(() => statusStore.error)
const sortedStatuses = computed(() => statusStore.sortedStatuses)

const newStatus = ref({
  name: '',
  label: '',
  color: '#3B82F6',
  order: sortedStatuses.value.length + 1,
  isDefault: false
})

const resetForm = () => {
  newStatus.value = {
    name: '',
    label: '',
    color: '#3B82F6',
    order: sortedStatuses.value.length + 1,
    isDefault: false
  }
}

const handleSubmit = async () => {
  try {
    await statusStore.createStatus({
      name: newStatus.value.name.toUpperCase(),
      label: newStatus.value.label,
      color: newStatus.value.color,
      order: newStatus.value.order,
      isDefault: false
    })
    resetForm()
  } catch (err) {
    console.error('Error creating status:', err)
  }
}

const deleteStatus = async (statusId: string) => {
  if (confirm('¿Estás seguro de que quieres eliminar este estado?')) {
    try {
      await statusStore.deleteStatus(statusId)
    } catch (err) {
      console.error('Error deleting status:', err)
    }
  }
}

onMounted(() => {
  statusStore.fetchStatuses()
})
</script>