import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  Paper,
  Chip
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Help,
  Save
} from '@mui/icons-material'

const ControlAsistencia = ({
  open,
  onClose,
  citacion = null,
  onUpdateAsistencia,
  loading = false,
  error = null
}) => {
  const [asistencias, setAsistencias] = useState({})
  const [observaciones, setObservaciones] = useState({})

  // Inicializar datos de asistencia
  useEffect(() => {
    if (open && citacion?.bomberos) {
      const initialAsistencias = {}
      const initialObservaciones = {}
      
      citacion.bomberos.forEach(bc => {
        initialAsistencias[bc.bombero.id] = bc.asistio
        initialObservaciones[bc.bombero.id] = bc.observaciones || ''
      })
      
      setAsistencias(initialAsistencias)
      setObservaciones(initialObservaciones)
    }
  }, [open, citacion])

  const handleAsistenciaChange = (bomberoId, value) => {
    setAsistencias(prev => ({
      ...prev,
      [bomberoId]: value === 'true' ? true : value === 'false' ? false : null
    }))
  }

  const handleObservacionChange = (bomberoId, value) => {
    setObservaciones(prev => ({
      ...prev,
      [bomberoId]: value
    }))
  }

  const handleSaveAsistencia = async (bomberoId) => {
    const asistio = asistencias[bomberoId]
    const observacion = observaciones[bomberoId]
    
    await onUpdateAsistencia({
      citacionId: citacion.id,
      bomberoId,
      asistio,
      observaciones: observacion
    })
  }

  const handleSaveAll = async () => {
    const bomberos = citacion?.bomberos || []
    
    for (const bc of bomberos) {
      const bomberoId = bc.bombero.id
      const asistio = asistencias[bomberoId]
      const observacion = observaciones[bomberoId]
      
      // Solo actualizar si hay cambios
      if (asistio !== bc.asistio || observacion !== (bc.observaciones || '')) {
        await onUpdateAsistencia({
          citacionId: citacion.id,
          bomberoId,
          asistio,
          observaciones: observacion
        })
      }
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const getAsistenciaIcon = (asistencia) => {
    if (asistencia === null) return <Help color="action" />
    if (asistencia === true) return <CheckCircle color="success" />
    return <Cancel color="error" />
  }

  const getAsistenciaColor = (asistencia) => {
    if (asistencia === null) return 'default'
    if (asistencia === true) return 'success'
    return 'error'
  }

  const getAsistenciaLabel = (asistencia) => {
    if (asistencia === null) return 'Pendiente'
    if (asistencia === true) return 'Asistió'
    return 'No asistió'
  }

  const bomberos = citacion?.bomberos || []
  const totalBomberos = bomberos.length
  const confirmados = Object.values(asistencias).filter(a => a === true).length
  const noAsistieron = Object.values(asistencias).filter(a => a === false).length
  const pendientes = Object.values(asistencias).filter(a => a === null).length

  const hasChanges = bomberos.some(bc => {
    const bomberoId = bc.bombero.id
    return asistencias[bomberoId] !== bc.asistio || 
           observaciones[bomberoId] !== (bc.observaciones || '')
  })

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Control de Asistencia - {citacion?.titulo}
          </Typography>
          <Box display="flex" gap={1}>
            <Chip 
              label={`${confirmados} Asistieron`}
              color="success"
              size="small"
            />
            <Chip 
              label={`${noAsistieron} No asistieron`}
              color="error"
              size="small"
            />
            <Chip 
              label={`${pendientes} Pendientes`}
              color="default"
              size="small"
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? error : 'Error al actualizar asistencia'}
          </Alert>
        )}

        {/* Información de la citación */}
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" gutterBottom>
            Información de la citación
          </Typography>
          <Box display="flex" gap={4}>
            <Typography variant="body2" color="text.secondary">
              <strong>Fecha:</strong> {citacion?.fecha}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Hora:</strong> {citacion?.hora}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Lugar:</strong> {citacion?.lugar}
            </Typography>
          </Box>
        </Paper>

        {/* Lista de bomberos con controles de asistencia */}
        <List sx={{ maxHeight: 500, overflow: 'auto' }}>
          {bomberos.map((bc, index) => {
            const bombero = bc.bombero
            const bomberoId = bombero.id
            const asistenciaActual = asistencias[bomberoId]
            const observacionActual = observaciones[bomberoId] || ''
            
            const hasIndividualChanges = 
              asistenciaActual !== bc.asistio || 
              observacionActual !== (bc.observaciones || '')

            return (
              <React.Fragment key={bombero.id}>
                <ListItem 
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    bgcolor: hasIndividualChanges ? 'action.hover' : 'transparent',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  {/* Header del bombero */}
                  <Box display="flex" alignItems="center" width="100%" mb={2}>
                    <ListItemAvatar>
                      <Avatar>
                        {bombero.nombres.charAt(0)}{bombero.apellidos.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {bombero.nombres} {bombero.apellidos}
                          </Typography>
                          {bombero.grado && (
                            <Chip 
                              label={bombero.grado} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                          <Chip
                            icon={getAsistenciaIcon(asistenciaActual)}
                            label={getAsistenciaLabel(asistenciaActual)}
                            color={getAsistenciaColor(asistenciaActual)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={`RUT: ${bombero.rut}`}
                    />

                    {hasIndividualChanges && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Save />}
                        onClick={() => handleSaveAsistencia(bomberoId)}
                        disabled={loading}
                      >
                        Guardar
                      </Button>
                    )}
                  </Box>

                  {/* Controles de asistencia */}
                  <Box width="100%">
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        row
                        value={asistenciaActual === null ? 'null' : asistenciaActual.toString()}
                        onChange={(e) => handleAsistenciaChange(bomberoId, e.target.value)}
                      >
                        <FormControlLabel
                          value="true"
                          control={<Radio color="success" />}
                          label="Asistió"
                        />
                        <FormControlLabel
                          value="false"
                          control={<Radio color="error" />}
                          label="No asistió"
                        />
                        <FormControlLabel
                          value="null"
                          control={<Radio />}
                          label="Pendiente"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Campo de observaciones */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Observaciones"
                      value={observacionActual}
                      onChange={(e) => handleObservacionChange(bomberoId, e.target.value)}
                      placeholder="Motivo de ausencia, comentarios adicionales..."
                      multiline
                      rows={2}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </ListItem>
                
                {index < bomberos.length - 1 && <Divider />}
              </React.Fragment>
            )
          })}
        </List>

        {/* Estado vacío */}
        {bomberos.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              No hay bomberos asignados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Primero debes asignar bomberos a esta citación
            </Typography>
          </Box>
        )}

        {/* Resumen de cambios */}
        {hasChanges && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Hay cambios sin guardar. Puedes guardar individualmente o usar "Guardar Todo" para aplicar todos los cambios.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          Cerrar
        </Button>
        
        {bomberos.length > 0 && hasChanges && (
          <Button 
            onClick={handleSaveAll}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? 'Guardando...' : 'Guardar Todo'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ControlAsistencia