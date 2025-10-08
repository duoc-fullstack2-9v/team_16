import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Star as StarIcon
} from '@mui/icons-material'
import { useState } from 'react'

// Mapeo de rangos con sus colores y niveles
const RANGOS_CONFIG = {
  COMANDANTE: { color: '#d32f2f', nivel: 7, icon: '★★★' },
  CAPITAN: { color: '#f57c00', nivel: 6, icon: '★★' },
  TENIENTE: { color: '#388e3c', nivel: 5, icon: '★' },
  ALFEREZ: { color: '#1976d2', nivel: 4, icon: '◆' },
  SARGENTO: { color: '#7b1fa2', nivel: 3, icon: '▲' },
  CABO: { color: '#5d4037', nivel: 2, icon: '●' },
  BOMBERO: { color: '#424242', nivel: 1, icon: '■' }
}

// Mapeo de departamentos con colores
const DEPARTAMENTOS_CONFIG = {
  COMANDO: { color: '#1565c0', label: 'Comando' },
  OPERACIONES: { color: '#d32f2f', label: 'Operaciones' },
  CAPACITACION: { color: '#388e3c', label: 'Capacitación' },
  MANTENIMIENTO: { color: '#f57c00', label: 'Mantenimiento' },
  COMUNICACIONES: { color: '#7b1fa2', label: 'Comunicaciones' },
  ADMINISTRACION: { color: '#5d4037', label: 'Administración' }
}

const OficialCard = ({ 
  oficial, 
  onView, 
  onEdit, 
  onDelete,
  showActions = true,
  variant = 'default' // 'default', 'compact', 'hierarchical'
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuClick = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleAction = (action) => {
    handleMenuClose()
    action(oficial)
  }

  const rangoConfig = RANGOS_CONFIG[oficial.rango] || RANGOS_CONFIG.BOMBERO
  const departamentoConfig = oficial.departamento ? 
    DEPARTAMENTOS_CONFIG[oficial.departamento] : null

  const getAvatarContent = () => {
    if (oficial.fotoUrl) {
      return <Avatar src={oficial.fotoUrl} sx={{ width: 48, height: 48 }} />
    }
    
    const initials = `${oficial.nombres?.charAt(0) || ''}${oficial.apellidos?.charAt(0) || ''}`
    return (
      <Avatar 
        sx={{ 
          width: 48, 
          height: 48, 
          bgcolor: rangoConfig.color,
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}
      >
        {initials || <PersonIcon />}
      </Avatar>
    )
  }

  const formatFecha = (fecha) => {
    if (!fecha) return 'No especificada'
    return new Date(fecha).toLocaleDateString('es-CL')
  }

  if (variant === 'compact') {
    return (
      <Card 
        sx={{ 
          mb: 1, 
          cursor: onView ? 'pointer' : 'default',
          '&:hover': onView ? { backgroundColor: 'action.hover' } : {}
        }}
        onClick={() => onView && onView(oficial)}
      >
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getAvatarContent()}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {oficial.nombres} {oficial.apellidos}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Chip
                  label={oficial.rango}
                  size="small"
                  sx={{ 
                    bgcolor: rangoConfig.color,
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
                {departamentoConfig && (
                  <Chip
                    label={departamentoConfig.label}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            </Box>
            {showActions && (
              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{ ml: 'auto' }}
              >
                <MoreVertIcon />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onView ? 'pointer' : 'default',
        '&:hover': onView ? { 
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        } : {}
      }}
      onClick={() => onView && onView(oficial)}
    >
      <CardContent>
        {/* Header con avatar y acciones */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          {getAvatarContent()}
          
          <Box sx={{ flexGrow: 1, ml: 2, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {oficial.nombres} {oficial.apellidos}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              RUT: {oficial.rut}
            </Typography>
          </Box>

          {showActions && (
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon />
            </IconButton>
          )}
        </Box>

        {/* Información principal */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Tooltip title={`Nivel ${rangoConfig.nivel} - ${rangoConfig.icon}`}>
              <Chip
                label={oficial.rango}
                sx={{ 
                  bgcolor: rangoConfig.color,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Tooltip>
            
            {departamentoConfig && (
              <Chip
                label={departamentoConfig.label}
                variant="outlined"
                sx={{ borderColor: departamentoConfig.color }}
              />
            )}

            <Chip
              label={oficial.activo ? 'Activo' : 'Inactivo'}
              color={oficial.activo ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </Box>

        {/* Información adicional */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {oficial.especialidad && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {oficial.especialidad}
              </Typography>
            </Box>
          )}

          {oficial.experienciaAnios && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {oficial.experienciaAnios} años de experiencia
              </Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            Ingreso: {formatFecha(oficial.fechaIngreso)}
          </Typography>
        </Box>

        {/* Información jerárquica para variante hierarchical */}
        {variant === 'hierarchical' && oficial.superior && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Superior: {oficial.superior.nombres} {oficial.superior.apellidos}
            </Typography>
          </Box>
        )}

        {variant === 'hierarchical' && oficial.subordinados?.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Subordinados: {oficial.subordinados.length}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Menu de acciones */}
      {showActions && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
        >
          {onView && (
            <MenuItem onClick={() => handleAction(onView)}>
              <ListItemIcon>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ver detalles</ListItemText>
            </MenuItem>
          )}
          
          {onEdit && (
            <MenuItem onClick={() => handleAction(onEdit)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Editar</ListItemText>
            </MenuItem>
          )}
          
          {onDelete && (
            <MenuItem 
              onClick={() => handleAction(onDelete)}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText>Eliminar</ListItemText>
            </MenuItem>
          )}
        </Menu>
      )}
    </Card>
  )
}

export default OficialCard