import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// ==================== ASYNC THUNKS ====================

// Obtener todas las categorías
export const fetchCategorias = createAsyncThunk(
  'categorias/fetchAll',
  async ({ flat = false, includeInactive = false } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/categorias', {
        params: { flat, includeInactive }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener categorías' })
    }
  }
)

// Obtener estadísticas de categorías
export const fetchCategoriasEstadisticas = createAsyncThunk(
  'categorias/fetchEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categorias/estadisticas')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener estadísticas' })
    }
  }
)

// Obtener una categoría por ID
export const fetchCategoriaById = createAsyncThunk(
  'categorias/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/categorias/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al obtener categoría' })
    }
  }
)

// Crear nueva categoría
export const createCategoria = createAsyncThunk(
  'categorias/create',
  async (categoriaData, { rejectWithValue }) => {
    try {
      const response = await api.post('/categorias', categoriaData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al crear categoría' })
    }
  }
)

// Actualizar categoría
export const updateCategoria = createAsyncThunk(
  'categorias/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categorias/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al actualizar categoría' })
    }
  }
)

// Desactivar categoría (soft delete)
export const deleteCategoria = createAsyncThunk(
  'categorias/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/categorias/${id}`)
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al desactivar categoría' })
    }
  }
)

// Reactivar categoría
export const reactivateCategoria = createAsyncThunk(
  'categorias/reactivate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/categorias/${id}/reactivar`)
      return response.data.categoria
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Error al reactivar categoría' })
    }
  }
)

// ==================== SLICE ====================

const categoriasSlice = createSlice({
  name: 'categorias',
  initialState: {
    items: [],
    selectedCategoria: null,
    estadisticas: null,
    loading: false,
    error: null
  },
  reducers: {
    clearSelectedCategoria: (state) => {
      state.selectedCategoria = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchCategorias.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al obtener categorías'
      })

      // Fetch Estadísticas
      .addCase(fetchCategoriasEstadisticas.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategoriasEstadisticas.fulfilled, (state, action) => {
        state.loading = false
        state.estadisticas = action.payload
      })
      .addCase(fetchCategoriasEstadisticas.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al obtener estadísticas'
      })

      // Fetch By ID
      .addCase(fetchCategoriaById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategoriaById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedCategoria = action.payload
      })
      .addCase(fetchCategoriaById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al obtener categoría'
      })

      // Create
      .addCase(createCategoria.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCategoria.fulfilled, (state, action) => {
        state.loading = false
        // Si es categoría raíz o lista plana, agregarla
        if (!action.payload.parentId) {
          state.items.push(action.payload)
        } else {
          // Si tiene parent, actualizar la estructura jerárquica
          // (idealmente recargar categorías)
          state.items = [...state.items]
        }
      })
      .addCase(createCategoria.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al crear categoría'
      })

      // Update
      .addCase(updateCategoria.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategoria.fulfilled, (state, action) => {
        state.loading = false
        state.selectedCategoria = action.payload
        // Actualizar en la lista (simplificado - idealmente recargar)
        const index = state.items.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateCategoria.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al actualizar categoría'
      })

      // Delete (soft)
      .addCase(deleteCategoria.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCategoria.fulfilled, (state, action) => {
        state.loading = false
        // Remover de la lista (si no se incluyen inactivas)
        state.items = state.items.filter(c => c.id !== action.payload.id)
      })
      .addCase(deleteCategoria.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al desactivar categoría'
      })

      // Reactivate
      .addCase(reactivateCategoria.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(reactivateCategoria.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(reactivateCategoria.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.error || 'Error al reactivar categoría'
      })
  }
})

export const { clearSelectedCategoria, clearError } = categoriasSlice.actions
export default categoriasSlice.reducer
