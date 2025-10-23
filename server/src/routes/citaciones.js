import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Schema de validación para citaciones (CREATE)
const citacionSchema = Joi.object({
  titulo: Joi.string().min(3).max(200).required().messages({
    'string.base': 'El título debe ser un texto',
    'string.min': 'El título debe tener al menos 3 caracteres',
    'string.max': 'El título no puede exceder 200 caracteres',
    'any.required': 'El título es requerido'
  }),
  fecha: Joi.date().iso().required().messages({
    'date.base': 'La fecha debe ser una fecha válida',
    'any.required': 'La fecha es requerida'
  }),
  hora: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'La hora debe tener formato HH:MM (ej: 19:00)',
    'any.required': 'La hora es requerida'
  }),
  lugar: Joi.string().min(3).max(300).required().messages({
    'string.base': 'El lugar debe ser un texto',
    'string.min': 'El lugar debe tener al menos 3 caracteres',
    'string.max': 'El lugar no puede exceder 300 caracteres',
    'any.required': 'El lugar es requerido'
  }),
  motivo: Joi.string().min(10).max(1000).required().messages({
    'string.base': 'El motivo debe ser un texto',
    'string.min': 'El motivo debe tener al menos 10 caracteres',
    'string.max': 'El motivo no puede exceder 1000 caracteres',
    'any.required': 'El motivo es requerido'
  }),
  estado: Joi.string().valid('Programada', 'Realizada', 'Cancelada').default('Programada').messages({
    'any.only': 'El estado debe ser: Programada, Realizada o Cancelada'
  }),
  bomberos: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    'array.base': 'Los bomberos deben ser un array de IDs',
    'number.base': 'Cada ID de bombero debe ser un número',
    'number.positive': 'Los IDs deben ser números positivos'
  })
})

// Schema de validación para actualización (UPDATE - campos opcionales)
const citacionUpdateSchema = Joi.object({
  titulo: Joi.string().min(3).max(200).optional().messages({
    'string.base': 'El título debe ser un texto',
    'string.min': 'El título debe tener al menos 3 caracteres',
    'string.max': 'El título no puede exceder 200 caracteres'
  }),
  fecha: Joi.date().iso().optional().messages({
    'date.base': 'La fecha debe ser una fecha válida'
  }),
  hora: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().messages({
    'string.pattern.base': 'La hora debe tener formato HH:MM (ej: 19:00)'
  }),
  lugar: Joi.string().min(3).max(300).optional().messages({
    'string.base': 'El lugar debe ser un texto',
    'string.min': 'El lugar debe tener al menos 3 caracteres',
    'string.max': 'El lugar no puede exceder 300 caracteres'
  }),
  motivo: Joi.string().min(10).max(1000).optional().messages({
    'string.base': 'El motivo debe ser un texto',
    'string.min': 'El motivo debe tener al menos 10 caracteres',
    'string.max': 'El motivo no puede exceder 1000 caracteres'
  }),
  estado: Joi.string().valid('Programada', 'Realizada', 'Cancelada').optional().messages({
    'any.only': 'El estado debe ser: Programada, Realizada o Cancelada'
  }),
  bomberos: Joi.array().items(Joi.number().integer().positive()).optional().messages({
    'array.base': 'Los bomberos deben ser un array de IDs',
    'number.base': 'Cada ID de bombero debe ser un número',
    'number.positive': 'Los IDs deben ser números positivos'
  })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
})

// Schema para asignación de bomberos
const asignacionSchema = Joi.object({
  bomberosIds: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': 'Los bomberos deben ser un array de IDs',
    'array.min': 'Debe seleccionar al menos un bombero',
    'any.required': 'Los bomberos son requeridos'
  })
})

// Schema para actualizar asistencia
const asistenciaSchema = Joi.object({
  asistio: Joi.boolean().required().messages({
    'boolean.base': 'La asistencia debe ser verdadero o falso',
    'any.required': 'La asistencia es requerida'
  }),
  observaciones: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Las observaciones no pueden exceder 500 caracteres'
  })
})

// GET /api/citaciones - Listar citaciones con filtros y paginación
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      estado = '', 
      fechaDesde = '',
      fechaHasta = '',
      sortBy = 'fecha',
      sortOrder = 'desc' 
    } = req.query

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber - 1) * limitNumber

    // Construir filtros
    const filterConditions = []
    
    if (estado) {
      filterConditions.push({ estado })
    }
    
    if (search) {
      filterConditions.push({
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { lugar: { contains: search, mode: 'insensitive' } },
          { motivo: { contains: search, mode: 'insensitive' } }
        ]
      })
    }
    
    if (fechaDesde && fechaHasta) {
      filterConditions.push({
        fecha: {
          gte: new Date(fechaDesde),
          lte: new Date(fechaHasta)
        }
      })
    }
    
    const filters = filterConditions.length > 0 ? { AND: filterConditions } : {}

    // Actualizar automáticamente citaciones pasadas que siguen como "Programada"
    const now = new Date()
    await prisma.citacion.updateMany({
      where: {
        estado: 'Programada',
        fecha: {
          lt: now
        }
      },
      data: {
        estado: 'Realizada'
      }
    })

    // Obtener citaciones con paginación
    const [citaciones, total] = await Promise.all([
      prisma.citacion.findMany({
        where: filters,
        skip,
        take: limitNumber,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: {
            select: { nombre: true }
          },
          bomberos: {
            include: {
              bombero: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true,
                  rango: true,
                  estado: true,
                  fotoUrl: true
                }
              }
            }
          },
          _count: {
            select: { bomberos: true }
          }
        }
      }),
      prisma.citacion.count({ where: filters })
    ])

    res.json({
      success: true,
      data: citaciones,
      pagination: {
        current: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total,
        hasNext: pageNumber < Math.ceil(total / limitNumber),
        hasPrev: pageNumber > 1
      }
    })
  } catch (error) {
    console.error('Error al obtener citaciones:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/citaciones/:id - Obtener citación específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const citacionId = parseInt(req.params.id)
    
    if (isNaN(citacionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de citación inválido'
      })
    }

    const citacion = await prisma.citacion.findUnique({
      where: { id: citacionId },
      include: {
        createdBy: {
          select: { nombre: true, email: true }
        },
        bomberos: {
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
                estado: true,
                fotoUrl: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!citacion) {
      return res.status(404).json({
        success: false,
        message: 'Citación no encontrada'
      })
    }

    res.json({
      success: true,
      data: citacion
    })
  } catch (error) {
    console.error('Error al obtener citación:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// POST /api/citaciones - Crear nueva citación
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = citacionSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    const { bomberos: bomberosIds, ...citacionData } = value

    // Crear citación en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la citación
      const citacion = await tx.citacion.create({
        data: {
          ...citacionData,
          createdById: req.user.userId
        }
      })

      // Asignar bomberos si se proporcionaron
      if (bomberosIds && bomberosIds.length > 0) {
        // Verificar que los bomberos existen y están activos
        const bomberosValidos = await tx.bombero.findMany({
          where: {
            id: { in: bomberosIds },
            estado: 'Activo'
          }
        })

        if (bomberosValidos.length !== bomberosIds.length) {
          throw new Error('Algunos bomberos no están disponibles')
        }

        // Crear las asignaciones
        await tx.bomberoCitacion.createMany({
          data: bomberosIds.map(bomberoId => ({
            bomberoId,
            citacionId: citacion.id
          }))
        })
      }

      // Retornar citación con relaciones
      return await tx.citacion.findUnique({
        where: { id: citacion.id },
        include: {
          createdBy: { select: { nombre: true } },
          bomberos: {
            include: {
              bombero: {
                select: { id: true, nombres: true, apellidos: true, rango: true, fotoUrl: true }
              }
            }
          }
        }
      })
    })

    res.status(201).json({
      success: true,
      message: 'Citación creada exitosamente',
      data: result
    })
  } catch (error) {
    console.error('Error al crear citación:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// PUT /api/citaciones/:id - Actualizar citación
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const citacionId = parseInt(req.params.id)
    
    if (isNaN(citacionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de citación inválido'
      })
    }

    // Validar datos de entrada con schema de actualización (campos opcionales)
    const { error, value } = citacionUpdateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    // Verificar que la citación existe
    const existingCitacion = await prisma.citacion.findUnique({
      where: { id: citacionId }
    })

    if (!existingCitacion) {
      return res.status(404).json({
        success: false,
        message: 'Citación no encontrada'
      })
    }

    // No permitir editar citaciones ya realizadas
    if (existingCitacion.estado === 'Realizada') {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar una citación ya realizada'
      })
    }

    const { bomberos: bomberosIds, ...citacionData } = value

    // Actualizar en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar la citación
      const citacion = await tx.citacion.update({
        where: { id: citacionId },
        data: citacionData
      })

      // Si se proporcionaron bomberos, actualizar asignaciones
      if (bomberosIds !== undefined) {
        // Eliminar asignaciones existentes
        await tx.bomberoCitacion.deleteMany({
          where: { citacionId }
        })

        // Crear nuevas asignaciones si hay bomberos
        if (bomberosIds.length > 0) {
          const bomberosValidos = await tx.bombero.findMany({
            where: {
              id: { in: bomberosIds },
              estado: 'Activo'
            }
          })

          if (bomberosValidos.length !== bomberosIds.length) {
            throw new Error('Algunos bomberos no están disponibles')
          }

          await tx.bomberoCitacion.createMany({
            data: bomberosIds.map(bomberoId => ({
              bomberoId,
              citacionId
            }))
          })
        }
      }

      // Retornar citación actualizada
      return await tx.citacion.findUnique({
        where: { id: citacionId },
        include: {
          createdBy: { select: { nombre: true } },
          bomberos: {
            include: {
              bombero: {
                select: { id: true, nombres: true, apellidos: true, rango: true, fotoUrl: true }
              }
            }
          }
        }
      })
    })

    res.json({
      success: true,
      message: 'Citación actualizada exitosamente',
      data: result
    })
  } catch (error) {
    console.error('Error al actualizar citación:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// DELETE /api/citaciones/:id - Eliminar citación
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const citacionId = parseInt(req.params.id)
    
    if (isNaN(citacionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de citación inválido'
      })
    }

    // Verificar que la citación existe
    const existingCitacion = await prisma.citacion.findUnique({
      where: { id: citacionId }
    })

    if (!existingCitacion) {
      return res.status(404).json({
        success: false,
        message: 'Citación no encontrada'
      })
    }

    // No permitir eliminar citaciones ya realizadas
    if (existingCitacion.estado === 'Realizada') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una citación ya realizada'
      })
    }

    // Eliminar en transacción (las asignaciones se eliminan automáticamente por CASCADE)
    await prisma.citacion.delete({
      where: { id: citacionId }
    })

    res.json({
      success: true,
      message: 'Citación eliminada exitosamente',
      data: { id: citacionId }
    })
  } catch (error) {
    console.error('Error al eliminar citación:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// POST /api/citaciones/:id/asignar - Asignar bomberos a citación
router.post('/:id/asignar', authenticateToken, async (req, res) => {
  try {
    const citacionId = parseInt(req.params.id)
    
    if (isNaN(citacionId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de citación inválido'
      })
    }

    // Validar datos
    const { error, value } = asignacionSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    const { bomberosIds } = value

    // Verificar que la citación existe y no está realizada
    const citacion = await prisma.citacion.findUnique({
      where: { id: citacionId }
    })

    if (!citacion) {
      return res.status(404).json({
        success: false,
        message: 'Citación no encontrada'
      })
    }

    if (citacion.estado === 'Realizada') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden asignar bomberos a una citación ya realizada'
      })
    }

    // Asignar bomberos en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Verificar que los bomberos existen y están activos
      const bomberosValidos = await tx.bombero.findMany({
        where: {
          id: { in: bomberosIds },
          estado: 'Activo'
        }
      })

      if (bomberosValidos.length !== bomberosIds.length) {
        throw new Error('Algunos bomberos no están disponibles')
      }

      // Eliminar asignaciones existentes
      await tx.bomberoCitacion.deleteMany({
        where: { citacionId }
      })

      // Crear nuevas asignaciones
      await tx.bomberoCitacion.createMany({
        data: bomberosIds.map(bomberoId => ({
          bomberoId,
          citacionId
        }))
      })

      // Retornar citación con bomberos asignados
      return await tx.citacion.findUnique({
        where: { id: citacionId },
        include: {
          bomberos: {
            include: {
              bombero: {
                select: { id: true, nombres: true, apellidos: true, rango: true, fotoUrl: true }
              }
            }
          }
        }
      })
    })

    res.json({
      success: true,
      message: 'Bomberos asignados exitosamente',
      data: result
    })
  } catch (error) {
    console.error('Error al asignar bomberos:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// PUT /api/citaciones/:citacionId/bomberos/:bomberoId/asistencia - Actualizar asistencia
router.put('/:citacionId/bomberos/:bomberoId/asistencia', authenticateToken, async (req, res) => {
  try {
    const citacionId = parseInt(req.params.citacionId)
    const bomberoId = parseInt(req.params.bomberoId)
    
    if (isNaN(citacionId) || isNaN(bomberoId)) {
      return res.status(400).json({
        success: false,
        message: 'IDs inválidos'
      })
    }

    // Validar datos
    const { error, value } = asistenciaSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    // Verificar que la asignación existe
    const asignacion = await prisma.bomberoCitacion.findFirst({
      where: {
        citacionId,
        bomberoId
      }
    })

    if (!asignacion) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada'
      })
    }

    // Actualizar asistencia
    const updated = await prisma.bomberoCitacion.update({
      where: { id: asignacion.id },
      data: value,
      include: {
        bombero: {
          select: { id: true, nombres: true, apellidos: true, rango: true, fotoUrl: true }
        },
        citacion: {
          select: { id: true, titulo: true, fecha: true }
        }
      }
    })

    res.json({
      success: true,
      message: 'Asistencia actualizada exitosamente',
      data: updated
    })
  } catch (error) {
    console.error('Error al actualizar asistencia:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/citaciones/stats/general - Estadísticas generales
router.get('/stats/general', authenticateToken, async (req, res) => {
  try {
    const [
      totalProgramadas,
      totalRealizadas,
      totalCanceladas,
      porEstado,
      proximasCitaciones,
      citacionesUltimoMes
    ] = await Promise.all([
      prisma.citacion.count({ where: { estado: 'Programada' } }),
      prisma.citacion.count({ where: { estado: 'Realizada' } }),
      prisma.citacion.count({ where: { estado: 'Cancelada' } }),
      prisma.citacion.groupBy({
        by: ['estado'],
        _count: { estado: true }
      }),
      prisma.citacion.findMany({
        where: {
          estado: 'Programada',
          fecha: {
            gte: new Date()
          }
        },
        take: 5,
        orderBy: { fecha: 'asc' },
        include: {
          _count: { select: { bomberos: true } }
        }
      }),
      prisma.citacion.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      })
    ])

    res.json({
      success: true,
      data: {
        totalProgramadas,
        totalRealizadas,
        totalCanceladas,
        total: totalProgramadas + totalRealizadas + totalCanceladas,
        porEstado: porEstado.map(e => ({
          estado: e.estado,
          cantidad: e._count.estado
        })),
        proximasCitaciones,
        citacionesUltimoMes
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

export default router