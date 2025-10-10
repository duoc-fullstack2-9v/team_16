import axios from 'axios'

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bomberosToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('📤 Request con token:', token.substring(0, 20) + '...')
    } else {
      console.log('⚠️ No hay token en localStorage')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Retornar la respuesta completa en lugar de solo response.data
    return response
  },
  (error) => {
    console.error('❌ Error en API:', error.response?.status, error.response?.data)
    
    // Si el token expira, limpiar localStorage y redirigir al login
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Token inválido/expirado - Limpiando sesión')
      localStorage.removeItem('bomberosToken')
      localStorage.removeItem('bomberosUser')
      
      // Solo redirigir si no estamos ya en la página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error.response?.data || error.message)
  }
)

// Servicios de API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  getProfile: () => api.get('/auth/profile'),
}

export const bomberosAPI = {
  getAll: () => api.get('/bomberos'),
  getById: (id) => api.get(`/bomberos/${id}`),
  create: (data) => api.post('/bomberos', data),
  update: (id, data) => api.put(`/bomberos/${id}`, data),
  delete: (id) => api.delete(`/bomberos/${id}`),
}

export const citacionesAPI = {
  getAll: () => api.get('/citaciones'),
  getById: (id) => api.get(`/citaciones/${id}`),
  create: (data) => api.post('/citaciones', data),
  update: (id, data) => api.put(`/citaciones/${id}`, data),
  delete: (id) => api.delete(`/citaciones/${id}`),
}

export const oficialesAPI = {
  getAll: () => api.get('/oficiales'),
  getById: (id) => api.get(`/oficiales/${id}`),
  create: (data) => api.post('/oficiales', data),
  update: (id, data) => api.put(`/oficiales/${id}`, data),
  delete: (id) => api.delete(`/oficiales/${id}`),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getLogs: () => api.get('/admin/logs'),
}

export default api