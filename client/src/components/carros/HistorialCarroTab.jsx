import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Chip
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab'
import {
  Build as MantencionIcon,
  Edit as EditIcon,
  AddCircle as CreateIcon,
  Delete as DeleteIcon,
  History as HistorialIcon
} from '@mui/icons-material'
import { fetchCarros, fetchHistorial } from '../../store/slices/carrosSlice'

function HistorialCarroTab() {
  const dispatch = useDispatch()
  const { carros, historial, loading } = useSelector((state) => state.carros)

  const [selectedCarroId, setSelectedCarroId] = useState('')

  useEffect(() => {
    dispatch(fetchCarros({ page: 1, limit: 100 }))
  }, [dispatch])

  useEffect(() => {
    if (selectedCarroId) {
      dispatch(fetchHistorial({ carroId: selectedCarroId, limit: 50 }))
    }
  }, [dispatch, selectedCarroId])

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'CREACION':
        return <CreateIcon />
      case 'ACTUALIZACION':
        return <EditIcon />
      case 'ELIMINACION':
        return <DeleteIcon />
      case 'MANTENCION':
        return <MantencionIcon />
      default:
        return <HistorialIcon />
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'CREACION':
        return 'success'
      case 'ACTUALIZACION':
        return 'info'
      case 'ELIMINACION':
        return 'error'
      case 'MANTENCION':
        return 'warning'
      default:
        return 'default'
    }
  }

  const selectedCarro = carros.find(c => c.id === parseInt(selectedCarroId))

  return (
    <Box>
      {/* Selector de Carro */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <HistorialIcon color="primary" sx={{ fontSize: 32 }} />
          <TextField
            label="Seleccionar Carro"
            select
            fullWidth
            value={selectedCarroId}
            onChange={(e) => setSelectedCarroId(e.target.value)}
            helperText="Selecciona un carro para ver su historial de eventos"
          >
            <MenuItem value="">-- Selecciona un carro --</MenuItem>
            {carros.map((carro) => (
              <MenuItem key={carro.id} value={carro.id}>
                {carro.nombre} - {carro.patente}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Contenido */}
      {!selectedCarroId ? (
        <Alert severity="info">
          Selecciona un carro para ver su historial completo de cambios y eventos
        </Alert>
      ) : loading.historial ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : historial.length === 0 ? (
        <Alert severity="info">
          No hay registros en el historial de este carro
        </Alert>
      ) : (
        <>
          {/* Resumen */}
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'primary.lighter' }}>
            <Typography variant="h6" gutterBottom>
              Historial de {selectedCarro?.nombre || 'Carro'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {historial.length} eventos registrados
            </Typography>
          </Paper>

          {/* Timeline */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Timeline position="right">
              {historial.map((evento, index) => (
                <TimelineItem key={evento.id}>
                  <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                    <Typography variant="body2">
                      {new Date(evento.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption">
                      {new Date(evento.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TimelineOppositeContent>

                  <TimelineSeparator>
                    <TimelineDot color={getTipoColor(evento.tipo)} variant="outlined">
                      {getTipoIcon(evento.tipo)}
                    </TimelineDot>
                    {index < historial.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>

                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={evento.tipo}
                            color={getTipoColor(evento.tipo)}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            por {evento.usuario?.nombre || 'Sistema'}
                          </Typography>
                        </Box>

                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {evento.descripcion}
                        </Typography>

                        {evento.detalles && (
                          <Box
                            sx={{
                              p: 1,
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Detalles:
                            </Typography>
                            <Typography variant="body2">
                              {typeof evento.detalles === 'string'
                                ? evento.detalles
                                : JSON.stringify(evento.detalles, null, 2)}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </>
      )}
    </Box>
  )
}

export default HistorialCarroTab
