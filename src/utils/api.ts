// API Configuration
export const API_BASE_URL = 'https://boost.pitahayasoft.com'

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  }
} as const

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