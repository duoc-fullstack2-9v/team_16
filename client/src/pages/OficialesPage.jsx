import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton
} from '@mui/material'
import {
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  AccountTree as HierarchyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOficiales,
  fetchEstadisticas,
  fetchJerarquia,
  selectOficiales,
  selectEstadisticas,
  selectJerarquia,
  selectOficialesLoading,
  selectEstadisticasLoading,
  selectJerarquiaLoading,
  selectError,
  clearError
} from '../features/oficiales/oficialesSlice'
import OficialesList from '../components/oficiales/OficialesList'

// Componente de estadísticas
const EstadisticasTab = () => {
  const dispatch = useDispatch()
  const estadisticas = useSelector(selectEstadisticas)
  const loading = useSelector(selectEstadisticasLoading)
  const error = useSelector(selectError)

  useEffect(() => {
    dispatch(fetchEstadisticas())
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(fetchEstadisticas())
  }

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar estadísticas: {error}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header con botón de actualizar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Estadísticas de Oficiales</Typography>
        <Tooltip title="Actualizar estadísticas">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Resumen general */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Oficiales</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {estadisticas.total}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={`${estadisticas.totalActivos} Activos`} 
                  color="success" 
                  size="small" 
                />
                {estadisticas.totalInactivos > 0 && (
                  <Chip 
                    label={`${estadisticas.totalInactivos} Inactivos`} 
                    color="error" 
                    size="small" 
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por rango */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Rango
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {estadisticas.porRango?.map((item) => (
                  <Box 
                    key={item.rango} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2">{item.rango}</Typography>
                    <Chip 
                      label={item.cantidad} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por departamento */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Departamento
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {estadisticas.porDepartamento?.map((item) => (
                  <Box 
                    key={item.departamento} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2">{item.departamento}</Typography>
                    <Chip 
                      label={item.cantidad} 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Oficiales más experimentados */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Oficiales con Mayor Experiencia
              </Typography>
              <Grid container spacing={2}>
                {estadisticas.masExperimentados?.map((oficial) => (
                  <Grid item xs={12} sm={6} md={4} key={oficial.id}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2">
                        {oficial.nombres} {oficial.apellidos}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip 
                          label={oficial.rango} 
                          size="small" 
                          color="primary" 
                        />
                        <Chip 
                          label={`${oficial.experienciaAnios} años`} 
                          size="small" 
                          color="secondary" 
                          variant="outlined" 
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

// Componente de jerarquía organizacional
const JerarquiaTab = () => {
  const dispatch = useDispatch()
  const jerarquia = useSelector(selectJerarquia)
  const estadisticas = useSelector(selectEstadisticas)
  const loading = useSelector(selectJerarquiaLoading)
  const error = useSelector(selectError)

  useEffect(() => {
    dispatch(fetchJerarquia())
    dispatch(fetchEstadisticas()) // Para obtener la comandancia
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(fetchJerarquia())
    dispatch(fetchEstadisticas())
  }

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error al cargar jerarquía: {error}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Jerarquía Organizacional</Typography>
        <Tooltip title="Actualizar jerarquía">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Comandancia */}
      {estadisticas.comandancia?.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <HierarchyIcon sx={{ mr: 1 }} />
            Comandancia
          </Typography>
          <Grid container spacing={2}>
            {estadisticas.comandancia.map((comandante) => (
              <Grid item xs={12} md={6} key={comandante.id}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6">
                      {comandante.nombres} {comandante.apellidos}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
                      <Chip 
                        label={comandante.rango} 
                        sx={{ bgcolor: 'white', color: 'primary.main' }}
                        size="small" 
                      />
                      {comandante.departamento && (
                        <Chip 
                          label={comandante.departamento} 
                          variant="outlined" 
                          sx={{ borderColor: 'white', color: 'white' }}
                          size="small" 
                        />
                      )}
                    </Box>
                    
                    {/* Subordinados */}
                    {comandante.subordinados?.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Subordinados Directos: {comandante.subordinados.length}
                        </Typography>
                        <Grid container spacing={1}>
                          {comandante.subordinados.slice(0, 3).map((subordinado) => (
                            <Grid item xs={12} sm={4} key={subordinado.id}>
                              <Paper sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.2)' }}>
                                <Typography variant="caption" sx={{ color: 'white' }}>
                                  {subordinado.nombres} {subordinado.apellidos}
                                </Typography>
                                <br />
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                  {subordinado.rango}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                          {comandante.subordinados.length > 3 && (
                            <Grid item xs={12}>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                +{comandante.subordinados.length - 3} más...
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Información adicional */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        La jerarquía organizacional muestra la estructura de mando y las relaciones 
        superior-subordinado entre los oficiales activos de la compañía.
      </Typography>
    </Box>
  )
}

// Componente principal
const OficialesPage = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const dispatch = useDispatch()
  const error = useSelector(selectError)

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  // Limpiar errores al cambiar de tab
  useEffect(() => {
    if (error) {
      dispatch(clearError())
    }
  }, [currentTab, dispatch, error])

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab 
            icon={<PeopleIcon />} 
            label="Lista de Oficiales" 
            iconPosition="start"
          />
          <Tab 
            icon={<AssessmentIcon />} 
            label="Estadísticas" 
            iconPosition="start"
          />
          <Tab 
            icon={<TimelineIcon />} 
            label="Jerarquía Organizacional" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Contenido de las tabs */}
      {currentTab === 0 && <OficialesList />}
      {currentTab === 1 && <EstadisticasTab />}
      {currentTab === 2 && <JerarquiaTab />}
    </Container>
  )
}

export default OficialesPage