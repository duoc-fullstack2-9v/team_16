import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Collapse
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { updateFilters, clearFilters, selectFilters } from '../../features/oficiales/oficialesSlice'

// Opciones de rangos
const RANGOS_OPTIONS = [
  { value: '', label: 'Todos los rangos' },
  { value: 'COMANDANTE', label: 'Comandante' },
  { value: 'CAPITAN', label: 'Capitán' },
  { value: 'TENIENTE', label: 'Teniente' },
  { value: 'ALFEREZ', label: 'Alférez' },
  { value: 'SARGENTO', label: 'Sargento' },
  { value: 'CABO', label: 'Cabo' },
  { value: 'BOMBERO', label: 'Bombero' }
]

// Opciones de departamentos
const DEPARTAMENTOS_OPTIONS = [
  { value: '', label: 'Todos los departamentos' },
  { value: 'COMANDO', label: 'Comando' },
  { value: 'OPERACIONES', label: 'Operaciones' },
  { value: 'CAPACITACION', label: 'Capacitación' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'COMUNICACIONES', label: 'Comunicaciones' },
  { value: 'ADMINISTRACION', label: 'Administración' }
]

// Opciones de estado
const ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' }
]

// Opciones de ordenamiento
const ORDEN_OPTIONS = [
  { value: 'nombres', label: 'Nombres A-Z' },
  { value: '-nombres', label: 'Nombres Z-A' },
  { value: 'apellidos', label: 'Apellidos A-Z' },
  { value: '-apellidos', label: 'Apellidos Z-A' },
  { value: 'rango', label: 'Rango (ascendente)' },
  { value: '-rango', label: 'Rango (descendente)' },
  { value: 'fechaIngreso', label: 'Fecha ingreso (antigua)' },
  { value: '-fechaIngreso', label: 'Fecha ingreso (reciente)' },
  { value: 'experienciaAnios', label: 'Experiencia (menor)' },
  { value: '-experienciaAnios', label: 'Experiencia (mayor)' }
]

const OficialesFilters = ({ onApplyFilters, totalResults = 0 }) => {
  const dispatch = useDispatch()
  const filters = useSelector(selectFilters)
  
  const [localFilters, setLocalFilters] = useState(filters)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Actualizar filtros locales cuando cambien los del store
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyFilters = () => {
    dispatch(updateFilters(localFilters))
    if (onApplyFilters) {
      onApplyFilters(localFilters)
    }
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      rango: '',
      departamento: '',
      activo: '',
      sortBy: 'nombres',
      page: 1,
      limit: 10
    }
    setLocalFilters(clearedFilters)
    dispatch(clearFilters())
    if (onApplyFilters) {
      onApplyFilters(clearedFilters)
    }
  }

  const hasActiveFilters = () => {
    return localFilters.search || 
           localFilters.rango || 
           localFilters.departamento || 
           localFilters.activo
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.search) count++
    if (localFilters.rango) count++
    if (localFilters.departamento) count++
    if (localFilters.activo) count++
    return count
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Filtros de Búsqueda
        </Typography>
        
        {totalResults > 0 && (
          <Chip 
            label={`${totalResults} resultado${totalResults !== 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* Búsqueda por texto */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Buscar oficial"
            placeholder="Nombre, apellido, RUT o especialidad..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: localFilters.search && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterChange('search', '')}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Rango */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Rango</InputLabel>
            <Select
              value={localFilters.rango}
              onChange={(e) => handleFilterChange('rango', e.target.value)}
              label="Rango"
            >
              {RANGOS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Estado */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={localFilters.activo}
              onChange={(e) => handleFilterChange('activo', e.target.value)}
              label="Estado"
            >
              {ESTADO_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Filtros avanzados */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          sx={{ mb: 1 }}
        >
          Filtros Avanzados
          {getActiveFiltersCount() > 0 && (
            <Chip 
              label={getActiveFiltersCount()} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }} 
            />
          )}
        </Button>

        <Collapse in={showAdvanced}>
          <Grid container spacing={2}>
            {/* Departamento */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={localFilters.departamento}
                  onChange={(e) => handleFilterChange('departamento', e.target.value)}
                  label="Departamento"
                >
                  {DEPARTAMENTOS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Ordenamiento */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Ordenar por</InputLabel>
                <Select
                  value={localFilters.sortBy || 'nombres'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Ordenar por"
                >
                  {ORDEN_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Cantidad por página */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Resultados por página</InputLabel>
                <Select
                  value={localFilters.limit}
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  label="Resultados por página"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Collapse>
      </Box>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            onClick={applyFilters}
            startIcon={<SearchIcon />}
          >
            Buscar
          </Button>
          
          {hasActiveFilters() && (
            <Button 
              variant="outlined" 
              onClick={clearAllFilters}
              startIcon={<ClearIcon />}
            >
              Limpiar Filtros
            </Button>
          )}
        </Box>

        {/* Indicadores de filtros activos */}
        {hasActiveFilters() && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {localFilters.search && (
              <Chip
                label={`Texto: "${localFilters.search}"`}
                size="small"
                onDelete={() => handleFilterChange('search', '')}
                color="primary"
                variant="outlined"
              />
            )}
            
            {localFilters.rango && (
              <Chip
                label={`Rango: ${RANGOS_OPTIONS.find(r => r.value === localFilters.rango)?.label}`}
                size="small"
                onDelete={() => handleFilterChange('rango', '')}
                color="primary"
                variant="outlined"
              />
            )}
            
            {localFilters.departamento && (
              <Chip
                label={`Depto: ${DEPARTAMENTOS_OPTIONS.find(d => d.value === localFilters.departamento)?.label}`}
                size="small"
                onDelete={() => handleFilterChange('departamento', '')}
                color="primary"
                variant="outlined"
              />
            )}
            
            {localFilters.activo && (
              <Chip
                label={`Estado: ${ESTADO_OPTIONS.find(e => e.value === localFilters.activo)?.label}`}
                size="small"
                onDelete={() => handleFilterChange('activo', '')}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default OficialesFilters