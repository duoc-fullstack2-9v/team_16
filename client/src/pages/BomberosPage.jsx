import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Breadcrumbs,
  Link,
  Stack,
  Card,
  CardContent,
  Grid,
  IconButton
} from '@mui/material'
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  BarChart as StatsIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { BomberosList, BomberoForm, BomberoCard } from '../components/bomberos'
import { 
  fetchBomberos, 
  fetchBomberosStats, 
  deleteBombero,
  clearError,
  clearSelectedBombero 
} from '../store/slices/bomberosSlice'
import ErrorBoundary from '../components/ErrorBoundary'

const BomberosPage = () => {
  console.log('🚒 BomberosPage rendering...')
  
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Redux state
  const { 
    stats = {}, 
    statsLoading = false, 
    error = null,
    pagination = {},
    filters = {}
  } = useSelector(state => state.bomberos || {})

  console.log('🚒 BomberosPage state:', { stats, statsLoading, error, pagination, filters })

  // Local state
  const [showForm, setShowForm] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [selectedBombero, setSelectedBombero] = useState(null)
  const [formMode, setFormMode] = useState('create') // 'create' | 'edit'

  // Load initial data
  useEffect(() => {
    dispatch(fetchBomberosStats())
  }, [dispatch])

  // Handle create new bombero
  const handleCreate = () => {
    setSelectedBombero(null)
    setFormMode('create')
    setShowForm(true)
  }

  // Handle edit bombero
  const handleEdit = (bombero) => {
    setSelectedBombero(bombero)
    setFormMode('edit')
    setShowForm(true)
    setShowCard(false)
  }

  // Handle view bombero details
  const handleView = (bombero) => {
    setSelectedBombero(bombero)
    setShowCard(true)
  }

  // Handle delete bombero
  const handleDelete = async (bombero) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${bombero.nombre}?`)) {
      try {
        await dispatch(deleteBombero(bombero.id)).unwrap()
        // Refresh list and stats
        dispatch(fetchBomberos({ 
          page: pagination.current || 1,
          ...filters 
        }))
        dispatch(fetchBomberosStats())
        setShowCard(false)
      } catch (error) {
        console.error('Error al eliminar bombero:', error)
      }
    }
  }

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedBombero(null)
    // Refresh list and stats
    dispatch(fetchBomberos({ 
      page: pagination.current || 1,
      ...filters 
    }))
    dispatch(fetchBomberosStats())
  }

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false)
    setSelectedBombero(null)
    dispatch(clearError())
  }

  // Handle card close
  const handleCardClose = () => {
    setShowCard(false)
    setSelectedBombero(null)
    dispatch(clearSelectedBombero())
  }

  // Refresh data
  const handleRefresh = () => {
    dispatch(fetchBomberos({ 
      page: pagination.current || 1,
      ...filters 
    }))
    dispatch(fetchBomberosStats())
  }

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            underline="hover" 
            color="inherit" 
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault()
              navigate('/dashboard')
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Bomberos
          </Typography>
        </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <GroupIcon sx={{ mr: 1, fontSize: '2rem' }} />
            Gestión de Bomberos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra la información de los bomberos de la compañía
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <IconButton 
            onClick={handleRefresh}
            color="primary"
            title="Actualizar datos"
          >
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Nuevo Bombero
          </Button>
        </Stack>
      </Box>

      {/* Error general */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Bomberos Activos
                  </Typography>
                  <Typography variant="h4">
                    {statsLoading ? '...' : (stats.totalActivos || 0)}
                  </Typography>
                </Box>
                <StatsIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Bomberos
                  </Typography>
                  <Typography variant="h4">
                    {statsLoading ? '...' : (stats.total || 0)}
                  </Typography>
                </Box>
                <GroupIcon color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Inactivos/Licencia
              </Typography>
              <Typography variant="h4">
                {statsLoading ? '...' : (stats.totalInactivos || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Nuevos este mes
              </Typography>
              <Typography variant="h4">
                {statsLoading ? '...' : (stats.nuevosUltimoMes || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de bomberos */}
      <BomberosList 
        onEdit={handleEdit}
        onAdd={handleCreate}
        onView={handleView}
      />

      {/* Modal para formulario */}
      <Dialog 
        open={showForm} 
        onClose={handleFormCancel}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {formMode === 'create' ? 'Nuevo Bombero' : 'Editar Bombero'}
        </DialogTitle>
        <DialogContent>
          <BomberoForm
            bombero={selectedBombero}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para detalles */}
      <Dialog 
        open={showCard} 
        onClose={handleCardClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <BomberoCard
            bombero={selectedBombero}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={handleCardClose}
          />
        </DialogContent>
      </Dialog>
    </Container>
    </ErrorBoundary>
  )
}

export default BomberosPage