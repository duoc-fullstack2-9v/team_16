import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

// Aplicar autenticación a todas las rutas
router.use(authenticateToken)

// Esquemas de validación con Joi
const oficialSchema = Joi.object({
  nombres: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Los nombres deben tener al menos 2 caracteres',
      'string.max': 'Los nombres no pueden exceder 100 caracteres',
      'any.required': 'Los nombres son requeridos'
    }),
  apellidos: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Los apellidos deben tener al menos 2 caracteres',
      'string.max': 'Los apellidos no pueden exceder 100 caracteres',
      'any.required': 'Los apellidos son requeridos'
    }),
  rut: Joi.string().pattern(/^\d{7,8}-[\dkK]$/).required()
    .messages({
      'string.pattern.base': 'El RUT debe tener formato válido (ej: 12345678-9)',
      'any.required': 'El RUT es requerido'
    }),
  rango: Joi.string().valid(
    'COMANDANTE', 'CAPITAN', 'TENIENTE', 'ALFEREZ', 
    'SARGENTO', 'CABO', 'BOMBERO'
  ).required()
    .messages({
      'any.only': 'El rango debe ser uno de: COMANDANTE, CAPITAN, TENIENTE, ALFEREZ, SARGENTO, CABO, BOMBERO',
      'any.required': 'El rango es requerido'
    }),
  especialidades: Joi.string().max(255).optional()
    .messages({
      'string.max': 'Las especialidades no pueden exceder 255 caracteres'
    }),
  telefono: Joi.string().pattern(/^\+56 [0-9] [0-9]{4} [0-9]{4}$/).optional()
    .messages({
      'string.pattern.base': 'El teléfono debe tener formato +56 9 1234 5678'
    }),
  email: Joi.string().email().max(255).optional()
    .messages({
      'string.email': 'Debe ser un email válido',
      'string.max': 'El email no puede exceder 255 caracteres'
    }),
  fechaIngreso: Joi.date().max('now').required()
    .messages({
      'date.max': 'La fecha de ingreso no puede ser futura',
      'any.required': 'La fecha de ingreso es requerida'
    }),
  departamento: Joi.string().valid(
    'COMANDO', 'OPERACIONES', 'CAPACITACION', 'MANTENIMIENTO', 
    'COMUNICACIONES', 'ADMINISTRACION'
  ).optional()
    .messages({
      'any.only': 'El departamento debe ser uno de: COMANDO, OPERACIONES, CAPACITACION, MANTENIMIENTO, COMUNICACIONES, ADMINISTRACION'
    }),
  cargo: Joi.string().max(100).optional(),
  fechaNacimiento: Joi.date().max('now').optional()
    .messages({
      'date.max': 'La fecha de nacimiento no puede ser futura'
    }),
  direccion: Joi.string().max(255).optional(),
  estadoCivil: Joi.string().valid(
    'SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_CIVIL'
  ).optional(),
  nivelEducacion: Joi.string().valid(
    'BASICA', 'MEDIA', 'TECNICA', 'UNIVERSITARIA', 'POSTGRADO'
  ).optional(),
  certificaciones: Joi.string().max(500).optional(),
  experienciaAnios: Joi.number().integer().min(0).max(50).optional()
    .messages({
      'number.min': 'Los años de experiencia no pueden ser negativos',
      'number.max': 'Los años de experiencia no pueden exceder 50'
    }),
  observaciones: Joi.string().max(1000).optional(),
  fotoUrl: Joi.string().uri().optional(),
  superiornId: Joi.number().integer().positive().optional(),
  activo: Joi.boolean().optional()
})

// Esquema para filtros de búsqueda
const filtrosSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).default(''),
  rango: Joi.string().valid(
    'COMANDANTE', 'CAPITAN', 'TENIENTE', 'ALFEREZ', 
    'SARGENTO', 'CABO', 'BOMBERO', ''
  ).default(''),
  departamento: Joi.string().valid(
    'COMANDO', 'OPERACIONES', 'CAPACITACION', 'MANTENIMIENTO', 
    'COMUNICACIONES', 'ADMINISTRACION', ''
  ).default(''),
  activo: Joi.string().valid('true', 'false', '').default(''),
  sortBy: Joi.string().valid(
    'nombres', 'apellidos', 'rango', 'fechaIngreso', 'departamento'
  ).default('apellidos'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc')
})

// GET /api/oficiales/stats/jerarquia - Obtener estadísticas de jerarquía
router.get('/stats/jerarquia', async (req, res) => {
  try {
    // Estadísticas por rango
    const porRango = await prisma.oficial.groupBy({
      by: ['rango'],
      where: { activo: true },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Estadísticas por departamento
    const porDepartamento = await prisma.oficial.groupBy({
      by: ['departamento'],
      where: { 
        activo: true,
        departamento: { not: null }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Total de oficiales activos e inactivos
    const [totalActivos, totalInactivos] = await Promise.all([
      prisma.oficial.count({ where: { activo: true } }),
      prisma.oficial.count({ where: { activo: false } })
    ])

    // Oficiales con más años de experiencia
    const masExperimentados = await prisma.oficial.findMany({
      where: { 
        activo: true,
        experienciaAnios: { not: null }
      },
      orderBy: {
        experienciaAnios: 'desc'
      },
      take: 5,
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        rango: true,
        experienciaAnios: true
      }
    })

    // Jerarquía organizacional (comandantes sin superior)
    const comandancia = await prisma.oficial.findMany({
      where: {
        activo: true,
        OR: [
          { rango: 'COMANDANTE' },
          { superiornId: null }
        ]
      },
      include: {
        subordinados: {
          where: { activo: true },
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true,
            departamento: true
          }
        }
      },
      orderBy: {
        fechaIngreso: 'asc'
      }
    })

    res.json({
      success: true,
      data: {
        totalActivos,
        totalInactivos,
        total: totalActivos + totalInactivos,
        porRango: porRango.map(item => ({
          rango: item.rango,
          cantidad: item._count.id
        })),
        porDepartamento: porDepartamento.map(item => ({
          departamento: item.departamento,
          cantidad: item._count.id
        })),
        masExperimentados,
        comandancia
      }
    })

  } catch (error) {
    console.error('Error al obtener estadísticas de jerarquía:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// GET /api/oficiales - Obtener lista de oficiales con filtros
router.get('/', async (req, res) => {
  try {
    // Validar parámetros de consulta
    const { error, value: filtros } = filtrosSchema.validate(req.query, { 
      stripUnknown: true 
    })
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    const { page, limit, search, rango, departamento, activo, sortBy, sortOrder } = filtros

    // Construir condiciones de filtro
    const where = {
      AND: [
        // Filtro de búsqueda en nombres, apellidos o RUT
        search ? {
          OR: [
            { nombres: { contains: search, mode: 'insensitive' } },
            { apellidos: { contains: search, mode: 'insensitive' } },
            { rut: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        
        // Filtro por rango
        rango ? { rango } : {},
        
        // Filtro por departamento
        departamento ? { departamento } : {},
        
        // Filtro por estado activo
        activo ? { activo: activo === 'true' } : {}
      ]
    }

    // Configuración de ordenamiento
    const orderBy = {
      [sortBy]: sortOrder
    }

    // Ejecutar consultas en paralelo
    const [oficiales, total] = await Promise.all([
      prisma.oficial.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          createdBy: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          },
          superior: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              rango: true
            }
          },
          subordinados: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              rango: true
            }
          }
        }
      }),
      prisma.oficial.count({ where })
    ])

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      success: true,
      data: oficiales,
      pagination: {
        current: page,
        pages: totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error al obtener oficiales:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/oficiales/:id - Obtener oficial específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Validar que el ID sea un número
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de oficial inválido'
      })
    }

    const oficial = await prisma.oficial.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        superior: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true,
            departamento: true
          }
        },
        subordinados: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true,
            departamento: true
          }
        }
      }
    })

    if (!oficial) {
      return res.status(404).json({
        success: false,
        message: 'Oficial no encontrado'
      })
    }

    res.json({
      success: true,
      data: oficial
    })

  } catch (error) {
    console.error('Error al obtener oficial:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/oficiales - Crear nuevo oficial
router.post('/', async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value: oficialData } = oficialSchema.validate(req.body, {
      stripUnknown: true
    })
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    // Verificar que no exista otro oficial con el mismo RUT
    const existeRut = await prisma.oficial.findFirst({
      where: { rut: oficialData.rut }
    })

    if (existeRut) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un oficial con este RUT'
      })
    }

    // Verificar que no exista otro oficial con el mismo email (si se proporciona)
    if (oficialData.email) {
      const existeEmail = await prisma.oficial.findFirst({
        where: { email: oficialData.email }
      })

      if (existeEmail) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un oficial con este email'
        })
      }
    }

    // Verificar que el superior exista (si se proporciona)
    if (oficialData.superiornId) {
      const superior = await prisma.oficial.findUnique({
        where: { id: oficialData.superiornId }
      })

      if (!superior) {
        return res.status(400).json({
          success: false,
          message: 'El superior especificado no existe'
        })
      }
    }

    // Crear el oficial
    const nuevoOficial = await prisma.oficial.create({
      data: {
        ...oficialData,
        activo: oficialData.activo ?? true,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        superior: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Oficial creado exitosamente',
      data: nuevoOficial
    })

  } catch (error) {
    console.error('Error al crear oficial:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// PUT /api/oficiales/:id - Actualizar oficial
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Validar que el ID sea un número
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de oficial inválido'
      })
    }

    // Verificar que el oficial existe
    const oficialExistente = await prisma.oficial.findUnique({
      where: { id: parseInt(id) }
    })

    if (!oficialExistente) {
      return res.status(404).json({
        success: false,
        message: 'Oficial no encontrado'
      })
    }

    // Validar datos de entrada
    const { error, value: oficialData } = oficialSchema.validate(req.body, {
      stripUnknown: true
    })
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    // Verificar que no exista otro oficial con el mismo RUT (excluyendo el actual)
    if (oficialData.rut && oficialData.rut !== oficialExistente.rut) {
      const existeRut = await prisma.oficial.findFirst({
        where: { 
          rut: oficialData.rut,
          id: { not: parseInt(id) }
        }
      })

      if (existeRut) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otro oficial con este RUT'
        })
      }
    }

    // Verificar que no exista otro oficial con el mismo email (excluyendo el actual)
    if (oficialData.email && oficialData.email !== oficialExistente.email) {
      const existeEmail = await prisma.oficial.findFirst({
        where: { 
          email: oficialData.email,
          id: { not: parseInt(id) }
        }
      })

      if (existeEmail) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otro oficial con este email'
        })
      }
    }

    // Verificar que el superior exista (si se proporciona)
    if (oficialData.superiornId && oficialData.superiornId !== oficialExistente.superiornId) {
      const superior = await prisma.oficial.findUnique({
        where: { id: oficialData.superiornId }
      })

      if (!superior) {
        return res.status(400).json({
          success: false,
          message: 'El superior especificado no existe'
        })
      }

      // Evitar jerarquías circulares (que el oficial no sea su propio superior)
      if (oficialData.superiornId === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Un oficial no puede ser su propio superior'
        })
      }
    }

    // Actualizar el oficial
    const oficialActualizado = await prisma.oficial.update({
      where: { id: parseInt(id) },
      data: oficialData,
      include: {
        createdBy: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        },
        superior: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true
          }
        },
        subordinados: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: 'Oficial actualizado exitosamente',
      data: oficialActualizado
    })

  } catch (error) {
    console.error('Error al actualizar oficial:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// DELETE /api/oficiales/:id - Eliminar oficial
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Validar que el ID sea un número
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de oficial inválido'
      })
    }

    // Verificar que el oficial existe
    const oficial = await prisma.oficial.findUnique({
      where: { id: parseInt(id) },
      include: {
        subordinados: true
      }
    })

    if (!oficial) {
      return res.status(404).json({
        success: false,
        message: 'Oficial no encontrado'
      })
    }

    // Verificar que no tenga subordinados asignados
    if (oficial.subordinados.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un oficial que tiene subordinados asignados',
        details: `Tiene ${oficial.subordinados.length} subordinado(s). Primero reasigne o elimine los subordinados.`
      })
    }

    // Eliminar el oficial
    await prisma.oficial.delete({
      where: { id: parseInt(id) }
    })

    res.json({
      success: true,
      message: 'Oficial eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar oficial:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

export default router