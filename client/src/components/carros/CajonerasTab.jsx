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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as CajoneraIcon
} from '@mui/icons-material'
import { fetchCarros, fetchCajoneras, createCajonera, updateCajonera, deleteCajonera } from '../../store/slices/carrosSlice'
import CajoneraForm from './CajoneraForm'

function CajonerasTab() {
  const dispatch = useDispatch()
  const { carros, cajoneras, loading } = useSelector((state) => state.carros)

  const [selectedCarroId, setSelectedCarroId] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [selectedCajonera, setSelectedCajonera] = useState(null)

  useEffect(() => {
    dispatch(fetchCarros({ page: 1, limit: 100 }))
  }, [dispatch])

  useEffect(() => {
    if (selectedCarroId) {
      dispatch(fetchCajoneras(selectedCarroId))
    }
  }, [dispatch, selectedCarroId])

  const handleOpenForm = (cajonera = null) => {
    setSelectedCajonera(cajonera)
    setOpenForm(true)
  }

  const handleCloseForm = () => {
    setOpenForm(false)
    setSelectedCajonera(null)
  }

  const handleFormSuccess = () => {
    handleCloseForm()
    if (selectedCarroId) {
      dispatch(fetchCajoneras(selectedCarroId))
    }
  }

  const handleDelete = async (cajoneraId) => {
    if (window.confirm('¿Estás seguro de eliminar esta cajonera?')) {
      try {
        await dispatch(deleteCajonera(cajoneraId)).unwrap()
        if (selectedCarroId) {
          dispatch(fetchCajoneras(selectedCarroId))
        }
      } catch (error) {
        alert('Error al eliminar cajonera: ' + error.message)
      }
    }
  }

  const selectedCarro = carros.find(c => c.id === parseInt(selectedCarroId))

  return (
    <Box>
      {/* Selector de Carro */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CajoneraIcon color="primary" sx={{ fontSize: 32 }} />
          <TextField
            label="Seleccionar Carro"
            select
            fullWidth
            value={selectedCarroId}
            onChange={(e) => setSelectedCarroId(e.target.value)}
            helperText="Selecciona un carro para ver y gestionar sus cajoneras"
          >
            <MenuItem value="">-- Selecciona un carro --</MenuItem>
            {carros.map((carro) => (
              <MenuItem key={carro.id} value={carro.id}>
                {carro.nombre} - {carro.patente} ({carro._count?.cajoneras || 0} cajoneras)
              </MenuItem>
            ))}
          </TextField>

          {selectedCarroId && (
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => handleOpenForm()}
              sx={{ minWidth: 200 }}
            >
              Nueva Cajonera
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Lista de Cajoneras */}
      {!selectedCarroId ? (
        <Alert severity="info">
          Selecciona un carro para ver y gestionar sus cajoneras
        </Alert>
      ) : loading.cajoneras ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : cajoneras.length === 0 ? (
        <Alert severity="info">
          Este carro no tiene cajoneras registradas. Haz clic en "Nueva Cajonera" para agregar una.
        </Alert>
      ) : (
        <>
          <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'primary.lighter' }}>
            <Typography variant="h6" gutterBottom>
              Cajoneras de {selectedCarro?.nombre || 'Carro'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {cajoneras.length} cajoneras
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            {cajoneras
              .sort((a, b) => a.posicion - b.posicion)
              .map((cajonera) => (
                <Grid item xs={12} sm={6} md={4} key={cajonera.id}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      height: '100%',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CajoneraIcon color="primary" />
                      <Typography variant="h6">{cajonera.nombre}</Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Posición
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          #{cajonera.posicion}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Estado
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={cajonera.estado}
                            color={
                              cajonera.estado === 'Operativa'
                                ? 'success'
                                : cajonera.estado === 'Mantenimiento'
                                ? 'warning'
                                : 'error'
                            }
                            size="small"
                          />
                        </Box>
                      </Box>

                      {cajonera.observaciones && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Observaciones
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cajonera.observaciones}
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenForm(cajonera)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(cajonera.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </>
      )}

      {/* Dialog Form */}
      {openForm && (
        <CajoneraForm
          open={openForm}
          onClose={handleCloseForm}
          carroId={selectedCarroId}
          cajonera={selectedCajonera}
          onSuccess={handleFormSuccess}
        />
      )}
    </Box>
  )
}

export default CajonerasTab
