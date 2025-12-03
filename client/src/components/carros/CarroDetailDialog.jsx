import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Tab,
  Tabs,
  Stack,
  Alert
} from '@mui/material'
import {
  Close as CloseIcon,
  LocalShipping as CarroIcon,
  Inventory as CajoneraIcon,
  Assignment as MaterialIcon,
  People as ConductoresIcon,
  Build as MantencionIcon,
  History as HistorialIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { fetchCarroById } from '../../store/slices/carrosSlice'
import { useState } from 'react'

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

function CarroDetailDialog({ open, onClose, carroId }) {
  const dispatch = useDispatch()
  const { selectedCarro, loading } = useSelector((state) => state.carros)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    if (open && carroId) {
      dispatch(fetchCarroById(carroId))
    }
  }, [dispatch, open, carroId])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  if (loading.detail || !selectedCarro) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  const carro = selectedCarro

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Operativo': return 'success'
      case 'Mantenimiento': return 'warning'
      case 'Fuera de Servicio': return 'error'
      default: return 'default'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CarroIcon sx={{ fontSize: 32 }} color="primary" />
          <Box>
            <Typography variant="h5">{carro.nombre}</Typography>
            <Typography variant="body2" color="text.secondary">
              {carro.marca} {carro.modelo} - {carro.patente}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Estado y Tipo */}
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip label={carro.tipo} color="primary" />
          <Chip label={carro.estadoOperativo} color={getEstadoColor(carro.estadoOperativo)} />
          <Chip label={`Año ${carro.anioFabricacion}`} variant="outlined" />
        </Stack>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<InfoIcon />} label="Info General" iconPosition="start" />
            <Tab icon={<CajoneraIcon />} label={`Cajoneras (${carro.cajoneras?.length || 0})`} iconPosition="start" />
            <Tab icon={<MaterialIcon />} label={`Material (${carro.asignacionesMaterial?.length || 0})`} iconPosition="start" />
            <Tab icon={<ConductoresIcon />} label={`Conductores (${carro.conductoresHabilitados?.length || 0})`} iconPosition="start" />
            <Tab icon={<MantencionIcon />} label={`Mantenciones (${carro.mantenciones?.length || 0})`} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab 1: Información General */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Datos del Vehículo
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Marca/Modelo</Typography>
                    <Typography variant="body1">{carro.marca} {carro.modelo}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Patente</Typography>
                    <Typography variant="body1">{carro.patente}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Año Fabricación</Typography>
                    <Typography variant="body1">{carro.anioFabricacion}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Capacidades
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1.5}>
                  {carro.capacidadAgua && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Capacidad Agua</Typography>
                      <Typography variant="body1">{carro.capacidadAgua} litros</Typography>
                    </Box>
                  )}
                  {carro.capacidadEspuma && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Capacidad Espuma</Typography>
                      <Typography variant="body1">{carro.capacidadEspuma} litros</Typography>
                    </Box>
                  )}
                  {carro.capacidadMotobomba && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Capacidad Motobomba</Typography>
                      <Typography variant="body1">{carro.capacidadMotobomba}</Typography>
                    </Box>
                  )}
                  {carro.potenciaMotobomba && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Potencia Motobomba</Typography>
                      <Typography variant="body1">{carro.potenciaMotobomba}</Typography>
                    </Box>
                  )}
                  {carro.capacidadCarga && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Capacidad Carga</Typography>
                      <Typography variant="body1">{carro.capacidadCarga}</Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {carro.caracteristicas && Object.keys(carro.caracteristicas).length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Características Adicionales
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {Object.entries(carro.caracteristicas).map(([key, value]) => (
                      <Grid item xs={12} sm={6} md={3} key={key}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {key}
                        </Typography>
                        <Typography variant="body1">{value}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Fechas Importantes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {carro.fechaProximaMantencion && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Próxima Mantención</Typography>
                      <Typography variant="body1">{new Date(carro.fechaProximaMantencion).toLocaleDateString()}</Typography>
                    </Grid>
                  )}
                  {carro.fechaRevisionTecnica && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Revisión Técnica</Typography>
                      <Typography variant="body1">{new Date(carro.fechaRevisionTecnica).toLocaleDateString()}</Typography>
                    </Grid>
                  )}
                  {carro.fechaPermisoCirculacion && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Permiso Circulación</Typography>
                      <Typography variant="body1">{new Date(carro.fechaPermisoCirculacion).toLocaleDateString()}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {carro.observaciones && (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Observaciones
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2">{carro.observaciones}</Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Tab 2: Cajoneras */}
        <TabPanel value={tabValue} index={1}>
          {carro.cajoneras?.length > 0 ? (
            <List>
              {carro.cajoneras.map((cajonera) => (
                <Paper key={cajonera.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                  <ListItem sx={{ px: 0 }}>
                    <CajoneraIcon sx={{ mr: 2 }} color="primary" />
                    <ListItemText
                      primary={cajonera.nombre}
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Posición:</strong> {cajonera.posicion}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Estado:</strong> <Chip label={cajonera.estado} size="small" color={cajonera.estado === 'Operativa' ? 'success' : 'warning'} />
                          </Typography>
                          {cajonera.observaciones && (
                            <Typography variant="body2" color="text.secondary">
                              {cajonera.observaciones}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Alert severity="info">No hay cajoneras registradas</Alert>
          )}
        </TabPanel>

        {/* Tab 3: Material Asignado */}
        <TabPanel value={tabValue} index={2}>
          {carro.asignacionesMaterial?.length > 0 ? (
            <List>
              {carro.asignacionesMaterial.map((asignacion) => (
                <Paper key={asignacion.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                  <ListItem sx={{ px: 0 }}>
                    <MaterialIcon sx={{ mr: 2 }} color="primary" />
                    <ListItemText
                      primary={asignacion.material?.nombre || 'Material'}
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Tipo:</strong> {asignacion.material?.tipo || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Ubicación:</strong> {asignacion.cajonera ? asignacion.cajonera.nombre : 'Sin cajonera específica'}
                          </Typography>
                          {asignacion.motivo && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Motivo:</strong> {asignacion.motivo}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Asignado: {new Date(asignacion.createdAt).toLocaleString()}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Alert severity="info">No hay material asignado a este carro</Alert>
          )}
        </TabPanel>

        {/* Tab 4: Conductores */}
        <TabPanel value={tabValue} index={3}>
          {carro.conductoresHabilitados?.length > 0 ? (
            <List>
              {carro.conductoresHabilitados.map((conductor) => (
                <Paper key={conductor.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ConductoresIcon sx={{ mr: 2 }} color="primary" />
                    <ListItemText
                      primary={`${conductor.bombero?.nombres || ''} ${conductor.bombero?.apellidos || ''}`}
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Rango:</strong> {conductor.bombero?.rango || 'N/A'}
                          </Typography>
                          {conductor.observaciones && (
                            <Typography variant="body2" color="text.secondary">
                              {conductor.observaciones}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Habilitado: {new Date(conductor.createdAt).toLocaleString()}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Alert severity="info">No hay conductores habilitados para este carro</Alert>
          )}
        </TabPanel>

        {/* Tab 5: Mantenciones */}
        <TabPanel value={tabValue} index={4}>
          {carro.mantenciones?.length > 0 ? (
            <List>
              {carro.mantenciones.map((mantencion) => (
                <Paper key={mantencion.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                  <ListItem sx={{ px: 0 }}>
                    <MantencionIcon sx={{ mr: 2 }} color="primary" />
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle2">{mantencion.tipo}</Typography>
                          <Chip label={new Date(mantencion.fechaRealizada).toLocaleDateString()} size="small" />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                          <Typography variant="body2">{mantencion.descripcion}</Typography>
                          {mantencion.realizadoPor && (
                            <Typography variant="body2">
                              <strong>Realizado por:</strong> {mantencion.realizadoPor}
                            </Typography>
                          )}
                          {mantencion.costo && (
                            <Typography variant="body2">
                              <strong>Costo:</strong> ${mantencion.costo.toLocaleString()}
                            </Typography>
                          )}
                          {mantencion.proximaFecha && (
                            <Typography variant="body2" color="warning.main">
                              <strong>Próxima mantención:</strong> {new Date(mantencion.proximaFecha).toLocaleDateString()}
                            </Typography>
                          )}
                          {mantencion.observaciones && (
                            <Typography variant="body2" color="text.secondary">
                              {mantencion.observaciones}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Alert severity="info">No hay mantenciones registradas</Alert>
          )}
        </TabPanel>
      </DialogContent>
    </Dialog>
  )
}

export default CarroDetailDialog
