import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Divider
} from '@mui/material'
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  LocalShipping as CarroIcon,
  CheckCircle as OperativoIcon,
  Build as MantenimientoIcon,
  Cancel as FueraServicioIcon,
  Inventory as CajoneraIcon,
  Assignment as MaterialIcon,
  People as ConductoresIcon
} from '@mui/icons-material'

function CarroCard({ carro, onEdit, onViewDetail }) {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Operativo':
        return 'success'
      case 'Mantenimiento':
        return 'warning'
      case 'Fuera de Servicio':
        return 'error'
      default:
        return 'default'
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Operativo':
        return <OperativoIcon sx={{ fontSize: 18 }} />
      case 'Mantenimiento':
        return <MantenimientoIcon sx={{ fontSize: 18 }} />
      case 'Fuera de Servicio':
        return <FueraServicioIcon sx={{ fontSize: 18 }} />
      default:
        return null
    }
  }

  const getTipoColor = (tipo) => {
    const colors = {
      'Bomba': 'error',
      'Escala': 'info',
      'Rescate': 'warning',
      'Ambulancia': 'success',
      'Materiales': 'secondary',
      'Unidad': 'primary'
    }
    return colors[tipo] || 'default'
  }

  return (
    <Card 
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header con icono y nombre */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CarroIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {carro.nombre}
          </Typography>
        </Box>

        {/* Tipo y Estado */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={carro.tipo}
            color={getTipoColor(carro.tipo)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={carro.estadoOperativo}
            color={getEstadoColor(carro.estadoOperativo)}
            size="small"
            icon={getEstadoIcon(carro.estadoOperativo)}
          />
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Información del vehículo */}
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            <strong>Patente:</strong> {carro.patente}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Marca/Modelo:</strong> {carro.marca} {carro.modelo}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Año:</strong> {carro.anioFabricacion}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Contadores */}
        <Stack direction="row" spacing={2} justifyContent="space-around">
          <Tooltip title="Cajoneras">
            <Box sx={{ textAlign: 'center' }}>
              <CajoneraIcon color="action" />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {carro._count?.cajoneras || 0}
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Material Asignado">
            <Box sx={{ textAlign: 'center' }}>
              <MaterialIcon color="action" />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {carro._count?.asignacionesMaterial || 0}
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Conductores">
            <Box sx={{ textAlign: 'center' }}>
              <ConductoresIcon color="action" />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {carro._count?.conductoresHabilitados || 0}
              </Typography>
            </Box>
          </Tooltip>
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <Tooltip title="Ver detalle completo">
          <IconButton 
            color="primary" 
            onClick={onViewDetail}
            sx={{ 
              '&:hover': { 
                bgcolor: 'primary.lighter' 
              } 
            }}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Editar carro">
          <IconButton 
            color="secondary" 
            onClick={onEdit}
            sx={{ 
              '&:hover': { 
                bgcolor: 'secondary.lighter' 
              } 
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  )
}

export default CarroCard
