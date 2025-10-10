import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Container,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'
import {
  CitacionesList,
  CitacionForm,
  AsignacionBomberos,
  ControlAsistencia
} from '../components/citaciones'
import {
  fetchCitaciones,
  createCitacion,
  updateCitacion,
  deleteCitacion,
  asignarBomberos,
  updateAsistencia,
  clearError,
  setFilters,
  selectCitacionesState,
  selectCitaciones,
  selectCitacionesLoading,
  selectCitacionesError,
  selectCitacionesPagination,
  selectCitacionesFilters,
  selectCreateLoading,
  selectUpdateLoading,
  selectDeleteLoading,
  selectAssignLoading,
  selectAttendanceLoading
} from '../store/slices/citacionesSlice'
import ErrorBoundary from '../components/ErrorBoundary'

const CitacionesPage = () => {
  console.log('📅 CitacionesPage rendering...')
  
  const dispatch = useDispatch()
  
  // Selectores Redux con manejo defensivo
  const citaciones = useSelector(selectCitaciones) || []
  const loading = useSelector(selectCitacionesLoading) || false
  const error = useSelector(selectCitacionesError) || null
  const pagination = useSelector(selectCitacionesPagination) || {}
  const filters = useSelector(selectCitacionesFilters) || {}
  const createLoading = useSelector(selectCreateLoading) || false
  const updateLoading = useSelector(selectUpdateLoading) || false
  const deleteLoading = useSelector(selectDeleteLoading) || false
  const assignLoading = useSelector(selectAssignLoading) || false
  const attendanceLoading = useSelector(selectAttendanceLoading) || false

  console.log('📅 CitacionesPage state:', { 
    citaciones: citaciones?.length, 
    loading, 
    error, 
    pagination, 
    filters 
  })

  // Estados locales para modales
  const [formModal, setFormModal] = useState({
    open: false,
    citacion: null
  })
  
  const [assignModal, setAssignModal] = useState({
    open: false,
    citacion: null
  })
  
  const [attendanceModal, setAttendanceModal] = useState({
    open: false,
    citacion: null
  })
  
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    citacion: null
  })

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  // Cargar citaciones al montar el componente
  useEffect(() => {
    try {
      console.log('📅 Loading citaciones with filters:', filters)
      const params = {
        page: pagination?.current || 1,
        limit: 12,
        ...filters
      }
      dispatch(fetchCitaciones(params))
    } catch (error) {
      console.error('📅 Error loading citaciones:', error)
    }
  }, [dispatch, filters, pagination?.current])

  // Manejar errores globales
  useEffect(() => {
    if (error) {
      setNotification({
        open: true,
        message: error,
        severity: 'error'
      })
      dispatch(clearError())
    }
  }, [error, dispatch])

  // Handlers para la lista
  const handleFiltersChange = (newFilters) => {
    try {
      console.log('📅 Changing filters:', newFilters)
      dispatch(setFilters(newFilters))
      // Resetear a página 1 cuando cambian los filtros
      const params = {
        page: 1,
        limit: 12,
        ...newFilters
      }
      dispatch(fetchCitaciones(params))
    } catch (error) {
      console.error('📅 Error changing filters:', error)
    }
  }

  const handlePageChange = (page) => {
    try {
      console.log('📅 Changing page to:', page)
      const params = {
        page,
        limit: 12,
        ...filters
      }
      dispatch(fetchCitaciones(params))
    } catch (error) {
      console.error('📅 Error changing page:', error)
    }
  }

  // Handlers para CRUD
  const handleAdd = () => {
    setFormModal({
      open: true,
      citacion: null
    })
  }

  const handleEdit = (citacion) => {
    setFormModal({
      open: true,
      citacion
    })
  }

  const handleView = (citacion) => {
    // Por ahora, abrir en modo edición (solo lectura si está realizada)
    setFormModal({
      open: true,
      citacion
    })
  }

  const handleDelete = (citacion) => {
    setDeleteDialog({
      open: true,
      citacion
    })
  }

  const handleAssign = (citacion) => {
    setAssignModal({
      open: true,
      citacion
    })
  }

  // Handlers para modales
  const handleFormSubmit = async (formData) => {
    try {
      if (formModal.citacion) {
        // Actualizar
        await dispatch(updateCitacion({
          id: formModal.citacion.id,
          data: formData
        })).unwrap()
        
        setNotification({
          open: true,
          message: 'Citación actualizada exitosamente',
          severity: 'success'
        })
      } else {
        // Crear
        console.log('📝 Datos a enviar:', formData)
        await dispatch(createCitacion(formData)).unwrap()
        
        setNotification({
          open: true,
          message: 'Citación creada exitosamente',
          severity: 'success'
        })
      }
      
      setFormModal({ open: false, citacion: null })
      
      // Recargar datos
      const params = {
        page: pagination.current,
        limit: 12,
        ...filters
      }
      dispatch(fetchCitaciones(params))
      
    } catch (error) {
      console.error('Error en form submit:', error)
      // Mostrar el error con detalles
      const errorMessage = Array.isArray(error) 
        ? error.join(', ') 
        : (typeof error === 'string' ? error : 'Error al crear citación')
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      })
    }
  }

  const handleFormClose = () => {
    setFormModal({ open: false, citacion: null })
  }

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteCitacion(deleteDialog.citacion.id)).unwrap()
      
      setNotification({
        open: true,
        message: 'Citación eliminada exitosamente',
        severity: 'success'
      })
      
      setDeleteDialog({ open: false, citacion: null })
      
      // Recargar datos
      const params = {
        page: pagination.current,
        limit: 12,
        ...filters
      }
      dispatch(fetchCitaciones(params))
      
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, citacion: null })
  }

  const handleCancel = async (citacion) => {
    try {
      // Confirmar antes de cancelar
      if (window.confirm(`¿Estás seguro de que deseas cancelar la citación "${citacion.titulo}"?`)) {
        await dispatch(updateCitacion({
          id: citacion.id,
          data: { estado: 'Cancelada' }
        })).unwrap()
        
        setNotification({
          open: true,
          message: 'Citación cancelada exitosamente',
          severity: 'success'
        })
        
        // Recargar datos
        const params = {
          page: pagination.current,
          limit: 12,
          ...filters
        }
        dispatch(fetchCitaciones(params))
      }
    } catch (error) {
      console.error('Error al cancelar citación:', error)
      setNotification({
        open: true,
        message: error || 'Error al cancelar la citación',
        severity: 'error'
      })
    }
  }

  const handleAssignSubmit = async (bomberosIds) => {
    try {
      await dispatch(asignarBomberos({
        citacionId: assignModal.citacion.id,
        bomberosIds
      })).unwrap()
      
      setNotification({
        open: true,
        message: 'Bomberos asignados exitosamente',
        severity: 'success'
      })
      
      setAssignModal({ open: false, citacion: null })
      
      // Recargar datos
      const params = {
        page: pagination.current,
        limit: 12,
        ...filters
      }
      dispatch(fetchCitaciones(params))
      
    } catch (error) {
      console.error('Error al asignar bomberos:', error)
    }
  }

  const handleAssignClose = () => {
    setAssignModal({ open: false, citacion: null })
  }

  const handleAttendanceUpdate = async (attendanceData) => {
    try {
      await dispatch(updateAsistencia(attendanceData)).unwrap()
      
      setNotification({
        open: true,
        message: 'Asistencia actualizada exitosamente',
        severity: 'success'
      })
      
    } catch (error) {
      console.error('Error al actualizar asistencia:', error)
    }
  }

  const handleAttendanceClose = () => {
    setAttendanceModal({ open: false, citacion: null })
  }

  // Handler especial para control de asistencia desde la card
  const handleAttendanceControl = (citacion) => {
    setAttendanceModal({
      open: true,
      citacion
    })
  }

  const handleNotificationClose = () => {
    setNotification({ open: false, message: '', severity: 'success' })
  }

  // Determinar si mostrar control de asistencia en lugar de asignación
  const handleAssignOrAttendance = (citacion) => {
    if (citacion.estado === 'realizada' && citacion.bomberos?.length > 0) {
      handleAttendanceControl(citacion)
    } else {
      handleAssign(citacion)
    }
  }

  return (
    <ErrorBoundary>
      <Container maxWidth={false} sx={{ py: 3 }}>
        {/* Lista principal de citaciones */}
        <CitacionesList
          citaciones={citaciones}
          pagination={pagination}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onPageChange={handlePageChange}
          onAdd={handleAdd}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAssign={handleAssignOrAttendance}
          onCancel={handleCancel}
          deleteLoading={deleteLoading}
        />

        {/* Modal de formulario (crear/editar) */}
        <CitacionForm
          open={formModal.open}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          citacion={formModal.citacion}
          loading={createLoading || updateLoading}
          error={error}
        />

        {/* Modal de asignación de bomberos */}
        <AsignacionBomberos
          open={assignModal.open}
          onClose={handleAssignClose}
          onSubmit={handleAssignSubmit}
          citacion={assignModal.citacion}
          loading={assignLoading}
          error={error}
        />

        {/* Modal de control de asistencia */}
        <ControlAsistencia
          open={attendanceModal.open}
          onClose={handleAttendanceClose}
          citacion={attendanceModal.citacion}
          onUpdateAsistencia={handleAttendanceUpdate}
          loading={attendanceLoading}
          error={error}
        />

        {/* Diálogo de confirmación de eliminación */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Confirmar eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres eliminar la citación "{deleteDialog.citacion?.titulo}"?
              
              {deleteDialog.citacion?.bomberos?.length > 0 && (
                <Box component="span" display="block" mt={1} color="warning.main">
                  Esta citación tiene {deleteDialog.citacion.bomberos.length} bombero(s) asignado(s).
                </Box>
              )}
              
              <Box component="span" display="block" mt={1} fontWeight="bold">
                Esta acción no se puede deshacer.
              </Box>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleDeleteCancel}
              disabled={deleteLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleteLoading}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notificaciones */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleNotificationClose}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
    </Container>
    </ErrorBoundary>
  )
}

export default CitacionesPage