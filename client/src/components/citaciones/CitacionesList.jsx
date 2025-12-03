import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
  Stack,
  Chip
} from '@mui/material'
import {
  Search,
  Add,
  FilterList,
  Clear
} from '@mui/icons-material'
import CitacionCard from './CitacionCard'

const CitacionesList = ({
  citaciones = [],
  pagination = {},
  loading = false,
  error = null,
  filters = {},
  onFiltersChange,
  onPageChange,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onAssign,
  onCancel,
  deleteLoading = false
}) => {
  const [localFilters, setLocalFilters] = useState({
    search: '',
    estado: '',
    fechaDesde: null,
    fechaHasta: null,
    sortBy: 'fecha',
    sortOrder: 'desc'
  })

  const [showFilters, setShowFilters] = useState(false)

  // Sincronizar filtros locales con props
  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      ...filters
    }))
  }, [filters])

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value
    const newFilters = {
      ...localFilters,
      [field]: value
    }
    setLocalFilters(newFilters)
    
    // Aplicar filtros inmediatamente para search, con delay para evitar spam
    if (field === 'search') {
      clearTimeout(handleFilterChange.searchTimeout)
      handleFilterChange.searchTimeout = setTimeout(() => {
        onFiltersChange(newFilters)
      }, 300)
    } else {
      onFiltersChange(newFilters)
    }
  }

  const handleDateFilterChange = (field) => (date) => {
    const newFilters = {
      ...localFilters,
      [field]: date
    }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    const defaultFilters = {
      search: '',
      estado: '',
      fechaDesde: null,
      fechaHasta: null,
      sortBy: 'fecha',
      sortOrder: 'desc'
    }
    setLocalFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = localFilters.search || 
                          localFilters.estado || 
                          localFilters.fechaDesde || 
                          localFilters.fechaHasta

  const getEstadoStats = () => {
    // Calcular rango de 60 días (30 atrás, 30 adelante)
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)
    
    const thirtyDaysAhead = new Date(now)
    thirtyDaysAhead.setDate(now.getDate() + 30)
    
    // Filtrar citaciones dentro del rango de 60 días
    const citacionesEnRango = citaciones.filter(citacion => {
      const fechaCitacion = new Date(citacion.fecha)
      return fechaCitacion >= thirtyDaysAgo && fechaCitacion <= thirtyDaysAhead
    })
    
    // Contar por estado solo las citaciones en rango
    const stats = citacionesEnRango.reduce((acc, citacion) => {
      acc[citacion.estado] = (acc[citacion.estado] || 0) + 1
      return acc
    }, {})
    
    return stats
  }

  const estadoStats = getEstadoStats()

  return (
    <Box>
        {/* Header con título y botón de agregar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Citaciones
            </Typography>
            {pagination.total > 0 && (
              <Typography variant="body2" color="text.secondary">
                {pagination.total} citación{pagination.total !== 1 ? 'es' : ''} en total
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
            size="large"
          >
            Nueva Citación
          </Button>
        </Box>

        {/* Estadísticas rápidas */}
        {Object.keys(estadoStats).length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Estado de citaciones (últimos 30 días - próximos 30 días)
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {estadoStats.Programada && (
                <Chip 
                  label={`${estadoStats.Programada} Programadas`}
                  color="info"
                  size="small"
                />
              )}
              {estadoStats.Realizada && (
                <Chip 
                  label={`${estadoStats.Realizada} Realizadas`}
                  color="success"
                  size="small"
                />
              )}
              {estadoStats.Cancelada && (
                <Chip 
                  label={`${estadoStats.Cancelada} Canceladas`}
                  color="warning"
                  size="small"
                />
              )}
            </Stack>
          </Paper>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Búsqueda */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar citaciones..."
                value={localFilters.search}
                onChange={handleFilterChange('search')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={localFilters.estado}
                  onChange={handleFilterChange('estado')}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="programada">Programada</MenuItem>
                  <MenuItem value="realizada">Realizada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Ordenamiento */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={`${localFilters.sortBy}-${localFilters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    const newFilters = {
                      ...localFilters,
                      sortBy,
                      sortOrder
                    }
                    setLocalFilters(newFilters)
                    onFiltersChange(newFilters)
                  }}
                  label="Ordenar por"
                >
                  <MenuItem value="fecha-desc">Fecha (más reciente)</MenuItem>
                  <MenuItem value="fecha-asc">Fecha (más antigua)</MenuItem>
                  <MenuItem value="titulo-asc">Título (A-Z)</MenuItem>
                  <MenuItem value="titulo-desc">Título (Z-A)</MenuItem>
                  <MenuItem value="estado-asc">Estado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Botones de filtro */}
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filtros avanzados
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outlined"
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    color="secondary"
                  >
                    Limpiar
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>

          {/* Filtros avanzados (expandible) */}
          {showFilters && (
            <Box mt={2} pt={2} borderTop={1} borderColor="divider">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha desde"
                    type="date"
                    value={localFilters.fechaDesde}
                    onChange={(e) => handleDateFilterChange('fechaDesde')(e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha hasta"
                    type="date"
                    value={localFilters.fechaHasta}
                    onChange={(e) => handleDateFilterChange('fechaHasta')(e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Lista de citaciones */}
        {!loading && citaciones.length > 0 && (
          <>
            <Grid container spacing={3}>
              {citaciones
                .filter(citacion => citacion && citacion.id) // Filtro defensivo
                .map((citacion) => (
                <Grid item xs={12} md={6} lg={4} key={citacion.id}>
                  <CitacionCard
                    citacion={citacion}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAssign={onAssign}
                    onCancel={onCancel}
                    loading={deleteLoading}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Paginación */}
            {pagination.pages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.current}
                  onChange={(event, page) => onPageChange(page)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}

        {/* Estado vacío */}
        {!loading && citaciones.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {hasActiveFilters ? 'No se encontraron citaciones' : 'No hay citaciones registradas'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {hasActiveFilters 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primera citación'
              }
            </Typography>
            {!hasActiveFilters && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAdd}
              >
                Crear Primera Citación
              </Button>
            )}
          </Paper>
        )}
      </Box>
  )
}

export default CitacionesList