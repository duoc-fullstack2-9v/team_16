import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  SwapHoriz as CambiarIcon,
  Assignment as MaterialIcon,
  Inventory as CajoneraIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import { fetchCarros, fetchMaterialCarro, desasignarMaterial } from '../../store/slices/carrosSlice'
import AsignarMaterialDialog from './AsignarMaterialDialog'
import CambiarCajoneraDialog from './CambiarCajoneraDialog'

function MaterialCarroTab() {
  const dispatch = useDispatch()
  const { carros, materialCarro, loading } = useSelector((state) => state.carros)

  const [selectedCarroId, setSelectedCarroId] = useState('')
  const [filtroConCajonera, setFiltroConCajonera] = useState('todos')
  const [selectedCajoneraId, setSelectedCajoneraId] = useState('')
  const [openAsignar, setOpenAsignar] = useState(false)
  const [openCambiar, setOpenCambiar] = useState(false)
  const [selectedAsignacion, setSelectedAsignacion] = useState(null)

  useEffect(() => {
    dispatch(fetchCarros({ page: 1, limit: 100 }))
  }, [dispatch])

  useEffect(() => {
    if (selectedCarroId) {
      loadMaterial()
    }
  }, [dispatch, selectedCarroId, filtroConCajonera, selectedCajoneraId])

  const loadMaterial = () => {
    const params = {}
    
    if (filtroConCajonera === 'con') {
      params.cajoneraId = 'notnull'
    } else if (filtroConCajonera === 'sin') {
      params.cajoneraId = 'null'
    } else if (filtroConCajonera === 'especifica' && selectedCajoneraId) {
      params.cajoneraId = selectedCajoneraId
    }

    dispatch(fetchMaterialCarro({ carroId: selectedCarroId, params }))
  }

  const handleDesasignar = async (asignacionId) => {
    if (window.confirm('¿Estás seguro de desasignar este material del carro?')) {
      try {
        await dispatch(desasignarMaterial(asignacionId)).unwrap()
        loadMaterial()
      } catch (error) {
        alert('Error al desasignar material: ' + error.message)
      }
    }
  }

  const handleOpenCambiar = (asignacion) => {
    setSelectedAsignacion(asignacion)
    setOpenCambiar(true)
  }

  const selectedCarro = carros.find(c => c.id === parseInt(selectedCarroId))
  const cajoneras = selectedCarro?.cajoneras || []

  // Agrupar material por cajonera
  const materialAgrupado = materialCarro.reduce((acc, asignacion) => {
    const key = asignacion.cajoneraId || 'sin-cajonera'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(asignacion)
    return acc
  }, {})

  return (
    <Box>
      {/* Selector de Carro y Filtros */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="Seleccionar Carro"
              select
              fullWidth
              value={selectedCarroId}
              onChange={(e) => setSelectedCarroId(e.target.value)}
            >
              <MenuItem value="">-- Selecciona un carro --</MenuItem>
              {carros.map((carro) => (
                <MenuItem key={carro.id} value={carro.id}>
                  {carro.nombre} - {carro.patente}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {selectedCarroId && (
            <>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Filtrar por Cajonera"
                  select
                  fullWidth
                  value={filtroConCajonera}
                  onChange={(e) => {
                    setFiltroConCajonera(e.target.value)
                    setSelectedCajoneraId('')
                  }}
                >
                  <MenuItem value="todos">Ver Todo</MenuItem>
                  <MenuItem value="con">Con Cajonera Específica</MenuItem>
                  <MenuItem value="sin">Sin Cajonera</MenuItem>
                  <MenuItem value="especifica">Cajonera Específica</MenuItem>
                </TextField>
              </Grid>

              {filtroConCajonera === 'especifica' && (
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Seleccionar Cajonera"
                    select
                    fullWidth
                    value={selectedCajoneraId}
                    onChange={(e) => setSelectedCajoneraId(e.target.value)}
                  >
                    <MenuItem value="">-- Todas --</MenuItem>
                    {cajoneras.map((cajonera) => (
                      <MenuItem key={cajonera.id} value={cajonera.id}>
                        {cajonera.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAsignar(true)}
                >
                  Asignar Material
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Contenido */}
      {!selectedCarroId ? (
        <Alert severity="info">
          Selecciona un carro para ver y gestionar el material asignado
        </Alert>
      ) : loading.materialCarro ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : materialCarro.length === 0 ? (
        <Alert severity="info">
          No hay material asignado a este carro {filtroConCajonera !== 'todos' ? 'con el filtro seleccionado' : ''}
        </Alert>
      ) : (
        <>
          {/* Resumen */}
          <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'primary.lighter' }}>
            <Typography variant="h6" gutterBottom>
              Material de {selectedCarro?.nombre || 'Carro'}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Chip 
                label={`Total: ${materialCarro.length} elementos`} 
                color="primary"
              />
              <Chip 
                label={`Con cajonera: ${materialCarro.filter(m => m.cajoneraId).length}`} 
                variant="outlined"
              />
              <Chip 
                label={`Sin cajonera: ${materialCarro.filter(m => !m.cajoneraId).length}`} 
                variant="outlined"
              />
            </Stack>
          </Paper>

          {/* Material Agrupado */}
          <Grid container spacing={3}>
            {Object.entries(materialAgrupado).map(([key, materiales]) => {
              const cajonera = key === 'sin-cajonera' ? null : cajoneras.find(c => c.id === parseInt(key))
              
              return (
                <Grid item xs={12} key={key}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CajoneraIcon color={cajonera ? 'primary' : 'action'} />
                      <Typography variant="h6">
                        {cajonera ? cajonera.nombre : 'Sin Cajonera Específica'}
                      </Typography>
                      <Chip label={materiales.length} size="small" color="primary" />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      {materiales.map((asignacion) => (
                        <Grid item xs={12} sm={6} md={4} key={asignacion.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                                  <MaterialIcon color="primary" sx={{ mt: 0.5 }} />
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                      {asignacion.material?.nombre || 'Material'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {asignacion.material?.categoria?.nombre || 'Sin categoría'}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                                  <Chip 
                                    label={asignacion.material?.tipo || 'N/A'} 
                                    size="small" 
                                    color="secondary"
                                  />
                                  {asignacion.cantidad && (
                                    <Chip 
                                      label={`Cant: ${asignacion.cantidad}`} 
                                      size="small" 
                                      variant="outlined"
                                    />
                                  )}
                                </Stack>

                                {asignacion.motivo && (
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Motivo:</strong> {asignacion.motivo}
                                  </Typography>
                                )}

                                <Typography variant="caption" color="text.secondary">
                                  Asignado: {new Date(asignacion.createdAt).toLocaleDateString()}
                                </Typography>

                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Tooltip title="Cambiar ubicación">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleOpenCambiar(asignacion)}
                                    >
                                      <CambiarIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Desasignar del carro">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDesasignar(asignacion.id)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>
        </>
      )}

      {/* Dialogs */}
      {openAsignar && (
        <AsignarMaterialDialog
          open={openAsignar}
          onClose={() => setOpenAsignar(false)}
          carroId={selectedCarroId}
          cajoneras={cajoneras}
          onSuccess={() => {
            setOpenAsignar(false)
            loadMaterial()
          }}
        />
      )}

      {openCambiar && selectedAsignacion && (
        <CambiarCajoneraDialog
          open={openCambiar}
          onClose={() => {
            setOpenCambiar(false)
            setSelectedAsignacion(null)
          }}
          asignacion={selectedAsignacion}
          cajoneras={cajoneras}
          onSuccess={() => {
            setOpenCambiar(false)
            setSelectedAsignacion(null)
            loadMaterial()
          }}
        />
      )}
    </Box>
  )
}

export default MaterialCarroTab
