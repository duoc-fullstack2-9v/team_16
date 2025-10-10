import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Avatar,
  Grid,
  Pagination,
  Stack,
  Tooltip,
  InputAdornment,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBomberos, deleteBombero, setFilters, resetFilters, clearError } from '../../store/slices/bomberosSlice'

const BomberosList = ({ onEdit, onAdd, onView }) => {
  console.log('🚒 BomberosList rendering...')
  
  const dispatch = useDispatch()
  const {
    bomberos,
    loading,
    error,
    pagination,
    filters,
    deleteLoading
  } = useSelector(state => state.bomberos)

  console.log('🚒 BomberosList state:', { bomberos, loading, error, pagination, filters })

  const [localSearch, setLocalSearch] = useState(filters.search)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch bomberos on component mount and when filters change
  useEffect(() => {
    dispatch(fetchBomberos({ 
      page: pagination.current,
      ...filters 
    }))
  }, [dispatch, filters, pagination.current])

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== filters.search) {
        dispatch(setFilters({ search: localSearch, page: 1 }))
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [localSearch, filters.search, dispatch])

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value, page: 1 }))
  }

  // Handle pagination
  const handlePageChange = (event, page) => {
    dispatch(fetchBomberos({ 
      page,
      ...filters 
    }))
  }

  // Handle delete
  const handleDelete = async (bombero) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${bombero.nombres} ${bombero.apellidos}?`)) {
      try {
        await dispatch(deleteBombero(bombero.id)).unwrap()
        // Refetch to update the list
        dispatch(fetchBomberos({ 
          page: pagination.current,
          ...filters 
        }))
      } catch (error) {
        console.error('Error al eliminar bombero:', error)
      }
    }
  }

  // Clear all filters
  const handleClearFilters = () => {
    setLocalSearch('')
    dispatch(resetFilters())
  }

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

  const hasActiveFilters = useMemo(() => {
    return filters.search || filters.rango || filters.estado !== 'Activo'
  }, [filters])

  if (loading && bomberos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header con búsqueda y filtros */}
      <Box mb={3}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar bomberos por nombre o especialidad..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: localSearch && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setLocalSearch('')}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </Stack>

        {/* Filtros expandibles */}
        {showFilters && (
          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Rango</InputLabel>
                  <Select
                    value={filters.rango}
                    label="Rango"
                    onChange={(e) => handleFilterChange('rango', e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Bombero">Bombero</MenuItem>
                    <MenuItem value="Cabo">Cabo</MenuItem>
                    <MenuItem value="Sargento">Sargento</MenuItem>
                    <MenuItem value="Teniente">Teniente</MenuItem>
                    <MenuItem value="Capitán">Capitán</MenuItem>
                    <MenuItem value="Comandante">Comandante</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filters.estado}
                    label="Estado"
                    onChange={(e) => handleFilterChange('estado', e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Licencia">Licencia</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Ordenar por</InputLabel>
                  <Select
                    value={filters.sortBy}
                    label="Ordenar por"
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <MenuItem value="nombre">Nombre</MenuItem>
                    <MenuItem value="rango">Rango</MenuItem>
                    <MenuItem value="createdAt">Fecha de ingreso</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters}
                  >
                    Limpiar filtros
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        )}
      </Box>

      {/* Error message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      {/* Lista de bomberos */}
      {bomberos.length === 0 && !loading ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No se encontraron bomberos
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
              {hasActiveFilters ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza agregando un nuevo bombero'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {bomberos.map((bombero) => (
            <Grid item xs={12} sm={6} md={4} key={bombero.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  '&:hover': { 
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <CardContent>
                  {/* Header con avatar y acciones */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center">
                      <Avatar 
                        src={bombero.fotoUrl || ''}
                        sx={{ 
                          bgcolor: 'primary.main', 
                          mr: 2,
                          width: 56,
                          height: 56
                        }}
                      >
                        {!bombero.fotoUrl && ((bombero.nombres?.charAt(0) || '') + (bombero.apellidos?.charAt(0) || 'B'))}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" noWrap>
                          {`${bombero.nombres} ${bombero.apellidos}`}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={bombero.rango}
                          color={getRankColor(bombero.rango)}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => onView && onView(bombero)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(bombero)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(bombero)}
                          disabled={deleteLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Información del bombero */}
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center">
                      <Chip 
                        size="small" 
                        label={bombero.estado}
                        color={getStatusColor(bombero.estado)}
                        sx={{ mr: 1 }}
                      />
                      {bombero._count?.citaciones > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {bombero._count.citaciones} citaciones
                        </Typography>
                      )}
                    </Box>

                    {bombero.especialidad && (
                      <Box display="flex" alignItems="center">
                        <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {bombero.especialidad}
                        </Typography>
                      </Box>
                    )}

                    {bombero.telefono && (
                      <Box display="flex" alignItems="center">
                        <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {bombero.telefono}
                        </Typography>
                      </Box>
                    )}

                    {bombero.email && (
                      <Box display="flex" alignItems="center">
                        <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {bombero.email}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Paginación */}
      {pagination.pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={pagination.pages}
            page={pagination.current}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Loading overlay */}
      {loading && bomberos.length > 0 && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgcolor="rgba(255, 255, 255, 0.7)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
        >
          <CircularProgress />
        </Box>
      )}

      {/* FAB para agregar bombero */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={onAdd}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}

export default BomberosList