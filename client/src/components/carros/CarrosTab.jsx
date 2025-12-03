import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Pagination
} from '@mui/material'
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material'
import { fetchCarros } from '../../store/slices/carrosSlice'
import CarroCard from './CarroCard'
import CarroForm from './CarroForm'
import CarroDetailDialog from './CarroDetailDialog'

function CarrosTab() {
  const dispatch = useDispatch()
  const { carros, pagination, loading, error } = useSelector((state) => state.carros)

  console.log('CarrosTab state:', { carros, pagination, loading, error })

  const [openForm, setOpenForm] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedCarro, setSelectedCarro] = useState(null)
  const [localFilters, setLocalFilters] = useState({
    tipo: '',
    estadoOperativo: '',
    search: ''
  })

  useEffect(() => {
    dispatch(fetchCarros({ 
      page: 1, 
      limit: 9,
      ...localFilters 
    }))
  }, [dispatch])

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = () => {
    dispatch(fetchCarros({ 
      page: 1, 
      limit: 9,
      ...localFilters 
    }))
  }

  const handleClearFilters = () => {
    setLocalFilters({ tipo: '', estadoOperativo: '', search: '' })
    dispatch(fetchCarros({ page: 1, limit: 9 }))
  }

  const handlePageChange = (event, page) => {
    dispatch(fetchCarros({ 
      page, 
      limit: 9,
      ...localFilters 
    }))
  }

  const handleOpenForm = (carro = null) => {
    setSelectedCarro(carro)
    setOpenForm(true)
  }

  const handleCloseForm = () => {
    setOpenForm(false)
    setSelectedCarro(null)
  }

  const handleOpenDetail = (carro) => {
    setSelectedCarro(carro)
    setOpenDetail(true)
  }

  const handleCloseDetail = () => {
    setOpenDetail(false)
    setSelectedCarro(null)
  }

  const handleFormSuccess = () => {
    handleCloseForm()
    dispatch(fetchCarros({ 
      page: pagination.current || 1, 
      limit: 9,
      ...localFilters 
    }))
  }

  return (
    <Box>
      {/* Filtros */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={2}>
          <FilterIcon color="action" />
          <TextField
            label="Buscar"
            placeholder="Nombre, patente, marca..."
            size="small"
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ minWidth: 250 }}
          />
          
          <TextField
            label="Tipo"
            select
            size="small"
            value={localFilters.tipo}
            onChange={(e) => handleFilterChange('tipo', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Bomba">Bomba</MenuItem>
            <MenuItem value="Escala">Escala</MenuItem>
            <MenuItem value="Rescate">Rescate</MenuItem>
            <MenuItem value="Ambulancia">Ambulancia</MenuItem>
            <MenuItem value="Materiales">Materiales</MenuItem>
            <MenuItem value="Unidad">Unidad</MenuItem>
          </TextField>

          <TextField
            label="Estado Operativo"
            select
            size="small"
            value={localFilters.estadoOperativo}
            onChange={(e) => handleFilterChange('estadoOperativo', e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="Operativo">Operativo</MenuItem>
            <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
            <MenuItem value="Fuera de Servicio">Fuera de Servicio</MenuItem>
          </TextField>

          <Button 
            variant="contained" 
            onClick={handleApplyFilters}
            disabled={loading}
          >
            Aplicar Filtros
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleClearFilters}
          >
            Limpiar
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Nuevo Carro
          </Button>
        </Stack>
      </Box>

      {/* Resultados */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !carros || carros.length === 0 ? (
        <Alert severity="info">
          No se encontraron carros con los filtros aplicados
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {(carros || []).map((carro) => (
              <Grid item xs={12} sm={6} md={4} key={carro.id}>
                <CarroCard 
                  carro={carro} 
                  onEdit={() => handleOpenForm(carro)}
                  onViewDetail={() => handleOpenDetail(carro)}
                />
              </Grid>
            ))}
          </Grid>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.pages}
                page={pagination.current}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Dialogs */}
      {openForm && (
        <CarroForm
          open={openForm}
          onClose={handleCloseForm}
          carro={selectedCarro}
          onSuccess={handleFormSuccess}
        />
      )}

      {openDetail && selectedCarro && (
        <CarroDetailDialog
          open={openDetail}
          onClose={handleCloseDetail}
          carroId={selectedCarro.id}
        />
      )}
    </Box>
  )
}

export default CarrosTab
