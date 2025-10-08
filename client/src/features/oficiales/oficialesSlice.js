import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Estados de carga
const LOADING_STATES = {
  IDLE: 'idle',
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

// Thunks asincrónicos
export const fetchOficiales = createAsyncThunk(
  'oficiales/fetchOficiales',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/oficiales', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar oficiales'
      )
    }
  }
)

export const fetchOficialById = createAsyncThunk(
  'oficiales/fetchOficialById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/oficiales/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar oficial'
      )
    }
  }
)

export const createOficial = createAsyncThunk(
  'oficiales/createOficial',
  async (oficialData, { rejectWithValue }) => {
    try {
      const response = await api.post('/oficiales', oficialData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al crear oficial'
      )
    }
  }
)

export const updateOficial = createAsyncThunk(
  'oficiales/updateOficial',
  async ({ id, ...oficialData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/oficiales/${id}`, oficialData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al actualizar oficial'
      )
    }
  }
)

export const deleteOficial = createAsyncThunk(
  'oficiales/deleteOficial',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/oficiales/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al eliminar oficial'
      )
    }
  }
)

export const fetchJerarquia = createAsyncThunk(
  'oficiales/fetchJerarquia',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/oficiales/jerarquia')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar jerarquía'
      )
    }
  }
)

export const fetchEstadisticas = createAsyncThunk(
  'oficiales/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/oficiales/stats/jerarquia')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar estadísticas'
      )
    }
  }
)

// Estado inicial
const initialState = {
  // Lista de oficiales
  oficiales: [],
  totalOficiales: 0,
  totalPages: 0,
  currentPage: 1,
  
  // Oficial seleccionado
  selectedOficial: null,
  
  // Jerarquía organizacional
  jerarquia: [],
  
  // Estadísticas
  estadisticas: {
    totalActivos: 0,
    totalInactivos: 0,
    total: 0,
    porRango: [],
    porDepartamento: [],
    masExperimentados: [],
    comandancia: []
  },
  
  // Estados de carga
  status: LOADING_STATES.IDLE,
  estadisticasStatus: LOADING_STATES.IDLE,
  jerarquiaStatus: LOADING_STATES.IDLE,
  
  // Errores
  error: null,
  estadisticasError: null,
  jerarquiaError: null,
  
  // Filtros
  filters: {
    search: '',
    rango: '',
    departamento: '',
    activo: '',
    page: 1,
    limit: 10
  }
}

// Slice
const oficialesSlice = createSlice({
  name: 'oficiales',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null
      state.estadisticasError = null
      state.jerarquiaError = null
    },
    
    // Actualizar filtros
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    // Limpiar filtros
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    
    // Seleccionar oficial
    selectOficial: (state, action) => {
      state.selectedOficial = action.payload
    },
    
    // Limpiar oficial seleccionado
    clearSelectedOficial: (state) => {
      state.selectedOficial = null
    },
    
    // Resetear estado
    resetState: () => initialState
  },
  
  extraReducers: (builder) => {
    // Fetch oficiales
    builder
      .addCase(fetchOficiales.pending, (state) => {
        state.status = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(fetchOficiales.fulfilled, (state, action) => {
        state.status = LOADING_STATES.FULFILLED
        state.oficiales = action.payload.data.data || []
        state.totalOficiales = action.payload.data.total || 0
        state.totalPages = action.payload.data.totalPages || 0
        state.currentPage = action.payload.data.page || 1
      })
      .addCase(fetchOficiales.rejected, (state, action) => {
        state.status = LOADING_STATES.REJECTED
        state.error = action.payload
      })

    // Fetch oficial por ID
    builder
      .addCase(fetchOficialById.pending, (state) => {
        state.error = null
      })
      .addCase(fetchOficialById.fulfilled, (state, action) => {
        state.selectedOficial = action.payload.data.data
      })
      .addCase(fetchOficialById.rejected, (state, action) => {
        state.error = action.payload
      })

    // Crear oficial
    builder
      .addCase(createOficial.pending, (state) => {
        state.error = null
      })
      .addCase(createOficial.fulfilled, (state, action) => {
        state.oficiales.unshift(action.payload.data.data)
        state.totalOficiales += 1
      })
      .addCase(createOficial.rejected, (state, action) => {
        state.error = action.payload
      })

    // Actualizar oficial
    builder
      .addCase(updateOficial.pending, (state) => {
        state.error = null
      })
      .addCase(updateOficial.fulfilled, (state, action) => {
        const index = state.oficiales.findIndex(
          oficial => oficial.id === action.payload.data.data.id
        )
        if (index !== -1) {
          state.oficiales[index] = action.payload.data.data
        }
        if (state.selectedOficial?.id === action.payload.data.data.id) {
          state.selectedOficial = action.payload.data.data
        }
      })
      .addCase(updateOficial.rejected, (state, action) => {
        state.error = action.payload
      })

    // Eliminar oficial
    builder
      .addCase(deleteOficial.pending, (state) => {
        state.error = null
      })
      .addCase(deleteOficial.fulfilled, (state, action) => {
        state.oficiales = state.oficiales.filter(
          oficial => oficial.id !== action.payload
        )
        state.totalOficiales -= 1
        if (state.selectedOficial?.id === action.payload) {
          state.selectedOficial = null
        }
      })
      .addCase(deleteOficial.rejected, (state, action) => {
        state.error = action.payload
      })

    // Fetch jerarquía
    builder
      .addCase(fetchJerarquia.pending, (state) => {
        state.jerarquiaStatus = LOADING_STATES.PENDING
        state.jerarquiaError = null
      })
      .addCase(fetchJerarquia.fulfilled, (state, action) => {
        state.jerarquiaStatus = LOADING_STATES.FULFILLED
        state.jerarquia = action.payload.data.data || []
      })
      .addCase(fetchJerarquia.rejected, (state, action) => {
        state.jerarquiaStatus = LOADING_STATES.REJECTED
        state.jerarquiaError = action.payload
      })

    // Fetch estadísticas
    builder
      .addCase(fetchEstadisticas.pending, (state) => {
        state.estadisticasStatus = LOADING_STATES.PENDING
        state.estadisticasError = null
      })
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.estadisticasStatus = LOADING_STATES.FULFILLED
        state.estadisticas = action.payload.data.data || initialState.estadisticas
      })
      .addCase(fetchEstadisticas.rejected, (state, action) => {
        state.estadisticasStatus = LOADING_STATES.REJECTED
        state.estadisticasError = action.payload
      })
  }
})

// Selectores
export const selectOficiales = (state) => state.oficiales.oficiales
export const selectTotalOficiales = (state) => state.oficiales.totalOficiales
export const selectSelectedOficial = (state) => state.oficiales.selectedOficial
export const selectJerarquia = (state) => state.oficiales.jerarquia
export const selectEstadisticas = (state) => state.oficiales.estadisticas
export const selectOficialesStatus = (state) => state.oficiales.status
export const selectEstadisticasStatus = (state) => state.oficiales.estadisticasStatus
export const selectJerarquiaStatus = (state) => state.oficiales.jerarquiaStatus
export const selectError = (state) => state.oficiales.error
export const selectFilters = (state) => state.oficiales.filters

// Selectores computados
export const selectOficialesLoading = (state) => 
  state.oficiales.status === LOADING_STATES.PENDING

export const selectEstadisticasLoading = (state) => 
  state.oficiales.estadisticasStatus === LOADING_STATES.PENDING

export const selectJerarquiaLoading = (state) => 
  state.oficiales.jerarquiaStatus === LOADING_STATES.PENDING

// Exportar acciones
export const {
  clearError,
  updateFilters,
  clearFilters,
  selectOficial,
  clearSelectedOficial,
  resetState
} = oficialesSlice.actions

// Exportar reducer
export default oficialesSlice.reducer