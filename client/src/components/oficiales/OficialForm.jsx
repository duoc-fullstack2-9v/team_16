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
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Alert,
  Autocomplete
} from '@mui/material'
import {
  Person as PersonIcon
} from '@mui/icons-material'

// Opciones de rangos en orden jerárquico
const RANGOS_OPTIONS = [
  { value: 'COMANDANTE', label: 'Comandante', nivel: 7 },
  { value: 'CAPITAN', label: 'Capitán', nivel: 6 },
  { value: 'TENIENTE', label: 'Teniente', nivel: 5 },
  { value: 'ALFEREZ', label: 'Alférez', nivel: 4 },
  { value: 'SARGENTO', label: 'Sargento', nivel: 3 },
  { value: 'CABO', label: 'Cabo', nivel: 2 },
  { value: 'BOMBERO', label: 'Bombero', nivel: 1 }
]

// Opciones de especialidades
const ESPECIALIDADES_OPTIONS = [
  'Rescate Urbano',
  'Rescate Vehicular', 
  'Primeros Auxilios',
  'Manejo de Incendios',
  'Materiales Peligrosos',
  'Rescate en Altura',
  'Comunicaciones',
  'Administración'
]

const OficialForm = ({ 
  open, 
  onClose, 
  oficial = null, 
  onSubmit, 
  oficiales = [], // Para seleccionar superior
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    rango: '',
    superiornId: '',
    especialidad: '',
    activo: true,
    telefono: '',
    email: '',
    fechaIngreso: ''
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const isEditing = Boolean(oficial)

  // Inicializar datos del formulario
  useEffect(() => {
    if (oficial && open) {
      setFormData({
        nombres: oficial.nombres || '',
        apellidos: oficial.apellidos || '',
        rango: oficial.rango || '',
        superiornId: oficial.superiornId || '',
        especialidad: oficial.especialidad || '',
        activo: oficial.activo ?? true,
        telefono: oficial.telefono || '',
        email: oficial.email || '',
        fechaIngreso: oficial.fechaIngreso ? oficial.fechaIngreso.split('T')[0] : ''
      })
    } else if (!oficial && open) {
      // Reset para nuevo oficial
      setFormData({
        nombres: '',
        apellidos: '',
        rango: '',
        superiornId: '',
        especialidad: '',
        activo: true,
        telefono: '',
        email: '',
        fechaIngreso: ''
      })
    }
    setErrors({})
    setSubmitError('')
  }, [oficial, open])

  // Manejar cambios en los campos
  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo al modificarlo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos'
    } else if (formData.nombres.length < 2) {
      newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres'
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos'
    } else if (formData.apellidos.length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
    }

    if (!formData.rango) {
      newErrors.rango = 'El rango es requerido'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (formData.telefono && !/^(\+56)?[0-9]{8,9}$/.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono debe tener formato válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitError('')
      
      // Preparar datos para envío
      const submitData = {
        ...formData,
        superiornId: formData.superiornId || null
      }

      await onSubmit(submitData)
      onClose()
    } catch (error) {
      console.error('Error al guardar oficial:', error)
      setSubmitError(error.message || 'Error al guardar el oficial')
    }
  }

  // Filtrar oficiales para superior (excluir el oficial actual y sus subordinados)
  const getAvailableSuperiors = () => {
    if (!oficial) return oficiales

    return oficiales.filter(o => {
      // No puede ser superior de sí mismo
      if (o.id === oficial.id) return false
      
      // No puede tener como superior a uno de sus subordinados
      if (o.superiornId === oficial.id) return false
      
      return true
    })
  }

  const availableSuperiors = getAvailableSuperiors()

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '600px',
          bgcolor: 'background.paper'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        mb: 2
      }}>
        <PersonIcon />
        {isEditing ? 'Editar Oficial' : 'Nuevo Oficial'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Información Personal
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombres"
                value={formData.nombres}
                onChange={handleChange('nombres')}
                error={!!errors.nombres}
                helperText={errors.nombres}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellidos"
                value={formData.apellidos}
                onChange={handleChange('apellidos')}
                error={!!errors.apellidos}
                helperText={errors.apellidos}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.telefono}
                onChange={handleChange('telefono')}
                error={!!errors.telefono}
                helperText={errors.telefono}
                placeholder="Ej: +56912345678"
                variant="outlined"
              />
            </Grid>

            {/* Información Profesional */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                Información Profesional
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.rango}>
                <InputLabel>Rango</InputLabel>
                <Select
                  value={formData.rango}
                  onChange={handleChange('rango')}
                  label="Rango"
                >
                  {RANGOS_OPTIONS.map((rango) => (
                    <MenuItem key={rango.value} value={rango.value}>
                      {rango.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.rango && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.rango}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={ESPECIALIDADES_OPTIONS}
                value={formData.especialidad}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    especialidad: newValue || ''
                  }))
                }}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Especialidad"
                    variant="outlined"
                    helperText="Selecciona o escribe una especialidad"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Superior Directo</InputLabel>
                <Select
                  value={formData.superiornId}
                  onChange={handleChange('superiornId')}
                  label="Superior Directo"
                >
                  <MenuItem value="">
                    <em>Sin superior directo</em>
                  </MenuItem>
                  {availableSuperiors.map((superior) => (
                    <MenuItem key={superior.id} value={superior.id}>
                      {superior.nombres} {superior.apellidos} ({superior.rango})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Ingreso"
                type="date"
                value={formData.fechaIngreso}
                onChange={handleChange('fechaIngreso')}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={handleChange('activo')}
                    color="primary"
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>
                      Estado: {formData.activo ? 'Activo' : 'Inactivo'}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default OficialForm