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
  Alert,
  Chip,
  Box,
  CircularProgress
} from '@mui/material'
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material'
import { asignarMaterialCarro } from '../../store/slices/carrosSlice'
import axios from 'axios'

function AsignarMaterialDialog({ open, onClose, carroId, cajoneras, onSuccess }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.carros)

  const [materialesDisponibles, setMaterialesDisponibles] = useState([])
  const [loadingMateriales, setLoadingMateriales] = useState(false)
  
  const [formData, setFormData] = useState({
    materialId: '',
    cajoneraId: '',
    cantidad: '',
    motivo: '',
    observaciones: ''
  })

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (open) {
      loadMaterialesDisponibles()
    }
  }, [open])

  const loadMaterialesDisponibles = async () => {
    setLoadingMateriales(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3001/api/material', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          limit: 100,
          estado: 'Disponible'
        }
      })
      setMaterialesDisponibles(response.data.data || [])
    } catch (error) {
      console.error('Error al cargar materiales:', error)
      setSubmitError('Error al cargar materiales disponibles')
    } finally {
      setLoadingMateriales(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.materialId) {
      newErrors.materialId = 'Debes seleccionar un material'
    }

    const material = materialesDisponibles.find(m => m.id === parseInt(formData.materialId))
    if (material?.tipo === 'CANTIDAD' && (!formData.cantidad || formData.cantidad <= 0)) {
      newErrors.cantidad = 'La cantidad es requerida para material tipo CANTIDAD'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setSubmitError('')

    const submitData = {
      materialId: parseInt(formData.materialId),
      cajoneraId: formData.cajoneraId ? parseInt(formData.cajoneraId) : null,
      cantidad: formData.cantidad ? parseInt(formData.cantidad) : null,
      motivo: formData.motivo.trim() || undefined,
      observaciones: formData.observaciones.trim() || undefined
    }

    try {
      await dispatch(asignarMaterialCarro({ carroId: parseInt(carroId), data: submitData })).unwrap()
      onSuccess()
    } catch (error) {
      setSubmitError(error.message || 'Error al asignar material')
    }
  }

  const selectedMaterial = materialesDisponibles.find(m => m.id === parseInt(formData.materialId))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Asignar Material al Carro
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

        {loadingMateriales ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Seleccionar Material"
                select
                fullWidth
                required
                value={formData.materialId}
                onChange={(e) => handleChange('materialId', e.target.value)}
                error={!!errors.materialId}
                helperText={errors.materialId || `${materialesDisponibles.length} materiales disponibles`}
              >
                <MenuItem value="">-- Selecciona un material --</MenuItem>
                {materialesDisponibles.map((material) => (
                  <MenuItem key={material.id} value={material.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Typography>{material.nombre}</Typography>
                      <Chip label={material.tipo} size="small" color="secondary" />
                      {material.tipo === 'CANTIDAD' && material.cantidad && (
                        <Chip label={`Stock: ${material.cantidad}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {selectedMaterial && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Tipo:</strong> {selectedMaterial.tipo}<br />
                    <strong>Categoría:</strong> {selectedMaterial.categoria?.nombre || 'Sin categoría'}
                    {selectedMaterial.tipo === 'CANTIDAD' && (
                      <>
                        <br /><strong>Stock disponible:</strong> {selectedMaterial.cantidad || 0}
                      </>
                    )}
                  </Typography>
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Ubicación (Cajonera)"
                select
                fullWidth
                value={formData.cajoneraId}
                onChange={(e) => handleChange('cajoneraId', e.target.value)}
                helperText="Opcional - Puedes asignar el material a una cajonera específica o dejarlo sin cajonera"
              >
                <MenuItem value="">Sin cajonera específica</MenuItem>
                {cajoneras.map((cajonera) => (
                  <MenuItem key={cajonera.id} value={cajonera.id}>
                    {cajonera.nombre} (Posición {cajonera.posicion})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {selectedMaterial?.tipo === 'CANTIDAD' && (
              <Grid item xs={12}>
                <TextField
                  label="Cantidad a Asignar"
                  type="number"
                  fullWidth
                  required
                  value={formData.cantidad}
                  onChange={(e) => handleChange('cantidad', e.target.value)}
                  error={!!errors.cantidad}
                  helperText={errors.cantidad || `Máximo disponible: ${selectedMaterial.cantidad || 0}`}
                  inputProps={{ min: 1, max: selectedMaterial.cantidad || 1 }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Motivo de Asignación"
                fullWidth
                value={formData.motivo}
                onChange={(e) => handleChange('motivo', e.target.value)}
                placeholder="Ej: Equipamiento estándar, reemplazo, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                fullWidth
                multiline
                rows={2}
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                placeholder="Observaciones adicionales..."
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading.asignarMaterial}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading.asignarMaterial || loadingMateriales}
          startIcon={<SaveIcon />}
        >
          {loading.asignarMaterial ? 'Asignando...' : 'Asignar Material'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AsignarMaterialDialog
