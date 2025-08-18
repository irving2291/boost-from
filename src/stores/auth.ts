import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Router } from 'vue-router'
import { supabase } from '../utils/supabase'
import type { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name?: string
  org_id?: string
  roles?: string[]
  permissions?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    return !!session.value && !!user.value
  })

  const authHeader = computed(() => {
    if (!session.value?.access_token) return null
    return `Bearer ${session.value.access_token}`
  })

  const hasRole = computed(() => (role: string) => {
    return user.value?.roles?.includes(role) || false
  })

  const hasPermission = computed(() => (permission: string) => {
    return user.value?.permissions?.includes(permission) || false
  })

  const hasAnyRole = computed(() => (roles: string[]) => {
    if (!user.value?.roles) return false
    return roles.some(role => user.value?.roles?.includes(role))
  })

  const hasAnyPermission = computed(() => (permissions: string[]) => {
    if (!user.value?.permissions) return false
    return permissions.some(permission => user.value?.permissions?.includes(permission))
  })

  const isAdmin = computed(() => {
    return hasRole.value('admin') || hasRole.value('super-admin')
  })

  // Private methods
  const setUserData = (supabaseUser: SupabaseUser, supabaseSession: Session) => {
    session.value = supabaseSession
    user.value = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email,
      org_id: supabaseUser.user_metadata?.org_id,
      roles: supabaseUser.user_metadata?.roles || [],
      permissions: supabaseUser.user_metadata?.permissions || []
    }

    // Store in localStorage for persistence
    localStorage.setItem('supabase_session', JSON.stringify(supabaseSession))
    localStorage.setItem('auth_user', JSON.stringify(user.value))
  }

  const clearUserData = () => {
    user.value = null
    session.value = null
    error.value = null

    // Clear localStorage
    localStorage.removeItem('supabase_session')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('current_organization')
  }

  // Actions
  const login = async (credentials: LoginCredentials): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      if (!data.user || !data.session) {
        throw new Error('Error en el login: datos de usuario no válidos')
      }

      setUserData(data.user, data.session)

      // Load organization data after successful login
      await loadOrganizationData()

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async (router?: Router): Promise<void> => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
    } finally {
      // Always clear local data regardless of API call result
      clearUserData()
      
      // Redirect to login page if router is provided
      if (router) {
        router.push('/login')
      }
    }
  }

  const initializeAuth = async () => {
    try {
      // Get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        clearUserData()
        return
      }

      if (session && session.user) {
        setUserData(session.user, session)
        await loadOrganizationData()
      } else {
        // Try to restore from localStorage as fallback
        const storedSession = localStorage.getItem('supabase_session')
        const storedUser = localStorage.getItem('auth_user')

        if (storedSession && storedUser) {
          try {
            const parsedSession = JSON.parse(storedSession)
            const parsedUser = JSON.parse(storedUser)
            
            // Verify session is still valid
            if (parsedSession.expires_at && new Date(parsedSession.expires_at * 1000) > new Date()) {
              session.value = parsedSession
              user.value = parsedUser
              await loadOrganizationData()
            } else {
              clearUserData()
            }
          } catch (err) {
            console.error('Error parsing stored session:', err)
            clearUserData()
          }
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err)
      clearUserData()
    }
  }

  const clearError = () => {
    error.value = null
  }

  const loadOrganizationData = async () => {
    if (!user.value?.org_id) return
    
    try {
      // Dynamically import to avoid circular dependency
      const { useOrganizationsStore } = await import('./organizations')
      const organizationsStore = useOrganizationsStore()
      // Note: This method might need to be adapted for Supabase
      // await organizationsStore.loadCurrentOrganizationFromToken()
    } catch (err) {
      console.error('Error loading organization data:', err)
    }
  }

  // Setup Supabase auth state listener
  supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, supabaseSession: Session | null) => {
    if (event === 'SIGNED_IN' && supabaseSession?.user) {
      setUserData(supabaseSession.user, supabaseSession)
    } else if (event === 'SIGNED_OUT') {
      clearUserData()
    } else if (event === 'TOKEN_REFRESHED' && supabaseSession?.user) {
      setUserData(supabaseSession.user, supabaseSession)
    }
  })

  return {
    // State
    user,
    session,
    loading,
    error,
    // Getters
    isAuthenticated,
    authHeader,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    isAdmin,
    // Actions
    login,
    logout,
    initializeAuth,
    clearError
  }
})