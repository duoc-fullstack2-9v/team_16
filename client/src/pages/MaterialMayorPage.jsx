import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Chip,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material'
import {
  LocalShipping as CarrosIcon,
  CheckCircle as OperativoIcon,
  Build as MantenimientoIcon,
  Cancel as FueraServicioIcon,
  Warning as AlertaIcon,
  Inventory as CajoneraIcon,
  Assignment as MaterialIcon,
  History as HistorialIcon
} from '@mui/icons-material'
import { fetchCarros, fetchCarrosEstadisticas, fetchCarrosAlertas } from '../store/slices/carrosSlice'
import CarrosTab from '../components/carros/CarrosTab'
import CajonerasTab from '../components/carros/CajonerasTab'
import MaterialCarroTab from '../components/carros/MaterialCarroTab'
import HistorialCarroTab from '../components/carros/HistorialCarroTab'

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function MaterialMayorPage() {
  const dispatch = useDispatch()
  const [tabValue, setTabValue] = useState(0)
  
  const { estadisticas, alertas, loading } = useSelector((state) => state.carros)

  useEffect(() => {
    dispatch(fetchCarrosEstadisticas())
    dispatch(fetchCarrosAlertas())
    dispatch(fetchCarros({ page: 1, limit: 10 }))
  }, [dispatch])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Calcular total de alertas
  const totalAlertas = alertas?.totales?.criticas + alertas?.totales?.advertencias || 0

  // KPIs Cards
  const kpiCards = [
    {
      title: 'Total Carros',
      value: estadisticas?.totalCarros || 0,
      icon: <CarrosIcon sx={{ fontSize: 40 }} />,
      color: 'primary.main',
      bgColor: 'primary.light'
    },
    {
      title: 'Operativos',
      value: estadisticas?.operativos || 0,
      icon: <OperativoIcon sx={{ fontSize: 40 }} />,
      color: 'success.main',
      bgColor: 'success.light'
    },
    {
      title: 'En Mantenimiento',
      value: estadisticas?.enMantenimiento || 0,
      icon: <MantenimientoIcon sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      bgColor: 'warning.light'
    },
    {
      title: 'Fuera de Servicio',
      value: estadisticas?.fueraServicio || 0,
      icon: <FueraServicioIcon sx={{ fontSize: 40 }} />,
      color: 'error.main',
      bgColor: 'error.light'
    }
  ]

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CarrosIcon sx={{ fontSize: 40 }} />
          Material Mayor - Carros de Bomberos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión integral de la flota de vehículos de emergencia
        </Typography>
      </Box>

      {/* KPIs Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={3}
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h3" sx={{ color: kpi.color, fontWeight: 'bold' }}>
                      {loading.estadisticas ? <CircularProgress size={40} /> : kpi.value}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: kpi.bgColor,
                      color: kpi.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Alertas Panel */}
      {totalAlertas > 0 && alertas && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'warning.lighter', borderLeft: 4, borderColor: 'warning.main' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <AlertaIcon color="warning" sx={{ fontSize: 32 }} />
            <Typography variant="h6" color="warning.dark">
              Sistema de Alertas ({totalAlertas} alertas activas)
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Alertas Críticas */}
            {alertas.totales.criticas > 0 && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🚨 Alertas Críticas ({alertas.totales.criticas})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {alertas.mantencion?.atrasadas?.length > 0 && (
                      <Chip 
                        label={`Mantenciones atrasadas: ${alertas.mantencion.atrasadas.length}`}
                        color="error" 
                        size="small" 
                      />
                    )}
                    {alertas.revisionTecnica?.atrasadas?.length > 0 && (
                      <Chip 
                        label={`Revisiones técnicas vencidas: ${alertas.revisionTecnica.atrasadas.length}`}
                        color="error" 
                        size="small" 
                      />
                    )}
                    {alertas.permisoCirculacion?.atrasados?.length > 0 && (
                      <Chip 
                        label={`Permisos circulación vencidos: ${alertas.permisoCirculacion.atrasados.length}`}
                        color="error" 
                        size="small" 
                      />
                    )}
                  </Stack>
                </Alert>
              </Grid>
            )}

            {/* Advertencias */}
            {alertas.totales.advertencias > 0 && (
              <Grid item xs={12}>
                <Alert severity="warning">
                  <Typography variant="subtitle2" gutterBottom>
                    ⚠️ Advertencias ({alertas.totales.advertencias})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {alertas.mantencion?.proximas?.length > 0 && (
                      <Chip 
                        label={`Mantenciones próximas (30 días): ${alertas.mantencion.proximas.length}`}
                        color="warning" 
                        size="small" 
                      />
                    )}
                    {alertas.revisionTecnica?.proximas?.length > 0 && (
                      <Chip 
                        label={`Revisiones técnicas próximas: ${alertas.revisionTecnica.proximas.length}`}
                        color="warning" 
                        size="small" 
                      />
                    )}
                    {alertas.permisoCirculacion?.proximos?.length > 0 && (
                      <Chip 
                        label={`Permisos próximos a vencer: ${alertas.permisoCirculacion.proximos.length}`}
                        color="warning" 
                        size="small" 
                      />
                    )}
                  </Stack>
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Tabs Section */}
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { 
                py: 2,
                fontSize: '0.95rem',
                fontWeight: 500
              }
            }}
          >
            <Tab 
              icon={<CarrosIcon />} 
              label="Info Carros" 
              iconPosition="start"
            />
            <Tab 
              icon={<CajoneraIcon />} 
              label="Cajoneras" 
              iconPosition="start"
            />
            <Tab 
              icon={<MaterialIcon />} 
              label="Material Asignado" 
              iconPosition="start"
            />
            <Tab 
              icon={<HistorialIcon />} 
              label="Historial" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <CarrosTab />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CajonerasTab />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <MaterialCarroTab />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <HistorialCarroTab />
        </TabPanel>
      </Paper>
    </Container>
  )
}

export default MaterialMayorPage
