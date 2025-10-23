import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material'
import { format } from 'date-fns'

const CitacionForm = ({
  open,
  onClose,
  onSubmit,
  citacion = null,
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    fecha: '',
    hora: '',
    lugar: '',
    motivo: '',
    estado: 'Programada'
  })

  const [formErrors, setFormErrors] = useState({})

  // Resetear formulario cuando se abre/cierra o cambia la citación
  useEffect(() => {
    if (open) {
      if (citacion) {
        // Modo edición - formatear fecha y hora correctamente
        const fechaStr = citacion.fecha ? format(new Date(citacion.fecha), 'yyyy-MM-dd') : ''
        const horaStr = citacion.hora ? citacion.hora.substring(0, 5) : '' // HH:mm
        
        setFormData({
          titulo: citacion.titulo || '',
          fecha: fechaStr,
          hora: horaStr,
          lugar: citacion.lugar || '',
          motivo: citacion.motivo || '',
          estado: citacion.estado || 'Programada'
        })
      } else {
        // Modo creación - usar fecha y hora actual
        const now = new Date()
        const fechaStr = format(now, 'yyyy-MM-dd')
        const horaStr = format(now, 'HH:mm')
        
        setFormData({
          titulo: '',
          fecha: fechaStr,
          hora: horaStr,
          lugar: '',
          motivo: '',
          estado: 'Programada'
        })
      }
      setFormErrors({})
    }
  }, [open, citacion])

  const handleInputChange = (field) => (event) => {
    const value = event.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es requerido'
    } else if (formData.titulo.trim().length < 3) {
      errors.titulo = 'El título debe tener al menos 3 caracteres'
    }

    if (!formData.fecha) {
      errors.fecha = 'La fecha es requerida'
    }

    if (!formData.hora) {
      errors.hora = 'La hora es requerida'
    }

    if (!formData.lugar.trim()) {
      errors.lugar = 'El lugar es requerido'
    } else if (formData.lugar.trim().length < 3) {
      errors.lugar = 'El lugar debe tener al menos 3 caracteres'
    }

    if (!formData.motivo.trim()) {
      errors.motivo = 'El motivo es requerido'
    } else if (formData.motivo.trim().length < 10) {
      errors.motivo = 'El motivo debe tener al menos 10 caracteres'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Formatear datos para envío
    const submitData = {
      titulo: formData.titulo.trim(),
      fecha: formData.fecha, // Ya está en formato yyyy-MM-dd
      hora: formData.hora,   // Ya está en formato HH:mm
      lugar: formData.lugar.trim(),
      motivo: formData.motivo.trim(),
      estado: formData.estado
    }

    onSubmit(submitData)
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const isEditing = Boolean(citacion)
  const canEditEstado = isEditing && citacion?.estado !== 'Realizada'

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit
      }}
      >
        <DialogTitle>
          {isEditing ? 'Editar Citación' : 'Nueva Citación'}
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {typeof error === 'string' ? error : 'Error al procesar la citación'}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Título */}
            <Grid item xs={12}>
              <TextField
                label="Título"
                fullWidth
                required
                value={formData.titulo}
                onChange={handleInputChange('titulo')}
                error={Boolean(formErrors.titulo)}
                helperText={formErrors.titulo}
                disabled={loading}
                placeholder="Ej: Reunión mensual, Capacitación, etc."
              />
            </Grid>

            {/* Fecha y Hora */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha"
                type="date"
                fullWidth
                required
                value={formData.fecha}
                onChange={handleInputChange('fecha')}
                disabled={loading}
                error={Boolean(formErrors.fecha)}
                helperText={formErrors.fecha}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora"
                type="time"
                fullWidth
                required
                value={formData.hora}
                onChange={handleInputChange('hora')}
                disabled={loading}
                error={Boolean(formErrors.hora)}
                helperText={formErrors.hora}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Lugar */}
            <Grid item xs={12}>
              <TextField
                label="Lugar"
                fullWidth
                required
                value={formData.lugar}
                onChange={handleInputChange('lugar')}
                error={Boolean(formErrors.lugar)}
                helperText={formErrors.lugar}
                disabled={loading}
                placeholder="Ej: Cuartel central, Sala de reuniones, etc."
              />
            </Grid>

            {/* Estado (solo en edición) */}
            {isEditing && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estado}
                    onChange={handleInputChange('estado')}
                    label="Estado"
                    disabled={loading || !canEditEstado}
                  >
                    <MenuItem value="Programada">Programada</MenuItem>
                    <MenuItem value="Realizada">Realizada</MenuItem>
                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
                {!canEditEstado && (
                  <Typography variant="caption" color="text.secondary">
                    No se puede cambiar el estado de una citación realizada
                  </Typography>
                )}
              </Grid>
            )}

            {/* Motivo */}
            <Grid item xs={12}>
              <TextField
                label="Motivo / Descripción"
                fullWidth
                multiline
                rows={4}
                value={formData.motivo}
                onChange={handleInputChange('motivo')}
                disabled={loading}
                placeholder="Describe el propósito de la citación..."
                helperText="Opcional: Agrega detalles sobre el motivo de la citación"
              />
            </Grid>
          </Grid>

          {/* Información adicional para edición */}
          {isEditing && citacion && (
            <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>
                Información de la citación
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Creada por: {citacion.creador?.nombres} {citacion.creador?.apellidos}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Bomberos asignados: {citacion.bomberos?.length || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
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
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
  )
}

export default CitacionForm