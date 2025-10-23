import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Typography,
  Alert
} from '@mui/material'
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material'
import { createCajonera, updateCajonera } from '../../store/slices/carrosSlice'

function CajoneraForm({ open, onClose, carroId, cajonera, onSuccess }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.carros)

  const [formData, setFormData] = useState({
    nombre: '',
    estado: 'Operativa',
    posicion: 1,
    observaciones: ''
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (cajonera) {
      setFormData({
        nombre: cajonera.nombre || '',
        estado: cajonera.estado || 'Operativa',
        posicion: cajonera.posicion || 1,
        observaciones: cajonera.observaciones || ''
      })
    }
  }, [cajonera])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    if (!formData.posicion || formData.posicion < 1) {
      newErrors.posicion = 'La posición debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSubmitError('')

    const submitData = {
      ...formData,
      posicion: parseInt(formData.posicion)
    }

    try {
      if (cajonera) {
        await dispatch(updateCajonera({ id: cajonera.id, data: submitData })).unwrap()
      } else {
        await dispatch(createCajonera({ carroId: parseInt(carroId), data: submitData })).unwrap()
      }
      onSuccess()
    } catch (error) {
      setSubmitError(error.message || 'Error al guardar la cajonera')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {cajonera ? 'Editar Cajonera' : 'Nueva Cajonera'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError('')}>
            {submitError}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nombre de la Cajonera"
              fullWidth
              required
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              error={!!errors.nombre}
              helperText={errors.nombre || 'Ej: Cajonera Lateral Izquierda, Cajonera Frontal, etc.'}
              placeholder="Nombre descriptivo de la cajonera"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Posición"
              type="number"
              fullWidth
              required
              value={formData.posicion}
              onChange={(e) => handleChange('posicion', e.target.value)}
              error={!!errors.posicion}
              helperText={errors.posicion || 'Número de posición en el carro'}
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Estado"
              select
              fullWidth
              required
              value={formData.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
            >
              <MenuItem value="Operativa">Operativa</MenuItem>
              <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
              <MenuItem value="Fuera de Servicio">Fuera de Servicio</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Observaciones"
              fullWidth
              multiline
              rows={3}
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales sobre la cajonera..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading.createCajonera || loading.updateCajonera}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading.createCajonera || loading.updateCajonera}
          startIcon={<SaveIcon />}
        >
          {loading.createCajonera || loading.updateCajonera ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CajoneraForm
