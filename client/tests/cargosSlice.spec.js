import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import cargosReducer, {
  fetchCargos,
  fetchCargoById,
  createCargo,
  updateCargo,
  deleteCargo,
  asignarBombero,
  liberarCargo,
  fetchHistorialCargo,
  fetchEstadisticas,
  clearError,
  clearSuccessMessage,
  clearCargoActual,
  clearHistorial
} from '../src/store/slices/cargosSlice'
import api from '../src/services/api'

vi.mock('../src/services/api')

describe('cargosSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        cargos: cargosReducer
      }
    })
    vi.clearAllMocks()
  })

  describe('Estado inicial', () => {
    it('debe tener el estado inicial correcto', () => {
      const state = store.getState().cargos

      expect(state.cargos).toEqual([])
      expect(state.cargosPorRama).toEqual({
        ADMINISTRATIVA: [],
        OPERATIVA: [],
        CONSEJOS: []
      })
      expect(state.cargoActual).toBeNull()
      expect(state.historial).toEqual([])
      expect(state.estadisticas).toBeNull()
      expect(state.loading).toBe('idle')
      expect(state.error).toBeNull()
      expect(state.successMessage).toBeNull()
    })
  })

  describe('Reducers síncronos', () => {
    it('clearError debe limpiar el error', () => {
      store = configureStore({
        reducer: { cargos: cargosReducer },
        preloadedState: {
          cargos: {
            cargos: [],
            cargosPorRama: { ADMINISTRATIVA: [], OPERATIVA: [], CONSEJOS: [] },
            cargoActual: null,
            historial: [],
            estadisticas: null,
            loading: 'idle',
            error: 'Error de prueba',
            successMessage: null
          }
        }
      })

      store.dispatch(clearError())
      const state = store.getState().cargos

      expect(state.error).toBeNull()
    })

    it('clearSuccessMessage debe limpiar el mensaje de éxito', () => {
      store = configureStore({
        reducer: { cargos: cargosReducer },
        preloadedState: {
          cargos: {
            cargos: [],
            cargosPorRama: { ADMINISTRATIVA: [], OPERATIVA: [], CONSEJOS: [] },
            cargoActual: null,
            historial: [],
            estadisticas: null,
            loading: 'idle',
            error: null,
            successMessage: 'Operación exitosa'
          }
        }
      })

      store.dispatch(clearSuccessMessage())
      const state = store.getState().cargos

      expect(state.successMessage).toBeNull()
    })

    it('clearCargoActual debe limpiar el cargo actual', () => {
      store = configureStore({
        reducer: { cargos: cargosReducer },
        preloadedState: {
          cargos: {
            cargos: [],
            cargosPorRama: { ADMINISTRATIVA: [], OPERATIVA: [], CONSEJOS: [] },
            cargoActual: { id: 1, nombre: 'Comandante' },
            historial: [],
            estadisticas: null,
            loading: 'idle',
            error: null,
            successMessage: null
          }
        }
      })

      store.dispatch(clearCargoActual())
      const state = store.getState().cargos

      expect(state.cargoActual).toBeNull()
    })

    it('clearHistorial debe limpiar el historial', () => {
      store = configureStore({
        reducer: { cargos: cargosReducer },
        preloadedState: {
          cargos: {
            cargos: [],
            cargosPorRama: { ADMINISTRATIVA: [], OPERATIVA: [], CONSEJOS: [] },
            cargoActual: null,
            historial: [{ id: 1 }, { id: 2 }],
            estadisticas: null,
            loading: 'idle',
            error: null,
            successMessage: null
          }
        }
      })

      store.dispatch(clearHistorial())
      const state = store.getState().cargos

      expect(state.historial).toEqual([])
    })
  })

  describe('AsyncThunk fetchCargos', () => {
    it('debe manejar el estado pending', () => {
      api.get.mockImplementation(() => new Promise(() => {}))

      store.dispatch(fetchCargos())
      const state = store.getState().cargos

      expect(state.loading).toBe('pending')
      expect(state.error).toBeNull()
    })

    it('debe cargar cargos exitosamente', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, nombre: 'Comandante', rama: 'ADMINISTRATIVA' },
            { id: 2, nombre: 'Subcomandante', rama: 'ADMINISTRATIVA' }
          ],
          cargosPorRama: {
            ADMINISTRATIVA: [
              { id: 1, nombre: 'Comandante' }
            ],
            OPERATIVA: [],
            CONSEJOS: []
          }
        }
      }

      api.get.mockResolvedValueOnce(mockResponse)

      await store.dispatch(fetchCargos())
      const state = store.getState().cargos

      expect(state.loading).toBe('fulfilled')
      expect(state.cargos).toHaveLength(2)
      expect(state.cargosPorRama.ADMINISTRATIVA).toHaveLength(1)
      expect(state.error).toBeNull()
    })

    it('debe manejar errores al cargar cargos', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error del servidor'
          }
        }
      })

      await store.dispatch(fetchCargos())
      const state = store.getState().cargos

      expect(state.loading).toBe('rejected')
      expect(state.error).toBe('Error del servidor')
    })

    it('debe usar mensaje genérico si no hay mensaje específico', async () => {
      api.get.mockRejectedValueOnce({})

      await store.dispatch(fetchCargos())
      const state = store.getState().cargos

      expect(state.error).toBe('Error al cargar cargos')
    })
  })

  describe('AsyncThunk fetchCargoById', () => {
    it('debe cargar un cargo específico', async () => {
      const mockCargo = {
        id: 1,
        nombre: 'Comandante',
        descripcion: 'Cargo de Comandante',
        rama: 'ADMINISTRATIVA'
      }

      api.get.mockResolvedValueOnce({
        data: {
          data: mockCargo
        }
      })

      await store.dispatch(fetchCargoById(1))
      const state = store.getState().cargos

      expect(state.loading).toBe('fulfilled')
      expect(state.cargoActual).toEqual(mockCargo)
      expect(state.error).toBeNull()
    })

    it('debe manejar errores al cargar cargo específico', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Cargo no encontrado'
          }
        }
      })

      await store.dispatch(fetchCargoById(999))
      const state = store.getState().cargos

      expect(state.loading).toBe('rejected')
      expect(state.error).toBe('Cargo no encontrado')
    })
  })

  describe('AsyncThunk createCargo', () => {
    it('debe crear un cargo exitosamente', async () => {
      const newCargo = {
        nombre: 'Nuevo Cargo',
        descripcion: 'Descripción',
        rama: 'OPERATIVA'
      }

      api.post.mockResolvedValueOnce({
        data: {
          data: { id: 3, ...newCargo },
          message: 'Cargo creado exitosamente'
        }
      })

      await store.dispatch(createCargo(newCargo))
      const state = store.getState().cargos

      expect(state.loading).toBe('fulfilled')
      expect(state.cargos).toHaveLength(1)
      expect(state.cargos[0].nombre).toBe('Nuevo Cargo')
      expect(state.successMessage).toBe('Cargo creado exitosamente')
      expect(state.error).toBeNull()
    })

    it('debe manejar errores al crear cargo', async () => {
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error de validación'
          }
        }
      })

      await store.dispatch(createCargo({ nombre: '' }))
      const state = store.getState().cargos

      expect(state.loading).toBe('rejected')
      expect(state.error).toBe('Error de validación')
    })
  })

  describe('AsyncThunk updateCargo', () => {
    it('debe actualizar un cargo exitosamente', async () => {
      store = configureStore({
        reducer: { cargos: cargosReducer },
        preloadedState: {
          cargos: {
            cargos: [
              { id: 1, nombre: 'Cargo Viejo', descripcion: 'Desc' }
            ],
            cargosPorRama: { ADMINISTRATIVA: [], OPERATIVA: [], CONSEJOS: [] },
            cargoActual: null,
            historial: [],
            estadisticas: null,
            loading: 'idle',
            error: null,
            successMessage: null
          }
        }
      })

      const updatedCargo = {
        id: 1,
        nombre: 'Cargo Actualizado',
        descripcion: 'Nueva descripción'
      }

      api.put.mockResolvedValueOnce({
        data: {
          data: updatedCargo,
          message: 'Cargo actualizado'
        }
      })

      await store.dispatch(updateCargo({ id: 1, nombre: 'Cargo Actualizado' }))
      const state = store.getState().cargos

      expect(state.loading).toBe('fulfilled')
      expect(state.cargos[0].nombre).toBe('Cargo Actualizado')
      expect(state.successMessage).toBe('Cargo actualizado')
    })

    it('debe manejar errores al actualizar', async () => {
      api.put.mockRejectedValueOnce({
        response: {
          data: {
            message: 'No se puede actualizar'
          }
        }
      })

      await store.dispatch(updateCargo({ id: 1 }))
      const state = store.getState().cargos

      expect(state.loading).toBe('rejected')
      expect(state.error).toBe('No se puede actualizar')
    })
  })

  describe('AsyncThunk deleteCargo', () => {
    it('debe eliminar un cargo exitosamente', async () => {
      store = configureStore({
        reducer: { cargos: cargosReducer },
        preloadedState: {
          cargos: {
            cargos: [
              { id: 1, nombre: 'Cargo 1' },
              { id: 2, nombre: 'Cargo 2' }
            ],
            cargosPorRama: { ADMINISTRATIVA: [], OPERATIVA: [], CONSEJOS: [] },
            cargoActual: null,
            historial: [],
            estadisticas: null,
            loading: 'idle',
            error: null,
            successMessage: null
          }
        }
      })

      api.delete.mockResolvedValueOnce({ data: { success: true } })

      await store.dispatch(deleteCargo(1))
      const state = store.getState().cargos

      expect(state.loading).toBe('fulfilled')
      expect(state.cargos).toHaveLength(1)
      expect(state.cargos[0].id).toBe(2)
      expect(state.successMessage).toBe('Cargo eliminado exitosamente')
    })

    it('debe manejar errores al eliminar', async () => {
      api.delete.mockRejectedValueOnce({
        response: {
          data: {
            message: 'No se puede eliminar cargo con asignaciones activas'
          }
        }
      })

      await store.dispatch(deleteCargo(1))
      const state = store.getState().cargos

      expect(state.loading).toBe('rejected')
      expect(state.error).toBe('No se puede eliminar cargo con asignaciones activas')
    })
  })

  describe('AsyncThunk asignarBombero', () => {
    it('debe asignar un bombero exitosamente', async () => {
      api.post.mockResolvedValueOnce({
        data: {
          message: 'Bombero asignado al cargo exitosamente',
          data: { asignacionId: 1 }
        }
      })

      await store.dispatch(asignarBombero({
        cargoId: 1,
        bomberoId: 5,
        fechaInicio: '2024-01-01',
        periodoAnio: '2024',
        observaciones: 'Asignación de prueba'
      }))

      const state = store.getState().cargos

      expect(state.loading).toBe('fulfilled')
      expect(state.successMessage).toBe('Bombero asignado al cargo exitosamente')
      expect(state.error).toBeNull()
    })

    it('debe manejar errores al asignar bombero', async () => {
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'El cargo ya tiene un bombero asignado'
          }
        }
      })

      await store.dispatch(asignarBombero({
        cargoId: 1,
        bomberoId: 5,
        fechaInicio: '2024-01-01'
      }))

      const state = store.getState().cargos

      expect(state.loading).toBe('rejected')
      expect(state.error).toBe('El cargo ya tiene un bombero asignado')
    })
  })

  describe('AsyncThunk liberarCargo', () => {
    it('debe liberar un cargo exitosamente', async () => {
      api.put.mockResolvedValueOnce({
        data: {
          message: 'Cargo liberado exitosamente'
        }
      })

      await store.dispatch(liberarCargo({
        cargoId: 1,
        fechaFin: '2024-12-31',
        observaciones: 'Fin de periodo'
      }))

      const state = store.getState().cargos

      expect(state.loading).toBe('fulfilled')
      expect(state.successMessage).toBe('Cargo liberado exitosamente')
      expect(state.error).toBeNull()
    })

    it('debe manejar errores al liberar cargo', async () => {
      api.put.mockRejectedValueOnce({
        response: {
          data: {
            message: 'El cargo no tiene asignación activa'
          }
        }
      })

      await store.dispatch(liberarCargo({
        cargoId: 1,
        fechaFin: '2024-12-31'
      }))

      const state = store.getState().cargos

      expect(state.loading).toBe('rejected')
      expect(state.error).toBe('El cargo no tiene asignación activa')
    })
  })

  describe('AsyncThunk fetchHistorialCargo', () => {
    it('debe cargar el historial de un cargo', async () => {
      const mockHistorial = [
        { id: 1, bombero: 'Juan Pérez', fechaInicio: '2023-01-01', fechaFin: '2023-12-31' },
        { id: 2, bombero: 'María González', fechaInicio: '2024-01-01', fechaFin: null }
      ]

      api.get.mockResolvedValueOnce({
        data: {
          data: {
            historial: mockHistorial
          }
        }
      })

      await store.dispatch(fetchHistorialCargo(1))
      const state = store.getState().cargos

      expect(state.loading).toBe('fulfilled')
      expect(state.historial).toHaveLength(2)
      expect(state.historial[0].bombero).toBe('Juan Pérez')
      expect(state.error).toBeNull()
    })

    it('debe manejar errores al cargar historial', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Cargo no encontrado'
          }
        }
      })

      await store.dispatch(fetchHistorialCargo(999))
      const state = store.getState().cargos

      expect(state.loading).toBe('rejected')
      expect(state.error).toBe('Cargo no encontrado')
    })
  })

  describe('AsyncThunk fetchEstadisticas', () => {
    it('debe cargar estadísticas exitosamente', async () => {
      const mockStats = {
        totalCargos: 50,
        cargosOcupados: 35,
        cargosDisponibles: 15,
        porRama: {
          ADMINISTRATIVA: 20,
          OPERATIVA: 25,
          CONSEJOS: 5
        }
      }

      api.get.mockResolvedValueOnce({
        data: {
          data: mockStats
        }
      })

      await store.dispatch(fetchEstadisticas())
      const state = store.getState().cargos

      expect(state.loading).toBe('fulfilled')
      expect(state.estadisticas).toEqual(mockStats)
      expect(state.estadisticas.totalCargos).toBe(50)
      expect(state.error).toBeNull()
    })

    it('debe manejar errores al cargar estadísticas', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Error al obtener estadísticas'
          }
        }
      })

      await store.dispatch(fetchEstadisticas())
      const state = store.getState().cargos

      expect(state.loading).toBe('rejected')
      expect(state.error).toBe('Error al obtener estadísticas')
    })
  })

  describe('Integración completa', () => {
    it('debe manejar flujo completo: crear -> listar -> actualizar -> eliminar', async () => {
      // 1. Crear cargo
      api.post.mockResolvedValueOnce({
        data: {
          data: { id: 1, nombre: 'Nuevo Cargo' },
          message: 'Creado'
        }
      })
      await store.dispatch(createCargo({ nombre: 'Nuevo Cargo' }))

      let state = store.getState().cargos
      expect(state.cargos).toHaveLength(1)
      expect(state.successMessage).toBe('Creado')

      // 2. Listar cargos
      api.get.mockResolvedValueOnce({
        data: {
          data: [{ id: 1, nombre: 'Nuevo Cargo' }],
          cargosPorRama: { ADMINISTRATIVA: [], OPERATIVA: [], CONSEJOS: [] }
        }
      })
      await store.dispatch(fetchCargos())

      state = store.getState().cargos
      expect(state.cargos).toHaveLength(1)

      // 3. Actualizar cargo
      api.put.mockResolvedValueOnce({
        data: {
          data: { id: 1, nombre: 'Cargo Actualizado' },
          message: 'Actualizado'
        }
      })
      await store.dispatch(updateCargo({ id: 1, nombre: 'Cargo Actualizado' }))

      state = store.getState().cargos
      expect(state.cargos[0].nombre).toBe('Cargo Actualizado')

      // 4. Eliminar cargo
      api.delete.mockResolvedValueOnce({ data: { success: true } })
      await store.dispatch(deleteCargo(1))

      state = store.getState().cargos
      expect(state.cargos).toHaveLength(0)
      expect(state.successMessage).toBe('Cargo eliminado exitosamente')
    })

    it('debe manejar flujo de asignación: asignar -> ver historial -> liberar', async () => {
      // 1. Asignar bombero
      api.post.mockResolvedValueOnce({
        data: {
          message: 'Asignado',
          data: { asignacionId: 1 }
        }
      })
      await store.dispatch(asignarBombero({
        cargoId: 1,
        bomberoId: 5,
        fechaInicio: '2024-01-01'
      }))

      let state = store.getState().cargos
      expect(state.successMessage).toBe('Asignado')

      // 2. Ver historial
      api.get.mockResolvedValueOnce({
        data: {
          data: {
            historial: [{ id: 1, bomberoId: 5, fechaFin: null }]
          }
        }
      })
      await store.dispatch(fetchHistorialCargo(1))

      state = store.getState().cargos
      expect(state.historial).toHaveLength(1)

      // 3. Liberar cargo
      api.put.mockResolvedValueOnce({
        data: {
          message: 'Liberado'
        }
      })
      await store.dispatch(liberarCargo({
        cargoId: 1,
        fechaFin: '2024-12-31'
      }))

      state = store.getState().cargos
      expect(state.successMessage).toBe('Liberado')
    })
  })
})
