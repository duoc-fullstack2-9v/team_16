import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async actions using createAsyncThunk

// Fetch citaciones con filtros y paginación
export const fetchCitaciones = createAsyncThunk(
  'citaciones/fetchCitaciones',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        estado: params.estado || '',
        fechaDesde: params.fechaDesde || '',
        fechaHasta: params.fechaHasta || '',
        sortBy: params.sortBy || 'fecha',
        sortOrder: params.sortOrder || 'desc'
      }).toString()

      console.log('🔍 Fetching citaciones with URL:', `/citaciones?${queryParams}`)
      const response = await api.get(`/citaciones?${queryParams}`)
      console.log('✅ Response data:', response.data)
      console.log('✅ Citaciones array:', response.data.data)
      console.log('✅ Pagination:', response.data.pagination)
      // Retornar el objeto completo con data y pagination
      return {
        data: response.data.data,
        pagination: response.data.pagination
      }
    } catch (error) {
      console.error('❌ Error fetching citaciones:', error)
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar citaciones'
      )
    }
  }
)

// Fetch citación específica
export const fetchCitacionById = createAsyncThunk(
  'citaciones/fetchCitacionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/citaciones/${id}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar citación'
      )
    }
  }
)

// Crear nueva citación
export const createCitacion = createAsyncThunk(
  'citaciones/createCitacion',
  async (citacionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/citaciones', citacionData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details || 
        error.response?.data?.message || 
        'Error al crear citación'
      )
    }
  }
)

// Actualizar citación
export const updateCitacion = createAsyncThunk(
  'citaciones/updateCitacion',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/citaciones/${id}`, data)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details || 
        error.response?.data?.message || 
        'Error al actualizar citación'
      )
    }
  }
)

// Eliminar citación
export const deleteCitacion = createAsyncThunk(
  'citaciones/deleteCitacion',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/citaciones/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al eliminar citación'
      )
    }
  }
)

// Asignar bomberos a citación
export const asignarBomberos = createAsyncThunk(
  'citaciones/asignarBomberos',
  async ({ citacionId, bomberosIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/citaciones/${citacionId}/asignar`, {
        bomberosIds
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.details || 
        error.response?.data?.message || 
        'Error al asignar bomberos'
      )
    }
  }
)

// Actualizar asistencia de bombero
export const updateAsistencia = createAsyncThunk(
  'citaciones/updateAsistencia',
  async ({ citacionId, bomberoId, asistio, observaciones }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/citaciones/${citacionId}/bomberos/${bomberoId}/asistencia`,
        { asistio, observaciones }
      )
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al actualizar asistencia'
      )
    }
  }
)

// Fetch estadísticas
export const fetchCitacionesStats = createAsyncThunk(
  'citaciones/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/citaciones/stats/general')
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error al cargar estadísticas'
      )
    }
  }
)

const initialState = {
  // Lista de citaciones
  citaciones: [],
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  },
  
  // Citación seleccionada
  selectedCitacion: null,
  
  // Estadísticas
  stats: {
    totalProgramadas: 0,
    totalRealizadas: 0,
    totalCanceladas: 0,
    total: 0,
    porEstado: [],
    proximasCitaciones: [],
    citacionesUltimoMes: 0
  },
  
  // Estados de carga
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  assignLoading: false,
  attendanceLoading: false,
  statsLoading: false,
  
  // Errores
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  assignError: null,
  attendanceError: null,
  
  // Filtros actuales
  filters: {
    search: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    sortBy: 'fecha',
    sortOrder: 'desc'
  }
}

const citacionesSlice = createSlice({
  name: 'citaciones',
  initialState,
  reducers: {
    // Acciones síncronas
    clearError: (state) => {
      state.error = null
      state.createError = null
      state.updateError = null
      state.deleteError = null
      state.assignError = null
      state.attendanceError = null
    },
    
    clearSelectedCitacion: (state) => {
      state.selectedCitacion = null
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters
    },

    // Optimistic updates
    optimisticDeleteCitacion: (state, action) => {
      const citacionId = action.payload
      state.citaciones = state.citaciones.filter(c => c.id !== citacionId)
    },

    optimisticUpdateEstado: (state, action) => {
      const { id, estado } = action.payload
      const citacion = state.citaciones.find(c => c.id === id)
      if (citacion) {
        citacion.estado = estado
      }
    }
  },

  extraReducers: (builder) => {
    builder
      // Fetch citaciones
      .addCase(fetchCitaciones.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCitaciones.fulfilled, (state, action) => {
        state.loading = false
        state.citaciones = action.payload.data
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchCitaciones.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch citación by ID
      .addCase(fetchCitacionById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCitacionById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedCitacion = action.payload
        state.error = null
      })
      .addCase(fetchCitacionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create citación
      .addCase(createCitacion.pending, (state) => {
        state.createLoading = true
        state.createError = null
      })
      .addCase(createCitacion.fulfilled, (state, action) => {
        state.createLoading = false
        state.citaciones.unshift(action.payload) // Agregar al inicio
        state.createError = null
      })
      .addCase(createCitacion.rejected, (state, action) => {
        state.createLoading = false
        state.createError = action.payload
      })

      // Update citación
      .addCase(updateCitacion.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
      })
      .addCase(updateCitacion.fulfilled, (state, action) => {
        state.updateLoading = false
        const index = state.citaciones.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.citaciones[index] = action.payload
        }
        if (state.selectedCitacion?.id === action.payload.id) {
          state.selectedCitacion = action.payload
        }
        state.updateError = null
      })
      .addCase(updateCitacion.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload
      })

      // Delete citación
      .addCase(deleteCitacion.pending, (state) => {
        state.deleteLoading = true
        state.deleteError = null
      })
      .addCase(deleteCitacion.fulfilled, (state, action) => {
        state.deleteLoading = false
        const citacionId = action.payload
        state.citaciones = state.citaciones.filter(c => c.id !== citacionId)
        if (state.selectedCitacion?.id === citacionId) {
          state.selectedCitacion = null
        }
        state.deleteError = null
      })
      .addCase(deleteCitacion.rejected, (state, action) => {
        state.deleteLoading = false
        state.deleteError = action.payload
      })

      // Asignar bomberos
      .addCase(asignarBomberos.pending, (state) => {
        state.assignLoading = true
        state.assignError = null
      })
      .addCase(asignarBomberos.fulfilled, (state, action) => {
        state.assignLoading = false
        const index = state.citaciones.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.citaciones[index] = action.payload
        }
        if (state.selectedCitacion?.id === action.payload.id) {
          state.selectedCitacion = action.payload
        }
        state.assignError = null
      })
      .addCase(asignarBomberos.rejected, (state, action) => {
        state.assignLoading = false
        state.assignError = action.payload
      })

      // Update asistencia
      .addCase(updateAsistencia.pending, (state) => {
        state.attendanceLoading = true
        state.attendanceError = null
      })
      .addCase(updateAsistencia.fulfilled, (state, action) => {
        state.attendanceLoading = false
        // Actualizar la asistencia en la citación seleccionada si corresponde
        if (state.selectedCitacion) {
          const bomberoCitacion = state.selectedCitacion.bomberos?.find(
            bc => bc.bomberoId === action.payload.bomberoId
          )
          if (bomberoCitacion) {
            bomberoCitacion.asistio = action.payload.asistio
            bomberoCitacion.observaciones = action.payload.observaciones
          }
        }
        state.attendanceError = null
      })
      .addCase(updateAsistencia.rejected, (state, action) => {
        state.attendanceLoading = false
        state.attendanceError = action.payload
      })

      // Fetch stats
      .addCase(fetchCitacionesStats.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchCitacionesStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
      })
      .addCase(fetchCitacionesStats.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload
      })
  }
})

// Selectores con manejo defensivo
export const selectCitacionesState = (state) => state.citaciones || {}
export const selectCitaciones = (state) => state.citaciones?.citaciones || []
export const selectCitacionesLoading = (state) => state.citaciones?.loading || false
export const selectCitacionesError = (state) => state.citaciones?.error || null
export const selectSelectedCitacion = (state) => state.citaciones?.selectedCitacion || null
export const selectCitacionesPagination = (state) => state.citaciones?.pagination || {}
export const selectCitacionesFilters = (state) => state.citaciones?.filters || {}
export const selectCitacionesStats = (state) => state.citaciones?.stats || {}

// Selectores específicos para operaciones
export const selectCreateLoading = (state) => state.citaciones?.createLoading || false
export const selectUpdateLoading = (state) => state.citaciones?.updateLoading || false
export const selectDeleteLoading = (state) => state.citaciones?.deleteLoading || false
export const selectAssignLoading = (state) => state.citaciones?.assignLoading || false
export const selectAttendanceLoading = (state) => state.citaciones?.attendanceLoading || false

// Exportar acciones
export const {
  clearError,
  clearSelectedCitacion,
  setFilters,
  resetFilters,
  optimisticDeleteCitacion,
  optimisticUpdateEstado
} = citacionesSlice.actions

export default citacionesSlice.reducer