import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  Stack
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonChecked as ActiveIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'
import { fetchHistorialCargo, clearHistorial } from '../../store/slices/cargosSlice'

const HistorialCargoDialog = ({ open, onClose, cargo }) => {
  const dispatch = useDispatch()
  const { historial, loading } = useSelector((state) => state.cargos)

  useEffect(() => {
    if (open && cargo) {
      dispatch(fetchHistorialCargo(cargo.id))
    }

    return () => {
      dispatch(clearHistorial())
    }
  }, [open, cargo, dispatch])

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const calcularDuracion = (inicio, fin) => {
    const start = new Date(inicio)
    const end = fin ? new Date(fin) : new Date()
    const meses = Math.floor((end - start) / (1000 * 60 * 60 * 24 * 30))
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Historial del Cargo: {cargo?.nombre}
      </DialogTitle>
      <DialogContent>
        {loading === 'pending' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : historial && historial.length > 0 ? (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {historial.map((asignacion, index) => (
              <Paper 
                key={asignacion.id} 
                elevation={asignacion.activo ? 6 : 2} 
                sx={{ 
                  p: 3,
                  border: asignacion.activo ? '2px solid' : 'none',
                  borderColor: 'primary.main',
                  position: 'relative'
                }}
              >
                {/* Indicador de estado */}
                <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                  {asignacion.activo ? (
                    <ActiveIcon color="primary" sx={{ fontSize: 32 }} />
                  ) : (
                    <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                  )}
                </Box>

                {/* Información del bombero */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={asignacion.bombero?.fotoUrl}
                    alt={`${asignacion.bombero?.nombres} ${asignacion.bombero?.apellidos}`}
                    sx={{ width: 60, height: 60 }}
                  />
                  <Box>
                    <Typography variant="h6" component="div">
                      {asignacion.bombero?.nombres} {asignacion.bombero?.apellidos}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {asignacion.bombero?.rango}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Fechas y duración */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Inicio:</strong> {formatFecha(asignacion.fechaInicio)}
                    </Typography>
                  </Box>
                  {asignacion.fechaFin && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Fin:</strong> {formatFecha(asignacion.fechaFin)}
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    <strong>Duración:</strong> {calcularDuracion(asignacion.fechaInicio, asignacion.fechaFin)}
                  </Typography>
                </Box>

                {/* Chips de estado */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={asignacion.activo ? 'Asignación Actual' : 'Finalizado'}
                    color={asignacion.activo ? 'success' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={`Período ${asignacion.periodoAnio}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </Box>

                {/* Observaciones */}
                {asignacion.observaciones && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Observaciones:
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      {asignacion.observaciones}
                    </Typography>
                  </Box>
                )}

                {index < historial.length - 1 && (
                  <Divider sx={{ mt: 3, display: { xs: 'block', sm: 'none' } }} />
                )}
              </Paper>
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay historial de asignaciones para este cargo
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}

export default HistorialCargoDialog
