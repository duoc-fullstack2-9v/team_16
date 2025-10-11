import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material'
import { liberarCargo } from '../../store/slices/cargosSlice'

const LiberarCargoDialog = ({ open, onClose, cargo }) => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.cargos)
  
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (open) {
      setFechaFin(new Date().toISOString().split('T')[0])
      setObservaciones('')
    }
  }, [open])

  const handleSubmit = async () => {
    const result = await dispatch(liberarCargo({
      cargoId: cargo.id,
      fechaFin,
      observaciones
    }))

    if (result.type === 'cargos/liberarCargo/fulfilled') {
      onClose()
    }
  }

  const asignacionActiva = cargo?.asignaciones?.find(a => a.activo)
  const bombero = asignacionActiva?.bombero

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Liberar Cargo de {cargo?.nombre}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Alert severity="warning" sx={{ mb: 2 }}>
          ¿Está seguro que desea liberar este cargo? Esta acción finalizará la asignación actual.
        </Alert>

        {bombero && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Bombero actual en el cargo:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={bombero.fotoUrl}
                alt={`${bombero.nombres} ${bombero.apellidos}`}
                sx={{ width: 60, height: 60 }}
              />
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {bombero.nombres} {bombero.apellidos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bombero.rango}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Desde: {new Date(asignacionActiva.fechaInicio).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Fecha de Finalización"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Motivo / Observaciones"
            multiline
            rows={4}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Indique el motivo por el cual se libera este cargo (cambio de período, renuncia, etc.)..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading === 'pending'}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={loading === 'pending'}
          startIcon={loading === 'pending' ? <CircularProgress size={20} /> : null}
        >
          {loading === 'pending' ? 'Liberando...' : 'Liberar Cargo'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LiberarCargoDialog
