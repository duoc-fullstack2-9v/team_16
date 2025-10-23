import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import {
  fetchPlantillas,
  deletePlantilla,
} from '../../store/slices/guardiasSlice'
import CrearPlantillaDialog from './CrearPlantillaDialog'

const PlantillasDialog = ({ open, onClose, onSelect }) => {
  const dispatch = useDispatch()
  const { plantillas, loadingPlantillas } = useSelector((state) => state.guardias)
  const [crearDialogOpen, setCrearDialogOpen] = useState(false)

  useEffect(() => {
    if (open) {
      dispatch(fetchPlantillas())
    }
  }, [open, dispatch])

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      try {
        await dispatch(deletePlantilla(id)).unwrap()
      } catch (error) {
        console.error('Error al eliminar plantilla:', error)
      }
    }
  }

  const handleSelect = (plantilla) => {
    onSelect(plantilla)
    onClose()
  }

  const getTipoLabel = (tipo) => {
    return tipo === 'por_fecha' ? 'Por día del mes' : 'Por día de la semana'
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Gestión de Plantillas de Guardia
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCrearDialogOpen(true)}
            >
              Crear Nueva Plantilla
            </Button>

            {loadingPlantillas && <Typography>Cargando plantillas...</Typography>}

            {!loadingPlantillas && plantillas.length === 0 && (
              <Alert severity="info">
                No hay plantillas creadas. Crea una para reutilizarla en futuros roles.
              </Alert>
            )}

            {!loadingPlantillas && plantillas.length > 0 && (
              <List>
                {plantillas.map((plantilla) => (
                  <ListItem
                    key={plantilla.id}
                    divider
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleDelete(plantilla.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {plantilla.nombre}
                          </Typography>
                          <Chip
                            label={getTipoLabel(plantilla.tipo)}
                            size="small"
                            color="primary"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {plantilla.descripcion && (
                            <Typography variant="body2" color="text.secondary">
                              {plantilla.descripcion}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {plantilla.dias?.length || 0} día(s) configurado(s)
                          </Typography>
                        </>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSelect(plantilla)}
                      sx={{ ml: 2 }}
                    >
                      Aplicar
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <CrearPlantillaDialog
        open={crearDialogOpen}
        onClose={() => setCrearDialogOpen(false)}
      />
    </>
  )
}

export default PlantillasDialog
