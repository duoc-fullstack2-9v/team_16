import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Schema de validación para bomberos
const bomberoSchema = Joi.object({
  nombres: Joi.string().min(2).max(100).required().messages({
    'string.base': 'Los nombres deben ser un texto',
    'string.min': 'Los nombres deben tener al menos 2 caracteres',
    'string.max': 'Los nombres no pueden exceder 100 caracteres',
    'any.required': 'Los nombres son requeridos'
  }),
  apellidos: Joi.string().min(2).max(100).required().messages({
    'string.base': 'Los apellidos deben ser un texto',
    'string.min': 'Los apellidos deben tener al menos 2 caracteres',
    'string.max': 'Los apellidos no pueden exceder 100 caracteres',
    'any.required': 'Los apellidos son requeridos'
  }),
  rango: Joi.string().valid('Bombero', 'Cabo', 'Sargento', 'Teniente', 'Capitán', 'Comandante').required().messages({
    'any.only': 'El rango debe ser: Bombero, Cabo, Sargento, Teniente, Capitán o Comandante',
    'any.required': 'El rango es requerido'
  }),
  especialidad: Joi.string().max(200).optional().allow('').messages({
    'string.max': 'La especialidad no puede exceder 200 caracteres'
  }),
  estado: Joi.string().valid('Activo', 'Licencia', 'Inactivo').default('Activo').messages({
    'any.only': 'El estado debe ser: Activo, Licencia o Inactivo'
  }),
  telefono: Joi.string().pattern(/^\+?[\d\s\-\(\)]{8,20}$/).optional().allow('').messages({
    'string.pattern.base': 'El teléfono debe tener un formato válido'
  }),
  email: Joi.string().email().optional().allow('').messages({
    'string.email': 'El email debe tener un formato válido'
  }),
  direccion: Joi.string().max(300).optional().allow('').messages({
    'string.max': 'La dirección no puede exceder 300 caracteres'
  }),
  fechaIngreso: Joi.date().iso().optional().allow(null).messages({
    'date.base': 'La fecha de ingreso debe ser una fecha válida'
  })
})

// GET /api/bomberos - Listar bomberos con paginación y filtros
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      rango = '', 
      estado = 'Activo',
      sortBy = 'apellidos',
      sortOrder = 'asc' 
    } = req.query

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber - 1) * limitNumber

    // Construir filtros
    const filterConditions = []
    
    if (estado) {
      filterConditions.push({ estado })
    }
    
    if (rango) {
      filterConditions.push({ rango })
    }
    
    if (search) {
      filterConditions.push({
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { especialidad: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const filters = filterConditions.length > 0 
      ? { AND: filterConditions }
      : {}

    // Obtener bomberos con paginación
    const [bomberos, total] = await Promise.all([
      prisma.bombero.findMany({
        where: filters,
        skip,
        take: limitNumber,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: {
            select: { nombre: true }
          },
          _count: {
            select: { citaciones: true }
          }
        }
      }),
      prisma.bombero.count({ where: filters })
    ])

    res.json({
      success: true,
      data: bomberos,
      pagination: {
        current: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total,
        hasNext: pageNumber < Math.ceil(total / limitNumber),
        hasPrev: pageNumber > 1
      }
    })
  } catch (error) {
    console.error('Error al obtener bomberos:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/bomberos/:id - Obtener bombero específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bomberoId = parseInt(req.params.id)
    
    if (isNaN(bomberoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de bombero inválido'
      })
    }

    const bombero = await prisma.bombero.findUnique({
      where: { id: bomberoId },
      include: {
        createdBy: {
          select: { nombre: true, email: true }
        },
        citaciones: {
          include: {
            citacion: {
              select: {
                id: true,
                titulo: true,
                fecha: true,
                estado: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Últimas 10 citaciones
        }
      }
    })

    if (!bombero) {
      return res.status(404).json({
        success: false,
        message: 'Bombero no encontrado'
      })
    }

    res.json({
      success: true,
      data: bombero
    })
  } catch (error) {
    console.error('Error al obtener bombero:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// POST /api/bomberos - Crear nuevo bombero
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = bomberoSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    // Crear bombero
    const bombero = await prisma.bombero.create({
      data: {
        ...value,
        createdById: req.user.userId
      },
      include: {
        createdBy: {
          select: { nombre: true }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Bombero creado exitosamente',
      data: bombero
    })
  } catch (error) {
    console.error('Error al crear bombero:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// PUT /api/bomberos/:id - Actualizar bombero
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const bomberoId = parseInt(req.params.id)
    
    if (isNaN(bomberoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de bombero inválido'
      })
    }

    // Validar datos de entrada
    const { error, value } = bomberoSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    // Verificar que el bombero existe
    const existingBombero = await prisma.bombero.findUnique({
      where: { id: bomberoId }
    })

    if (!existingBombero) {
      return res.status(404).json({
        success: false,
        message: 'Bombero no encontrado'
      })
    }

    // Actualizar bombero
    const bombero = await prisma.bombero.update({
      where: { id: bomberoId },
      data: value,
      include: {
        createdBy: {
          select: { nombre: true }
        }
      }
    })

    res.json({
      success: true,
      message: 'Bombero actualizado exitosamente',
      data: bombero
    })
  } catch (error) {
    console.error('Error al actualizar bombero:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// DELETE /api/bomberos/:id - Eliminar bombero (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const bomberoId = parseInt(req.params.id)
    
    if (isNaN(bomberoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de bombero inválido'
      })
    }

    // Verificar que el bombero existe
    const existingBombero = await prisma.bombero.findUnique({
      where: { id: bomberoId }
    })

    if (!existingBombero) {
      return res.status(404).json({
        success: false,
        message: 'Bombero no encontrado'
      })
    }

    // Soft delete - cambiar estado a Inactivo
    const bombero = await prisma.bombero.update({
      where: { id: bomberoId },
      data: { estado: 'Inactivo' }
    })

    res.json({
      success: true,
      message: 'Bombero eliminado exitosamente',
      data: { id: bombero.id, estado: bombero.estado }
    })
  } catch (error) {
    console.error('Error al eliminar bombero:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/bomberos/stats/general - Estadísticas generales
router.get('/stats/general', authenticateToken, async (req, res) => {
  try {
    const [
      totalActivos,
      totalInactivos,
      porRango,
      nuevosUltimoMes
    ] = await Promise.all([
      prisma.bombero.count({ where: { estado: 'Activo' } }),
      prisma.bombero.count({ where: { estado: { in: ['Inactivo', 'Licencia'] } } }),
      prisma.bombero.groupBy({
        by: ['rango'],
        _count: { rango: true },
        where: { estado: 'Activo' }
      }),
      prisma.bombero.count({
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
        totalActivos,
        totalInactivos,
        total: totalActivos + totalInactivos,
        porRango: porRango.map(r => ({
          rango: r.rango,
          cantidad: r._count.rango
        })),
        nuevosUltimoMes
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