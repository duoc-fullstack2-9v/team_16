import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box } from '@mui/material'

import { checkAuthToken } from './store/slices/authSlice'

// Pages (por ahora crearemos versiones temporales)
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BomberosPage from './pages/BomberosPage'
import CitacionesPage from './pages/CitacionesPage'
import OficialesPage from './pages/OficialesPage'
import AdminPage from './pages/AdminPage'
import MaterialMenorPage from './pages/MaterialMenorPage'
import MaterialMayorPage from './pages/MaterialMayorPage'
import GuardiasPage from './pages/GuardiasPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  const dispatch = useDispatch()

  // Verificar token al cargar la aplicación
  useEffect(() => {
    dispatch(checkAuthToken())
  }, [dispatch])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        {/* Ruta pública - Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Dashboard principal */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Módulos principales */}
          <Route path="bomberos" element={<BomberosPage />} />
          <Route path="citaciones" element={<CitacionesPage />} />
          <Route path="oficiales" element={<OficialesPage />} />
          <Route path="material" element={<MaterialMenorPage />} />
          <Route path="material-mayor" element={<MaterialMayorPage />} />
          <Route path="guardias" element={<GuardiasPage />} />
          
          {/* Panel administrativo */}
          <Route path="admin" element={<AdminPage />} />
        </Route>
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Box>
  )
}

export default App