import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// ==================== ASYNC THUNKS ====================

// Obtener todo el material con filtros
export const fetchMaterial = createAsyncThunk(
  'material/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/material', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener material' })
    }
  }
)

// Obtener estadísticas del material
export const fetchMaterialEstadisticas = createAsyncThunk(
  'material/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/material/estadisticas')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener estadísticas' })
    }
  }
)

// Obtener alertas de material
export const fetchMaterialAlertas = createAsyncThunk(
  'material/fetchAlertas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/material/alertas')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener alertas' })
    }
  }
)

// Obtener un material por ID
export const fetchMaterialById = createAsyncThunk(
  'material/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/material/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener material' })
    }
  }
)

// Obtener historial de asignaciones de un material
export const fetchMaterialHistorial = createAsyncThunk(
  'material/fetchHistorial',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/material/${id}/historial`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener historial' })
    }
  }
)

// Crear nuevo material
export const createMaterial = createAsyncThunk(
  'material/create',
  async (materialData, { rejectWithValue }) => {
    try {
      const response = await api.post('/material', materialData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al crear material' })
    }
  }
)

// Actualizar material
export const updateMaterial = createAsyncThunk(
  'material/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/material/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al actualizar material' })
    }
  }
)

// Desactivar material (soft delete)
export const deleteMaterial = createAsyncThunk(
  'material/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/material/${id}`)
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al desactivar material' })
    }
  }
)

// Asignar material
export const asignarMaterial = createAsyncThunk(
  'material/asignar',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/material/${id}/asignar`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al asignar material' })
    }
  }
)

// Devolver material
export const devolverMaterial = createAsyncThunk(
  'material/devolver',
  async ({ asignacionId, observaciones }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/material/asignaciones/${asignacionId}/devolver`,
        { observaciones }
      )
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al devolver material' })
    }
  }
)

// ==================== SLICE ====================

const materialSlice = createSlice({
  name: 'material',
  initialState: {
    items: [],
    selectedMaterial: null,
    historial: null,
    estadisticas: null,
    alertas: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    },
    loading: false,
    error: null
  },
  reducers: {
    clearSelectedMaterial: (state) => {
      state.selectedMaterial = null
      state.historial = null
    },
    clearError: (state) => {
      state.error = null
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchMaterial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaterial.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.material
        state.pagination = action.payload.pagination
      })
      .addCase(fetchMaterial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al obtener material'
      })

      // Fetch Estadísticas
      .addCase(fetchMaterialEstadisticas.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaterialEstadisticas.fulfilled, (state, action) => {
        state.loading = false
        state.estadisticas = action.payload
      })
      .addCase(fetchMaterialEstadisticas.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al obtener estadísticas'
      })

      // Fetch Alertas
      .addCase(fetchMaterialAlertas.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaterialAlertas.fulfilled, (state, action) => {
        state.loading = false
        state.alertas = action.payload
      })
      .addCase(fetchMaterialAlertas.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al obtener alertas'
      })

      // Fetch By ID
      .addCase(fetchMaterialById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaterialById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedMaterial = action.payload
      })
      .addCase(fetchMaterialById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al obtener material'
      })

      // Fetch Historial
      .addCase(fetchMaterialHistorial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMaterialHistorial.fulfilled, (state, action) => {
        state.loading = false
        state.historial = action.payload
      })
      .addCase(fetchMaterialHistorial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al obtener historial'
      })

      // Create
      .addCase(createMaterial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        state.pagination.total += 1
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al crear material'
      })

      // Update
      .addCase(updateMaterial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        state.loading = false
        state.selectedMaterial = action.payload
        const index = state.items.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al actualizar material'
      })

      // Delete (soft)
      .addCase(deleteMaterial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(m => m.id !== action.payload.id)
        state.pagination.total -= 1
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al desactivar material'
      })

      // Asignar
      .addCase(asignarMaterial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(asignarMaterial.fulfilled, (state, action) => {
        state.loading = false
        // Actualizar el material en la lista
        const index = state.items.findIndex(m => m.id === action.payload.materialId)
        if (index !== -1) {
          // Agregar la asignación al material
          if (!state.items[index].asignaciones) {
            state.items[index].asignaciones = []
          }
          state.items[index].asignaciones.push(action.payload)
        }
      })
      .addCase(asignarMaterial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al asignar material'
      })

      // Devolver
      .addCase(devolverMaterial.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(devolverMaterial.fulfilled, (state, action) => {
        state.loading = false
        // Actualizar el material en la lista
        const materialId = action.payload.materialId
        const index = state.items.findIndex(m => m.id === materialId)
        if (index !== -1 && state.items[index].asignaciones) {
          // Marcar la asignación como inactiva
          const asigIndex = state.items[index].asignaciones.findIndex(
            a => a.id === action.payload.id
          )
          if (asigIndex !== -1) {
            state.items[index].asignaciones[asigIndex] = action.payload
          }
        }
      })
      .addCase(devolverMaterial.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al devolver material'
      })
  }
})

export const { clearSelectedMaterial, clearError, setPage } = materialSlice.actions
export default materialSlice.reducer
