import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice.js'
import bomberosSlice from './slices/bomberosSlice.js'
import citacionesSlice from './slices/citacionesSlice.js'
import cargosSlice from './slices/cargosSlice.js'
import categoriasSlice from './slices/categoriasSlice.js'
import materialSlice from './slices/materialSlice.js'
import carrosSlice from './slices/carrosSlice.js'
import guardiasSlice from './slices/guardiasSlice.js'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    bomberos: bomberosSlice,
    citaciones: citacionesSlice,
    cargos: cargosSlice,
    categorias: categoriasSlice,
    material: materialSlice,
    carros: carrosSlice,
    guardias: guardiasSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones específicas que pueden contener valores no serializables
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'bomberos/fetchStats/fulfilled',
          'bomberos/fetchBomberos/fulfilled',
        ],
        // Ignorar paths específicos en el estado
        ignoredActionPaths: ['payload.headers', 'payload.config', 'payload.request'],
        ignoredPaths: ['payload.headers', 'payload.config', 'payload.request'],
      },
    }),
})

export default store