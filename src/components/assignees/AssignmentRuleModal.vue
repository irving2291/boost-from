<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-900">
          {{ isEditing ? 'Editar Regla de Asignación' : 'Nueva Regla de Asignación' }}
        </h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="saveRule" class="space-y-6">
        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Regla *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Distribución Equitativa"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prioridad *
            </label>
            <input
              v-model.number="form.priority"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
            <p class="text-xs text-gray-500 mt-1">Menor número = mayor prioridad</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe el propósito de esta regla..."
          ></textarea>
        </div>

        <!-- Assignment Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Asignación *
          </label>
          <select
            v-model="form.assignmentType"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tipo...</option>
            <option value="round_robin">Rotación (Round Robin)</option>
            <option value="load_balanced">Balanceado por Carga</option>
            <option value="skill_based">Basado en Habilidades</option>
            <option value="manual">Manual</option>
            <option value="random">Aleatorio</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">{{ getAssignmentTypeDescription(form.assignmentType) }}</p>
        </div>

        <!-- Assignees Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Responsables *
          </label>
          <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
            <div
              v-for="assignee in availableAssignees"
              :key="assignee.id"
              class="flex items-center"
            >
              <input
                :id="`assignee-${assignee.id}`"
                v-model="form.assigneeIds"
                :value="assignee.id"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                :for="`assignee-${assignee.id}`"
                class="ml-2 text-sm text-gray-700 cursor-pointer flex items-center"
              >
                <div class="flex-shrink-0 h-6 w-6 mr-2">
                  <div class="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-xs font-medium text-gray-700">
                      {{ assignee.firstName.charAt(0) }}{{ assignee.lastName.charAt(0) }}
                    </span>
                  </div>
                </div>
                {{ assignee.firstName }} {{ assignee.lastName }}
                <span class="text-xs text-gray-500 ml-1">({{ assignee.role }})</span>
              </label>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-1">Selecciona los responsables que participarán en esta regla</p>
        </div>

        <!-- Conditions -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <label class="block text-sm font-medium text-gray-700">
              Condiciones
            </label>
            <button
              type="button"
              @click="addCondition"
              class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              + Agregar Condición
            </button>
          </div>

          <div v-if="form.conditions.length === 0" class="text-sm text-gray-500 italic">
            Sin condiciones - la regla se aplicará a todas las peticiones
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(condition, index) in form.conditions"
              :key="index"
              class="flex items-center space-x-3 p-3 border border-gray-200 rounded-md"
            >
              <select
                v-model="condition.field"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Campo...</option>
                <option value="programInterestId">Programa de Interés</option>
                <option value="leadOriginId">Origen del Lead</option>
                <option value="city">Ciudad</option>
                <option value="firstName">Nombre</option>
                <option value="lastName">Apellido</option>
                <option value="email">Email</option>
                <option value="phone">Teléfono</option>
                <option value="status">Estado</option>
                <option value="amount">Monto</option>
                <option value="required_skills">Habilidades Requeridas</option>
              </select>

              <select
                v-model="condition.operator"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Operador...</option>
                <option value="equals">Igual a</option>
                <option value="not_equals">Diferente de</option>
                <option value="contains">Contiene</option>
                <option value="not_contains">No contiene</option>
                <option value="greater_than">Mayor que</option>
                <option value="less_than">Menor que</option>
                <option value="greater_equal">Mayor o igual</option>
                <option value="less_equal">Menor o igual</option>
                <option value="in">En lista</option>
                <option value="not_in">No en lista</option>
              </select>

              <input
                v-model="condition.value"
                type="text"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Valor..."
              />

              <button
                type="button"
                @click="removeCondition(index)"
                class="p-2 text-red-600 hover:text-red-800"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Active Status -->
        <div class="flex items-center">
          <input
            v-model="form.active"
            type="checkbox"
            id="active"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="active" class="ml-2 text-sm text-gray-700">
            Regla activa
          </label>
          <p class="text-xs text-gray-500 ml-2">Solo las reglas activas se aplicarán automáticamente</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="!isFormValid || loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEditing ? 'Actualizar' : 'Crear' }} Regla
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AssignmentRule, AssignmentCondition, Assignee } from '../../types'

interface Props {
  isOpen: boolean
  rule?: AssignmentRule | null
  availableAssignees: Assignee[]
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', rule: Omit<AssignmentRule, 'id' | 'createdAt' | 'updatedAt'>): void
}

const props = withDefaults(defineProps<Props>(), {
  rule: null,
  loading: false
})

const emit = defineEmits<Emits>()

// Form data
const form = ref({
  name: '',
  description: '',
  active: true,
  priority: 1,
  conditions: [] as AssignmentCondition[],
  assignmentType: '' as AssignmentRule['assignmentType'] | '',
  assigneeIds: [] as string[]
})

// Computed
const isEditing = computed(() => !!props.rule)

const isFormValid = computed(() => {
  return form.value.name.trim() !== '' &&
         form.value.assignmentType !== '' &&
         form.value.assigneeIds.length > 0 &&
         form.value.priority > 0
})

// Methods
const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    active: true,
    priority: 1,
    conditions: [],
    assignmentType: '',
    assigneeIds: []
  }
}

const loadRule = (rule: AssignmentRule) => {
  form.value = {
    name: rule.name,
    description: rule.description || '',
    active: rule.active,
    priority: rule.priority,
    conditions: [...rule.conditions],
    assignmentType: rule.assignmentType,
    assigneeIds: [...rule.assigneeIds]
  }
}

const addCondition = () => {
  form.value.conditions.push({
    field: 'programInterestId',
    operator: 'equals',
    value: ''
  })
}

const removeCondition = (index: number) => {
  form.value.conditions.splice(index, 1)
}

const getAssignmentTypeDescription = (type: string) => {
  const descriptions = {
    'round_robin': 'Asigna peticiones de forma rotativa entre los responsables',
    'load_balanced': 'Asigna a quien tenga menos peticiones activas',
    'skill_based': 'Asigna basado en habilidades y departamento',
    'manual': 'Asigna siempre al primer responsable de la lista',
    'random': 'Asigna de forma aleatoria'
  }
  return descriptions[type as keyof typeof descriptions] || ''
}

const saveRule = () => {
  if (!isFormValid.value) return

  const ruleData = {
    name: form.value.name.trim(),
    description: form.value.description?.trim() || null,
    active: form.value.active,
    priority: form.value.priority,
    conditions: form.value.conditions.filter(c => c.field && c.operator && c.value),
    assignmentType: form.value.assignmentType as AssignmentRule['assignmentType'],
    assigneeIds: form.value.assigneeIds
  }

  emit('save', ruleData)
}

const closeModal = () => {
  emit('close')
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.rule) {
      loadRule(props.rule)
    } else {
      resetForm()
    }
  }
})

watch(() => props.rule, (rule) => {
  if (rule && props.isOpen) {
    loadRule(rule)
  }
})
</script>