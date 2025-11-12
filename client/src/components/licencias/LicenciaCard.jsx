import { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Avatar,
  Button,
  Box,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Description,
  Warning,
  Edit,
  Cancel,
  Visibility,
  CheckCircle,
  Error as ErrorIcon,
  Block,
} from '@mui/icons-material';
import { formatearFecha } from '../../utils/formatters';

const LicenciaCard = ({ licencia, onEditar, onCancelar, onVerDetalle, esAdmin = false }) => {
  const [dialogCancelar, setDialogCancelar] = useState(false);

  // Determinar color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Aprobada':
        return 'success';
      case 'Rechazada':
        return 'error';
      case 'Cancelada':
        return 'default';
      case 'Activa':
        return 'info';
      case 'Finalizada':
        return 'default';
      default:
        return 'default';
    }
  };

  // Determinar icono del estado
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return <AccessTime fontSize="small" />;
      case 'Aprobada':
        return <CheckCircle fontSize="small" />;
      case 'Rechazada':
        return <ErrorIcon fontSize="small" />;
      case 'Cancelada':
        return <Block fontSize="small" />;
      case 'Activa':
        return <CheckCircle fontSize="small" />;
      case 'Finalizada':
        return <CheckCircle fontSize="small" />;
      default:
        return null;
    }
  };

  const handleCancelar = () => {
    setDialogCancelar(false);
    if (onCancelar) {
      onCancelar(licencia.id);
    }
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-4px)',
            transition: 'all 0.3s ease-in-out',
          },
        }}
      >
        {/* Indicador de conflicto de guardia */}
        {licencia.tieneConflictoGuardia && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            <Tooltip title="Tiene guardia asignada en estas fechas">
              <Warning color="warning" />
            </Tooltip>
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Header con avatar y nombre */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={licencia.bombero?.fotoPerfil}
              alt={`${licencia.bombero?.nombre} ${licencia.bombero?.apellidos}`}
              sx={{ width: 48, height: 48, mr: 2 }}
            >
              {licencia.bombero?.nombre?.[0]}{licencia.bombero?.apellidos?.[0]}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {licencia.bombero?.nombre} {licencia.bombero?.apellidos}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {licencia.bombero?.rut}
              </Typography>
            </Box>
          </Box>

          {/* Tipo de licencia */}
          <Box sx={{ mb: 2 }}>
            <Chip
              label={licencia.tipoLicencia?.nombre || 'Sin tipo'}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              icon={getEstadoIcon(licencia.estado)}
              label={licencia.estado}
              color={getEstadoColor(licencia.estado)}
              size="small"
            />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* Fechas */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarToday sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatearFecha(licencia.fechaInicio)} - {formatearFecha(licencia.fechaFin)}
            </Typography>
          </Box>

          {/* Días de la semana seleccionados */}
          {licencia.diasSemana && Array.isArray(licencia.diasSemana) && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Días seleccionados:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {licencia.diasSemana
                  .filter(d => d.activo)
                  .map((dia, idx) => (
                    <Chip
                      key={idx}
                      label={dia.label}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
              </Box>
            </Box>
          )}

          {/* Horario */}
          {licencia.mismoHorarioTodos && licencia.horaInicioGeneral && licencia.horaFinGeneral ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {licencia.horaInicioGeneral} - {licencia.horaFinGeneral} (todos los días)
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Horario personalizado por día
              </Typography>
            </Box>
          )}

          {/* Días y horas totales */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarToday sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" fontWeight="medium">
              {licencia.diasSolicitados} días • {licencia.horasTotales || 0} horas
            </Typography>
          </Box>

          {/* Documentos */}
          {licencia.documentosUrls && licencia.documentosUrls.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Description sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {licencia.documentosUrls.length} documento(s)
              </Typography>
            </Box>
          )}

          {/* Motivo (preview) */}
          {licencia.motivo && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {licencia.motivo}
            </Typography>
          )}

          {/* Observaciones del admin (si existen) */}
          {licencia.observacionesAdmin && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                Observaciones:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {licencia.observacionesAdmin}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => onVerDetalle && onVerDetalle(licencia)}
          >
            Ver Detalles
          </Button>

          <Box>
            {/* Botones solo para licencias pendientes */}
            {licencia.estado === 'Pendiente' && !esAdmin && (
              <>
                <Tooltip title="Editar licencia">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEditar && onEditar(licencia)}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancelar licencia">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDialogCancelar(true)}
                  >
                    <Cancel fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </CardActions>
      </Card>

      {/* Dialog de confirmación para cancelar */}
      <Dialog open={dialogCancelar} onClose={() => setDialogCancelar(false)}>
        <DialogTitle>¿Cancelar Licencia?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas cancelar esta licencia? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCancelar(false)}>No, mantener</Button>
          <Button onClick={handleCancelar} color="error" variant="contained">
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LicenciaCard;
