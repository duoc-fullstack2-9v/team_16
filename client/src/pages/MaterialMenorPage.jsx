import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Inventory2 as InventoryIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
  Add as AddIcon
} from '@mui/icons-material'
import {
  fetchMaterial,
  fetchMaterialEstadisticas,
  fetchMaterialAlertas
} from '../store/slices/materialSlice'
import { fetchCategorias } from '../store/slices/categoriasSlice'

function MaterialMenorPage() {
  const dispatch = useDispatch()
  const [tabValue, setTabValue] = useState(0)

  const { 
    items: material, 
    estadisticas, 
    alertas, 
    loading, 
    error 
  } = useSelector((state) => state.material)
  
  const { items: categorias } = useSelector((state) => state.categorias)

  useEffect(() => {
    dispatch(fetchMaterial())
    dispatch(fetchMaterialEstadisticas())
    dispatch(fetchMaterialAlertas())
    dispatch(fetchCategorias({ flat: true }))
  }, [dispatch])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            📦 Material Menor
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
          >
            Nuevo Material
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Estadísticas */}
        {estadisticas && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Total Material
                      </Typography>
                      <Typography variant="h4">
                        {estadisticas.totalMaterial || 0}
                      </Typography>
                    </Box>
                    <InventoryIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Asignado
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {estadisticas.totalAsignado || 0}
                      </Typography>
                    </Box>
                    <InventoryIcon sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Disponible
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {estadisticas.totalDisponible || 0}
                      </Typography>
                    </Box>
                    <InventoryIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        Alertas
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {alertas?.totalAlertas || 0}
                      </Typography>
                    </Box>
                    <WarningIcon sx={{ fontSize: 48, color: 'error.main', opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="material tabs">
            <Tab label="Material" />
            <Tab label="Categorías" />
            <Tab 
              label="Alertas" 
              icon={alertas?.totalAlertas > 0 ? <Chip label={alertas.totalAlertas} size="small" color="error" /> : null}
              iconPosition="end"
            />
          </Tabs>
        </Paper>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Tab 0: Material */}
            {tabValue === 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📦 Listado de Material
                </Typography>
                {material && material.length > 0 ? (
                  <Grid container spacing={2}>
                    {material.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {item.nombre}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              {item.descripcion || 'Sin descripción'}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Chip 
                                label={item.estado} 
                                size="small" 
                                color={
                                  item.estado === 'Disponible' ? 'success' :
                                  item.estado === 'En Uso' ? 'warning' :
                                  item.estado === 'Mantenimiento' ? 'info' : 'default'
                                }
                                sx={{ mr: 1 }}
                              />
                              <Chip 
                                label={item.tipo === 'individual' ? '🔢 Individual' : '📊 Cantidad'} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                            {item.tipo === 'individual' && item.numeroSerie && (
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                S/N: {item.numeroSerie}
                              </Typography>
                            )}
                            {item.tipo === 'cantidad' && (
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Cantidad: {item.cantidad} {item.unidadMedida}
                              </Typography>
                            )}
                            {item.categoria && (
                              <Typography variant="caption" display="block" color="primary">
                                📁 {item.categoria.nombre}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No hay material registrado. Haz clic en "Nuevo Material" para agregar uno.
                  </Alert>
                )}
              </Paper>
            )}

            {/* Tab 1: Categorías */}
            {tabValue === 1 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📂 Categorías
                </Typography>
                {categorias && categorias.length > 0 ? (
                  <Grid container spacing={2}>
                    {categorias.map((cat) => (
                      <Grid item xs={12} sm={6} md={4} key={cat.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="h6">
                                {cat.nombre}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {cat.descripcion || 'Sin descripción'}
                            </Typography>
                            {cat.parent && (
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                ↳ Subcategoría de: {cat.parent.nombre}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No hay categorías registradas.
                  </Alert>
                )}
              </Paper>
            )}

            {/* Tab 2: Alertas */}
            {tabValue === 2 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ⚠️ Alertas
                </Typography>
                {alertas && alertas.totalAlertas > 0 ? (
                  <Grid container spacing={2}>
                    {/* Alertas de múltiples asignaciones */}
                    {alertas.alertas.multipleAsignaciones?.length > 0 && (
                      <Grid item xs={12}>
                        <Alert severity="error">
                          <Typography variant="subtitle1" gutterBottom>
                            Múltiples Asignaciones ({alertas.alertas.multipleAsignaciones.length})
                          </Typography>
                          {alertas.alertas.multipleAsignaciones.map((item) => (
                            <Typography key={item.id} variant="body2">
                              • {item.nombre} - {item.mensaje}
                            </Typography>
                          ))}
                        </Alert>
                      </Grid>
                    )}
                    
                    {/* Alertas de vencimiento */}
                    {alertas.alertas.proximoVencer?.length > 0 && (
                      <Grid item xs={12}>
                        <Alert severity="warning">
                          <Typography variant="subtitle1" gutterBottom>
                            Próximo a Vencer ({alertas.alertas.proximoVencer.length})
                          </Typography>
                          {alertas.alertas.proximoVencer.map((item) => (
                            <Typography key={item.id} variant="body2">
                              • {item.nombre} - {item.mensaje}
                            </Typography>
                          ))}
                        </Alert>
                      </Grid>
                    )}

                    {/* Alertas de mantención */}
                    {alertas.alertas.proximoMantencion?.length > 0 && (
                      <Grid item xs={12}>
                        <Alert severity="info">
                          <Typography variant="subtitle1" gutterBottom>
                            Próximo a Mantención ({alertas.alertas.proximoMantencion.length})
                          </Typography>
                          {alertas.alertas.proximoMantencion.map((item) => (
                            <Typography key={item.id} variant="body2">
                              • {item.nombre} - {item.mensaje}
                            </Typography>
                          ))}
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Alert severity="success">
                    ✅ No hay alertas pendientes. Todo el material está en orden.
                  </Alert>
                )}
              </Paper>
            )}
          </>
        )}
      </Box>
    </Container>
  )
}

export default MaterialMenorPage
