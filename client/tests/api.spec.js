import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'

// Mock de axios ANTES de importar cualquier cosa
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
      eject: vi.fn()
    },
    response: {
      use: vi.fn(),
      eject: vi.fn()
    }
  }
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance)
  }
}))

// Importar después del mock
let api, authAPI, bomberosAPI, citacionesAPI, oficialesAPI, adminAPI, guardiasAPI

describe('API Service', () => {
  let requestInterceptor
  let responseInterceptor

  beforeAll(async () => {
    // Capturar los interceptores cuando se registren
    mockAxiosInstance.interceptors.request.use.mockImplementation((onFulfilled, onRejected) => {
      requestInterceptor = { onFulfilled, onRejected }
    })
    
    mockAxiosInstance.interceptors.response.use.mockImplementation((onFulfilled, onRejected) => {
      responseInterceptor = { onFulfilled, onRejected }
    })

    // Importar el módulo DESPUÉS de configurar los mocks
    const apiModule = await import('../src/services/api')
    api = apiModule.default
    authAPI = apiModule.authAPI
    bomberosAPI = apiModule.bomberosAPI
    citacionesAPI = apiModule.citacionesAPI
    oficialesAPI = apiModule.oficialesAPI
    adminAPI = apiModule.adminAPI
    guardiasAPI = apiModule.guardiasAPI
  })

  beforeEach(() => {
    // Limpiar mocks
    vi.clearAllMocks()
    
    // Limpiar localStorage
    localStorage.clear()
    
    // Mock de console.log y console.error
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Resetear respuestas de mock
    mockAxiosInstance.get.mockResolvedValue({ data: {} })
    mockAxiosInstance.post.mockResolvedValue({ data: {} })
    mockAxiosInstance.put.mockResolvedValue({ data: {} })
    mockAxiosInstance.delete.mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Interceptor de Request', () => {
    it('debe agregar token de autorización cuando existe en localStorage', () => {
      const token = 'test-token-12345'
      localStorage.setItem('bomberosToken', token)

      const config = {
        headers: {}
      }

      const result = requestInterceptor.onFulfilled(config)

      expect(result.headers.Authorization).toBe(`Bearer ${token}`)
      expect(console.log).toHaveBeenCalledWith(
        '📤 Request con token:',
        expect.stringContaining('test-token-12345')
      )
    })

    it('debe manejar request sin token en localStorage', () => {
      const config = {
        headers: {}
      }

      const result = requestInterceptor.onFulfilled(config)

      expect(result.headers.Authorization).toBeUndefined()
      expect(console.log).toHaveBeenCalledWith('⚠️ No hay token en localStorage')
    })

    it('debe rechazar cuando hay un error en el request', async () => {
      const error = new Error('Request error')

      await expect(requestInterceptor.onRejected(error)).rejects.toThrow('Request error')
    })
  })

  describe('Interceptor de Response', () => {
    beforeEach(() => {
      // Mock de window.location
      delete window.location
      window.location = { 
        href: '',
        pathname: '/dashboard'
      }
    })

    it('debe retornar solo datos serializables en respuesta exitosa', () => {
      const mockResponse = {
        data: { message: 'Success', data: [1, 2, 3] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      }

      const result = responseInterceptor.onFulfilled(mockResponse)

      expect(result).toEqual({
        data: mockResponse.data,
        status: 200,
        statusText: 'OK'
      })
    })

    it('debe limpiar localStorage y redirigir en error 401', async () => {
      localStorage.setItem('bomberosToken', 'test-token')
      localStorage.setItem('bomberosUser', JSON.stringify({ id: 1 }))

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      window.location.pathname = '/dashboard'

      await expect(responseInterceptor.onRejected(error)).rejects.toEqual(error.response.data)

      expect(localStorage.getItem('bomberosToken')).toBeNull()
      expect(localStorage.getItem('bomberosUser')).toBeNull()
      expect(window.location.href).toBe('/login')
      expect(console.log).toHaveBeenCalledWith('🔒 Token inválido/expirado - Limpiando sesión')
    })

    it('debe limpiar localStorage y redirigir en error 403', async () => {
      localStorage.setItem('bomberosToken', 'test-token')
      localStorage.setItem('bomberosUser', JSON.stringify({ id: 1 }))

      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      }

      window.location.pathname = '/dashboard'

      await expect(responseInterceptor.onRejected(error)).rejects.toEqual(error.response.data)

      expect(localStorage.getItem('bomberosToken')).toBeNull()
      expect(localStorage.getItem('bomberosUser')).toBeNull()
      expect(window.location.href).toBe('/login')
    })

    it('NO debe redirigir si ya estamos en la página de login', async () => {
      localStorage.setItem('bomberosToken', 'test-token')

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      }

      window.location.pathname = '/login'
      const originalHref = window.location.href

      await expect(responseInterceptor.onRejected(error)).rejects.toEqual(error.response.data)

      expect(localStorage.getItem('bomberosToken')).toBeNull()
      expect(window.location.href).toBe(originalHref) // No cambió
    })

    it('debe manejar errores sin response.data', async () => {
      const error = {
        message: 'Network error'
      }

      await expect(responseInterceptor.onRejected(error)).rejects.toBe('Network error')
      expect(console.error).toHaveBeenCalledWith('❌ Error en API:', undefined, undefined)
    })

    it('debe manejar errores con response pero sin data', async () => {
      const error = {
        response: {
          status: 500
        },
        message: 'Server error'
      }

      await expect(responseInterceptor.onRejected(error)).rejects.toBe('Server error')
    })

    it('debe logear errores de respuesta', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Bad request' }
        }
      }

      await expect(responseInterceptor.onRejected(error)).rejects.toEqual(error.response.data)
      expect(console.error).toHaveBeenCalledWith('❌ Error en API:', 400, error.response.data)
    })
  })

  describe('authAPI', () => {
    it('debe llamar a login con credenciales', async () => {
      const credentials = { username: 'test', password: '123' }
      await authAPI.login(credentials)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials)
    })

    it('debe llamar a logout', async () => {
      await authAPI.logout()

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout')
    })

    it('debe llamar a refreshToken', async () => {
      await authAPI.refreshToken()

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/refresh')
    })

    it('debe llamar a getProfile', async () => {
      await authAPI.getProfile()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/profile')
    })
  })

  describe('bomberosAPI', () => {
    it('debe llamar a getAll', async () => {
      await bomberosAPI.getAll()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bomberos')
    })

    it('debe llamar a getById con id', async () => {
      await bomberosAPI.getById(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bomberos/1')
    })

    it('debe llamar a create con data', async () => {
      const data = { nombre: 'Test' }
      await bomberosAPI.create(data)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/bomberos', data)
    })

    it('debe llamar a update con id y data', async () => {
      const data = { nombre: 'Updated' }
      await bomberosAPI.update(1, data)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/bomberos/1', data)
    })

    it('debe llamar a delete con id', async () => {
      await bomberosAPI.delete(1)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/bomberos/1')
    })
  })

  describe('citacionesAPI', () => {
    it('debe llamar a getAll', async () => {
      await citacionesAPI.getAll()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/citaciones')
    })

    it('debe llamar a getById con id', async () => {
      await citacionesAPI.getById(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/citaciones/1')
    })

    it('debe llamar a create con data', async () => {
      const data = { titulo: 'Test' }
      await citacionesAPI.create(data)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/citaciones', data)
    })

    it('debe llamar a update con id y data', async () => {
      const data = { titulo: 'Updated' }
      await citacionesAPI.update(1, data)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/citaciones/1', data)
    })

    it('debe llamar a delete con id', async () => {
      await citacionesAPI.delete(1)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/citaciones/1')
    })
  })

  describe('oficialesAPI', () => {
    it('debe llamar a getAll', async () => {
      await oficialesAPI.getAll()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/oficiales')
    })

    it('debe llamar a getById con id', async () => {
      await oficialesAPI.getById(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/oficiales/1')
    })

    it('debe llamar a create con data', async () => {
      const data = { nombre: 'Test' }
      await oficialesAPI.create(data)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/oficiales', data)
    })

    it('debe llamar a update con id y data', async () => {
      const data = { nombre: 'Updated' }
      await oficialesAPI.update(1, data)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/oficiales/1', data)
    })

    it('debe llamar a delete con id', async () => {
      await oficialesAPI.delete(1)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/oficiales/1')
    })
  })

  describe('adminAPI', () => {
    it('debe llamar a getStats', async () => {
      await adminAPI.getStats()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/stats')
    })

    it('debe llamar a getUsers', async () => {
      await adminAPI.getUsers()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/users')
    })

    it('debe llamar a createUser con data', async () => {
      const data = { username: 'test' }
      await adminAPI.createUser(data)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/admin/users', data)
    })

    it('debe llamar a updateUser con id y data', async () => {
      const data = { username: 'updated' }
      await adminAPI.updateUser(1, data)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/admin/users/1', data)
    })

    it('debe llamar a deleteUser con id', async () => {
      await adminAPI.deleteUser(1)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/admin/users/1')
    })

    it('debe llamar a getLogs', async () => {
      await adminAPI.getLogs()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/admin/logs')
    })
  })

  describe('guardiasAPI', () => {
    it('debe llamar a getMensuales con params', async () => {
      const params = { mes: 1, anio: 2024 }
      await guardiasAPI.getMensuales(params)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/guardias/mensuales', { params })
    })

    it('debe llamar a getMensualById con id', async () => {
      await guardiasAPI.getMensualById(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/guardias/mensuales/1')
    })

    it('debe llamar a createMensual con data', async () => {
      const data = { mes: 1, anio: 2024 }
      await guardiasAPI.createMensual(data)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/guardias/mensuales', data)
    })

    it('debe llamar a updateMensual con id y data', async () => {
      const data = { mes: 2 }
      await guardiasAPI.updateMensual(1, data)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/guardias/mensuales/1', data)
    })

    it('debe llamar a deleteMensual con id', async () => {
      await guardiasAPI.deleteMensual(1)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/guardias/mensuales/1')
    })

    it('debe llamar a saveDia con guardiaId y data', async () => {
      const data = { dia: 1, bomberos: [] }
      await guardiasAPI.saveDia(1, data)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/guardias/mensuales/1/dias', data)
    })

    it('debe llamar a deleteDia con diaId', async () => {
      await guardiasAPI.deleteDia(1)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/guardias/dias/1')
    })

    it('debe llamar a getBomberos', async () => {
      await guardiasAPI.getBomberos()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/guardias/bomberos')
    })

    it('debe llamar a exportPdf con id y responseType blob', async () => {
      await guardiasAPI.exportPdf(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/guardias/mensuales/1/export/pdf', { 
        responseType: 'blob' 
      })
    })

    it('debe llamar a getPlantillas', async () => {
      await guardiasAPI.getPlantillas()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/guardias/plantillas')
    })

    it('debe llamar a getPlantillaById con id', async () => {
      await guardiasAPI.getPlantillaById(1)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/guardias/plantillas/1')
    })

    it('debe llamar a createPlantilla con data', async () => {
      const data = { nombre: 'Plantilla Test' }
      await guardiasAPI.createPlantilla(data)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/guardias/plantillas', data)
    })

    it('debe llamar a updatePlantilla con id y data', async () => {
      const data = { nombre: 'Updated' }
      await guardiasAPI.updatePlantilla(1, data)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/guardias/plantillas/1', data)
    })

    it('debe llamar a deletePlantilla con id', async () => {
      await guardiasAPI.deletePlantilla(1)

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/guardias/plantillas/1')
    })

    it('debe llamar a aplicarPlantilla con guardiaId y plantillaId', async () => {
      await guardiasAPI.aplicarPlantilla(1, 2)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/guardias/mensuales/1/aplicar-plantilla/2')
    })
  })

  describe('Exportación por defecto', () => {
    it('debe exportar la instancia de api por defecto', () => {
      expect(api).toBeDefined()
      expect(api.get).toBeDefined()
      expect(api.post).toBeDefined()
      expect(api.put).toBeDefined()
      expect(api.delete).toBeDefined()
    })
  })
})
