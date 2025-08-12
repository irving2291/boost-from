<template>
  <header class="bg-white border-b border-slate-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Search Bar -->
      <div class="flex-1 max-w-md">
        <div class="relative">
          <PhMagnifyingGlass 
            :size="20" 
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
          />
          <input
            type="text"
            placeholder="Buscar..."
            class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            v-model="searchQuery"
          />
        </div>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center space-x-4">
        <!-- Network Status -->
        <div class="flex items-center space-x-2">
          <div 
            :class="[
              'w-2 h-2 rounded-full',
              networkStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
            ]"
          />
          <span class="text-sm text-slate-600">
            {{ networkStatus.isOnline ? 'Conectado' : 'Desconectado' }}
          </span>
        </div>

        <!-- Notifications -->
        <button class="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
          <PhBell :size="20" />
          <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            3
          </span>
        </button>

        <!-- User Menu -->
        <div class="relative">
          <button 
            @click="toggleUserMenu"
            class="flex items-center space-x-2 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">U</span>
            </div>
            <PhCaretDown :size="16" />
          </button>

          <!-- User Dropdown -->
          <div 
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
          >
            <a href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
              Mi Perfil
            </a>
            <a href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
              Configuración
            </a>
            <hr class="my-1 border-slate-200">
            <a href="#" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
              Cerrar Sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PhMagnifyingGlass, PhBell, PhCaretDown } from '@phosphor-icons/vue'
import { useNetworkStore } from '../../stores/network'

const networkStore = useNetworkStore()
const searchQuery = ref('')
const showUserMenu = ref(false)

const networkStatus = computed(() => networkStore.networkStatus)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = (event: Event) => {
  if (!(event.target as Element).closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  networkStore.initializeNetworkListeners()
  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})
</script>