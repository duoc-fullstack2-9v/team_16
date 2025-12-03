import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Checkbox,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Grid,
  FormControlLabel,
  Switch
} from '@mui/material'
import {
  Search,
  Person,
  CheckCircle,
  Cancel,
  Help
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { fetchBomberos, selectBomberos, selectBomberosLoading } from '../../store/slices/bomberosSlice'

const AsignacionBomberos = ({
  open,
  onClose,
  onSubmit,
  citacion = null,
  loading = false,
  error = null
}) => {
  const dispatch = useDispatch()
  const bomberos = useSelector(selectBomberos)
  const bomberosLoading = useSelector(selectBomberosLoading)

  const [selectedBomberos, setSelectedBomberos] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlySelected, setShowOnlySelected] = useState(false)

  // Cargar bomberos al abrir el modal
  useEffect(() => {
    if (open && bomberos.length === 0) {
      dispatch(fetchBomberos({ page: 1, limit: 100 }))
    }
  }, [open, dispatch, bomberos.length])

  // Inicializar bomberos seleccionados
  useEffect(() => {
    if (open && citacion?.bomberos) {
      const asignados = new Set(
        citacion.bomberos.map(bc => bc.bombero.id)
      )
      setSelectedBomberos(asignados)
    } else if (open) {
      setSelectedBomberos(new Set())
    }
  }, [open, citacion])

  // Limpiar búsqueda al cerrar
  useEffect(() => {
    if (!open) {
      setSearchTerm('')
      setShowOnlySelected(false)
    }
  }, [open])

  const handleBomberoToggle = (bomberoId) => {
    setSelectedBomberos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bomberoId)) {
        newSet.delete(bomberoId)
      } else {
        newSet.add(bomberoId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const filteredBomberos = getFilteredBomberos()
    const allSelected = filteredBomberos.every(b => selectedBomberos.has(b.id))
    
    if (allSelected) {
      // Deseleccionar todos los filtrados
      setSelectedBomberos(prev => {
        const newSet = new Set(prev)
        filteredBomberos.forEach(b => newSet.delete(b.id))
        return newSet
      })
    } else {
      // Seleccionar todos los filtrados
      setSelectedBomberos(prev => {
        const newSet = new Set(prev)
        filteredBomberos.forEach(b => newSet.add(b.id))
        return newSet
      })
    }
  }

  const getFilteredBomberos = () => {
    let filtered = bomberos.filter(bombero => bombero.activo)

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(bombero =>
        bombero.nombres.toLowerCase().includes(term) ||
        bombero.apellidos.toLowerCase().includes(term) ||
        bombero.rut.toLowerCase().includes(term) ||
        bombero.grado?.toLowerCase().includes(term)
      )
    }

    // Mostrar solo seleccionados
    if (showOnlySelected) {
      filtered = filtered.filter(bombero => selectedBomberos.has(bombero.id))
    }

    return filtered.sort((a, b) => {
      // Primero los seleccionados
      const aSelected = selectedBomberos.has(a.id)
      const bSelected = selectedBomberos.has(b.id)
      
      if (aSelected && !bSelected) return -1
      if (!aSelected && bSelected) return 1
      
      // Luego por apellido
      return a.apellidos.localeCompare(b.apellidos)
    })
  }

  const handleSubmit = () => {
    const bomberosIds = Array.from(selectedBomberos)
    onSubmit(bomberosIds)
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const filteredBomberos = getFilteredBomberos()
  const selectedCount = selectedBomberos.size

  // Obtener estado de asistencia para bomberos ya asignados
  const getAsistenciaInfo = (bomberoId) => {
    if (!citacion?.bomberos) return null
    
    const bomberoCitacion = citacion.bomberos.find(
      bc => bc.bombero.id === bomberoId
    )
    
    if (!bomberoCitacion) return null
    
    return {
      asistio: bomberoCitacion.asistio,
      observaciones: bomberoCitacion.observaciones
    }
  }

  const getAsistenciaIcon = (asistencia) => {
    if (asistencia === null) return <Help color="action" />
    if (asistencia === true) return <CheckCircle color="success" />
    return <Cancel color="error" />
  }

  const getAsistenciaText = (asistencia) => {
    if (asistencia === null) return 'Pendiente'
    if (asistencia === true) return 'Asistió'
    return 'No asistió'
  }

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
            Asignar Bomberos - {citacion?.titulo}
          </Typography>
          <Chip 
            label={`${selectedCount} seleccionado${selectedCount !== 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {typeof error === 'string' ? error : 'Error al asignar bomberos'}
          </Alert>
        )}

        {/* Controles de búsqueda y filtros */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Buscar bomberos por nombre, RUT o grado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" gap={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnlySelected}
                      onChange={(e) => setShowOnlySelected(e.target.checked)}
                    />
                  }
                  label="Solo seleccionados"
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleSelectAll}
                  disabled={filteredBomberos.length === 0}
                >
                  {filteredBomberos.length > 0 && 
                   filteredBomberos.every(b => selectedBomberos.has(b.id))
                    ? 'Deseleccionar todos' 
                    : 'Seleccionar todos'
                  }
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Loading de bomberos */}
        {bomberosLoading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Lista de bomberos */}
        {!bomberosLoading && (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredBomberos.map((bombero, index) => {
              const isSelected = selectedBomberos.has(bombero.id)
              const asistenciaInfo = getAsistenciaInfo(bombero.id)

              return (
                <React.Fragment key={bombero.id}>
                  <ListItem
                    button
                    onClick={() => handleBomberoToggle(bombero.id)}
                    selected={isSelected}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        }
                      }
                    }}
                  >
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
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            RUT: {bombero.rut}
                          </Typography>
                          {asistenciaInfo && citacion?.estado === 'realizada' && (
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              {getAsistenciaIcon(asistenciaInfo.asistio)}
                              <Typography variant="caption" color="text.secondary">
                                {getAsistenciaText(asistenciaInfo.asistio)}
                              </Typography>
                              {asistenciaInfo.observaciones && (
                                <Typography variant="caption" color="text.secondary">
                                  - {asistenciaInfo.observaciones}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleBomberoToggle(bombero.id)}
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  {index < filteredBomberos.length - 1 && <Divider />}
                </React.Fragment>
              )
            })}
          </List>
        )}

        {/* Estado vacío */}
        {!bomberosLoading && filteredBomberos.length === 0 && (
          <Box textAlign="center" py={4}>
            <Person sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No se encontraron bomberos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Intenta ajustar la búsqueda' : 'No hay bomberos disponibles'}
            </Typography>
          </Box>
        )}

        {/* Información adicional */}
        {citacion && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" gutterBottom>
              Información de la citación
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Estado: <strong>{citacion.estado}</strong>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Asignados anteriormente: {citacion.bomberos?.length || 0}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || selectedCount === 0}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Asignando...' : `Asignar ${selectedCount} bombero${selectedCount !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AsignacionBomberos