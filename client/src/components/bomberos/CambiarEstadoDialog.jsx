import { useState } from 'react';
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
  Alert,
  Box,
  Chip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const CambiarEstadoDialog = ({ open, onClose, bombero, onConfirm }) => {
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');

  const estados = [
    { value: 'Activo', label: 'Activo', color: 'success' },
    { value: 'Suspendido', label: 'Suspendido', color: 'warning' },
    { value: 'Dado de Baja', label: 'Dado de Baja', color: 'error' },
    { value: 'Renuncia', label: 'Renuncia', color: 'default' }
  ];

  const handleSubmit = () => {
    // Validaciones
    if (!nuevoEstado) {
      setError('Debes seleccionar un estado');
      return;
    }

    if (nuevoEstado === bombero.estado) {
      setError(`El bombero ya tiene el estado: ${nuevoEstado}`);
      return;
    }

    if (!motivo.trim()) {
      setError('Debes ingresar un motivo para el cambio de estado');
      return;
    }

    // Confirmar cambio
    onConfirm({
      bomberoId: bombero.id,
      nuevoEstado,
      motivo: motivo.trim(),
      observaciones: observaciones.trim() || null
    });

    // Resetear formulario
    handleClose();
  };

  const handleClose = () => {
    setNuevoEstado('');
    setMotivo('');
    setObservaciones('');
    setError('');
    onClose();
  };

  if (!bombero) return null;

  const getEstadoActualColor = () => {
    const estado = estados.find(e => e.value === bombero.estado);
    return estado ? estado.color : 'default';
  };

  const getMensajeAdvertencia = () => {
    if (nuevoEstado === 'Suspendido') {
      return 'El bombero será suspendido temporalmente. No podrá crear nuevas licencias mientras esté suspendido.';
    }
    if (nuevoEstado === 'Dado de Baja') {
      return 'El bombero será dado de baja del servicio. No podrá crear nuevas licencias.';
    }
    if (nuevoEstado === 'Renuncia') {
      return 'Se registrará la renuncia del bombero. No podrá crear nuevas licencias.';
    }
    if (nuevoEstado === 'Activo' && bombero.estado !== 'Activo') {
      return 'El bombero será reactivado y podrá volver a crear licencias.';
    }
    return null;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Cambiar Estado de Bombero
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Alert severity="info">
            <strong>{bombero.nombres} {bombero.apellidos}</strong>
            <br />
            Estado actual: <Chip 
              label={bombero.estado} 
              color={getEstadoActualColor()} 
              size="small" 
              sx={{ ml: 1 }} 
            />
          </Alert>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Nuevo Estado *</InputLabel>
          <Select
            value={nuevoEstado}
            label="Nuevo Estado *"
            onChange={(e) => {
              setNuevoEstado(e.target.value);
              setError('');
            }}
          >
            {estados.map((estado) => (
              <MenuItem 
                key={estado.value} 
                value={estado.value}
                disabled={estado.value === bombero.estado}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={estado.label} 
                    color={estado.color} 
                    size="small" 
                  />
                  {estado.value === bombero.estado && ' (Estado actual)'}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {getMensajeAdvertencia() && (
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
            {getMensajeAdvertencia()}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Motivo del Cambio *"
          multiline
          rows={3}
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            setError('');
          }}
          placeholder="Ej: Sanción administrativa por ausencias injustificadas"
          sx={{ mb: 2 }}
          inputProps={{ maxLength: 500 }}
          helperText={`${motivo.length}/500 caracteres`}
        />

        <TextField
          fullWidth
          label="Observaciones (Opcional)"
          multiline
          rows={2}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Información adicional sobre el cambio de estado"
          inputProps={{ maxLength: 500 }}
          helperText={`${observaciones.length}/500 caracteres`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!nuevoEstado || !motivo.trim()}
        >
          Confirmar Cambio
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CambiarEstadoDialog;
