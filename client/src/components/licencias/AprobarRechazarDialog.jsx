import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Chip,
  Avatar,
  Grid,
} from '@mui/material';
import { CheckCircle, Cancel, CalendarToday, AccessTime, Description } from '@mui/icons-material';
import { formatearFecha } from '../../utils/formatters';

const AprobarRechazarDialog = ({ 
  open, 
  onClose, 
  licencia, 
  accion, // 'aprobar' o 'rechazar'
  onConfirmar,
}) => {
  const [observaciones, setObservaciones] = useState('');

  const handleConfirmar = () => {
    onConfirmar(licencia.id, observaciones);
    setObservaciones('');
    onClose();
  };

  const handleCancelar = () => {
    setObservaciones('');
    onClose();
  };

  if (!licencia) return null;

  const esAprobar = accion === 'aprobar';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {esAprobar ? (
            <CheckCircle color="success" sx={{ mr: 1 }} />
          ) : (
            <Cancel color="error" sx={{ mr: 1 }} />
          )}
          <Typography variant="h6">
            {esAprobar ? 'Aprobar Licencia' : 'Rechazar Licencia'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Información del Bombero */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={licencia.bombero?.fotoPerfil}
            alt={`${licencia.bombero?.nombre} ${licencia.bombero?.apellidos}`}
            sx={{ width: 56, height: 56, mr: 2 }}
          >
            {licencia.bombero?.nombre?.[0]}{licencia.bombero?.apellidos?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {licencia.bombero?.nombre} {licencia.bombero?.apellidos}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {licencia.bombero?.rut} - {licencia.bombero?.rango}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Detalles de la Licencia */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Tipo de Licencia
            </Typography>
            <Chip
              label={licencia.tipoLicencia?.nombre || 'Sin tipo'}
              color="primary"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Período
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <CalendarToday sx={{ fontSize: 18, mr: 1 }} />
              <Typography variant="body2">
                {formatearFecha(licencia.fechaInicio)} - {formatearFecha(licencia.fechaFin)}
              </Typography>
            </Box>
          </Grid>

          {licencia.esPorHoras && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Horario
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <AccessTime sx={{ fontSize: 18, mr: 1 }} />
                <Typography variant="body2">
                  {licencia.horaInicio} - {licencia.horaFin}
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Días Solicitados
            </Typography>
            <Typography variant="body1" fontWeight="medium" sx={{ mt: 0.5 }}>
              {licencia.diasSolicitados} {licencia.esPorHoras ? 'días equivalentes' : 'días'}
            </Typography>
          </Grid>

          {licencia.motivo && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Motivo
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {licencia.motivo}
              </Typography>
            </Grid>
          )}

          {licencia.documentosUrls && licencia.documentosUrls.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Documentos
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Description sx={{ fontSize: 18, mr: 1 }} />
                <Typography variant="body2">
                  {licencia.documentosUrls.length} documento(s) adjunto(s)
                </Typography>
              </Box>
            </Grid>
          )}

          {licencia.tieneConflictoGuardia && (
            <Grid item xs={12}>
              <Chip
                label="⚠️ Tiene guardia asignada en estas fechas"
                color="warning"
                size="small"
              />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Campo de Observaciones */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label={`Observaciones ${esAprobar ? '(opcional)' : '(requerido para rechazo)'}`}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder={
            esAprobar 
              ? 'Agrega comentarios adicionales si lo deseas...'
              : 'Explica el motivo del rechazo...'
          }
          inputProps={{ maxLength: 500 }}
          helperText={`${observaciones.length}/500 caracteres`}
        />

        {!esAprobar && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            * Es importante especificar el motivo del rechazo
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancelar}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          color={esAprobar ? 'success' : 'error'}
          disabled={!esAprobar && !observaciones.trim()}
        >
          {esAprobar ? 'Aprobar Licencia' : 'Rechazar Licencia'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AprobarRechazarDialog;
