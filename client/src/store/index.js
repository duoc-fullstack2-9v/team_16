import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice.js'
import bomberosSlice from './slices/bomberosSlice.js'
import citacionesSlice from './slices/citacionesSlice.js'
import oficialesSlice from '../features/oficiales/oficialesSlice.js'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    bomberos: bomberosSlice,
    citaciones: citacionesSlice,
    oficiales: oficialesSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export default store