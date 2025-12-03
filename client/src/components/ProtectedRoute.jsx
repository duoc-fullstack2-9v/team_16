import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Box, CircularProgress } from '@mui/material'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth)

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si está autenticado, mostrar el contenido protegido
  return children
}

export default ProtectedRoute