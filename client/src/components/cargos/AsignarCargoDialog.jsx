import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material'
import { asignarBombero } from '../../store/slices/cargosSlice'
import { fetchBomberos } from '../../store/slices/bomberosSlice'

const AsignarCargoDialog = ({ open, onClose, cargo }) => {
  const dispatch = useDispatch()
  const { bomberos, loading: bomberosLoading } = useSelector((state) => state.bomberos)
  const { loading, error } = useSelector((state) => state.cargos)
  
  const [bomberoId, setBomberoId] = useState('')
  const [periodoAnio, setPeriodoAnio] = useState(new Date().getFullYear())
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (open) {
      dispatch(fetchBomberos({ limit: 100, estado: 'Activo' }))
      // Reset form
      setBomberoId('')
      setPeriodoAnio(new Date().getFullYear())
      setFechaInicio(new Date().toISOString().split('T')[0])
      setObservaciones('')
    }
  }, [open, dispatch])

  const handleSubmit = async () => {
    if (!bomberoId) {
      return
    }

    const result = await dispatch(asignarBombero({
      cargoId: cargo.id,
      bomberoId: parseInt(bomberoId),
      fechaInicio,
      periodoAnio,
      observaciones
    }))

    if (result.type === 'cargos/asignarBombero/fulfilled') {
      onClose()
    }
  }

  const bomberoSeleccionado = bomberos?.find(b => b.id === parseInt(bomberoId))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Asignar Bombero al Cargo de {cargo?.nombre}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Seleccionar Bombero</InputLabel>
            <Select
              value={bomberoId}
              onChange={(e) => setBomberoId(e.target.value)}
              label="Seleccionar Bombero"
            >
              <MenuItem value="">
                <em>Seleccione un bombero...</em>
              </MenuItem>
              {bomberosLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Cargando bomberos...
                </MenuItem>
              ) : bomberos && bomberos.length > 0 ? (
                bomberos.map((bombero) => (
                  <MenuItem key={bombero.id} value={bombero.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar 
                        src={bombero.fotoUrl} 
                        alt={`${bombero.nombres} ${bombero.apellidos}`}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box>
                        <Typography variant="body2">
                          {bombero.nombres} {bombero.apellidos}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bombero.rango} - {bombero.especialidad || 'Sin especialidad'}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <Typography variant="caption" color="text.secondary">
                    No hay bomberos disponibles
                  </Typography>
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {bomberoSeleccionado && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bombero seleccionado:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={bomberoSeleccionado.fotoUrl}
                  alt={`${bomberoSeleccionado.nombres} ${bomberoSeleccionado.apellidos}`}
                  sx={{ width: 60, height: 60 }}
                />
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {bomberoSeleccionado.nombres} {bomberoSeleccionado.apellidos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bomberoSeleccionado.rango}
                  </Typography>
                  {bomberoSeleccionado.especialidad && (
                    <Typography variant="caption" color="text.secondary">
                      {bomberoSeleccionado.especialidad}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            label="Período (Año)"
            type="number"
            value={periodoAnio}
            onChange={(e) => setPeriodoAnio(parseInt(e.target.value))}
            sx={{ mb: 2 }}
            inputProps={{ min: 2000, max: 2100 }}
          />

          <TextField
            fullWidth
            label="Fecha de Inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Observaciones (opcional)"
            multiline
            rows={3}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Agregue observaciones sobre esta asignación..."
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
          disabled={!bomberoId || loading === 'pending'}
          startIcon={loading === 'pending' ? <CircularProgress size={20} /> : null}
        >
          {loading === 'pending' ? 'Asignando...' : 'Asignar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AsignarCargoDialog
