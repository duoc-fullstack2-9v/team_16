import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { guardiasAPI } from '../../services/api'

const initialState = {
  guardias: [],
  selectedGuardiaId: null,
  bomberos: [],
  plantillas: [],
  loading: false,
  savingDay: false,
  exporting: false,
  loadingPlantillas: false,
  savingPlantilla: false,
  aplicandoPlantilla: false,
  error: null,
}

export const fetchGuardiasMensuales = createAsyncThunk(
  'guardias/fetchMensuales',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.getMensuales(params)
      return response.data?.data || []
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible obtener las guardias nocturnas')
    }
  }
)

export const fetchGuardiaMensualById = createAsyncThunk(
  'guardias/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.getMensualById(id)
      return response.data?.data
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible cargar la guardia nocturna solicitada')
    }
  }
)

export const createGuardiaMensual = createAsyncThunk(
  'guardias/createMensual',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.createMensual(payload)
      return {
        ...response.data?.data,
        dias: [],
      }
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible crear la guardia nocturna')
    }
  }
)

export const updateGuardiaMensual = createAsyncThunk(
  'guardias/updateMensual',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.updateMensual(id, data)
      return response.data?.data
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible actualizar la guardia nocturna')
    }
  }
)

export const deleteGuardiaMensual = createAsyncThunk(
  'guardias/deleteMensual',
  async (id, { rejectWithValue }) => {
    try {
      await guardiasAPI.deleteMensual(id)
      return id
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible eliminar la guardia nocturna')
    }
  }
)

export const saveGuardiaDia = createAsyncThunk(
  'guardias/saveDia',
  async ({ guardiaId, data }, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.saveDia(guardiaId, data)
      return { guardiaId, dia: response.data?.data }
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible guardar la guardia diaria')
    }
  }
)

export const deleteGuardiaDia = createAsyncThunk(
  'guardias/deleteDia',
  async ({ guardiaId, diaId }, { rejectWithValue }) => {
    try {
      await guardiasAPI.deleteDia(diaId)
      return { guardiaId, diaId }
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible eliminar la guardia diaria')
    }
  }
)

export const fetchGuardiaBomberos = createAsyncThunk(
  'guardias/fetchBomberos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.getBomberos()
      return response.data?.data || []
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible cargar los bomberos disponibles')
    }
  }
)

export const exportGuardiaMensualPdf = createAsyncThunk(
  'guardias/exportPdf',
  async ({ guardiaId, fileName }, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.exportPdf(guardiaId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || `guardia_nocturna_${guardiaId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      return true
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible exportar la guardia nocturna a PDF')
    }
  }
)

// ============================================
// THUNKS PARA PLANTILLAS
// ============================================

export const fetchPlantillas = createAsyncThunk(
  'guardias/fetchPlantillas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.getPlantillas()
      return response.data?.data || []
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible cargar las plantillas')
    }
  }
)

export const createPlantilla = createAsyncThunk(
  'guardias/createPlantilla',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.createPlantilla(payload)
      return response.data?.data
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible crear la plantilla')
    }
  }
)

export const updatePlantilla = createAsyncThunk(
  'guardias/updatePlantilla',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.updatePlantilla(id, data)
      return response.data?.data
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible actualizar la plantilla')
    }
  }
)

export const deletePlantilla = createAsyncThunk(
  'guardias/deletePlantilla',
  async (id, { rejectWithValue }) => {
    try {
      await guardiasAPI.deletePlantilla(id)
      return id
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible eliminar la plantilla')
    }
  }
)

export const aplicarPlantilla = createAsyncThunk(
  'guardias/aplicarPlantilla',
  async ({ guardiaId, plantillaId }, { rejectWithValue }) => {
    try {
      const response = await guardiasAPI.aplicarPlantilla(guardiaId, plantillaId)
      return response.data?.data
    } catch (error) {
      return rejectWithValue(error?.message || 'No fue posible aplicar la plantilla')
    }
  }
)

const guardiasSlice = createSlice({
  name: 'guardias',
  initialState,
  reducers: {
    setSelectedGuardiaId(state, action) {
      state.selectedGuardiaId = action.payload
    },
    clearGuardiasState() {
      return initialState
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuardiasMensuales.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGuardiasMensuales.fulfilled, (state, action) => {
        state.loading = false
        state.guardias = action.payload.map((guardia) => ({
          ...guardia,
          dias: guardia.dias || [],
        }))

        if (state.guardias.length === 0) {
          state.selectedGuardiaId = null
        } else if (!state.selectedGuardiaId || !state.guardias.some((g) => g.id === state.selectedGuardiaId)) {
          state.selectedGuardiaId = state.guardias[0].id
        }
      })
      .addCase(fetchGuardiasMensuales.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al obtener las guardias nocturnas'
      })
      .addCase(fetchGuardiaMensualById.fulfilled, (state, action) => {
        if (!action.payload) return
        const index = state.guardias.findIndex((g) => g.id === action.payload.id)
        const payload = {
          ...action.payload,
          dias: action.payload.dias || [],
        }

        if (index >= 0) {
          state.guardias[index] = payload
        } else {
          state.guardias.push(payload)
        }
        state.selectedGuardiaId = payload.id
      })
      .addCase(createGuardiaMensual.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createGuardiaMensual.fulfilled, (state, action) => {
        state.loading = false
        const guardia = {
          ...action.payload,
          dias: action.payload?.dias || [],
        }
        state.guardias.push(guardia)
        state.selectedGuardiaId = guardia.id
      })
      .addCase(createGuardiaMensual.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al crear la guardia nocturna'
      })
      .addCase(updateGuardiaMensual.fulfilled, (state, action) => {
        const index = state.guardias.findIndex((g) => g.id === action.payload.id)
        if (index >= 0) {
          state.guardias[index] = {
            ...state.guardias[index],
            ...action.payload,
          }
        }
      })
      .addCase(deleteGuardiaMensual.fulfilled, (state, action) => {
        state.guardias = state.guardias.filter((g) => g.id !== action.payload)
        if (state.selectedGuardiaId === action.payload) {
          state.selectedGuardiaId = state.guardias[0]?.id || null
        }
      })
      .addCase(saveGuardiaDia.pending, (state) => {
        state.savingDay = true
        state.error = null
      })
      .addCase(saveGuardiaDia.fulfilled, (state, action) => {
        state.savingDay = false
        const guardia = state.guardias.find((g) => g.id === action.payload.guardiaId)
        if (!guardia) return

        const existingIndex = guardia.dias.findIndex((dia) => dia.id === action.payload.dia.id)
        if (existingIndex >= 0) {
          guardia.dias[existingIndex] = action.payload.dia
        } else {
          guardia.dias.push(action.payload.dia)
          guardia.dias.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        }
      })
      .addCase(saveGuardiaDia.rejected, (state, action) => {
        state.savingDay = false
        state.error = action.payload || 'Error al guardar la guardia diaria'
      })
      .addCase(deleteGuardiaDia.fulfilled, (state, action) => {
        const guardia = state.guardias.find((g) => g.id === action.payload.guardiaId)
        if (!guardia) return
        guardia.dias = guardia.dias.filter((dia) => dia.id !== action.payload.diaId)
      })
      .addCase(fetchGuardiaBomberos.fulfilled, (state, action) => {
        state.bomberos = action.payload
      })
      .addCase(exportGuardiaMensualPdf.pending, (state) => {
        state.exporting = true
      })
      .addCase(exportGuardiaMensualPdf.fulfilled, (state) => {
        state.exporting = false
      })
      .addCase(exportGuardiaMensualPdf.rejected, (state, action) => {
        state.exporting = false
        state.error = action.payload || 'Error al exportar la guardia nocturna'
      })
      // Plantillas
      .addCase(fetchPlantillas.pending, (state) => {
        state.loadingPlantillas = true
      })
      .addCase(fetchPlantillas.fulfilled, (state, action) => {
        state.loadingPlantillas = false
        state.plantillas = action.payload
      })
      .addCase(fetchPlantillas.rejected, (state, action) => {
        state.loadingPlantillas = false
        state.error = action.payload || 'Error al cargar plantillas'
      })
      .addCase(createPlantilla.pending, (state) => {
        state.savingPlantilla = true
        state.error = null
      })
      .addCase(createPlantilla.fulfilled, (state, action) => {
        state.savingPlantilla = false
        state.plantillas.push(action.payload)
      })
      .addCase(createPlantilla.rejected, (state, action) => {
        state.savingPlantilla = false
        state.error = action.payload || 'Error al crear plantilla'
      })
      .addCase(updatePlantilla.fulfilled, (state, action) => {
        const index = state.plantillas.findIndex((p) => p.id === action.payload.id)
        if (index >= 0) {
          state.plantillas[index] = { ...state.plantillas[index], ...action.payload }
        }
      })
      .addCase(deletePlantilla.fulfilled, (state, action) => {
        state.plantillas = state.plantillas.filter((p) => p.id !== action.payload)
      })
      .addCase(aplicarPlantilla.pending, (state) => {
        state.aplicandoPlantilla = true
        state.error = null
      })
      .addCase(aplicarPlantilla.fulfilled, (state, action) => {
        state.aplicandoPlantilla = false
        if (!action.payload) return
        const index = state.guardias.findIndex((g) => g.id === action.payload.id)
        const payload = {
          ...action.payload,
          dias: action.payload.dias || [],
        }
        if (index >= 0) {
          state.guardias[index] = payload
        }
      })
      .addCase(aplicarPlantilla.rejected, (state, action) => {
        state.aplicandoPlantilla = false
        state.error = action.payload || 'Error al aplicar plantilla'
      })
  }
})

export const { setSelectedGuardiaId, clearGuardiasState } = guardiasSlice.actions
export default guardiasSlice.reducer
