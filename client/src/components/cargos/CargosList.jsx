import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Grid,
  Typography,
  Avatar,
  Button,
  Chip,
  IconButton,
  Divider,
  Alert
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  History as HistoryIcon,
  PersonOff as PersonOffIcon,
  AccountBox as AccountBoxIcon
} from '@mui/icons-material'
import {
  fetchCargos,
  clearError,
  clearSuccessMessage
} from '../../store/slices/cargosSlice'
import AsignarCargoDialog from './AsignarCargoDialog'
import HistorialCargoDialog from './HistorialCargoDialog'
import LiberarCargoDialog from './LiberarCargoDialog'

const CargosList = () => {
  const dispatch = useDispatch()
  const { cargosPorRama, loading, error, successMessage } = useSelector((state) => state.cargos)
  
  const [asignarDialogOpen, setAsignarDialogOpen] = useState(false)
  const [historialDialogOpen, setHistorialDialogOpen] = useState(false)
  const [liberarDialogOpen, setLiberarDialogOpen] = useState(false)
  const [cargoSeleccionado, setCargoSeleccionado] = useState(null)

  console.log('🔍 CargosList - cargosPorRama:', cargosPorRama)
  console.log('🔍 CargosList - loading:', loading)

  useEffect(() => {
    dispatch(fetchCargos())
  }, [dispatch])

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearSuccessMessage())
        dispatch(fetchCargos()) // Refrescar la lista
      }, 2000)
    }
  }, [successMessage, dispatch])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  const handleAsignarClick = (cargo) => {
    setCargoSeleccionado(cargo)
    setAsignarDialogOpen(true)
  }

  const handleLiberarClick = (cargo) => {
    setCargoSeleccionado(cargo)
    setLiberarDialogOpen(true)
  }

  const handleHistorialClick = (cargo) => {
    setCargoSeleccionado(cargo)
    setHistorialDialogOpen(true)
  }

  const renderCargo = (cargo) => {
    const asignacionActiva = cargo.asignaciones && cargo.asignaciones.length > 0 
      ? cargo.asignaciones.find(a => a.activo) 
      : null
    const bombero = asignacionActiva?.bombero

    return (
      <Grid item xs={12} sm={6} md={4} key={cargo.id}>
        <Card 
          elevation={3}
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': { boxShadow: 6 }
          }}
        >
          <CardHeader
            title={cargo.nombre}
            subheader={cargo.descripcion}
            titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
            sx={{ pb: 1 }}
          />
          <Divider />
          <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 3 }}>
            {bombero ? (
              <Box>
                <Avatar
                  src={bombero.fotoUrl || '/assets/bomberos/default.jpg'}
                  alt={`${bombero.nombres} ${bombero.apellidos}`}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    margin: '0 auto 16px',
                    border: '3px solid #1976d2'
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {bombero.nombres} {bombero.apellidos}
                </Typography>
                <Chip 
                  label={bombero.rango} 
                  color="primary" 
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" display="block" color="text.secondary">
                  Período {asignacionActiva.periodoAnio}
                </Typography>
              </Box>
            ) : (
              <Box>
                <AccountBoxIcon 
                  sx={{ 
                    fontSize: 100, 
                    color: 'grey.400',
                    mb: 2
                  }} 
                />
                <Typography variant="h6" color="text.secondary">
                  Sin Asignar
                </Typography>
                <Chip 
                  label="Vacante" 
                  color="default" 
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            )}
          </CardContent>
          <Divider />
          <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
            {bombero ? (
              <Button
                size="small"
                startIcon={<PersonOffIcon />}
                onClick={() => handleLiberarClick(cargo)}
                color="warning"
              >
                Liberar
              </Button>
            ) : (
              <Button
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => handleAsignarClick(cargo)}
                color="primary"
                variant="contained"
              >
                Asignar
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => handleHistorialClick(cargo)}
              color="info"
              title="Ver historial"
            >
              <HistoryIcon />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    )
  }

  const renderRama = (titulo, icono, cargos) => {
    if (!cargos || cargos.length === 0) return null

    return (
      <Box mb={4}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icono} <Box ml={1}>{titulo}</Box>
        </Typography>
        <Grid container spacing={3}>
          {cargos.map(renderCargo)}
        </Grid>
      </Box>
    )
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => dispatch(clearSuccessMessage())}>
          {successMessage}
        </Alert>
      )}

      {loading === 'pending' ? (
        <Typography>Cargando cargos...</Typography>
      ) : (
        <>
          {renderRama('🏛️ Rama Administrativa', '🏛️', cargosPorRama.ADMINISTRATIVA)}
          {renderRama('🚒 Rama Operativa', '🚒', cargosPorRama.OPERATIVA)}
          {renderRama('⚖️ Consejos de Disciplina', '⚖️', cargosPorRama.CONSEJOS)}
        </>
      )}

      {/* Diálogos */}
      <AsignarCargoDialog
        open={asignarDialogOpen}
        onClose={() => setAsignarDialogOpen(false)}
        cargo={cargoSeleccionado}
      />
      
      <HistorialCargoDialog
        open={historialDialogOpen}
        onClose={() => setHistorialDialogOpen(false)}
        cargo={cargoSeleccionado}
      />

      <LiberarCargoDialog
        open={liberarDialogOpen}
        onClose={() => setLiberarDialogOpen(false)}
        cargo={cargoSeleccionado}
      />
    </Box>
  )
}

export default CargosList
