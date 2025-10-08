import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  oficiales: [],
  loading: false,
  error: null,
  selectedOficial: null,
}

const oficialesSlice = createSlice({
  name: 'oficiales',
  initialState,
  reducers: {
    fetchOficialesStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchOficialesSuccess: (state, action) => {
      state.loading = false
      state.oficiales = action.payload
      state.error = null
    },
    fetchOficialesFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
    },
    addOficialSuccess: (state, action) => {
      state.oficiales.push(action.payload)
    },
    updateOficialSuccess: (state, action) => {
      const index = state.oficiales.findIndex(o => o.id === action.payload.id)
      if (index !== -1) {
        state.oficiales[index] = action.payload
      }
    },
    deleteOficialSuccess: (state, action) => {
      state.oficiales = state.oficiales.filter(o => o.id !== action.payload)
    },
    selectOficial: (state, action) => {
      state.selectedOficial = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchOficialesStart,
  fetchOficialesSuccess,
  fetchOficialesFailure,
  addOficialSuccess,
  updateOficialSuccess,
  deleteOficialSuccess,
  selectOficial,
  clearError,
} = oficialesSlice.actions

export default oficialesSlice.reducer