import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Alert,
  Stack,
  IconButton,
  Typography,
  Divider,
  InputAdornment,
  Avatar
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { createBombero, updateBombero, clearError } from '../../store/slices/bomberosSlice'

const BomberoForm = ({ bombero = null, onSuccess, onCancel }) => {
  const dispatch = useDispatch()
  const { createLoading, updateLoading, createError, updateError } = useSelector(state => state.bomberos)
  
  const isEditing = !!bombero
  const loading = isEditing ? updateLoading : createLoading
  const error = isEditing ? updateError : createError

  // Form state
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    rango: 'Bombero',
    especialidad: '',
    estado: 'Activo',
    telefono: '',
    email: '',
    direccion: '',
    fechaIngreso: null,
    fotoUrl: ''
  })

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({})

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && bombero) {
      setFormData({
        nombres: bombero.nombres || '',
        apellidos: bombero.apellidos || '',
        rango: bombero.rango || 'Bombero',
        especialidad: bombero.especialidad || '',
        estado: bombero.estado || 'Activo',
        telefono: bombero.telefono || '',
        email: bombero.email || '',
        direccion: bombero.direccion || '',
        fechaIngreso: bombero.fechaIngreso ? new Date(bombero.fechaIngreso) : null,
        fotoUrl: bombero.fotoUrl || ''
      })
    }
  }, [isEditing, bombero])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Handle input changes
  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    // Required fields
    if (!formData.nombres.trim()) {
      errors.nombres = 'Los nombres son requeridos'
    } else if (formData.nombres.length < 2) {
      errors.nombres = 'Los nombres deben tener al menos 2 caracteres'
    }

    if (!formData.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son requeridos'
    } else if (formData.apellidos.length < 2) {
      errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
    }

    if (!formData.rango) {
      errors.rango = 'El rango es requerido'
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email debe tener un formato válido'
    }

    // Phone validation
    if (formData.telefono && !/^\+?[\d\s\-\(\)]{8,20}$/.test(formData.telefono)) {
      errors.telefono = 'El teléfono debe tener un formato válido'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const submitData = {
        ...formData,
        fechaIngreso: formData.fechaIngreso ? formData.fechaIngreso.toISOString() : null
      }

      if (isEditing) {
        await dispatch(updateBombero({
          id: bombero.id,
          data: submitData
        })).unwrap()
      } else {
        await dispatch(createBombero(submitData)).unwrap()
      }

      onSuccess()
    } catch (error) {
      console.error('Error al guardar bombero:', error)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    dispatch(clearError())
    onCancel()
  }

  const rangos = [
    'Bombero',
    'Cabo',
    'Sargento',
    'Teniente',
    'Capitán',
    'Comandante'
  ]

  const estados = [
    'Activo',
    'Licencia',
    'Inactivo'
  ]

  return (
    <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <PersonIcon sx={{ mr: 1 }} />
              {isEditing ? 'Editar Bombero' : 'Nuevo Bombero'}
            </Box>
          }
          action={
            <IconButton onClick={handleCancel}>
              <CancelIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Error general */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {Array.isArray(error) ? (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {error.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                ) : (
                  error
                )}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Información Personal */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Información Personal
                </Typography>
              </Grid>

              {/* Foto del bombero */}
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={formData.fotoUrl}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 2,
                      mx: 'auto',
                      border: '3px solid',
                      borderColor: 'primary.main'
                    }}
                  >
                    {!formData.fotoUrl && (formData.nombres?.charAt(0) || formData.apellidos?.charAt(0) || 'B')}
                  </Avatar>
                  <Typography variant="caption" display="block" gutterBottom>
                    Selecciona una foto
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mt: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <IconButton
                        key={num}
                        onClick={() => setFormData(prev => ({ ...prev, fotoUrl: `/assets/bomberos/bombero-${num}.jpg` }))}
                        sx={{
                          border: formData.fotoUrl === `/assets/bomberos/bombero-${num}.jpg` ? '2px solid' : '1px solid',
                          borderColor: formData.fotoUrl === `/assets/bomberos/bombero-${num}.jpg` ? 'primary.main' : 'grey.300',
                          p: 0.5
                        }}
                      >
                        <Avatar
                          src={`/assets/bomberos/bombero-${num}.jpg`}
                          sx={{ width: 40, height: 40 }}
                        />
                      </IconButton>
                    ))}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombres"
                  value={formData.nombres}
                  onChange={handleChange('nombres')}
                  error={!!validationErrors.nombres}
                  helperText={validationErrors.nombres}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={formData.apellidos}
                  onChange={handleChange('apellidos')}
                  error={!!validationErrors.apellidos}
                  helperText={validationErrors.apellidos}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!validationErrors.rango}>
                  <InputLabel>Rango</InputLabel>
                  <Select
                    value={formData.rango}
                    label="Rango"
                    onChange={handleChange('rango')}
                  >
                    {rangos.map((rango) => (
                      <MenuItem key={rango} value={rango}>
                        {rango}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Especialidad"
                  value={formData.especialidad}
                  onChange={handleChange('especialidad')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon />
                      </InputAdornment>
                    )
                  }}
                  placeholder="Ej: Rescate urbano, Primeros auxilios..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estado}
                    label="Estado"
                    onChange={handleChange('estado')}
                  >
                    {estados.map((estado) => (
                      <MenuItem key={estado} value={estado}>
                        {estado}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Información de Contacto */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Información de Contacto
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={handleChange('telefono')}
                  error={!!validationErrors.telefono}
                  helperText={validationErrors.telefono}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    )
                  }}
                  placeholder="+56 9 1234 5678"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    )
                  }}
                  placeholder="ejemplo@bomberos.cl"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={formData.direccion}
                  onChange={handleChange('direccion')}
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              {/* Información Adicional */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Información Adicional
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fecha de Ingreso"
                  type="date"
                  value={formData.fechaIngreso ? formData.fechaIngreso.split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fechaIngreso: e.target.value ? new Date(e.target.value).toISOString() : null
                  }))}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    )
                  }}
                  inputProps={{
                    max: new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>
            </Grid>

            {/* Form Actions */}
            <Box mt={4}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
                </Button>
              </Stack>
            </Box>
          </Box>
        </CardContent>
      </Card>
  )
}

export default BomberoForm