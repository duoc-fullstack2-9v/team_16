import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Button,
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
  Chip,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import LicenciaCard from '../components/licencias/LicenciaCard';
import LicenciaForm from '../components/licencias/LicenciaForm';
import FiltrosLicencias from '../components/licencias/FiltrosLicencias';
import {
  fetchLicencias,
  fetchTiposLicencia,
  createLicencia,
  updateLicencia,
  cancelLicencia,
  clearError,
} from '../store/slices/licenciasSlice';

const LicenciasPage = () => {
  const dispatch = useDispatch();
  const { licencias, tiposLicencia, loading, error, total } = useSelector(
    (state) => state.licencias
  );
  const { user } = useSelector((state) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [licenciaEditar, setLicenciaEditar] = useState(null);
  const [filtros, setFiltros] = useState({});
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [licenciaDetalle, setLicenciaDetalle] = useState(null);

  useEffect(() => {
    dispatch(fetchTiposLicencia());
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

  const handleCrear = () => {
    setLicenciaEditar(null);
    setDialogOpen(true);
  };

  const handleEditar = (licencia) => {
    setLicenciaEditar(licencia);
    setDialogOpen(true);
  };

  const handleCancelar = async (id) => {
    try {
      await dispatch(cancelLicencia(id)).unwrap();
      dispatch(fetchLicencias(filtros));
    } catch (err) {
      console.error('Error al cancelar licencia:', err);
    }
  };

  const handleSubmit = async (datos) => {
    try {
      if (licenciaEditar) {
        await dispatch(updateLicencia({ id: licenciaEditar.id, datos })).unwrap();
      } else {
        await dispatch(createLicencia(datos)).unwrap();
      }
      setDialogOpen(false);
      dispatch(fetchLicencias(filtros));
    } catch (err) {
      console.error('Error al guardar licencia:', err);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Mis Licencias
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCrear}
          size="large"
        >
          Nueva Licencia
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FiltrosLicencias onFiltrar={handleFiltrar} tiposLicencia={tiposLicencia} />
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
                onEditar={handleEditar}
                onCancelar={handleCancelar}
                onVerDetalle={handleVerDetalle}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Crear/Editar */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {licenciaEditar ? 'Editar Licencia' : 'Nueva Licencia'}
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <LicenciaForm
            licencia={licenciaEditar}
            tiposLicencia={tiposLicencia}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Detalle */}
      <Dialog
        open={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        maxWidth="md"
        fullWidth
      >
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
                  <Typography variant="body1">
                    {licenciaDetalle.diasSolicitados} días
                  </Typography>
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
                      <Typography variant="body1">
                        {licenciaDetalle.observacionesAdmin}
                      </Typography>
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
                        <Button
                          variant="outlined"
                          size="small"
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Documento {idx + 1}
                        </Button>
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
    </Container>
  );
};

export default LicenciasPage;
