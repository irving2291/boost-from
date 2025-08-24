// Test script to verify token expiration detection
import { isTokenExpired, decodeJWT } from './utils/api.js'

// Create a test expired token (expired 1 hour ago)
const createExpiredToken = () => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: 'test-user',
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
  }
  
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  
  return `${encodedHeader}.${encodedPayload}.fake-signature`
}

// Create a test valid token (expires in 1 hour)
const createValidToken = () => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: 'test-user',
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
  }
  
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  
  return `${encodedHeader}.${encodedPayload}.fake-signature`
}

// Test token expiration detection
console.log('Testing token expiration detection...')

const expiredToken = createExpiredToken()
const validToken = createValidToken()

console.log('Expired token test:', isTokenExpired(expiredToken)) // Should be true
console.log('Valid token test:', isTokenExpired(validToken))     // Should be false

console.log('Decoded expired token:', decodeJWT(expiredToken))
console.log('Decoded valid token:', decodeJWT(validToken))

console.log('Token expiration tests completed!')