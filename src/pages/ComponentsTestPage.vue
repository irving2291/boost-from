<template>
  <div class="p-6 space-y-8 min-h-screen">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Componentes Core - Pruebas
      </h1>

      <!-- Buttons Section -->
      <Card class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">Botones</h2>
        </template>
        
        <div class="space-y-4">
          <!-- Button Types -->
          <div>
            <h3 class="text-lg font-medium mb-3">Tipos de Botones</h3>
            <div class="flex flex-wrap gap-3">
              <Button type="primary">Primario</Button>
              <Button type="secondary">Secundario</Button>
              <Button type="success">Éxito</Button>
              <Button type="danger">Peligro</Button>
              <Button type="warning">Advertencia</Button>
              <Button type="info">Información</Button>
              <Button type="light">Claro</Button>
              <Button type="dark">Oscuro</Button>
            </div>
          </div>

          <!-- Button Sizes -->
          <div>
            <h3 class="text-lg font-medium mb-3">Tamaños</h3>
            <div class="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra Pequeño</Button>
              <Button size="sm">Pequeño</Button>
              <Button size="md">Mediano</Button>
              <Button size="lg">Grande</Button>
              <Button size="xl">Extra Grande</Button>
            </div>
          </div>

          <!-- Button States -->
          <div>
            <h3 class="text-lg font-medium mb-3">Estados</h3>
            <div class="flex flex-wrap gap-3">
              <Button type="primary">Normal</Button>
              <Button type="primary" :busy="true">Cargando</Button>
              <Button type="primary" :disabled="true">Deshabilitado</Button>
              <Button type="primary" outline>Outline</Button>
              <Button type="primary" block>Bloque Completo</Button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Group Buttons Section -->
      <Card class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">Grupo de Botones</h2>
        </template>
        
        <div class="space-y-4">
          <div>
            <h3 class="text-lg font-medium mb-3">Horizontal</h3>
            <GroupButton
              v-model="selectedOption"
              :buttons="groupButtonOptions"
              @change="handleGroupButtonChange"
            />
          </div>

          <div>
            <h3 class="text-lg font-medium mb-3">Vertical</h3>
            <GroupButton
              v-model="selectedVerticalOption"
              :buttons="groupButtonOptions"
              vertical
              @change="handleGroupButtonChange"
            />
          </div>

          <div>
            <h3 class="text-lg font-medium mb-3">Múltiple Selección</h3>
            <GroupButton
              v-model="selectedMultipleOptions"
              :buttons="groupButtonOptions"
              multiple
              @change="handleGroupButtonChange"
            />
          </div>
        </div>
      </Card>

      <!-- Inputs Section -->
      <Card class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">Inputs</h2>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            v-model="textInput"
            label="Texto"
            placeholder="Ingresa texto aquí"
            help-text="Este es un texto de ayuda"
          />
          
          <Input
            v-model="emailInput"
            type="email"
            label="Email"
            placeholder="correo@ejemplo.com"
            required
          />
          
          <Input
            v-model="passwordInput"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
          />
          
          <Input
            v-model="numberInput"
            type="number"
            label="Número"
            placeholder="123"
          />
          
          <Input
            v-model="errorInput"
            label="Con Error"
            placeholder="Campo con error"
            error="Este campo tiene un error"
          />
          
          <Input
            v-model="disabledInput"
            label="Deshabilitado"
            placeholder="Campo deshabilitado"
            disabled
          />
          
          <Input
            v-model="clearableInput"
            label="Con Botón Limpiar"
            placeholder="Texto que se puede limpiar"
            show-clear-button
          />
        </div>
      </Card>

      <!-- Dropdown Section -->
      <Card class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">Dropdowns</h2>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium mb-2">Dropdown Simple</label>
            <Dropdown
              v-model="selectedDropdownValue"
              :items="dropdownItems"
              placeholder="Selecciona una opción"
              @change="handleDropdownChange"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Dropdown con Búsqueda</label>
            <Dropdown
              v-model="selectedSearchableValue"
              :items="dropdownItems"
              placeholder="Buscar y seleccionar"
              searchable
              @change="handleDropdownChange"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Selección Múltiple</label>
            <Dropdown
              v-model="selectedMultipleValues"
              :items="dropdownItems"
              placeholder="Selecciona múltiples opciones"
              multiple
              @change="handleDropdownChange"
            />
          </div>
        </div>
      </Card>

      <!-- List View Section -->
      <Card class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">Lista de Elementos</h2>
        </template>
        
        <ListView
          :items="listItems"
          :loading="listLoading"
          @item-click="handleItemClick"
          @item-action="handleItemAction"
        />
      </Card>

      <!-- Modal Section -->
      <Card class="mb-8">
        <template #header>
          <h2 class="text-xl font-semibold">Modales</h2>
        </template>
        
        <div class="flex flex-wrap gap-3">
          <Button @click="showSimpleModal = true">Modal Simple</Button>
          <Button @click="showLargeModal = true">Modal Grande</Button>
          <Button @click="showConfirmModal = true">Modal de Confirmación</Button>
        </div>
      </Card>
    </div>

    <!-- Modals -->
    <Modal
      v-model:is-open="showSimpleModal"
      title="Modal Simple"
      size="md"
    >
      <p class="text-gray-600 dark:text-gray-400">
        Este es un modal simple con contenido básico. Puedes cerrarlo haciendo clic en el botón X o presionando Escape.
      </p>
    </Modal>

    <Modal
      v-model:is-open="showLargeModal"
      title="Modal Grande"
      size="lg"
      :show-footer="true"
    >
      <div class="space-y-4">
        <p class="text-gray-600 dark:text-gray-400">
          Este es un modal más grande con más contenido y botones en el footer.
        </p>
        <Input
          v-model="modalInput"
          label="Campo en Modal"
          placeholder="Escribe algo aquí"
        />
      </div>
      
      <template #footer>
        <Button type="secondary" @click="showLargeModal = false">
          Cancelar
        </Button>
        <Button type="primary" @click="showLargeModal = false">
          Guardar
        </Button>
      </template>
    </Modal>

    <Modal
      v-model:is-open="showConfirmModal"
      title="Confirmar Acción"
      size="sm"
      :show-footer="true"
      :show-cancel-button="true"
      :show-confirm-button="true"
      confirm-text="Confirmar"
      cancel-text="Cancelar"
      confirm-button-type="danger"
      @confirm="handleConfirm"
      @cancel="showConfirmModal = false"
    >
      <p class="text-gray-600 dark:text-gray-400">
        ¿Estás seguro de que quieres realizar esta acción? Esta acción no se puede deshacer.
      </p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button, Modal, Card, Input, Dropdown, ListView, GroupButton, Switch } from '../core'
import type { DropdownItem, ListItem } from '../core/types'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

// Switch Data
const switchStates = ref({
  small: false,
  medium: true,
  large: false,
  blue: true,
  green: false,
  purple: true,
  red: false,
  yellow: false,
  enabled: true,
  disabled: true,
  darkMode: themeStore.isDark
})

// Button Group Data
const selectedOption = ref('option1')
const selectedVerticalOption = ref('option2')
const selectedMultipleOptions = ref(['option1', 'option3'])

const groupButtonOptions = [
  { label: 'Opción 1', value: 'option1' },
  { label: 'Opción 2', value: 'option2' },
  { label: 'Opción 3', value: 'option3' },
  { label: 'Opción 4', value: 'option4' }
]

// Input Data
const textInput = ref('')
const emailInput = ref('')
const passwordInput = ref('')
const numberInput = ref('')
const errorInput = ref('')
const disabledInput = ref('Valor deshabilitado')
const clearableInput = ref('')

// Dropdown Data
const selectedDropdownValue = ref('')
const selectedSearchableValue = ref('')
const selectedMultipleValues = ref([])

const dropdownItems: DropdownItem[] = [
  { label: 'Opción 1', value: 'option1' },
  { label: 'Opción 2', value: 'option2' },
  { label: 'Opción 3', value: 'option3' },
  { label: 'Opción 4', value: 'option4' },
  { label: 'Opción 5', value: 'option5' }
]

// List Data
const listLoading = ref(false)
const listItems: ListItem[] = [
  {
    id: 1,
    title: 'Juan Pérez',
    subtitle: 'juan@ejemplo.com',
    description: 'Cliente desde hace 2 años',
    badge: 'VIP',
    actions: [
      { label: 'Editar', action: () => console.log('Editar') },
      { label: 'Eliminar', action: () => console.log('Eliminar') }
    ]
  },
  {
    id: 2,
    title: 'María García',
    subtitle: 'maria@ejemplo.com',
    description: 'Nueva cliente',
    actions: [
      { label: 'Contactar', action: () => console.log('Contactar') }
    ]
  },
  {
    id: 3,
    title: 'Carlos López',
    subtitle: 'carlos@ejemplo.com',
    description: 'Cliente frecuente',
    badge: 'Premium'
  }
]

// Modal Data
const showSimpleModal = ref(false)
const showLargeModal = ref(false)
const showConfirmModal = ref(false)
const modalInput = ref('')

// Event Handlers
const handleGroupButtonChange = (value: any) => {
  console.log('Group button changed:', value)
}

const handleDropdownChange = (value: any) => {
  console.log('Dropdown changed:', value)
}

const handleItemClick = (item: ListItem) => {
  console.log('Item clicked:', item)
}

const handleItemAction = (action: string, item: ListItem) => {
  console.log('Item action:', action, item)
}

const handleDarkModeToggle = (isDark: boolean) => {
  console.log('Dark mode toggled:', isDark)
  themeStore.setTheme(isDark ? 'dark' : 'light')
}

const handleConfirm = () => {
  console.log('Confirmed!')
  showConfirmModal.value = false
}
</script>