import React from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const BomberoCard = ({ bombero, onEdit, onDelete, onClose, showActions = true }) => {
  if (!bombero) return null

  // Get status color
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Activo': return 'success'
      case 'Licencia': return 'warning'
      case 'Inactivo': return 'error'
      default: return 'default'
    }
  }

  // Get rank color
  const getRankColor = (rango) => {
    switch (rango) {
      case 'Comandante': return 'error'
      case 'Capitán': return 'warning'
      case 'Teniente': return 'info'
      case 'Sargento': return 'primary'
      case 'Cabo': return 'secondary'
      default: return 'default'
    }
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return 'No especificada'
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: es })
    } catch (error) {
      return 'Fecha inválida'
    }
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* Header */}
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Avatar 
              src={bombero.fotoUrl || ''}
              sx={{ 
                bgcolor: 'primary.main', 
                mr: 2, 
                width: 64, 
                height: 64,
                fontSize: '1.5rem'
              }}
            >
              {!bombero.fotoUrl && ((bombero.nombres?.charAt(0) || '') + (bombero.apellidos?.charAt(0) || 'B'))}
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom>
                {`${bombero.nombres} ${bombero.apellidos}`}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label={bombero.rango}
                  color={getRankColor(bombero.rango)}
                  variant="filled"
                />
                <Chip 
                  label={bombero.estado}
                  color={getStatusColor(bombero.estado)}
                  size="small"
                />
              </Stack>
            </Box>
          </Box>
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Información detallada */}
        <List disablePadding>
          {/* Especialidad */}
          {bombero.especialidad && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <WorkIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Especialidad"
                secondary={bombero.especialidad}
              />
            </ListItem>
          )}

          {/* Teléfono */}
          {bombero.telefono && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <PhoneIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Teléfono"
                secondary={
                  <Box component="a" href={`tel:${bombero.telefono}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                    {bombero.telefono}
                  </Box>
                }
              />
            </ListItem>
          )}

          {/* Email */}
          {bombero.email && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <EmailIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Email"
                secondary={
                  <Box component="a" href={`mailto:${bombero.email}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                    {bombero.email}
                  </Box>
                }
              />
            </ListItem>
          )}

          {/* Dirección */}
          {bombero.direccion && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <HomeIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Dirección"
                secondary={bombero.direccion}
              />
            </ListItem>
          )}

          {/* Fecha de ingreso */}
          {bombero.fechaIngreso && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <CalendarIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Fecha de Ingreso"
                secondary={formatDate(bombero.fechaIngreso)}
              />
            </ListItem>
          )}

          {/* Información del sistema */}
          {bombero.createdBy && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Creado por"
                secondary={bombero.createdBy.nombre}
              />
            </ListItem>
          )}

          {/* Citaciones */}
          {bombero.citaciones && bombero.citaciones.length > 0 && (
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemIcon>
                <AssignmentIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Citaciones recientes"
                secondary={
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {bombero.citaciones.slice(0, 3).map((cit) => (
                      <Box key={cit.id} display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2">
                          {cit.citacion.titulo}
                        </Typography>
                        <Chip 
                          size="small"
                          label={cit.citacion.estado}
                          variant="outlined"
                        />
                      </Box>
                    ))}
                    {bombero.citaciones.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        Y {bombero.citaciones.length - 3} más...
                      </Typography>
                    )}
                  </Stack>
                }
              />
            </ListItem>
          )}
        </List>

        {/* Fechas del sistema */}
        <Box mt={3} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary" display="block">
            Creado: {formatDate(bombero.createdAt)}
          </Typography>
          {bombero.updatedAt !== bombero.createdAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Actualizado: {formatDate(bombero.updatedAt)}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Box>
              {onEdit && (
                <Tooltip title="Editar bombero">
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => onEdit(bombero)}
                    variant="outlined"
                    size="small"
                  >
                    Editar
                  </Button>
                </Tooltip>
              )}
            </Box>
            <Box>
              {onDelete && (
                <Tooltip title="Eliminar bombero">
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => onDelete(bombero)}
                    variant="outlined"
                    color="error"
                    size="small"
                  >
                    Eliminar
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardActions>
      )}
    </Card>
  )
}

export default BomberoCard