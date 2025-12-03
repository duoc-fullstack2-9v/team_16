import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Acción asíncrona para login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error de conexión'
      return rejectWithValue(message)
    }
  }
)

// Acción asíncrona para logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout')
      return true
    } catch (error) {
      // Aún si falla el logout en el servidor, limpiamos el cliente
      return true
    }
  }
)

const initialState = {
  user: null,
  token: localStorage.getItem('bomberosToken') || null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    // Para verificar token existente al cargar la app
    checkAuthToken: (state) => {
      const token = localStorage.getItem('bomberosToken')
      const user = localStorage.getItem('bomberosUser')
      
      if (token && user) {
        try {
          state.token = token
          state.user = JSON.parse(user)
          state.isAuthenticated = true
        } catch (error) {
          // Si hay error al parsear, limpiar todo
          localStorage.removeItem('bomberosToken')
          localStorage.removeItem('bomberosUser')
          state.token = null
          state.user = null
          state.isAuthenticated = false
        }
      } else {
        state.token = null
        state.user = null
        state.isAuthenticated = false
      }
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.data.user
        state.token = action.payload.data.token
        state.error = null
        // Guardar en localStorage
        localStorage.setItem('bomberosToken', action.payload.data.token)
        localStorage.setItem('bomberosUser', JSON.stringify(action.payload.data.user))
        console.log('✅ Login exitoso - Token guardado:', action.payload.data.token)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload
        // Limpiar localStorage
        localStorage.removeItem('bomberosToken')
        localStorage.removeItem('bomberosUser')
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
        state.loading = false
        // Limpiar localStorage
        localStorage.removeItem('bomberosToken')
        localStorage.removeItem('bomberosUser')
      })
  },
})

export const {
  clearError,
  checkAuthToken,
} = authSlice.actions

export default authSlice.reducer