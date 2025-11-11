import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { Close, People, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import LicenciaCard from '../components/licencias/LicenciaCard';
import FiltrosLicencias from '../components/licencias/FiltrosLicencias';
import AprobarRechazarDialog from '../components/licencias/AprobarRechazarDialog';
import {
  fetchLicencias,
  fetchTiposLicencia,
  fetchEstadisticas,
  aprobarLicencia,
  rechazarLicencia,
  clearError,
} from '../store/slices/licenciasSlice';

const AdminLicenciasPage = () => {
  const dispatch = useDispatch();
  const { licencias, tiposLicencia, estadisticas, loading, error, total } = useSelector(
    (state) => state.licencias
  );

  const [tabValue, setTabValue] = useState(0);
  const [filtros, setFiltros] = useState({});
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [licenciaDetalle, setLicenciaDetalle] = useState(null);
  const [aprobarDialog, setAprobarDialog] = useState(false);
  const [rechazarDialog, setRechazarDialog] = useState(false);
  const [licenciaActual, setLicenciaActual] = useState(null);

  useEffect(() => {
    dispatch(fetchTiposLicencia());
    dispatch(fetchEstadisticas());
  }, [dispatch]);

  useEffect(() => {
    const params = { ...filtros };

    // Filtrar por estado según la pestaña
    if (tabValue === 0) {
      // Todas
    } else if (tabValue === 1) {
      params.estado = 'Pendiente';
    } else if (tabValue === 2) {
      params.estado = 'Aprobada';
    } else if (tabValue === 3) {
      params.estado = 'Rechazada';
    }

    dispatch(fetchLicencias(params));
  }, [dispatch, filtros, tabValue]);

  const handleAprobar = (licencia) => {
    setLicenciaActual(licencia);
    setAprobarDialog(true);
  };

  const handleRechazar = (licencia) => {
    setLicenciaActual(licencia);
    setRechazarDialog(true);
  };

  const handleConfirmarAprobar = async (observaciones) => {
    try {
      await dispatch(
        aprobarLicencia({
          id: licenciaActual.id,
          observacionesAdmin: observaciones,
        })
      ).unwrap();
      setAprobarDialog(false);
      dispatch(fetchLicencias(filtros));
      dispatch(fetchEstadisticas());
    } catch (err) {
      console.error('Error al aprobar licencia:', err);
    }
  };

  const handleConfirmarRechazar = async (observaciones) => {
    try {
      await dispatch(
        rechazarLicencia({
          id: licenciaActual.id,
          observacionesAdmin: observaciones,
        })
      ).unwrap();
      setRechazarDialog(false);
      dispatch(fetchLicencias(filtros));
      dispatch(fetchEstadisticas());
    } catch (err) {
      console.error('Error al rechazar licencia:', err);
    }
  };

  const handleVerDetalle = (licencia) => {
    setLicenciaDetalle(licencia);
    setDetalleOpen(true);
  };

  const handleFiltrar = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Administración de Licencias
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {estadisticas.totalLicencias}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Licencias
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <HourglassEmpty color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {estadisticas.pendientes}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Pendientes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {estadisticas.totalDiasAprobados}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Días Aprobados
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Por Tipo
                </Typography>
                {estadisticas.porTipo?.slice(0, 3).map((tipo, idx) => (
                  <Chip
                    key={idx}
                    label={`${tipo.tipo}: ${tipo.cantidad}`}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FiltrosLicencias
          onFiltrar={handleFiltrar}
          tiposLicencia={tiposLicencia}
          esAdmin
        />
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Todas (${total})`} />
          <Tab label="Pendientes" />
          <Tab label="Aprobadas" />
          <Tab label="Rechazadas" />
        </Tabs>
      </Paper>

      {/* Lista de Licencias */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : licencias.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay licencias para mostrar
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {licencias.map((licencia) => (
            <Grid item xs={12} sm={6} md={4} key={licencia.id}>
              <LicenciaCard
                licencia={licencia}
                onVerDetalle={handleVerDetalle}
                esAdmin
              />
              {licencia.estado === 'Pendiente' && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <button
                    onClick={() => handleAprobar(licencia)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleRechazar(licencia)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Rechazar
                  </button>
                </Box>
              )}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Detalle */}
      <Dialog open={detalleOpen} onClose={() => setDetalleOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalle de Licencia
          <IconButton
            onClick={() => setDetalleOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {licenciaDetalle && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bombero
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {licenciaDetalle.bombero?.nombre} {licenciaDetalle.bombero?.apellidos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {licenciaDetalle.bombero?.rut}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Licencia
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {licenciaDetalle.tipoLicencia?.nombre}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha Inicio
                  </Typography>
                  <Typography variant="body1">
                    {new Date(licenciaDetalle.fechaInicio).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha Fin
                  </Typography>
                  <Typography variant="body1">
                    {new Date(licenciaDetalle.fechaFin).toLocaleDateString()}
                  </Typography>
                </Grid>

                {licenciaDetalle.esPorHoras && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Hora Inicio
                      </Typography>
                      <Typography variant="body1">{licenciaDetalle.horaInicio}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Hora Fin
                      </Typography>
                      <Typography variant="body1">{licenciaDetalle.horaFin}</Typography>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Días Solicitados
                  </Typography>
                  <Typography variant="body1">{licenciaDetalle.diasSolicitados} días</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip label={licenciaDetalle.estado} color="primary" size="small" />
                </Grid>

                {licenciaDetalle.motivo && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Motivo
                    </Typography>
                    <Typography variant="body1">{licenciaDetalle.motivo}</Typography>
                  </Grid>
                )}

                {licenciaDetalle.observacionesAdmin && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Observaciones del Administrador
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                      <Typography variant="body1">{licenciaDetalle.observacionesAdmin}</Typography>
                    </Paper>
                  </Grid>
                )}

                {licenciaDetalle.documentosUrls && licenciaDetalle.documentosUrls.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Documentos Adjuntos
                    </Typography>
                    {licenciaDetalle.documentosUrls.map((url, idx) => (
                      <Box key={idx} sx={{ mt: 1 }}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          Documento {idx + 1}
                        </a>
                      </Box>
                    ))}
                  </Grid>
                )}

                {licenciaDetalle.tieneConflictoGuardia && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      Esta licencia tiene conflicto con guardias asignadas
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Aprobar */}
      {aprobarDialog && (
        <AprobarRechazarDialog
          open={aprobarDialog}
          onClose={() => setAprobarDialog(false)}
          onConfirm={handleConfirmarAprobar}
          tipo="aprobar"
          licencia={licenciaActual}
        />
      )}

      {/* Dialog Rechazar */}
      {rechazarDialog && (
        <AprobarRechazarDialog
          open={rechazarDialog}
          onClose={() => setRechazarDialog(false)}
          onConfirm={handleConfirmarRechazar}
          tipo="rechazar"
          licencia={licenciaActual}
        />
      )}
    </Container>
  );
};

export default AdminLicenciasPage;
