import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async actions using createAsyncThunk

// Fetch bomberos con filtros y paginación
export const fetchBomberos = createAsyncThunk(
  'bomberos/fetchBomberos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        rango: params.rango || '',
        estado: params.estado || 'Activo',
        sortBy: params.sortBy || 'apellidos',
        sortOrder: params.sortOrder || 'asc'
      }).toString()

      const response = await api.get(`/bomberos?${queryParams}`)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar bomberos'
      )
    }
  }
)

// Fetch bombero específico
export const fetchBomberoById = createAsyncThunk(
  'bomberos/fetchBomberoById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bomberos/${id}`)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar bombero'
      )
    }
  }
)

// Crear nuevo bombero
export const createBombero = createAsyncThunk(
  'bomberos/createBombero',
  async (bomberoData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bomberos', bomberoData)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details || 
        error.response?.data?.message || 
        'Error al crear bombero'
      )
    }
  }
)

// Actualizar bombero
export const updateBombero = createAsyncThunk(
  'bomberos/updateBombero',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/bomberos/${id}`, data)
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details || 
        error.response?.data?.message || 
        'Error al actualizar bombero'
      )
    }
  }
)

// Eliminar bombero (soft delete)
export const deleteBombero = createAsyncThunk(
  'bomberos/deleteBombero',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/bomberos/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al eliminar bombero'
      )
    }
  }
)

// Fetch estadísticas
export const fetchBomberosStats = createAsyncThunk(
  'bomberos/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bomberos/stats/general')
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar estadísticas'
      )
    }
  }
)

const initialState = {
  // Lista de bomberos
  bomberos: [],
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  
  // Bombero seleccionado
  selectedBombero: null,
  
  // Estadísticas
  stats: {
    totalActivos: 0,
    totalInactivos: 0,
    total: 0,
    porRango: [],
    nuevosUltimoMes: 0
  },
  
  // Estados de carga
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  statsLoading: false,
  
  // Errores
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  
  // Filtros actuales
  filters: {
    search: '',
    rango: '',
    estado: 'Activo',
    sortBy: 'apellidos',
    sortOrder: 'asc'
  }
}

const bomberosSlice = createSlice({
  name: 'bomberos',
  initialState,
  reducers: {
    // Acciones síncronas
    clearError: (state) => {
      state.error = null
      state.createError = null
      state.updateError = null
      state.deleteError = null
    },
    
    clearSelectedBombero: (state) => {
      state.selectedBombero = null
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters
    },

    // Optimistic updates para mejor UX
    optimisticDeleteBombero: (state, action) => {
      const bomberoId = action.payload
      const bombero = state.bomberos.find(b => b.id === bomberoId)
      if (bombero) {
        bombero.estado = 'Inactivo'
      }
    }
  },

  extraReducers: (builder) => {
    builder
      // Fetch bomberos
      .addCase(fetchBomberos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBomberos.fulfilled, (state, action) => {
        state.loading = false
        state.bomberos = action.payload.data.data
        state.pagination = action.payload.data.pagination
        state.error = null
      })
      .addCase(fetchBomberos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch bombero by ID
      .addCase(fetchBomberoById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBomberoById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedBombero = action.payload.data.data
        state.error = null
      })
      .addCase(fetchBomberoById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create bombero
      .addCase(createBombero.pending, (state) => {
        state.createLoading = true
        state.createError = null
      })
      .addCase(createBombero.fulfilled, (state, action) => {
        state.createLoading = false
        state.bomberos.unshift(action.payload.data.data) // Agregar al inicio
        state.createError = null
      })
      .addCase(createBombero.rejected, (state, action) => {
        state.createLoading = false
        state.createError = action.payload
      })

      // Update bombero
      .addCase(updateBombero.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
      })
      .addCase(updateBombero.fulfilled, (state, action) => {
        state.updateLoading = false
        const index = state.bomberos.findIndex(b => b.id === action.payload.data.data.id)
        if (index !== -1) {
          state.bomberos[index] = action.payload.data.data
        }
        if (state.selectedBombero?.id === action.payload.data.data.id) {
          state.selectedBombero = action.payload.data.data
        }
        state.updateError = null
      })
      .addCase(updateBombero.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload
      })

      // Delete bombero
      .addCase(deleteBombero.pending, (state) => {
        state.deleteLoading = true
        state.deleteError = null
      })
      .addCase(deleteBombero.fulfilled, (state, action) => {
        state.deleteLoading = false
        const bomberoId = action.payload
        const bombero = state.bomberos.find(b => b.id === bomberoId)
        if (bombero) {
          bombero.estado = 'Inactivo'
        }
        state.deleteError = null
      })
      .addCase(deleteBombero.rejected, (state, action) => {
        state.deleteLoading = false
        state.deleteError = action.payload
        // Revertir optimistic update si es necesario
      })

      // Fetch stats
      .addCase(fetchBomberosStats.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchBomberosStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload.data.data
      })
      .addCase(fetchBomberosStats.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })
  }
})

// Selectores (opcional, pero útil para componentes)
export const selectBomberosState = (state) => state.bomberos
export const selectBomberos = (state) => state.bomberos.bomberos
export const selectBomberosLoading = (state) => state.bomberos.loading
export const selectBomberosError = (state) => state.bomberos.error
export const selectSelectedBombero = (state) => state.bomberos.selectedBombero
export const selectBomberosPagination = (state) => state.bomberos.pagination
export const selectBomberosFilters = (state) => state.bomberos.filters
export const selectBomberosStats = (state) => state.bomberos.stats

// Exportar acciones
export const {
  clearError,
  clearSelectedBombero,
  setFilters,
  resetFilters,
  optimisticDeleteBombero
} = bomberosSlice.actions

export default bomberosSlice.reducer