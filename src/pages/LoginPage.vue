<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <PhLock :size="24" class="text-blue-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-bold text-slate-900">
          Iniciar Sesión
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600">
          Accede a tu cuenta del CRM
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700">
              Correo Electrónico
            </label>
            <div class="mt-1 relative">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': emailError }"
                placeholder="tu@email.com"
                @blur="validateEmail"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <PhEnvelope :size="20" class="text-slate-400" />
              </div>
            </div>
            <p v-if="emailError" class="mt-1 text-sm text-red-600">
              {{ emailError }}
            </p>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': passwordError }"
                placeholder="Tu contraseña"
                @blur="validatePassword"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <PhEye v-if="!showPassword" :size="20" class="text-slate-400 hover:text-slate-600" />
                <PhEyeSlash v-else :size="20" class="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">
              {{ passwordError }}
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <PhWarningCircle :size="20" class="text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Error de autenticación
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ authStore.error }}
              </div>
            </div>
            <div class="ml-auto pl-3">
              <div class="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  class="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                  @click="authStore.clearError"
                >
                  <PhX :size="16" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!authStore.loading" class="flex items-center">
              <PhSignIn :size="20" class="mr-2" />
              Iniciar Sesión
            </span>
            <span v-else class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Iniciando sesión...
            </span>
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-slate-600">
            ¿Problemas para acceder? 
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              Contacta al administrador
            </a>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  PhLock, 
  PhEnvelope, 
  PhEye, 
  PhEyeSlash, 
  PhSignIn, 
  PhWarningCircle, 
  PhX 
} from '@phosphor-icons/vue'
import { useAuthStore } from '../stores/auth'
import type { LoginCredentials } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = ref<LoginCredentials>({
  email: '',
  password: ''
})

const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')

// Validation
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email) {
    emailError.value = 'El correo electrónico es requerido'
  } else if (!emailRegex.test(form.value.email)) {
    emailError.value = 'Ingresa un correo electrónico válido'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!form.value.password) {
    passwordError.value = 'La contraseña es requerida'
  } else if (form.value.password.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
  } else {
    passwordError.value = ''
  }
}

const isFormValid = computed(() => {
  return form.value.email && 
         form.value.password && 
         !emailError.value && 
         !passwordError.value
})

// Form submission
const handleSubmit = async () => {
  // Clear previous errors
  authStore.clearError()
  
  // Validate form
  validateEmail()
  validatePassword()
  
  if (!isFormValid.value) {
    return
  }

  try {
    await authStore.login(form.value)
    
    // Check if there's a saved redirect URL
    const redirectUrl = localStorage.getItem('auth_redirect_url')
    if (redirectUrl) {
      localStorage.removeItem('auth_redirect_url')
      router.push(redirectUrl)
    } else {
      // Redirect to dashboard on successful login
      router.push('/dashboard')
    }
  } catch (error) {
    // Error is handled by the store
    console.error('Login failed:', error)
  }
}
</script>