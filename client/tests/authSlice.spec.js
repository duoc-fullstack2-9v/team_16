import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import authReducer, { 
  loginUser, 
  logoutUser, 
  clearError, 
  checkAuthToken 
} from '../src/store/slices/authSlice'
import api from '../src/services/api'

// Mock del módulo api
vi.mock('../src/services/api')

describe('authSlice', () => {
  let store

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear()
    
    // Crear store con el reducer
    store = configureStore({
      reducer: {
        auth: authReducer
      }
    })

    // Limpiar mocks
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('debe tener el estado inicial correcto', () => {
      const state = store.getState().auth
      
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('Reducer clearError', () => {
    it('debe limpiar el error del estado', () => {
      // Primero establecer un error manualmente
      store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: 'Error de prueba'
          }
        }
      })

      store.dispatch(clearError())
      const state = store.getState().auth
      
      expect(state.error).toBeNull()
    })
  })

  describe('Reducer checkAuthToken', () => {
    it('debe autenticar el usuario si hay token y user en localStorage', () => {
      const mockUser = {
        id: 1,
        nombre: 'Juan',
        apellidos: 'Pérez',
        rol: 'admin'
      }

      localStorage.setItem('bomberosToken', 'valid-token-123')
      localStorage.setItem('bomberosUser', JSON.stringify(mockUser))

      store.dispatch(checkAuthToken())
      const state = store.getState().auth

      expect(state.isAuthenticated).toBe(true)
      expect(state.token).toBe('valid-token-123')
      expect(state.user).toEqual(mockUser)
    })

    it('debe limpiar el estado si no hay token en localStorage', () => {
      store.dispatch(checkAuthToken())
      const state = store.getState().auth

      expect(state.isAuthenticated).toBe(false)
      expect(state.token).toBeNull()
      expect(state.user).toBeNull()
    })

    it('debe limpiar localStorage si el JSON del user es inválido', () => {
      localStorage.setItem('bomberosToken', 'token-123')
      localStorage.setItem('bomberosUser', 'invalid-json{')

      store.dispatch(checkAuthToken())
      const state = store.getState().auth

      expect(state.isAuthenticated).toBe(false)
      expect(state.token).toBeNull()
      expect(state.user).toBeNull()
      expect(localStorage.getItem('bomberosToken')).toBeNull()
      expect(localStorage.getItem('bomberosUser')).toBeNull()
    })

    it('debe limpiar el estado si solo hay token pero no user', () => {
      localStorage.setItem('bomberosToken', 'token-123')
      // No hay bomberosUser

      store.dispatch(checkAuthToken())
      const state = store.getState().auth

      expect(state.isAuthenticated).toBe(false)
      expect(state.token).toBeNull()
      expect(state.user).toBeNull()
    })
  })

  describe('AsyncThunk loginUser', () => {
    it('debe manejar el estado pending durante el login', () => {
      api.post.mockImplementation(() => new Promise(() => {}))

      store.dispatch(loginUser({ usuario: 'admin', password: 'pass' }))
      const state = store.getState().auth

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('debe manejar el login exitoso y guardar en localStorage', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 1,
              nombre: 'Admin',
              apellidos: 'User',
              rol: 'admin'
            },
            token: 'jwt-token-12345'
          }
        }
      }

      api.post.mockResolvedValueOnce(mockResponse)

      await store.dispatch(loginUser({ usuario: 'admin', password: 'pass123' }))
      const state = store.getState().auth

      expect(state.loading).toBe(false)
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockResponse.data.data.user)
      expect(state.token).toBe('jwt-token-12345')
      expect(state.error).toBeNull()
      
      // Verificar que se guardó en localStorage
      expect(localStorage.getItem('bomberosToken')).toBe('jwt-token-12345')
      expect(JSON.parse(localStorage.getItem('bomberosUser'))).toEqual(mockResponse.data.data.user)
    })

    it('debe manejar errores de login y limpiar localStorage', async () => {
      const errorMessage = 'Credenciales inválidas'
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            message: errorMessage
          }
        }
      })

      // Establecer datos previos en localStorage
      localStorage.setItem('bomberosToken', 'old-token')
      localStorage.setItem('bomberosUser', JSON.stringify({ id: 1 }))

      await store.dispatch(loginUser({ usuario: 'admin', password: 'wrong' }))
      const state = store.getState().auth

      expect(state.loading).toBe(false)
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.error).toBe(errorMessage)
      
      // Verificar que se limpió localStorage
      expect(localStorage.getItem('bomberosToken')).toBeNull()
      expect(localStorage.getItem('bomberosUser')).toBeNull()
    })

    it('debe usar mensaje genérico si no hay mensaje de error específico', async () => {
      api.post.mockRejectedValueOnce(new Error('Network error'))

      await store.dispatch(loginUser({ usuario: 'admin', password: 'pass' }))
      const state = store.getState().auth

      expect(state.error).toBe('Network error')
    })

    it('debe usar mensaje de conexión si no hay response ni message', async () => {
      api.post.mockRejectedValueOnce({})

      await store.dispatch(loginUser({ usuario: 'admin', password: 'pass' }))
      const state = store.getState().auth

      expect(state.error).toBe('Error de conexión')
    })
  })

  describe('AsyncThunk logoutUser', () => {
    it('debe limpiar el estado y localStorage al hacer logout exitoso', async () => {
      // Establecer estado autenticado
      store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: { id: 1, nombre: 'Test' },
            token: 'token-123',
            isAuthenticated: true,
            loading: false,
            error: null
          }
        }
      })

      localStorage.setItem('bomberosToken', 'token-123')
      localStorage.setItem('bomberosUser', JSON.stringify({ id: 1 }))

      api.post.mockResolvedValueOnce({ data: { success: true } })

      await store.dispatch(logoutUser())
      const state = store.getState().auth

      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.error).toBeNull()
      expect(state.loading).toBe(false)
      
      // Verificar que se limpió localStorage
      expect(localStorage.getItem('bomberosToken')).toBeNull()
      expect(localStorage.getItem('bomberosUser')).toBeNull()
    })

    it('debe limpiar el estado incluso si el logout falla en el servidor', async () => {
      store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: { id: 1, nombre: 'Test' },
            token: 'token-123',
            isAuthenticated: true,
            loading: false,
            error: null
          }
        }
      })

      localStorage.setItem('bomberosToken', 'token-123')
      localStorage.setItem('bomberosUser', JSON.stringify({ id: 1 }))

      // Simular fallo en el servidor
      api.post.mockRejectedValueOnce(new Error('Server error'))

      await store.dispatch(logoutUser())
      const state = store.getState().auth

      // Aún así debe limpiar el estado local
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(localStorage.getItem('bomberosToken')).toBeNull()
    })
  })

  describe('Integración completa', () => {
    it('debe manejar flujo completo: login -> checkAuth -> logout', async () => {
      // 1. Login
      const mockLoginResponse = {
        data: {
          success: true,
          data: {
            user: { id: 1, nombre: 'Admin', rol: 'admin' },
            token: 'session-token'
          }
        }
      }

      api.post.mockResolvedValueOnce(mockLoginResponse)
      await store.dispatch(loginUser({ usuario: 'admin', password: 'pass' }))

      let state = store.getState().auth
      expect(state.isAuthenticated).toBe(true)
      expect(state.user.nombre).toBe('Admin')

      // 2. Simular recarga - checkAuthToken
      store.dispatch(checkAuthToken())
      state = store.getState().auth
      expect(state.isAuthenticated).toBe(true)
      expect(state.user.nombre).toBe('Admin')

      // 3. Logout
      api.post.mockResolvedValueOnce({ data: { success: true } })
      await store.dispatch(logoutUser())

      state = store.getState().auth
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBeNull()
      expect(localStorage.getItem('bomberosToken')).toBeNull()
    })

    it('debe mantener consistencia entre Redux y localStorage', async () => {
      const mockResponse = {
        data: {
          data: {
            user: { id: 5, nombre: 'Test User' },
            token: 'test-token'
          }
        }
      }

      api.post.mockResolvedValueOnce(mockResponse)
      await store.dispatch(loginUser({ usuario: 'test', password: 'test' }))

      const state = store.getState().auth
      const lsToken = localStorage.getItem('bomberosToken')
      const lsUser = JSON.parse(localStorage.getItem('bomberosUser'))

      expect(state.token).toBe(lsToken)
      expect(state.user).toEqual(lsUser)
    })
  })
})
