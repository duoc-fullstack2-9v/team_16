import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// ========================
// ASYNC THUNKS
// ========================

/**
 * Obtener tipos de licencia
 */
export const fetchTiposLicencia = createAsyncThunk(
  'licencias/fetchTiposLicencia',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.get(`${API_URL}/licencias/tipos-licencia`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al obtener tipos de licencia'
      );
    }
  }
);

/**
 * Crear tipo de licencia personalizado (admin)
 */
export const createTipoLicencia = createAsyncThunk(
  'licencias/createTipoLicencia',
  async (datos, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.post(`${API_URL}/licencias/tipos-licencia`, datos, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al crear tipo de licencia'
      );
    }
  }
);

/**
 * Obtener licencias con filtros
 */
export const fetchLicencias = createAsyncThunk(
  'licencias/fetchLicencias',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.get(`${API_URL}/licencias`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al obtener licencias'
      );
    }
  }
);

/**
 * Obtener estadísticas de licencias
 */
export const fetchEstadisticas = createAsyncThunk(
  'licencias/fetchEstadisticas',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.get(`${API_URL}/licencias/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al obtener estadísticas'
      );
    }
  }
);

/**
 * Obtener detalle de una licencia
 */
export const fetchLicenciaById = createAsyncThunk(
  'licencias/fetchLicenciaById',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.get(`${API_URL}/licencias/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al obtener licencia'
      );
    }
  }
);

/**
 * Crear nueva licencia
 */
export const createLicencia = createAsyncThunk(
  'licencias/createLicencia',
  async (datos, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.post(`${API_URL}/licencias`, datos, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al crear licencia'
      );
    }
  }
);

/**
 * Actualizar licencia (solo si está pendiente)
 */
export const updateLicencia = createAsyncThunk(
  'licencias/updateLicencia',
  async ({ id, datos }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.put(`${API_URL}/licencias/${id}`, datos, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al actualizar licencia'
      );
    }
  }
);

/**
 * Cancelar licencia (cambiar estado a Cancelada)
 */
export const cancelLicencia = createAsyncThunk(
  'licencias/cancelLicencia',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.delete(`${API_URL}/licencias/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al cancelar licencia'
      );
    }
  }
);

/**
 * Aprobar licencia (admin)
 */
export const aprobarLicencia = createAsyncThunk(
  'licencias/aprobarLicencia',
  async ({ id, observacionesAdmin }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.post(
        `${API_URL}/licencias/${id}/aprobar`,
        { observacionesAdmin },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al aprobar licencia'
      );
    }
  }
);

/**
 * Rechazar licencia (admin)
 */
export const rechazarLicencia = createAsyncThunk(
  'licencias/rechazarLicencia',
  async ({ id, observacionesAdmin }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('bomberosToken');
      const response = await axios.post(
        `${API_URL}/licencias/${id}/rechazar`,
        { observacionesAdmin },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.mensaje || 'Error al rechazar licencia'
      );
    }
  }
);

// ========================
// SLICE
// ========================

const licenciasSlice = createSlice({
  name: 'licencias',
  initialState: {
    licencias: [],
    licenciaActual: null,
    tiposLicencia: [],
    estadisticas: null,
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
    total: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLicenciaActual: (state) => {
      state.licenciaActual = null;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Tipos de licencia
    builder
      .addCase(fetchTiposLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTiposLicencia.fulfilled, (state, action) => {
        state.loading = false;
        state.tiposLicencia = action.payload;
      })
      .addCase(fetchTiposLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Crear tipo de licencia
    builder
      .addCase(createTipoLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTipoLicencia.fulfilled, (state, action) => {
        state.loading = false;
        state.tiposLicencia.push(action.payload);
      })
      .addCase(createTipoLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch licencias
    builder
      .addCase(fetchLicencias.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLicencias.fulfilled, (state, action) => {
        state.loading = false;
        state.licencias = action.payload.licencias;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchLicencias.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch estadísticas
    builder
      .addCase(fetchEstadisticas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEstadisticas.fulfilled, (state, action) => {
        state.loading = false;
        state.estadisticas = action.payload;
      })
      .addCase(fetchEstadisticas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch licencia por ID
    builder
      .addCase(fetchLicenciaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLicenciaById.fulfilled, (state, action) => {
        state.loading = false;
        state.licenciaActual = action.payload;
      })
      .addCase(fetchLicenciaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Crear licencia
    builder
      .addCase(createLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLicencia.fulfilled, (state, action) => {
        state.loading = false;
        state.licencias.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Actualizar licencia
    builder
      .addCase(updateLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLicencia.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.licencias.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.licencias[index] = action.payload;
        }
        if (state.licenciaActual?.id === action.payload.id) {
          state.licenciaActual = action.payload;
        }
      })
      .addCase(updateLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Cancelar licencia
    builder
      .addCase(cancelLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelLicencia.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.licencias.findIndex(
          (l) => l.id === action.payload.licencia.id
        );
        if (index !== -1) {
          state.licencias[index] = action.payload.licencia;
        }
      })
      .addCase(cancelLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Aprobar licencia
    builder
      .addCase(aprobarLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(aprobarLicencia.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.licencias.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.licencias[index] = action.payload;
        }
        if (state.licenciaActual?.id === action.payload.id) {
          state.licenciaActual = action.payload;
        }
      })
      .addCase(aprobarLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Rechazar licencia
    builder
      .addCase(rechazarLicencia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rechazarLicencia.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.licencias.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.licencias[index] = action.payload;
        }
        if (state.licenciaActual?.id === action.payload.id) {
          state.licenciaActual = action.payload;
        }
      })
      .addCase(rechazarLicencia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearLicenciaActual, setPage } = licenciasSlice.actions;

export default licenciasSlice.reducer;
