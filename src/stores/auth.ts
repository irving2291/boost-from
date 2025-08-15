import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Router } from 'vue-router'
import { API_ENDPOINTS, decodeJWT, isTokenExpired, getTokenExpirationTime } from '../utils/api'

export interface User {
  sub: string
  email: string
  name: string
  org_id: string
  roles?: string[]
  permissions?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const tokenType = ref<string>('bearer')
  const expiresIn = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const refreshTimer = ref<number | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    if (!token.value) return false
    return !isTokenExpired(token.value)
  })

  const authHeader = computed(() => {
    if (!token.value) return null
    return `${tokenType.value} ${token.value}`
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
  const extractUserFromToken = (accessToken: string): User | null => {
    const decoded = decodeJWT(accessToken)
    if (!decoded) return null

    return {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      org_id: decoded.org_id,
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    }
  }

  const setTokenData = (response: LoginResponse) => {
    token.value = response.access_token
    tokenType.value = response.token_type
    expiresIn.value = response.expires_in
    user.value = extractUserFromToken(response.access_token)

    // Store in localStorage
    localStorage.setItem('auth_token', response.access_token)
    localStorage.setItem('auth_token_type', response.token_type)
    localStorage.setItem('auth_expires_in', response.expires_in.toString())
    if (user.value) {
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }

    // Setup auto refresh
    setupTokenRefresh()
  }

  const clearTokenData = () => {
    user.value = null
    token.value = null
    tokenType.value = 'bearer'
    expiresIn.value = null
    error.value = null

    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_token_type')
    localStorage.removeItem('auth_expires_in')
    localStorage.removeItem('auth_user')

    // Clear organization data
    localStorage.removeItem('current_organization')

    // Clear refresh timer
    if (refreshTimer.value) {
      clearTimeout(refreshTimer.value)
      refreshTimer.value = null
    }
  }

  const setupTokenRefresh = () => {
    if (!token.value || !expiresIn.value) return

    // Clear existing timer
    if (refreshTimer.value) {
      clearTimeout(refreshTimer.value)
    }

    // Only refresh if there's more than 1 day (86400 seconds) until expiration
    const oneDayInSeconds = 86400
    const timeUntilExpiration = expiresIn.value
    
    if (timeUntilExpiration <= oneDayInSeconds) {
      // If there's 1 day or less, refresh token 5 minutes before expiration
      const refreshTime = (expiresIn.value - 300) * 1000 // Convert to milliseconds and subtract 5 minutes
      
      if (refreshTime > 0) {
        refreshTimer.value = setTimeout(async () => {
          try {
            await refreshToken()
          } catch (error) {
            console.error('Auto refresh failed:', error)
            await logout()
          }
        }, refreshTime)
      }
    } else {
      // If there's more than 1 day, set timer to check again when 1 day remains
      const timeUntilOneDayLeft = (timeUntilExpiration - oneDayInSeconds) * 1000
      
      refreshTimer.value = setTimeout(() => {
        setupTokenRefresh() // Re-evaluate when 1 day remains
      }, timeUntilOneDayLeft)
    }
  }

  // Actions
  const login = async (credentials: LoginCredentials): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Error en el login')
      }

      const data: LoginResponse = await response.json()
      setTokenData(data)

      // Load organization data after successful login
      await loadOrganizationData()

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshToken = async (): Promise<void> => {
    if (!token.value) {
      throw new Error('No token available for refresh')
    }

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader.value || '',
        },
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data: LoginResponse = await response.json()
      setTokenData(data)

    } catch (err) {
      console.error('Token refresh failed:', err)
      // If refresh fails, logout user
      await logout()
      throw err
    }
  }

  const logout = async (router?: Router): Promise<void> => {
    try {
      // Call logout API if token exists
      if (token.value) {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader.value || '',
          },
        }).catch(() => {
          // Ignore logout API errors, still clear local data
          console.warn('Logout API call failed, but clearing local session')
        })
      }
    } finally {
      // Always clear local data regardless of API call result
      clearTokenData()
      
      // Redirect to login page if router is provided
      if (router) {
        router.push('/login')
      }
    }
  }

  const initializeAuth = async () => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('auth_token')
    const storedTokenType = localStorage.getItem('auth_token_type')
    const storedExpiresIn = localStorage.getItem('auth_expires_in')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedTokenType && storedExpiresIn && storedUser) {
      try {
        // Check if token is still valid
        if (!isTokenExpired(storedToken)) {
          token.value = storedToken
          tokenType.value = storedTokenType
          expiresIn.value = parseInt(storedExpiresIn)
          user.value = JSON.parse(storedUser)
          
          // Setup auto refresh
          setupTokenRefresh()
          
          // Load organization data
          await loadOrganizationData()
        } else {
          // Token expired, clear data
          clearTokenData()
        }
      } catch (err) {
        // If parsing fails, clear invalid data
        console.error('Error initializing auth:', err)
        clearTokenData()
      }
    }
  }

  const checkTokenExpiration = (router?: Router) => {
    if (token.value && isTokenExpired(token.value)) {
      logout(router)
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
      await organizationsStore.loadCurrentOrganizationFromToken()
    } catch (err) {
      console.error('Error loading organization data:', err)
    }
  }

  // Setup periodic token expiration check
  setInterval(checkTokenExpiration, 60000) // Check every minute

  return {
    // State
    user,
    token,
    tokenType,
    expiresIn,
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
    refreshToken,
    logout,
    initializeAuth,
    checkTokenExpiration,
    clearError
  }
})