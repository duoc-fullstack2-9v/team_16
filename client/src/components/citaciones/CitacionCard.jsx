import React from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  AvatarGroup,
  Tooltip,
  IconButton,
  Stack,
  Divider
} from '@mui/material'
import {
  Edit,
  Delete,
  Visibility,
  People,
  Event,
  Schedule,
  LocationOn,
  Assignment,
  Cancel
} from '@mui/icons-material'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const CitacionCard = ({
  citacion,
  onView,
  onEdit,
  onDelete,
  onAssign,
  onCancel,
  loading = false
}) => {
  const getEstadoColor = (estado) => {
    const estadoLower = estado?.toLowerCase()
    switch (estadoLower) {
      case 'programada': return 'info'        // Celeste
      case 'realizada': return 'success'      // Verde
      case 'cancelada': return 'warning'      // Naranja
      default: return 'default'
    }
  }

  const getEstadoLabel = (estado) => {
    const estadoLower = estado?.toLowerCase()
    switch (estadoLower) {
      case 'programada': return 'Programada'
      case 'realizada': return 'Realizada'
      case 'cancelada': return 'Cancelada'
      default: return estado
    }
  }

  const formatFecha = (fecha) => {
    try {
      return format(parseISO(fecha), "dd 'de' MMMM, yyyy", { locale: es })
    } catch {
      return fecha
    }
  }

  const formatHora = (hora) => {
    try {
      // Si hora viene como "HH:mm:ss", extraer solo "HH:mm"
      return hora.substring(0, 5)
    } catch {
      return hora
    }
  }

  const bomberosAsignados = citacion?.bomberos || []
  const totalBomberos = bomberosAsignados.length
  const bomberosConfirmados = bomberosAsignados.filter(bc => bc?.asistio === true).length
  const bomberosPendientes = bomberosAsignados.filter(bc => bc?.asistio === null).length

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Header con título y estado */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              fontWeight: 600,
              lineHeight: 1.3,
              flex: 1,
              mr: 1
            }}
          >
            {citacion?.titulo || 'Sin título'}
          </Typography>
          <Chip
            label={getEstadoLabel(citacion?.estado)}
            color={getEstadoColor(citacion?.estado)}
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        {/* Información de fecha y hora */}
        <Stack spacing={1} mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Event color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {formatFecha(citacion?.fecha)}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Schedule color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {formatHora(citacion?.hora)}
            </Typography>
          </Box>

          {citacion?.lugar && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {citacion.lugar}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Motivo */}
        {citacion?.motivo && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {citacion?.motivo}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Información de bomberos asignados */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <People color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Bomberos asignados
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight={500}>
              {totalBomberos}
            </Typography>
          </Box>

          {totalBomberos > 0 ? (
            <>
              {/* Avatars de bomberos */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <AvatarGroup 
                  max={4} 
                  sx={{ 
                    '& .MuiAvatar-root': { 
                      width: 32, 
                      height: 32,
                      fontSize: '0.875rem',
                      border: '2px solid white'
                    }
                  }}
                >
                  {bomberosAsignados.map((bc) => (
                    <Tooltip 
                      key={bc?.bombero?.id || Math.random()}
                      title={`${bc?.bombero?.nombres || ''} ${bc?.bombero?.apellidos || ''} - ${bc?.bombero?.rango || ''}`}
                    >
                      <Avatar src={bc?.bombero?.fotoUrl || ''}>
                        {!bc?.bombero?.fotoUrl && (
                          <>
                            {bc?.bombero?.nombres?.charAt(0) || '?'}
                            {bc?.bombero?.apellidos?.charAt(0) || ''}
                          </>
                        )}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>

                {/* Estadísticas de asistencia (solo si citación está realizada) */}
                {citacion?.estado === 'realizada' && (
                  <Box textAlign="right">
                    <Typography variant="caption" color="success.main" display="block">
                      ✓ {bomberosConfirmados} confirmados
                    </Typography>
                    {bomberosPendientes > 0 && (
                      <Typography variant="caption" color="warning.main" display="block">
                        ⏳ {bomberosPendientes} pendientes
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.disabled" textAlign="center">
              Sin bomberos asignados
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Acciones */}
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Box display="flex" gap={0.5}>
          <Tooltip title="Ver detalles">
            <IconButton 
              size="small" 
              onClick={() => onView(citacion)}
              disabled={loading}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Ver y asignar bomberos">
            <IconButton 
              size="small" 
              onClick={() => onAssign(citacion)}
              disabled={loading}
              color="primary"
            >
              <Assignment fontSize="small" />
            </IconButton>
          </Tooltip>

          {citacion?.estado === 'Programada' && (
            <Tooltip title="Cancelar citación">
              <IconButton 
                size="small" 
                onClick={() => onCancel(citacion)}
                disabled={loading}
                color="warning"
              >
                <Cancel fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {citacion?.estado !== 'realizada' && citacion?.estado !== 'Realizada' && (
            <Tooltip title="Editar">
              <IconButton 
                size="small" 
                onClick={() => onEdit(citacion)}
                disabled={loading}
                color="primary"
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {citacion?.estado !== 'realizada' && citacion?.estado !== 'Realizada' && (
          <Tooltip title="Eliminar">
            <IconButton 
              size="small" 
              onClick={() => onDelete(citacion)}
              disabled={loading}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  )
}

export default CitacionCard