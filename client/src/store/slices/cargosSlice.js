import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Estados de carga
const LOADING_STATES = {
  IDLE: 'idle',
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected'
}

// ========================================
// ASYNC THUNKS
// ========================================

// Fetch todos los cargos
export const fetchCargos = createAsyncThunk(
  'cargos/fetchCargos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/cargos', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar cargos'
      )
    }
  }
)

// Fetch cargo específico
export const fetchCargoById = createAsyncThunk(
  'cargos/fetchCargoById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cargos/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar cargo'
      )
    }
  }
)

// Crear nuevo cargo
export const createCargo = createAsyncThunk(
  'cargos/createCargo',
  async (cargoData, { rejectWithValue }) => {
    try {
      const response = await api.post('/cargos', cargoData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al crear cargo'
      )
    }
  }
)

// Actualizar cargo
export const updateCargo = createAsyncThunk(
  'cargos/updateCargo',
  async ({ id, ...cargoData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cargos/${id}`, cargoData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al actualizar cargo'
      )
    }
  }
)

// Eliminar cargo
export const deleteCargo = createAsyncThunk(
  'cargos/deleteCargo',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/cargos/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al eliminar cargo'
      )
    }
  }
)

// Asignar bombero a cargo
export const asignarBombero = createAsyncThunk(
  'cargos/asignarBombero',
  async ({ cargoId, bomberoId, fechaInicio, periodoAnio, observaciones }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/cargos/${cargoId}/asignar`, {
        bomberoId,
        fechaInicio,
        periodoAnio,
        observaciones
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al asignar bombero'
      )
    }
  }
)

// Liberar cargo
export const liberarCargo = createAsyncThunk(
  'cargos/liberarCargo',
  async ({ cargoId, fechaFin, observaciones }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cargos/${cargoId}/liberar`, {
        fechaFin,
        observaciones
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al liberar cargo'
      )
    }
  }
)

// Obtener historial de un cargo
export const fetchHistorialCargo = createAsyncThunk(
  'cargos/fetchHistorialCargo',
  async (cargoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cargos/${cargoId}/historial`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar historial'
      )
    }
  }
)

// Obtener estadísticas generales
export const fetchEstadisticas = createAsyncThunk(
  'cargos/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cargos/estadisticas')
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar estadísticas'
      )
    }
  }
)

// ========================================
// SLICE
// ========================================

const cargosSlice = createSlice({
  name: 'cargos',
  initialState: {
    cargos: [],
    cargosPorRama: {
      ADMINISTRATIVA: [],
      OPERATIVA: [],
      CONSEJOS: []
    },
    cargoActual: null,
    historial: [],
    estadisticas: null,
    loading: LOADING_STATES.IDLE,
    error: null,
    successMessage: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
    clearCargoActual: (state) => {
      state.cargoActual = null
    },
    clearHistorial: (state) => {
      state.historial = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cargos
      .addCase(fetchCargos.pending, (state) => {
        state.loading = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(fetchCargos.fulfilled, (state, action) => {
        state.loading = LOADING_STATES.FULFILLED
        console.log('📦 Cargos recibidos:', action.payload)
        state.cargos = action.payload.data || []
        state.cargosPorRama = action.payload.cargosPorRama || {
          ADMINISTRATIVA: [],
          OPERATIVA: [],
          CONSEJOS: []
        }
      })
      .addCase(fetchCargos.rejected, (state, action) => {
        state.loading = LOADING_STATES.REJECTED
        state.error = action.payload
      })

      // Fetch cargo by ID
      .addCase(fetchCargoById.pending, (state) => {
        state.loading = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(fetchCargoById.fulfilled, (state, action) => {
        state.loading = LOADING_STATES.FULFILLED
        state.cargoActual = action.payload.data
      })
      .addCase(fetchCargoById.rejected, (state, action) => {
        state.loading = LOADING_STATES.REJECTED
        state.error = action.payload
      })

      // Create cargo
      .addCase(createCargo.pending, (state) => {
        state.loading = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(createCargo.fulfilled, (state, action) => {
        state.loading = LOADING_STATES.FULFILLED
        state.cargos.push(action.payload.data)
        state.successMessage = action.payload.message
      })
      .addCase(createCargo.rejected, (state, action) => {
        state.loading = LOADING_STATES.REJECTED
        state.error = action.payload
      })

      // Update cargo
      .addCase(updateCargo.pending, (state) => {
        state.loading = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(updateCargo.fulfilled, (state, action) => {
        state.loading = LOADING_STATES.FULFILLED
        const index = state.cargos.findIndex(c => c.id === action.payload.data.id)
        if (index !== -1) {
          state.cargos[index] = action.payload.data
        }
        state.successMessage = action.payload.message
      })
      .addCase(updateCargo.rejected, (state, action) => {
        state.loading = LOADING_STATES.REJECTED
        state.error = action.payload
      })

      // Delete cargo
      .addCase(deleteCargo.pending, (state) => {
        state.loading = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(deleteCargo.fulfilled, (state, action) => {
        state.loading = LOADING_STATES.FULFILLED
        state.cargos = state.cargos.filter(c => c.id !== action.payload)
        state.successMessage = 'Cargo eliminado exitosamente'
      })
      .addCase(deleteCargo.rejected, (state, action) => {
        state.loading = LOADING_STATES.REJECTED
        state.error = action.payload
      })

      // Asignar bombero
      .addCase(asignarBombero.pending, (state) => {
        state.loading = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(asignarBombero.fulfilled, (state, action) => {
        state.loading = LOADING_STATES.FULFILLED
        state.successMessage = action.payload.message
        // Se debe refrescar la lista de cargos después
      })
      .addCase(asignarBombero.rejected, (state, action) => {
        state.loading = LOADING_STATES.REJECTED
        state.error = action.payload
      })

      // Liberar cargo
      .addCase(liberarCargo.pending, (state) => {
        state.loading = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(liberarCargo.fulfilled, (state, action) => {
        state.loading = LOADING_STATES.FULFILLED
        state.successMessage = action.payload.message
        // Se debe refrescar la lista de cargos después
      })
      .addCase(liberarCargo.rejected, (state, action) => {
        state.loading = LOADING_STATES.REJECTED
        state.error = action.payload
      })

      // Fetch historial
      .addCase(fetchHistorialCargo.pending, (state) => {
        state.loading = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(fetchHistorialCargo.fulfilled, (state, action) => {
        state.loading = LOADING_STATES.FULFILLED
        state.historial = action.payload.data.historial
      })
      .addCase(fetchHistorialCargo.rejected, (state, action) => {
        state.loading = LOADING_STATES.REJECTED
        state.error = action.payload
      })

      // Fetch estadísticas
      .addCase(fetchEstadisticas.pending, (state) => {
        state.loading = LOADING_STATES.PENDING
        state.error = null
      })
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.loading = LOADING_STATES.FULFILLED
        state.estadisticas = action.payload.data
      })
      .addCase(fetchEstadisticas.rejected, (state, action) => {
        state.loading = LOADING_STATES.REJECTED
        state.error = action.payload
      })
  }
})

export const {
  clearError,
  clearSuccessMessage,
  clearCargoActual,
  clearHistorial
} = cargosSlice.actions

export default cargosSlice.reducer
