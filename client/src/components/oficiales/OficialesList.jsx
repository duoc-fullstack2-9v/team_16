import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Skeleton,
  Fab,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material'
import {
  Add as AddIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchOficiales,
  createOficial,
  updateOficial,
  deleteOficial,
  selectOficiales,
  selectTotalOficiales,
  selectOficialesLoading,
  selectError,
  clearError,
  selectFilters
} from '../../features/oficiales/oficialesSlice'
import OficialCard from './OficialCard'
import OficialForm from './OficialForm'
import OficialesFilters from './OficialesFilters'

const OficialesList = () => {
  const dispatch = useDispatch()
  const oficiales = useSelector(selectOficiales)
  const totalOficiales = useSelector(selectTotalOficiales)
  const loading = useSelector(selectOficialesLoading)
  const error = useSelector(selectError)
  const filters = useSelector(selectFilters)

  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [formOpen, setFormOpen] = useState(false)
  const [selectedOficial, setSelectedOficial] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [oficialToDelete, setOficialToDelete] = useState(null)
  const [page, setPage] = useState(1)

  // Cargar oficiales al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadOficiales()
  }, [filters, page])

  const loadOficiales = () => {
    dispatch(fetchOficiales({
      ...filters,
      page
    }))
  }

  const handleCreateOficial = async (oficialData) => {
    try {
      await dispatch(createOficial(oficialData)).unwrap()
      setFormOpen(false)
      setSelectedOficial(null)
      loadOficiales() // Recargar lista
    } catch (error) {
      console.error('Error al crear oficial:', error)
    }
  }

  const handleUpdateOficial = async (oficialData) => {
    try {
      await dispatch(updateOficial({
        id: selectedOficial.id,
        ...oficialData
      })).unwrap()
      setFormOpen(false)
      setSelectedOficial(null)
      loadOficiales() // Recargar lista
    } catch (error) {
      console.error('Error al actualizar oficial:', error)
    }
  }

  const handleDeleteConfirm = async () => {
    if (oficialToDelete) {
      try {
        await dispatch(deleteOficial(oficialToDelete.id)).unwrap()
        setDeleteDialogOpen(false)
        setOficialToDelete(null)
        loadOficiales() // Recargar lista
      } catch (error) {
        console.error('Error al eliminar oficial:', error)
      }
    }
  }

  const handleEditOficial = (oficial) => {
    setSelectedOficial(oficial)
    setFormOpen(true)
  }

  const handleDeleteOficial = (oficial) => {
    setOficialToDelete(oficial)
    setDeleteDialogOpen(true)
  }

  const handleViewOficial = (oficial) => {
    // TODO: Implementar vista detallada
    console.log('Ver detalles de:', oficial)
  }

  const handlePageChange = (event, newPage) => {
    setPage(newPage)
  }

  const handleApplyFilters = (newFilters) => {
    setPage(1) // Resetear a la primera página
    // Los filtros ya se aplican automáticamente desde OficialesFilters
  }

  const totalPages = Math.ceil(totalOficiales / filters.limit)

  // Componente de carga
  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(filters.limit)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ ml: 2, flexGrow: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="rectangular" width={80} height={24} />
              <Skeleton variant="rectangular" width={100} height={24} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )

  return (
    <Box>
      {/* Filtros */}
      <OficialesFilters 
        onApplyFilters={handleApplyFilters}
        totalResults={totalOficiales}
      />

      {/* Header con controles */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" component="h1">
          Oficiales
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Botones de vista */}
          <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('grid')}
              sx={{ borderRadius: '4px 0 0 4px', borderRight: 0 }}
            >
              <GridViewIcon />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('list')}
              sx={{ borderRadius: '0 4px 4px 0' }}
            >
              <ListViewIcon />
            </Button>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedOficial(null)
              setFormOpen(true)
            }}
            sx={{ ml: 2 }}
          >
            Nuevo Oficial
          </Button>
        </Box>
      </Box>

      {/* Manejo de errores */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      {/* Lista de oficiales */}
      <Box sx={{ minHeight: '400px' }}>
        {loading ? (
          <LoadingSkeleton />
        ) : oficiales.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron oficiales
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filters.search || filters.rango || filters.departamento || filters.activo
                ? 'No hay oficiales que coincidan con los filtros aplicados.'
                : 'Aún no hay oficiales registrados en el sistema.'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedOficial(null)
                setFormOpen(true)
              }}
            >
              Registrar Primer Oficial
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {oficiales.map((oficial) => (
              <Grid 
                item 
                xs={12} 
                sm={viewMode === 'grid' ? 6 : 12} 
                md={viewMode === 'grid' ? 4 : 12}
                lg={viewMode === 'grid' ? 3 : 12}
                key={oficial.id}
              >
                <OficialCard
                  oficial={oficial}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  onView={handleViewOficial}
                  onEdit={handleEditOficial}
                  onDelete={handleDeleteOficial}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Paginación */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* FAB para agregar */}
      <Zoom in={!formOpen}>
        <Fab
          color="primary"
          aria-label="Agregar oficial"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16
          }}
          onClick={() => {
            setSelectedOficial(null)
            setFormOpen(true)
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>

      {/* Formulario de oficial */}
      <OficialForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setSelectedOficial(null)
        }}
        oficial={selectedOficial}
        oficiales={oficiales} // Para seleccionar superior
        onSubmit={selectedOficial ? handleUpdateOficial : handleCreateOficial}
        loading={loading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar al oficial{' '}
            <strong>
              {oficialToDelete?.nombres} {oficialToDelete?.apellidos}
            </strong>?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OficialesList