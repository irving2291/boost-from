// API Configuration
export const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'https://api.boost.pitahayasoft.com/v1'

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  ORGANIZATIONS: {
    LIST: `${API_BASE_URL}/auth/organizations`,
  },
  CRM: {
    REQUESTS: `${API_BASE_URL}/crm/requests-information`,
    REQUESTS_STATUS: `${API_BASE_URL}/crm/requests-information/status`,
    REQUESTS_SUMMARY: `${API_BASE_URL}/crm/requests-information/summary`,
    QUOTATIONS: `${API_BASE_URL}/crm/quotations`,
    // New endpoints from backend
    ASSIGNEES: `${API_BASE_URL}/crm/assignees`,
    ACCOUNTS: `${API_BASE_URL}/crm/accounts`,
    ACTIVATIONS: `${API_BASE_URL}/crm/activations`,
    LANDING_PAGES: `${API_BASE_URL}/crm/landing-pages`,
    PUBLIC_LANDING_PAGES: `${API_BASE_URL}/landing-pages`,
  },
  // RBAC endpoints aligned with Bouncer-style routes
  RBAC: {
    // CRUD
    ROLES: `${API_BASE_URL}/auth/roles`,
    ABILITIES: `${API_BASE_URL}/auth/abilities`,

    // Assignments
    ASSIGN: {
      // Users ↔ Roles
      userRole: (userId: string | number, roleId: string | number) =>
        `${API_BASE_URL}/auth/users/${userId}/roles/${roleId}`,

      // Roles ↔ Abilities
      roleAbility: (roleId: string | number, abilityId: string | number) =>
        `${API_BASE_URL}/auth/roles/${roleId}/abilities/${abilityId}`,

      // Users ↔ Abilities
      userAbility: (userId: string | number, abilityId: string | number) =>
        `${API_BASE_URL}/auth/users/${userId}/abilities/${abilityId}`,
    },

    // Helpers
    GRANTS: {
      user: (userId: string | number) => `${API_BASE_URL}/auth/users/${userId}/grants`,
      role: (roleId: string | number) => `${API_BASE_URL}/auth/roles/${roleId}/grants`,
    },
  },
} as const

// API Helper functions
export const createAuthHeaders = (token?: string, organizationId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
  }
  return response
}

// API Interceptor for automatic token expiration handling
export const createApiClient = () => {
  const originalFetch = window.fetch

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await originalFetch(input, init)
    
    // Check if response is 401 (Unauthorized) and we have an auth header
    if (response.status === 401 && init?.headers) {
      const headers = init.headers as Record<string, string>
      const authHeader = headers['Authorization'] || headers['authorization']
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Token expired or invalid, trigger logout
        await handleTokenExpiration()
      }
    }
    
    return response
  }
}

// Handle token expiration
const handleTokenExpiration = async () => {
  try {
    // Dynamically import to avoid circular dependency
    const { useAuthStore } = await import('../stores/auth')
    const authStore = useAuthStore()
    
    // Get router instance
    const router = await import('../router').then(m => m.default)
    
    // Force logout with reason
    await authStore.forceLogout(router, 'Token expirado por respuesta 401 del servidor')
    
    // Optional: Show a toast notification if you have a notification system
    // You can uncomment and modify this if you have a notification store
    // const { useNotificationStore } = await import('../stores/notifications')
    // const notificationStore = useNotificationStore()
    // notificationStore.showWarning('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
    
  } catch (error) {
    console.error('Error handling token expiration:', error)
    // Fallback: redirect to login page
    window.location.href = '/login'
  }
}

// Initialize API interceptor
export const initializeApiInterceptor = () => {
  createApiClient()
}

// JWT Token utilities
export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

export const getTokenExpirationTime = (token: string): number | null => {
  const decoded = decodeJWT(token)
  return decoded?.exp ? decoded.exp * 1000 : null
}