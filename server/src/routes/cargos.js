import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// ========================================
// SCHEMAS DE VALIDACIÓN
// ========================================

// Schema para crear/actualizar cargo
const cargoSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required().messages({
    'string.base': 'El nombre debe ser un texto',
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  descripcion: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'La descripción no puede exceder 500 caracteres'
  }),
  rama: Joi.string().valid('ADMINISTRATIVA', 'OPERATIVA', 'CONSEJOS').required().messages({
    'any.only': 'La rama debe ser: ADMINISTRATIVA, OPERATIVA o CONSEJOS',
    'any.required': 'La rama es requerida'
  }),
  jerarquia: Joi.number().integer().min(1).max(10).required().messages({
    'number.base': 'La jerarquía debe ser un número',
    'number.min': 'La jerarquía debe ser al menos 1',
    'number.max': 'La jerarquía no puede exceder 10',
    'any.required': 'La jerarquía es requerida'
  }),
  maxOcupantes: Joi.number().integer().min(1).max(10).default(1).messages({
    'number.base': 'El máximo de ocupantes debe ser un número',
    'number.min': 'Debe haber al menos 1 ocupante máximo',
    'number.max': 'No puede haber más de 10 ocupantes máximos'
  }),
  activo: Joi.boolean().optional()
})

// Schema para asignar bombero a cargo
const asignacionSchema = Joi.object({
  bomberoId: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del bombero debe ser un número',
    'number.positive': 'El ID debe ser positivo',
    'any.required': 'El ID del bombero es requerido'
  }),
  fechaInicio: Joi.date().iso().default(() => new Date()).messages({
    'date.base': 'La fecha de inicio debe ser una fecha válida'
  }),
  periodoAnio: Joi.number().integer().min(2000).max(2100).default(() => new Date().getFullYear()).messages({
    'number.base': 'El período debe ser un número',
    'number.min': 'El año debe ser al menos 2000',
    'number.max': 'El año no puede exceder 2100'
  }),
  observaciones: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Las observaciones no pueden exceder 500 caracteres'
  })
})

// Schema para liberar cargo
const liberarCargoSchema = Joi.object({
  fechaFin: Joi.date().iso().default(() => new Date()).messages({
    'date.base': 'La fecha de fin debe ser una fecha válida'
  }),
  observaciones: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Las observaciones no pueden exceder 500 caracteres'
  })
})

// ========================================
// RUTAS DE CARGOS
// ========================================

// GET /api/cargos - Listar todos los cargos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rama, activo } = req.query

    // Construir filtros
    const filters = {}
    if (rama) filters.rama = rama
    if (activo !== undefined) filters.activo = activo === 'true'

    const cargos = await prisma.cargo.findMany({
      where: filters,
      include: {
        asignaciones: {
          where: { activo: true },
          include: {
            bombero: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                rango: true,
                fotoUrl: true
              }
            }
          }
        },
        _count: {
          select: {
            asignaciones: true
          }
        }
      },
      orderBy: [
        { rama: 'asc' },
        { jerarquia: 'asc' }
      ]
    })

    // Organizar por ramas
    const cargosPorRama = {
      ADMINISTRATIVA: cargos.filter(c => c.rama === 'ADMINISTRATIVA'),
      OPERATIVA: cargos.filter(c => c.rama === 'OPERATIVA'),
      CONSEJOS: cargos.filter(c => c.rama === 'CONSEJOS')
    }

    res.json({
      success: true,
      data: cargos,
      cargosPorRama,
      total: cargos.length
    })
  } catch (error) {
    console.error('Error al obtener cargos:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/cargos/estadisticas - Estadísticas generales
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const [
      totalCargos,
      cargosOcupados,
      cargosVacantes,
      totalAsignaciones,
      porRama
    ] = await Promise.all([
      prisma.cargo.count(),
      prisma.cargo.count({
        where: {
          asignaciones: {
            some: {
              activo: true
            }
          }
        }
      }),
      prisma.cargo.count({
        where: {
          asignaciones: {
            none: {
              activo: true
            }
          }
        }
      }),
      prisma.asignacionCargo.count(),
      prisma.cargo.groupBy({
        by: ['rama'],
        _count: {
          id: true
        }
      })
    ])

    res.json({
      success: true,
      data: {
        totalCargos,
        cargosOcupados,
        cargosVacantes,
        totalAsignaciones,
        porRama
      }
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/cargos/:id - Obtener cargo específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const cargoId = parseInt(req.params.id)

    if (isNaN(cargoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cargo inválido'
      })
    }

    const cargo = await prisma.cargo.findUnique({
      where: { id: cargoId },
      include: {
        asignaciones: {
          include: {
            bombero: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                rango: true,
                especialidad: true,
                telefono: true,
                email: true,
                fotoUrl: true
              }
            }
          },
          orderBy: {
            fechaInicio: 'desc'
          }
        }
      }
    })

    if (!cargo) {
      return res.status(404).json({
        success: false,
        message: 'Cargo no encontrado'
      })
    }

    res.json({
      success: true,
      data: cargo
    })
  } catch (error) {
    console.error('Error al obtener cargo:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// POST /api/cargos - Crear nuevo cargo
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = cargoSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    const cargo = await prisma.cargo.create({
      data: value
    })

    res.status(201).json({
      success: true,
      message: 'Cargo creado exitosamente',
      data: cargo
    })
  } catch (error) {
    console.error('Error al crear cargo:', error)
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cargo con ese nombre'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// PUT /api/cargos/:id - Actualizar cargo
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const cargoId = parseInt(req.params.id)

    if (isNaN(cargoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cargo inválido'
      })
    }

    const { error, value } = cargoSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    const cargoActualizado = await prisma.cargo.update({
      where: { id: cargoId },
      data: value
    })

    res.json({
      success: true,
      message: 'Cargo actualizado exitosamente',
      data: cargoActualizado
    })
  } catch (error) {
    console.error('Error al actualizar cargo:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Cargo no encontrado'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// DELETE /api/cargos/:id - Eliminar cargo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const cargoId = parseInt(req.params.id)

    if (isNaN(cargoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cargo inválido'
      })
    }

    // Verificar si tiene asignaciones activas
    const asignacionesActivas = await prisma.asignacionCargo.count({
      where: {
        cargoId,
        activo: true
      }
    })

    if (asignacionesActivas > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un cargo con asignaciones activas. Primero libere el cargo.'
      })
    }

    await prisma.cargo.delete({
      where: { id: cargoId }
    })

    res.json({
      success: true,
      message: 'Cargo eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar cargo:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Cargo no encontrado'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// ========================================
// RUTAS DE ASIGNACIONES
// ========================================

// POST /api/cargos/:id/asignar - Asignar bombero a cargo
router.post('/:id/asignar', authenticateToken, async (req, res) => {
  try {
    const cargoId = parseInt(req.params.id)

    if (isNaN(cargoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cargo inválido'
      })
    }

    const { error, value } = asignacionSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    // Verificar que el cargo existe
    const cargo = await prisma.cargo.findUnique({
      where: { id: cargoId },
      include: {
        asignaciones: {
          where: { activo: true }
        }
      }
    })

    if (!cargo) {
      return res.status(404).json({
        success: false,
        message: 'Cargo no encontrado'
      })
    }

    // Verificar que el bombero existe
    const bombero = await prisma.bombero.findUnique({
      where: { id: value.bomberoId }
    })

    if (!bombero) {
      return res.status(404).json({
        success: false,
        message: 'Bombero no encontrado'
      })
    }

    // Verificar que el bombero no tenga otro cargo activo
    const tieneCargoActivo = await prisma.asignacionCargo.findFirst({
      where: {
        bomberoId: value.bomberoId,
        activo: true
      },
      include: {
        cargo: true
      }
    })

    if (tieneCargoActivo) {
      return res.status(400).json({
        success: false,
        message: `El bombero ya tiene asignado el cargo de "${tieneCargoActivo.cargo.nombre}". Primero debe liberar ese cargo.`
      })
    }

    // Verificar que no se exceda el máximo de ocupantes
    if (cargo.asignaciones.length >= cargo.maxOcupantes) {
      return res.status(400).json({
        success: false,
        message: `El cargo ya tiene el máximo de ocupantes (${cargo.maxOcupantes}). Primero libere una plaza.`
      })
    }

    // Crear la asignación
    const asignacion = await prisma.asignacionCargo.create({
      data: {
        cargoId,
        bomberoId: value.bomberoId,
        fechaInicio: value.fechaInicio,
        periodoAnio: value.periodoAnio,
        observaciones: value.observaciones,
        activo: true
      },
      include: {
        cargo: true,
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true,
            fotoUrl: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: `${bombero.nombres} ${bombero.apellidos} asignado exitosamente al cargo de ${cargo.nombre}`,
      data: asignacion
    })
  } catch (error) {
    console.error('Error al asignar cargo:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// PUT /api/cargos/:id/liberar - Liberar cargo (finalizar asignación actual)
router.put('/:id/liberar', authenticateToken, async (req, res) => {
  try {
    const cargoId = parseInt(req.params.id)

    if (isNaN(cargoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cargo inválido'
      })
    }

    const { error, value } = liberarCargoSchema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    // Buscar asignación activa del cargo
    const asignacionActiva = await prisma.asignacionCargo.findFirst({
      where: {
        cargoId,
        activo: true
      },
      include: {
        cargo: true,
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    })

    if (!asignacionActiva) {
      return res.status(404).json({
        success: false,
        message: 'No hay ninguna asignación activa para este cargo'
      })
    }

    // Actualizar la asignación para marcarla como finalizada
    const asignacionFinalizada = await prisma.asignacionCargo.update({
      where: { id: asignacionActiva.id },
      data: {
        activo: false,
        fechaFin: value.fechaFin,
        observaciones: value.observaciones || asignacionActiva.observaciones
      },
      include: {
        cargo: true,
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: `Cargo de ${asignacionActiva.cargo.nombre} liberado exitosamente`,
      data: asignacionFinalizada
    })
  } catch (error) {
    console.error('Error al liberar cargo:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/cargos/:id/historial - Obtener historial de asignaciones del cargo
router.get('/:id/historial', authenticateToken, async (req, res) => {
  try {
    const cargoId = parseInt(req.params.id)

    if (isNaN(cargoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cargo inválido'
      })
    }

    const cargo = await prisma.cargo.findUnique({
      where: { id: cargoId }
    })

    if (!cargo) {
      return res.status(404).json({
        success: false,
        message: 'Cargo no encontrado'
      })
    }

    const historial = await prisma.asignacionCargo.findMany({
      where: { cargoId },
      include: {
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true,
            fotoUrl: true
          }
        }
      },
      orderBy: {
        fechaInicio: 'desc'
      }
    })

    res.json({
      success: true,
      data: {
        cargo,
        historial,
        total: historial.length
      }
    })
  } catch (error) {
    console.error('Error al obtener historial:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router
