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
  Box,
  Typography,
  Alert,
  Divider,
  IconButton,
  Stack
} from '@mui/material'
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material'
import { createCarro, updateCarro } from '../../store/slices/carrosSlice'

function CarroForm({ open, onClose, carro, onSuccess }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.carros)

  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Bomba',
    marca: '',
    modelo: '',
    anioFabricacion: new Date().getFullYear(),
    patente: '',
    estadoOperativo: 'Operativo',
    capacidadAgua: '',
    capacidadEspuma: '',
    potenciaMotobomba: '',
    capacidadMotobomba: '',
    capacidadCarga: '',
    fechaProximaMantencion: '',
    fechaRevisionTecnica: '',
    fechaPermisoCirculacion: '',
    observaciones: ''
  })

  const [caracteristicas, setCaracteristicas] = useState({
    altura: '',
    peso: '',
    traccion: '',
    otros: ''
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (carro) {
      setFormData({
        nombre: carro.nombre || '',
        tipo: carro.tipo || 'Bomba',
        marca: carro.marca || '',
        modelo: carro.modelo || '',
        anioFabricacion: carro.anioFabricacion || new Date().getFullYear(),
        patente: carro.patente || '',
        estadoOperativo: carro.estadoOperativo || 'Operativo',
        capacidadAgua: carro.capacidadAgua || '',
        capacidadEspuma: carro.capacidadEspuma || '',
        potenciaMotobomba: carro.potenciaMotobomba || '',
        capacidadMotobomba: carro.capacidadMotobomba || '',
        capacidadCarga: carro.capacidadCarga || '',
        fechaProximaMantencion: carro.fechaProximaMantencion ? carro.fechaProximaMantencion.split('T')[0] : '',
        fechaRevisionTecnica: carro.fechaRevisionTecnica ? carro.fechaRevisionTecnica.split('T')[0] : '',
        fechaPermisoCirculacion: carro.fechaPermisoCirculacion ? carro.fechaPermisoCirculacion.split('T')[0] : '',
        observaciones: carro.observaciones || ''
      })
      
      if (carro.caracteristicas && typeof carro.caracteristicas === 'object') {
        setCaracteristicas({
          altura: carro.caracteristicas.altura || '',
          peso: carro.caracteristicas.peso || '',
          traccion: carro.caracteristicas.traccion || '',
          otros: carro.caracteristicas.otros || ''
        })
      }
    }
  }, [carro])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCaracteristicaChange = (field, value) => {
    setCaracteristicas(prev => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!formData.marca.trim()) newErrors.marca = 'La marca es requerida'
    if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es requerido'
    if (!formData.patente.trim()) newErrors.patente = 'La patente es requerida'
    if (!formData.anioFabricacion || formData.anioFabricacion < 1900 || formData.anioFabricacion > new Date().getFullYear() + 1) {
      newErrors.anioFabricacion = 'Año inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSubmitError('')

    // Preparar características (solo incluir las que tienen valor)
    const caracteristicasData = {}
    Object.entries(caracteristicas).forEach(([key, value]) => {
      if (value.trim()) {
        caracteristicasData[key] = value
      }
    })

    const submitData = {
      ...formData,
      anioFabricacion: parseInt(formData.anioFabricacion),
      capacidadAgua: formData.capacidadAgua ? parseFloat(formData.capacidadAgua) : null,
      capacidadEspuma: formData.capacidadEspuma ? parseFloat(formData.capacidadEspuma) : null,
      caracteristicas: Object.keys(caracteristicasData).length > 0 ? caracteristicasData : null
    }

    try {
      if (carro) {
        await dispatch(updateCarro({ id: carro.id, data: submitData })).unwrap()
      } else {
        await dispatch(createCarro(submitData)).unwrap()
      }
      onSuccess()
    } catch (error) {
      setSubmitError(error.message || 'Error al guardar el carro')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {carro ? 'Editar Carro' : 'Nuevo Carro'}
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
          {/* Información Básica */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Información Básica
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre del Carro"
              fullWidth
              required
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              error={!!errors.nombre}
              helperText={errors.nombre}
              placeholder="Ej: Bomba B1"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Tipo"
              select
              fullWidth
              required
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
            >
              <MenuItem value="Bomba">Bomba</MenuItem>
              <MenuItem value="Escala">Escala</MenuItem>
              <MenuItem value="Rescate">Rescate</MenuItem>
              <MenuItem value="Ambulancia">Ambulancia</MenuItem>
              <MenuItem value="Materiales">Materiales</MenuItem>
              <MenuItem value="Unidad">Unidad</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Marca"
              fullWidth
              required
              value={formData.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              error={!!errors.marca}
              helperText={errors.marca}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Modelo"
              fullWidth
              required
              value={formData.modelo}
              onChange={(e) => handleChange('modelo', e.target.value)}
              error={!!errors.modelo}
              helperText={errors.modelo}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Año"
              type="number"
              fullWidth
              required
              value={formData.anioFabricacion}
              onChange={(e) => handleChange('anioFabricacion', e.target.value)}
              error={!!errors.anioFabricacion}
              helperText={errors.anioFabricacion}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Patente"
              fullWidth
              required
              value={formData.patente}
              onChange={(e) => handleChange('patente', e.target.value.toUpperCase())}
              error={!!errors.patente}
              helperText={errors.patente}
              placeholder="XXXX-00"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Estado Operativo"
              select
              fullWidth
              value={formData.estadoOperativo}
              onChange={(e) => handleChange('estadoOperativo', e.target.value)}
            >
              <MenuItem value="Operativo">Operativo</MenuItem>
              <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
              <MenuItem value="Fuera de Servicio">Fuera de Servicio</MenuItem>
            </TextField>
          </Grid>

          {/* Capacidades */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              Capacidades
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Capacidad Agua (litros)"
              type="number"
              fullWidth
              value={formData.capacidadAgua}
              onChange={(e) => handleChange('capacidadAgua', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Capacidad Espuma (litros)"
              type="number"
              fullWidth
              value={formData.capacidadEspuma}
              onChange={(e) => handleChange('capacidadEspuma', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Potencia Motobomba"
              fullWidth
              value={formData.potenciaMotobomba}
              onChange={(e) => handleChange('potenciaMotobomba', e.target.value)}
              placeholder="Ej: 600 GPM"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Capacidad Motobomba"
              fullWidth
              value={formData.capacidadMotobomba}
              onChange={(e) => handleChange('capacidadMotobomba', e.target.value)}
              placeholder="Ej: 2500 L/min"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Capacidad de Carga"
              fullWidth
              value={formData.capacidadCarga}
              onChange={(e) => handleChange('capacidadCarga', e.target.value)}
              placeholder="Ej: 6 personas"
            />
          </Grid>

          {/* Características Personalizadas */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              Características Adicionales
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Altura"
              fullWidth
              value={caracteristicas.altura}
              onChange={(e) => handleCaracteristicaChange('altura', e.target.value)}
              placeholder="Ej: 3.5m"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Peso"
              fullWidth
              value={caracteristicas.peso}
              onChange={(e) => handleCaracteristicaChange('peso', e.target.value)}
              placeholder="Ej: 12000kg"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Tracción"
              fullWidth
              value={caracteristicas.traccion}
              onChange={(e) => handleCaracteristicaChange('traccion', e.target.value)}
              placeholder="Ej: 4x4"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Otras Características"
              fullWidth
              multiline
              rows={2}
              value={caracteristicas.otros}
              onChange={(e) => handleCaracteristicaChange('otros', e.target.value)}
              placeholder="Características adicionales..."
            />
          </Grid>

          {/* Fechas Importantes */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
              Fechas Importantes
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Próxima Mantención"
              type="date"
              fullWidth
              value={formData.fechaProximaMantencion}
              onChange={(e) => handleChange('fechaProximaMantencion', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Revisión Técnica"
              type="date"
              fullWidth
              value={formData.fechaRevisionTecnica}
              onChange={(e) => handleChange('fechaRevisionTecnica', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Permiso Circulación"
              type="date"
              fullWidth
              value={formData.fechaPermisoCirculacion}
              onChange={(e) => handleChange('fechaPermisoCirculacion', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Observaciones */}
          <Grid item xs={12}>
            <TextField
              label="Observaciones"
              fullWidth
              multiline
              rows={3}
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales sobre el carro..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading.create || loading.update}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading.create || loading.update}
          startIcon={<SaveIcon />}
        >
          {loading.create || loading.update ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CarroForm
