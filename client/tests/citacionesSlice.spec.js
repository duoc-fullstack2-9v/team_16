import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import citacionesReducer, {
  fetchCitaciones,
  fetchCitacionById,
  createCitacion,
  updateCitacion,
  deleteCitacion,
  asignarBomberos,
  updateAsistencia,
  fetchCitacionesStats,
  clearError,
  clearSelectedCitacion,
  setFilters,
  resetFilters,
  optimisticDeleteCitacion,
  optimisticUpdateEstado,
  selectCitaciones,
  selectCitacionesLoading,
  selectSelectedCitacion,
  selectCitacionesPagination,
  selectCitacionesFilters,
  selectCreateLoading,
  selectAssignLoading
} from '../src/store/slices/citacionesSlice'
import api from '../src/services/api'

vi.mock('../src/services/api')

describe('citacionesSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        citaciones: citacionesReducer
      }
    })
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('debe tener el estado inicial correcto', () => {
      const state = store.getState().citaciones

      expect(state.citaciones).toEqual([])
      expect(state.selectedCitacion).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.createLoading).toBe(false)
      expect(state.updateLoading).toBe(false)
      expect(state.deleteLoading).toBe(false)
      expect(state.assignLoading).toBe(false)
      expect(state.attendanceLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.pagination).toEqual({
        current: 1,
        pages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
      })
      expect(state.filters).toEqual({
        search: '',
        estado: '',
        fechaDesde: '',
        fechaHasta: '',
        sortBy: 'fecha',
        sortOrder: 'desc'
      })
    })
  })

  describe('Reducers síncronos', () => {
    it('clearError debe limpiar todos los errores', () => {
      const preloadedState = {
        citaciones: {
          citaciones: [],
          selectedCitacion: null,
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: 'Error general',
          createError: 'Error crear',
          updateError: 'Error actualizar',
          deleteError: 'Error eliminar',
          assignError: 'Error asignar',
          attendanceError: 'Error asistencia',
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      store.dispatch(clearError())
      const state = store.getState().citaciones

      expect(state.error).toBeNull()
      expect(state.createError).toBeNull()
      expect(state.updateError).toBeNull()
      expect(state.deleteError).toBeNull()
      expect(state.assignError).toBeNull()
      expect(state.attendanceError).toBeNull()
    })

    it('clearSelectedCitacion debe limpiar la citación seleccionada', () => {
      const preloadedState = {
        citaciones: {
          citaciones: [],
          selectedCitacion: { id: 1, titulo: 'Test' },
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      store.dispatch(clearSelectedCitacion())
      const state = store.getState().citaciones

      expect(state.selectedCitacion).toBeNull()
    })

    it('setFilters debe actualizar los filtros', () => {
      store.dispatch(setFilters({ search: 'test', estado: 'Programada' }))
      const state = store.getState().citaciones

      expect(state.filters.search).toBe('test')
      expect(state.filters.estado).toBe('Programada')
      expect(state.filters.sortBy).toBe('fecha') // Mantiene otros valores
    })

    it('resetFilters debe restaurar los filtros iniciales', () => {
      store.dispatch(setFilters({ search: 'test', estado: 'Realizada' }))
      store.dispatch(resetFilters())
      const state = store.getState().citaciones

      expect(state.filters).toEqual({
        search: '',
        estado: '',
        fechaDesde: '',
        fechaHasta: '',
        sortBy: 'fecha',
        sortOrder: 'desc'
      })
    })

    it('optimisticDeleteCitacion debe eliminar la citación del array', () => {
      const preloadedState = {
        citaciones: {
          citaciones: [
            { id: 1, titulo: 'Citación 1' },
            { id: 2, titulo: 'Citación 2' }
          ],
          selectedCitacion: null,
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      store.dispatch(optimisticDeleteCitacion(1))
      const state = store.getState().citaciones

      expect(state.citaciones).toHaveLength(1)
      expect(state.citaciones[0].id).toBe(2)
    })

    it('optimisticUpdateEstado debe actualizar el estado de la citación', () => {
      const preloadedState = {
        citaciones: {
          citaciones: [
            { id: 1, titulo: 'Test', estado: 'Programada' }
          ],
          selectedCitacion: null,
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      store.dispatch(optimisticUpdateEstado({ id: 1, estado: 'Realizada' }))
      const state = store.getState().citaciones

      expect(state.citaciones[0].estado).toBe('Realizada')
    })
  })

  describe('AsyncThunk fetchCitaciones', () => {
    it('debe manejar el estado pending', () => {
      api.get.mockImplementation(() => new Promise(() => {}))

      store.dispatch(fetchCitaciones())
      const state = store.getState().citaciones

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('debe cargar citaciones exitosamente', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, titulo: 'Citación 1', fecha: '2024-01-01' },
            { id: 2, titulo: 'Citación 2', fecha: '2024-01-02' }
          ],
          pagination: {
            current: 1,
            pages: 3,
            total: 30,
            hasNext: true,
            hasPrev: false
          }
        }
      }

      api.get.mockResolvedValueOnce(mockResponse)

      await store.dispatch(fetchCitaciones({ page: 1, limit: 10 }))
      const state = store.getState().citaciones

      expect(state.loading).toBe(false)
      expect(state.citaciones).toHaveLength(2)
      expect(state.citaciones[0].titulo).toBe('Citación 1')
      expect(state.pagination.total).toBe(30)
      expect(state.error).toBeNull()
    })

    it('debe construir query params correctamente', async () => {
      api.get.mockResolvedValueOnce({
        data: { data: [], pagination: {} }
      })

      await store.dispatch(fetchCitaciones({
        page: 2,
        limit: 20,
        search: 'test',
        estado: 'Programada'
      }))

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      )
    })

    it('debe manejar errores al cargar citaciones', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error del servidor'
          }
        }
      })

      await store.dispatch(fetchCitaciones())
      const state = store.getState().citaciones

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Error del servidor')
    })
  })

  describe('AsyncThunk fetchCitacionById', () => {
    it('debe cargar una citación específica', async () => {
      const mockCitacion = {
        id: 1,
        titulo: 'Citación de Prueba',
        fecha: '2024-01-01',
        lugar: 'Cuartel'
      }

      api.get.mockResolvedValueOnce({
        data: {
          data: mockCitacion
        }
      })

      await store.dispatch(fetchCitacionById(1))
      const state = store.getState().citaciones

      expect(state.loading).toBe(false)
      expect(state.selectedCitacion).toEqual(mockCitacion)
      expect(state.error).toBeNull()
    })

    it('debe manejar errores al cargar citación específica', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Citación no encontrada'
          }
        }
      })

      await store.dispatch(fetchCitacionById(999))
      const state = store.getState().citaciones

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Citación no encontrada')
    })
  })

  describe('AsyncThunk createCitacion', () => {
    it('debe crear una citación exitosamente', async () => {
      const newCitacion = {
        titulo: 'Nueva Citación',
        fecha: '2024-12-01',
        lugar: 'Cuartel'
      }

      api.post.mockResolvedValueOnce({
        data: {
          data: { id: 3, ...newCitacion }
        }
      })

      await store.dispatch(createCitacion(newCitacion))
      const state = store.getState().citaciones

      expect(state.createLoading).toBe(false)
      expect(state.citaciones).toHaveLength(1)
      expect(state.citaciones[0].titulo).toBe('Nueva Citación')
      expect(state.createError).toBeNull()
    })

    it('debe agregar la nueva citación al inicio del array', async () => {
      const preloadedState = {
        citaciones: {
          citaciones: [{ id: 1, titulo: 'Existente' }],
          selectedCitacion: null,
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      api.post.mockResolvedValueOnce({
        data: {
          data: { id: 2, titulo: 'Nueva' }
        }
      })

      await store.dispatch(createCitacion({ titulo: 'Nueva' }))
      const state = store.getState().citaciones

      expect(state.citaciones[0].titulo).toBe('Nueva')
      expect(state.citaciones[1].titulo).toBe('Existente')
    })

    it('debe manejar errores al crear citación', async () => {
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            details: 'Datos inválidos'
          }
        }
      })

      await store.dispatch(createCitacion({ titulo: '' }))
      const state = store.getState().citaciones

      expect(state.createLoading).toBe(false)
      expect(state.createError).toBe('Datos inválidos')
    })
  })

  describe('AsyncThunk updateCitacion', () => {
    it('debe actualizar una citación exitosamente', async () => {
      const preloadedState = {
        citaciones: {
          citaciones: [
            { id: 1, titulo: 'Viejo', fecha: '2024-01-01' }
          ],
          selectedCitacion: null,
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      const updatedCitacion = {
        id: 1,
        titulo: 'Actualizado',
        fecha: '2024-01-01'
      }

      api.put.mockResolvedValueOnce({
        data: {
          data: updatedCitacion
        }
      })

      await store.dispatch(updateCitacion({ id: 1, data: { titulo: 'Actualizado' } }))
      const state = store.getState().citaciones

      expect(state.updateLoading).toBe(false)
      expect(state.citaciones[0].titulo).toBe('Actualizado')
      expect(state.updateError).toBeNull()
    })

    it('debe actualizar selectedCitacion si es la misma', async () => {
      const preloadedState = {
        citaciones: {
          citaciones: [{ id: 1, titulo: 'Test' }],
          selectedCitacion: { id: 1, titulo: 'Test' },
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      api.put.mockResolvedValueOnce({
        data: {
          data: { id: 1, titulo: 'Actualizado' }
        }
      })

      await store.dispatch(updateCitacion({ id: 1, data: { titulo: 'Actualizado' } }))
      const state = store.getState().citaciones

      expect(state.selectedCitacion.titulo).toBe('Actualizado')
    })

    it('debe manejar errores al actualizar', async () => {
      api.put.mockRejectedValueOnce({
        response: {
          data: {
            message: 'No se puede actualizar'
          }
        }
      })

      await store.dispatch(updateCitacion({ id: 1, data: {} }))
      const state = store.getState().citaciones

      expect(state.updateLoading).toBe(false)
      expect(state.updateError).toBe('No se puede actualizar')
    })
  })

  describe('AsyncThunk deleteCitacion', () => {
    it('debe eliminar una citación exitosamente', async () => {
      const preloadedState = {
        citaciones: {
          citaciones: [
            { id: 1, titulo: 'Citación 1' },
            { id: 2, titulo: 'Citación 2' }
          ],
          selectedCitacion: null,
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      api.delete.mockResolvedValueOnce({ data: { success: true } })

      await store.dispatch(deleteCitacion(1))
      const state = store.getState().citaciones

      expect(state.deleteLoading).toBe(false)
      expect(state.citaciones).toHaveLength(1)
      expect(state.citaciones[0].id).toBe(2)
      expect(state.deleteError).toBeNull()
    })

    it('debe limpiar selectedCitacion si es la eliminada', async () => {
      const preloadedState = {
        citaciones: {
          citaciones: [{ id: 1, titulo: 'Test' }],
          selectedCitacion: { id: 1, titulo: 'Test' },
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      api.delete.mockResolvedValueOnce({ data: { success: true } })

      await store.dispatch(deleteCitacion(1))
      const state = store.getState().citaciones

      expect(state.selectedCitacion).toBeNull()
    })

    it('debe manejar errores al eliminar', async () => {
      api.delete.mockRejectedValueOnce({
        response: {
          data: {
            message: 'No se puede eliminar citación con asistencia registrada'
          }
        }
      })

      await store.dispatch(deleteCitacion(1))
      const state = store.getState().citaciones

      expect(state.deleteLoading).toBe(false)
      expect(state.deleteError).toBe('No se puede eliminar citación con asistencia registrada')
    })
  })

  describe('AsyncThunk asignarBomberos', () => {
    it('debe asignar bomberos exitosamente', async () => {
      const preloadedState = {
        citaciones: {
          citaciones: [{ id: 1, titulo: 'Test', bomberos: [] }],
          selectedCitacion: null,
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      api.post.mockResolvedValueOnce({
        data: {
          data: {
            id: 1,
            titulo: 'Test',
            bomberos: [{ bomberoId: 5 }, { bomberoId: 6 }]
          }
        }
      })

      await store.dispatch(asignarBomberos({
        citacionId: 1,
        bomberosIds: [5, 6]
      }))

      const state = store.getState().citaciones

      expect(state.assignLoading).toBe(false)
      expect(state.citaciones[0].bomberos).toHaveLength(2)
      expect(state.assignError).toBeNull()
    })

    it('debe manejar errores al asignar bomberos', async () => {
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Bomberos ya asignados'
          }
        }
      })

      await store.dispatch(asignarBomberos({
        citacionId: 1,
        bomberosIds: [5]
      }))

      const state = store.getState().citaciones

      expect(state.assignLoading).toBe(false)
      expect(state.assignError).toBe('Bomberos ya asignados')
    })
  })

  describe('AsyncThunk updateAsistencia', () => {
    it('debe actualizar asistencia exitosamente', async () => {
      const preloadedState = {
        citaciones: {
          citaciones: [],
          selectedCitacion: {
            id: 1,
            bomberos: [
              { bomberoId: 5, asistio: null, observaciones: '' }
            ]
          },
          loading: false,
          createLoading: false,
          updateLoading: false,
          deleteLoading: false,
          assignLoading: false,
          attendanceLoading: false,
          statsLoading: false,
          error: null,
          createError: null,
          updateError: null,
          deleteError: null,
          assignError: null,
          attendanceError: null,
          pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
          filters: { search: '', estado: '', fechaDesde: '', fechaHasta: '', sortBy: 'fecha', sortOrder: 'desc' },
          stats: { totalProgramadas: 0, totalRealizadas: 0, totalCanceladas: 0, total: 0, porEstado: [], proximasCitaciones: [], citacionesUltimoMes: 0 }
        }
      }

      store = configureStore({
        reducer: { citaciones: citacionesReducer },
        preloadedState
      })

      api.put.mockResolvedValueOnce({
        data: {
          data: {
            bomberoId: 5,
            asistio: true,
            observaciones: 'Presente'
          }
        }
      })

      await store.dispatch(updateAsistencia({
        citacionId: 1,
        bomberoId: 5,
        asistio: true,
        observaciones: 'Presente'
      }))

      const state = store.getState().citaciones

      expect(state.attendanceLoading).toBe(false)
      expect(state.selectedCitacion.bomberos[0].asistio).toBe(true)
      expect(state.selectedCitacion.bomberos[0].observaciones).toBe('Presente')
      expect(state.attendanceError).toBeNull()
    })

    it('debe manejar errores al actualizar asistencia', async () => {
      api.put.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error al actualizar asistencia'
          }
        }
      })

      await store.dispatch(updateAsistencia({
        citacionId: 1,
        bomberoId: 5,
        asistio: true
      }))

      const state = store.getState().citaciones

      expect(state.attendanceLoading).toBe(false)
      expect(state.attendanceError).toBe('Error al actualizar asistencia')
    })
  })

  describe('AsyncThunk fetchCitacionesStats', () => {
    it('debe cargar estadísticas exitosamente', async () => {
      const mockStats = {
        totalProgramadas: 20,
        totalRealizadas: 15,
        totalCanceladas: 3,
        total: 38,
        porEstado: [
          { estado: 'Programada', cantidad: 20 },
          { estado: 'Realizada', cantidad: 15 }
        ],
        proximasCitaciones: [],
        citacionesUltimoMes: 5
      }

      api.get.mockResolvedValueOnce({
        data: {
          data: mockStats
        }
      })

      await store.dispatch(fetchCitacionesStats())
      const state = store.getState().citaciones

      expect(state.statsLoading).toBe(false)
      expect(state.stats).toEqual(mockStats)
      expect(state.stats.total).toBe(38)
    })

    it('debe manejar errores al cargar estadísticas', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error en estadísticas'
          }
        }
      })

      await store.dispatch(fetchCitacionesStats())
      const state = store.getState().citaciones

      expect(state.statsLoading).toBe(false)
      expect(state.error).toBe('Error en estadísticas')
    })
  })

  describe('Selectores', () => {
    it('selectCitaciones debe devolver el array de citaciones', () => {
      const mockState = {
        citaciones: {
          citaciones: [{ id: 1 }, { id: 2 }]
        }
      }

      expect(selectCitaciones(mockState)).toHaveLength(2)
    })

    it('selectCitacionesLoading debe devolver el estado de loading', () => {
      const mockState = {
        citaciones: {
          loading: true
        }
      }

      expect(selectCitacionesLoading(mockState)).toBe(true)
    })

    it('selectSelectedCitacion debe devolver la citación seleccionada', () => {
      const mockCitacion = { id: 1, titulo: 'Test' }
      const mockState = {
        citaciones: {
          selectedCitacion: mockCitacion
        }
      }

      expect(selectSelectedCitacion(mockState)).toEqual(mockCitacion)
    })

    it('selectCitacionesPagination debe devolver la paginación', () => {
      const mockState = {
        citaciones: {
          pagination: { current: 2, total: 100 }
        }
      }

      expect(selectCitacionesPagination(mockState).current).toBe(2)
    })

    it('selectCitacionesFilters debe devolver los filtros', () => {
      const mockState = {
        citaciones: {
          filters: { search: 'test', estado: 'Programada' }
        }
      }

      expect(selectCitacionesFilters(mockState).search).toBe('test')
    })

    it('selectCreateLoading debe devolver createLoading', () => {
      const mockState = {
        citaciones: {
          createLoading: true
        }
      }

      expect(selectCreateLoading(mockState)).toBe(true)
    })

    it('selectAssignLoading debe devolver assignLoading', () => {
      const mockState = {
        citaciones: {
          assignLoading: true
        }
      }

      expect(selectAssignLoading(mockState)).toBe(true)
    })

    it('selectores deben manejar estado undefined', () => {
      const mockState = {}

      expect(selectCitaciones(mockState)).toEqual([])
      expect(selectCitacionesLoading(mockState)).toBe(false)
      expect(selectSelectedCitacion(mockState)).toBeNull()
    })
  })

  describe('Integración completa', () => {
    it('debe manejar flujo completo: crear -> listar -> actualizar -> eliminar', async () => {
      // 1. Crear citación
      api.post.mockResolvedValueOnce({
        data: {
          data: { id: 1, titulo: 'Nueva Citación' }
        }
      })
      await store.dispatch(createCitacion({ titulo: 'Nueva Citación' }))

      let state = store.getState().citaciones
      expect(state.citaciones).toHaveLength(1)

      // 2. Listar citaciones
      api.get.mockResolvedValueOnce({
        data: {
          data: [{ id: 1, titulo: 'Nueva Citación' }],
          pagination: {}
        }
      })
      await store.dispatch(fetchCitaciones())

      state = store.getState().citaciones
      expect(state.citaciones).toHaveLength(1)

      // 3. Actualizar citación
      api.put.mockResolvedValueOnce({
        data: {
          data: { id: 1, titulo: 'Citación Actualizada' }
        }
      })
      await store.dispatch(updateCitacion({ id: 1, data: { titulo: 'Citación Actualizada' } }))

      state = store.getState().citaciones
      expect(state.citaciones[0].titulo).toBe('Citación Actualizada')

      // 4. Eliminar citación
      api.delete.mockResolvedValueOnce({ data: { success: true } })
      await store.dispatch(deleteCitacion(1))

      state = store.getState().citaciones
      expect(state.citaciones).toHaveLength(0)
    })

    it('debe manejar flujo de asignación y asistencia', async () => {
      // 1. Crear citación
      api.post.mockResolvedValueOnce({
        data: {
          data: { id: 1, titulo: 'Test', bomberos: [] }
        }
      })
      await store.dispatch(createCitacion({ titulo: 'Test' }))

      // 2. Asignar bomberos
      api.post.mockResolvedValueOnce({
        data: {
          data: {
            id: 1,
            bomberos: [{ bomberoId: 5, asistio: null }]
          }
        }
      })
      await store.dispatch(asignarBomberos({ citacionId: 1, bomberosIds: [5] }))

      let state = store.getState().citaciones
      expect(state.citaciones[0].bomberos).toHaveLength(1)

      // 3. Seleccionar citación
      api.get.mockResolvedValueOnce({
        data: {
          data: {
            id: 1,
            bomberos: [{ bomberoId: 5, asistio: null }]
          }
        }
      })
      await store.dispatch(fetchCitacionById(1))

      // 4. Actualizar asistencia
      api.put.mockResolvedValueOnce({
        data: {
          data: {
            bomberoId: 5,
            asistio: true,
            observaciones: 'Presente'
          }
        }
      })
      await store.dispatch(updateAsistencia({
        citacionId: 1,
        bomberoId: 5,
        asistio: true,
        observaciones: 'Presente'
      }))

      state = store.getState().citaciones
      expect(state.selectedCitacion.bomberos[0].asistio).toBe(true)
    })
  })
})
