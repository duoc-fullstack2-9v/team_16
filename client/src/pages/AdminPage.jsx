import React from 'react'
import { Box, Typography, Alert } from '@mui/material'
import { useSelector } from 'react-redux'

const AdminPage = () => {
  const { user } = useSelector((state) => state.auth)

  if (user?.tipo !== 'admin') {
    return (
      <Box>
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Acceso Denegado:</strong> Esta sección requiere permisos de administrador.
          </Typography>
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ⚙️ Panel Administrativo
      </Typography>
      
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          Esta página será desarrollada en la <strong>Fase 4</strong> con toda la funcionalidad administrativa avanzada.
        </Typography>
      </Alert>
    </Box>
  )
}

export default AdminPage