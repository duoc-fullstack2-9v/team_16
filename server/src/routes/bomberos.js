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
  estado: Joi.string().valid('Activo', 'Suspendido', 'Dado de Baja', 'Renuncia').default('Activo').messages({
    'any.only': 'El estado debe ser: Activo, Suspendido, Dado de Baja o Renuncia'
  }),
  motivoEstado: Joi.string().max(500).optional().allow('', null).messages({
    'string.max': 'El motivo del estado no puede exceder 500 caracteres'
  }),
  telefono: Joi.string().min(8).max(25).pattern(/^[\+\d\s\-\(\)]+$/).optional().allow('').messages({
    'string.pattern.base': 'El teléfono debe contener solo números, espacios, guiones, paréntesis o signo +',
    'string.min': 'El teléfono debe tener al menos 8 caracteres',
    'string.max': 'El teléfono no puede exceder 25 caracteres'
  }),
  email: Joi.string().email().optional().allow('').messages({
    'string.email': 'El email debe tener un formato válido'
  }),
  direccion: Joi.string().max(300).optional().allow('').messages({
    'string.max': 'La dirección no puede exceder 300 caracteres'
  }),
  fechaIngreso: Joi.date().iso().optional().allow(null).messages({
    'date.base': 'La fecha de ingreso debe ser una fecha válida'
  }),
  fotoUrl: Joi.string().optional().allow('', null).messages({
    'string.base': 'La URL de la foto debe ser un texto'
  })
})

// GET /api/bomberos/me - Obtener bombero del usuario autenticado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Buscando bombero para usuario:', req.user);
    
    // Buscar el bombero asociado al usuario autenticado
    const bombero = await prisma.bombero.findFirst({
      where: { 
        OR: [
          { email: req.user.email },
          { createdById: req.user.id }
        ]
      },
    });
    
    console.log('✅ Bombero encontrado:', bombero);
    
    if (!bombero) {
      return res.status(404).json({ 
        mensaje: 'No se encontró un bombero asociado a este usuario' 
      });
    }
    
    res.json(bombero);
  } catch (error) {
    console.error('❌ Error al obtener bombero del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener datos del bombero' });
  }
});

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
    console.log('📥 Datos recibidos en el backend:', JSON.stringify(req.body, null, 2))
    
    // Validar datos de entrada
    const { error, value } = bomberoSchema.validate(req.body)
    if (error) {
      console.log('❌ Error de validación:', error.details.map(d => d.message))
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
      totalSuspendidos,
      totalBajas,
      totalRenuncias,
      porRango,
      nuevosUltimoMes
    ] = await Promise.all([
      prisma.bombero.count({ where: { estado: 'Activo' } }),
      prisma.bombero.count({ where: { estado: 'Suspendido' } }),
      prisma.bombero.count({ where: { estado: 'Dado de Baja' } }),
      prisma.bombero.count({ where: { estado: 'Renuncia' } }),
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

    const totalNoActivos = totalSuspendidos + totalBajas + totalRenuncias;
    const total = totalActivos + totalNoActivos;

    res.json({
      success: true,
      data: {
        totalActivos,
        totalSuspendidos,
        totalBajas,
        totalRenuncias,
        totalNoActivos,
        total,
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

// POST /api/bomberos/:id/cambiar-estado - Cambiar estado de un bombero (Solo admin)
router.post('/:id/cambiar-estado', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado, motivo, observaciones } = req.body;

    // Verificar que el usuario sea admin
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para cambiar el estado de bomberos'
      });
    }

    // Validar ObjectId
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'ID de bombero inválido'
      });
    }

    // Validar estado
    const estadosValidos = ['Activo', 'Suspendido', 'Dado de Baja', 'Renuncia'];
    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: Activo, Suspendido, Dado de Baja o Renuncia'
      });
    }

    // Obtener bombero actual
    const bombero = await prisma.bombero.findUnique({
      where: { id }
    });

    if (!bombero) {
      return res.status(404).json({
        success: false,
        message: 'Bombero no encontrado'
      });
    }

    // Verificar si el estado ya es el mismo
    if (bombero.estado === nuevoEstado) {
      return res.status(400).json({
        success: false,
        message: `El bombero ya tiene el estado: ${nuevoEstado}`
      });
    }

    const estadoAnterior = bombero.estado;

    // Actualizar estado del bombero
    const bomberoActualizado = await prisma.bombero.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        motivoEstado: motivo || `Cambio de estado a ${nuevoEstado}`,
        fechaCambioEstado: new Date()
      }
    });

    // Crear registro en historial
    await prisma.historialEstadoBombero.create({
      data: {
        bomberoId: id,
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        motivo: motivo || `Cambio de estado a ${nuevoEstado}`,
        observaciones: observaciones || null,
        cambiadoPorId: req.user.id,
        fechaCambio: new Date()
      }
    });

    res.json({
      success: true,
      message: `Estado del bombero cambiado exitosamente de ${estadoAnterior} a ${nuevoEstado}`,
      data: bomberoActualizado
    });

  } catch (error) {
    console.error('Error al cambiar estado del bombero:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/bomberos/:id/historial-estados - Obtener historial de cambios de estado
router.get('/:id/historial-estados', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ObjectId
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'ID de bombero inválido'
      });
    }

    // Verificar que el bombero existe
    const bombero = await prisma.bombero.findUnique({
      where: { id }
    });

    if (!bombero) {
      return res.status(404).json({
        success: false,
        message: 'Bombero no encontrado'
      });
    }

    // Obtener historial de estados
    const historial = await prisma.historialEstadoBombero.findMany({
      where: { bomberoId: id },
      include: {
        cambiadoPor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true
          }
        }
      },
      orderBy: {
        fechaCambio: 'desc'
      }
    });

    res.json({
      success: true,
      data: historial
    });

  } catch (error) {
    console.error('Error al obtener historial de estados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


export default router