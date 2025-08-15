// API Configuration
export const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'https://boost.pitahayasoft.com/api/v1'

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
export const createAuthHeaders = (token?: string) => {
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