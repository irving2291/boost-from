<template>
  <header class="bg-white border-b border-slate-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Sidebar Toggle Button (visible on smaller screens) -->
      <button
        @click="sidebarStore.toggle"
        class="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 md:hidden mr-4"
        :title="sidebarStore.isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'"
      >
        <PhList :size="20" />
      </button>

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
              <span class="text-white text-sm font-medium">
                {{ userInitials }}
              </span>
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-medium text-slate-900">{{ authStore.user?.name || 'Usuario' }}</p>
              <p class="text-xs text-slate-500">{{ authStore.user?.email }}</p>
            </div>
            <PhCaretDown :size="16" />
          </button>

          <!-- User Dropdown -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-[100]"
          >
            <div class="px-4 py-2 border-b border-slate-200">
              <p class="text-sm font-medium text-slate-900">{{ authStore.user?.name || 'Usuario' }}</p>
              <p class="text-xs text-slate-500">{{ authStore.user?.email }}</p>
            </div>
            <router-link
              to="/settings"
              class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              @click="showUserMenu = false"
            >
              <div class="flex items-center space-x-2">
                <PhUser :size="16" />
                <span>Mi Perfil</span>
              </div>
            </router-link>
            <router-link
              to="/settings"
              class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              @click="showUserMenu = false"
            >
              <div class="flex items-center space-x-2">
                <PhGear :size="16" />
                <span>Configuración</span>
              </div>
            </router-link>
            <hr class="my-1 border-slate-200">
            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
            >
              <PhSignOut :size="16" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhMagnifyingGlass,
  PhBell,
  PhCaretDown,
  PhUser,
  PhGear,
  PhSignOut,
  PhList
} from '@phosphor-icons/vue'
import { useNetworkStore } from '../../stores/network'
import { useAuthStore } from '../../stores/auth'
import { useSidebarStore } from '../../stores/sidebar'

const router = useRouter()
const networkStore = useNetworkStore()
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()
const searchQuery = ref('')
const showUserMenu = ref(false)

const networkStatus = computed(() => networkStore.networkStatus)

const userInitials = computed(() => {
  if (authStore.user?.name) {
    return authStore.user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return authStore.user?.email?.charAt(0).toUpperCase() || 'U'
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = (event: Event) => {
  if (!(event.target as Element).closest('.relative')) {
    showUserMenu.value = false
  }
}

const handleLogout = async () => {
  showUserMenu.value = false
  await authStore.logout(router)
}

onMounted(() => {
  networkStore.initializeNetworkListeners()
  document.addEventListener('click', closeUserMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenu)
})
</script>