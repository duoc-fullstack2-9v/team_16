import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import bomberosReducer, {
  fetchBomberos,
  fetchBomberoById,
  createBombero,
  updateBombero,
  deleteBombero,
  fetchBomberosStats,
  clearError,
  clearSelectedBombero,
  setFilters,
  resetFilters,
  optimisticDeleteBombero,
  selectBomberos,
  selectBomberosLoading,
  selectSelectedBombero,
  selectBomberosPagination,
  selectBomberosFilters
} from '../src/store/slices/bomberosSlice'
import api from '../src/services/api'

vi.mock('../src/services/api')

describe('bomberosSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        bomberos: bomberosReducer
      }
    })
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('debe tener el estado inicial correcto', () => {
      const state = store.getState().bomberos

      expect(state.bomberos).toEqual([])
      expect(state.selectedBombero).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.createLoading).toBe(false)
      expect(state.updateLoading).toBe(false)
      expect(state.deleteLoading).toBe(false)
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
        rango: '',
        estado: 'Activo',
        sortBy: 'apellidos',
        sortOrder: 'asc'
      })
    })
  })

  describe('Reducers síncronos', () => {
    it('clearError debe limpiar todos los errores', () => {
      store = configureStore({
        reducer: { bomberos: bomberosReducer },
        preloadedState: {
          bomberos: {
            bomberos: [],
            error: 'Error general',
            createError: 'Error al crear',
            updateError: 'Error al actualizar',
            deleteError: 'Error al eliminar',
            loading: false,
            selectedBombero: null,
            pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
            filters: { search: '', rango: '', estado: 'Activo', sortBy: 'apellidos', sortOrder: 'asc' },
            stats: { totalActivos: 0, totalInactivos: 0, total: 0, porRango: [], nuevosUltimoMes: 0 },
            createLoading: false,
            updateLoading: false,
            deleteLoading: false,
            statsLoading: false
          }
        }
      })

      store.dispatch(clearError())
      const state = store.getState().bomberos

      expect(state.error).toBeNull()
      expect(state.createError).toBeNull()
      expect(state.updateError).toBeNull()
      expect(state.deleteError).toBeNull()
    })

    it('clearSelectedBombero debe limpiar el bombero seleccionado', () => {
      store = configureStore({
        reducer: { bomberos: bomberosReducer },
        preloadedState: {
          bomberos: {
            bomberos: [],
            selectedBombero: { id: 1, nombres: 'Test' },
            loading: false,
            error: null,
            pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
            filters: { search: '', rango: '', estado: 'Activo', sortBy: 'apellidos', sortOrder: 'asc' },
            stats: { totalActivos: 0, totalInactivos: 0, total: 0, porRango: [], nuevosUltimoMes: 0 },
            createLoading: false,
            updateLoading: false,
            deleteLoading: false,
            statsLoading: false,
            createError: null,
            updateError: null,
            deleteError: null
          }
        }
      })

      store.dispatch(clearSelectedBombero())
      const state = store.getState().bomberos

      expect(state.selectedBombero).toBeNull()
    })

    it('setFilters debe actualizar los filtros', () => {
      store.dispatch(setFilters({ search: 'Juan', rango: 'Cabo' }))
      const state = store.getState().bomberos

      expect(state.filters.search).toBe('Juan')
      expect(state.filters.rango).toBe('Cabo')
      expect(state.filters.estado).toBe('Activo') // Mantiene otros valores
    })

    it('resetFilters debe restaurar los filtros iniciales', () => {
      store.dispatch(setFilters({ search: 'Test', estado: 'Inactivo' }))
      store.dispatch(resetFilters())
      const state = store.getState().bomberos

      expect(state.filters).toEqual({
        search: '',
        rango: '',
        estado: 'Activo',
        sortBy: 'apellidos',
        sortOrder: 'asc'
      })
    })

    it('optimisticDeleteBombero debe marcar el bombero como Inactivo', () => {
      store = configureStore({
        reducer: { bomberos: bomberosReducer },
        preloadedState: {
          bomberos: {
            bomberos: [
              { id: 1, nombres: 'Juan', estado: 'Activo' },
              { id: 2, nombres: 'Pedro', estado: 'Activo' }
            ],
            selectedBombero: null,
            loading: false,
            error: null,
            pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
            filters: { search: '', rango: '', estado: 'Activo', sortBy: 'apellidos', sortOrder: 'asc' },
            stats: { totalActivos: 0, totalInactivos: 0, total: 0, porRango: [], nuevosUltimoMes: 0 },
            createLoading: false,
            updateLoading: false,
            deleteLoading: false,
            statsLoading: false,
            createError: null,
            updateError: null,
            deleteError: null
          }
        }
      })

      store.dispatch(optimisticDeleteBombero(1))
      const state = store.getState().bomberos

      expect(state.bomberos[0].estado).toBe('Inactivo')
      expect(state.bomberos[1].estado).toBe('Activo')
    })
  })

  describe('AsyncThunk fetchBomberos', () => {
    it('debe manejar el estado pending', () => {
      api.get.mockImplementation(() => new Promise(() => {}))

      store.dispatch(fetchBomberos())
      const state = store.getState().bomberos

      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('debe cargar bomberos exitosamente', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, nombres: 'Juan', apellidos: 'Pérez' },
            { id: 2, nombres: 'María', apellidos: 'González' }
          ],
          pagination: {
            current: 1,
            pages: 5,
            total: 50,
            hasNext: true,
            hasPrev: false
          }
        }
      }

      api.get.mockResolvedValueOnce(mockResponse)

      await store.dispatch(fetchBomberos({ page: 1, limit: 10 }))
      const state = store.getState().bomberos

      expect(state.loading).toBe(false)
      expect(state.bomberos).toHaveLength(2)
      expect(state.bomberos[0].nombres).toBe('Juan')
      expect(state.pagination.total).toBe(50)
      expect(state.error).toBeNull()
    })

    it('debe construir query params correctamente', async () => {
      api.get.mockResolvedValueOnce({ data: { data: [], pagination: {} } })

      await store.dispatch(fetchBomberos({
        page: 2,
        limit: 20,
        search: 'Juan',
        rango: 'Cabo',
        estado: 'Inactivo'
      }))

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      )
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=20')
      )
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('search=Juan')
      )
    })

    it('debe manejar errores al cargar bomberos', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error de servidor'
          }
        }
      })

      await store.dispatch(fetchBomberos())
      const state = store.getState().bomberos

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Error de servidor')
    })
  })

  describe('AsyncThunk fetchBomberoById', () => {
    it('debe cargar un bombero específico', async () => {
      const mockBombero = {
        id: 1,
        nombres: 'Juan',
        apellidos: 'Pérez',
        rut: '12345678-9'
      }

      api.get.mockResolvedValueOnce({
        data: {
          data: mockBombero
        }
      })

      await store.dispatch(fetchBomberoById(1))
      const state = store.getState().bomberos

      expect(state.loading).toBe(false)
      expect(state.selectedBombero).toEqual(mockBombero)
      expect(state.error).toBeNull()
    })

    it('debe manejar errores al cargar bombero específico', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Bombero no encontrado'
          }
        }
      })

      await store.dispatch(fetchBomberoById(999))
      const state = store.getState().bomberos

      expect(state.loading).toBe(false)
      expect(state.error).toBe('Bombero no encontrado')
    })
  })

  describe('AsyncThunk createBombero', () => {
    it('debe crear un bombero exitosamente', async () => {
      const newBombero = {
        nombres: 'Carlos',
        apellidos: 'López',
        rut: '11111111-1'
      }

      const mockResponse = {
        data: {
          data: { id: 3, ...newBombero }
        }
      }

      api.post.mockResolvedValueOnce(mockResponse)

      await store.dispatch(createBombero(newBombero))
      const state = store.getState().bomberos

      expect(state.createLoading).toBe(false)
      expect(state.bomberos).toHaveLength(1)
      expect(state.bomberos[0].nombres).toBe('Carlos')
      expect(state.createError).toBeNull()
    })

    it('debe agregar el nuevo bombero al inicio del array', async () => {
      store = configureStore({
        reducer: { bomberos: bomberosReducer },
        preloadedState: {
          bomberos: {
            bomberos: [{ id: 1, nombres: 'Existente' }],
            selectedBombero: null,
            loading: false,
            error: null,
            pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
            filters: { search: '', rango: '', estado: 'Activo', sortBy: 'apellidos', sortOrder: 'asc' },
            stats: { totalActivos: 0, totalInactivos: 0, total: 0, porRango: [], nuevosUltimoMes: 0 },
            createLoading: false,
            updateLoading: false,
            deleteLoading: false,
            statsLoading: false,
            createError: null,
            updateError: null,
            deleteError: null
          }
        }
      })

      api.post.mockResolvedValueOnce({
        data: {
          data: { id: 2, nombres: 'Nuevo' }
        }
      })

      await store.dispatch(createBombero({ nombres: 'Nuevo' }))
      const state = store.getState().bomberos

      expect(state.bomberos[0].nombres).toBe('Nuevo')
      expect(state.bomberos[1].nombres).toBe('Existente')
    })

    it('debe manejar errores al crear bombero', async () => {
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            details: 'RUT duplicado'
          }
        }
      })

      await store.dispatch(createBombero({ nombres: 'Test' }))
      const state = store.getState().bomberos

      expect(state.createLoading).toBe(false)
      expect(state.createError).toBe('RUT duplicado')
    })
  })

  describe('AsyncThunk updateBombero', () => {
    it('debe actualizar un bombero exitosamente', async () => {
      store = configureStore({
        reducer: { bomberos: bomberosReducer },
        preloadedState: {
          bomberos: {
            bomberos: [
              { id: 1, nombres: 'Juan', apellidos: 'Pérez' },
              { id: 2, nombres: 'María', apellidos: 'González' }
            ],
            selectedBombero: null,
            loading: false,
            error: null,
            pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
            filters: { search: '', rango: '', estado: 'Activo', sortBy: 'apellidos', sortOrder: 'asc' },
            stats: { totalActivos: 0, totalInactivos: 0, total: 0, porRango: [], nuevosUltimoMes: 0 },
            createLoading: false,
            updateLoading: false,
            deleteLoading: false,
            statsLoading: false,
            createError: null,
            updateError: null,
            deleteError: null
          }
        }
      })

      const updatedData = { nombres: 'Juan Carlos', apellidos: 'Pérez' }
      api.put.mockResolvedValueOnce({
        data: {
          data: { id: 1, ...updatedData }
        }
      })

      await store.dispatch(updateBombero({ id: 1, data: updatedData }))
      const state = store.getState().bomberos

      expect(state.updateLoading).toBe(false)
      expect(state.bomberos[0].nombres).toBe('Juan Carlos')
      expect(state.updateError).toBeNull()
    })

    it('debe actualizar el selectedBombero si es el mismo', async () => {
      store = configureStore({
        reducer: { bomberos: bomberosReducer },
        preloadedState: {
          bomberos: {
            bomberos: [{ id: 1, nombres: 'Juan' }],
            selectedBombero: { id: 1, nombres: 'Juan' },
            loading: false,
            error: null,
            pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
            filters: { search: '', rango: '', estado: 'Activo', sortBy: 'apellidos', sortOrder: 'asc' },
            stats: { totalActivos: 0, totalInactivos: 0, total: 0, porRango: [], nuevosUltimoMes: 0 },
            createLoading: false,
            updateLoading: false,
            deleteLoading: false,
            statsLoading: false,
            createError: null,
            updateError: null,
            deleteError: null
          }
        }
      })

      api.put.mockResolvedValueOnce({
        data: {
          data: { id: 1, nombres: 'Juan Actualizado' }
        }
      })

      await store.dispatch(updateBombero({ id: 1, data: { nombres: 'Juan Actualizado' } }))
      const state = store.getState().bomberos

      expect(state.selectedBombero.nombres).toBe('Juan Actualizado')
    })

    it('debe manejar errores al actualizar', async () => {
      api.put.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error al actualizar'
          }
        }
      })

      await store.dispatch(updateBombero({ id: 1, data: {} }))
      const state = store.getState().bomberos

      expect(state.updateLoading).toBe(false)
      expect(state.updateError).toBe('Error al actualizar')
    })
  })

  describe('AsyncThunk deleteBombero', () => {
    it('debe eliminar un bombero (soft delete)', async () => {
      store = configureStore({
        reducer: { bomberos: bomberosReducer },
        preloadedState: {
          bomberos: {
            bomberos: [
              { id: 1, nombres: 'Juan', estado: 'Activo' },
              { id: 2, nombres: 'María', estado: 'Activo' }
            ],
            selectedBombero: null,
            loading: false,
            error: null,
            pagination: { current: 1, pages: 1, total: 0, hasNext: false, hasPrev: false },
            filters: { search: '', rango: '', estado: 'Activo', sortBy: 'apellidos', sortOrder: 'asc' },
            stats: { totalActivos: 0, totalInactivos: 0, total: 0, porRango: [], nuevosUltimoMes: 0 },
            createLoading: false,
            updateLoading: false,
            deleteLoading: false,
            statsLoading: false,
            createError: null,
            updateError: null,
            deleteError: null
          }
        }
      })

      api.delete.mockResolvedValueOnce({ data: { success: true } })

      await store.dispatch(deleteBombero(1))
      const state = store.getState().bomberos

      expect(state.deleteLoading).toBe(false)
      expect(state.bomberos[0].estado).toBe('Inactivo')
      expect(state.deleteError).toBeNull()
    })

    it('debe manejar errores al eliminar', async () => {
      api.delete.mockRejectedValueOnce({
        response: {
          data: {
            message: 'No se puede eliminar'
          }
        }
      })

      await store.dispatch(deleteBombero(1))
      const state = store.getState().bomberos

      expect(state.deleteLoading).toBe(false)
      expect(state.deleteError).toBe('No se puede eliminar')
    })
  })

  describe('AsyncThunk fetchBomberosStats', () => {
    it('debe cargar estadísticas exitosamente', async () => {
      const mockStats = {
        totalActivos: 100,
        totalInactivos: 10,
        total: 110,
        porRango: [
          { rango: 'Cabo', cantidad: 30 },
          { rango: 'Voluntario', cantidad: 70 }
        ],
        nuevosUltimoMes: 5
      }

      api.get.mockResolvedValueOnce({
        data: {
          data: mockStats
        }
      })

      await store.dispatch(fetchBomberosStats())
      const state = store.getState().bomberos

      expect(state.statsLoading).toBe(false)
      expect(state.stats).toEqual(mockStats)
    })

    it('debe manejar errores al cargar estadísticas', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error en estadísticas'
          }
        }
      })

      await store.dispatch(fetchBomberosStats())
      const state = store.getState().bomberos

      expect(state.statsLoading).toBe(false)
      expect(state.error).toBe('Error en estadísticas')
    })
  })

  describe('Selectores', () => {
    it('selectBomberos debe devolver el array de bomberos', () => {
      const mockState = {
        bomberos: {
          bomberos: [{ id: 1 }, { id: 2 }]
        }
      }

      expect(selectBomberos(mockState)).toHaveLength(2)
    })

    it('selectBomberosLoading debe devolver el estado de loading', () => {
      const mockState = {
        bomberos: {
          loading: true
        }
      }

      expect(selectBomberosLoading(mockState)).toBe(true)
    })

    it('selectSelectedBombero debe devolver el bombero seleccionado', () => {
      const mockBombero = { id: 1, nombres: 'Test' }
      const mockState = {
        bomberos: {
          selectedBombero: mockBombero
        }
      }

      expect(selectSelectedBombero(mockState)).toEqual(mockBombero)
    })

    it('selectBomberosPagination debe devolver la paginación', () => {
      const mockState = {
        bomberos: {
          pagination: { current: 2, total: 100 }
        }
      }

      expect(selectBomberosPagination(mockState).current).toBe(2)
    })

    it('selectBomberosFilters debe devolver los filtros', () => {
      const mockState = {
        bomberos: {
          filters: { search: 'test', estado: 'Activo' }
        }
      }

      expect(selectBomberosFilters(mockState).search).toBe('test')
    })
  })
})
