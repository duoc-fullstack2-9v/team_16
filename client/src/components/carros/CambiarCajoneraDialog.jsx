import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Alert,
  Box,
  Chip
} from '@mui/material'
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material'
import { cambiarCajonera } from '../../store/slices/carrosSlice'

function CambiarCajoneraDialog({ open, onClose, asignacion, cajoneras, onSuccess }) {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.carros)

  const [cajoneraId, setCajoneraId] = useState(asignacion.cajoneraId || '')
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async () => {
    setSubmitError('')

    try {
      await dispatch(cambiarCajonera({ 
        asignacionId: asignacion.id, 
        cajoneraId: cajoneraId ? parseInt(cajoneraId) : null 
      })).unwrap()
      onSuccess()
    } catch (error) {
      setSubmitError(error.message || 'Error al cambiar la ubicación')
    }
  }

  const cajoneraActual = asignacion.cajonera

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Cambiar Ubicación
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

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Material:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {asignacion.material?.nombre || 'N/A'}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Ubicación Actual:
          </Typography>
          <Chip
            label={cajoneraActual ? cajoneraActual.nombre : 'Sin cajonera específica'}
            color={cajoneraActual ? 'primary' : 'default'}
          />
        </Box>

        <TextField
          label="Nueva Ubicación"
          select
          fullWidth
          value={cajoneraId}
          onChange={(e) => setCajoneraId(e.target.value)}
          helperText="Selecciona la nueva ubicación para este material"
        >
          <MenuItem value="">Sin cajonera específica</MenuItem>
          {cajoneras
            .filter(c => c.estado === 'Operativa')
            .map((cajonera) => (
              <MenuItem key={cajonera.id} value={cajonera.id}>
                {cajonera.nombre} (Posición {cajonera.posicion})
              </MenuItem>
            ))}
        </TextField>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading.cambiarCajonera}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading.cambiarCajonera}
          startIcon={<SaveIcon />}
        >
          {loading.cambiarCajonera ? 'Guardando...' : 'Cambiar Ubicación'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CambiarCajoneraDialog
