import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// ============================================
// VALIDACIONES JOI
// ============================================

const carroSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  tipo: Joi.string().valid('Bomba', 'Escala', 'Rescate', 'Ambulancia', 'Forestal', 'Otro').required(),
  marca: Joi.string().max(50).optional().allow('', null),
  modelo: Joi.string().max(50).optional().allow('', null),
  anioFabricacion: Joi.number().integer().min(1900).max(2100).optional().allow(null),
  patente: Joi.string().max(20).required(),
  estadoOperativo: Joi.string().valid('Operativo', 'Mantenimiento', 'Fuera de servicio').default('Operativo'),
  capacidadAgua: Joi.number().integer().min(0).optional().allow(null),
  capacidadEspuma: Joi.number().integer().min(0).optional().allow(null),
  potenciaMotobomba: Joi.string().max(50).optional().allow('', null),
  capacidadMotobomba: Joi.string().max(100).optional().allow('', null),
  capacidadCarga: Joi.string().max(100).optional().allow('', null),
  fechaProximaMantencion: Joi.date().optional().allow(null),
  fechaRevisionTecnica: Joi.date().optional().allow(null),
  fechaPermisoCirculacion: Joi.date().optional().allow(null),
  caracteristicas: Joi.object().optional().allow(null),
  observaciones: Joi.string().optional().allow('', null)
})

const cajoneraSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  estado: Joi.string().valid('Operativa', 'Dañada', 'En reparación').default('Operativa'),
  observaciones: Joi.string().optional().allow('', null),
  posicion: Joi.number().integer().min(0).optional().allow(null)
})

const conductorSchema = Joi.object({
  bomberoId: Joi.number().integer().required(),
  fechaDesde: Joi.date().optional(),
  fechaHasta: Joi.date().optional().allow(null),
  observaciones: Joi.string().optional().allow('', null)
})

const mantencionSchema = Joi.object({
  tipo: Joi.string().valid('Mecánica', 'Revisión Técnica', 'Permiso Circulación', 'Preventiva', 'Correctiva').required(),
  descripcion: Joi.string().required(),
  fechaRealizada: Joi.date().required(),
  proximaFecha: Joi.date().optional().allow(null),
  costo: Joi.number().min(0).optional().allow(null),
  realizadoPor: Joi.string().max(200).optional().allow('', null),
  observaciones: Joi.string().optional().allow('', null),
  documentos: Joi.object().optional().allow(null)
})

const asignacionMaterialSchema = Joi.object({
  materialId: Joi.number().integer().required(),
  cajoneraId: Joi.number().integer().optional().allow(null),
  cantidadAsignada: Joi.number().integer().min(1).optional().allow(null),
  motivo: Joi.string().max(200).optional().allow('', null),
  observaciones: Joi.string().optional().allow('', null)
})

// ============================================
// ENDPOINTS - CARROS (CRUD)
// ============================================

// GET /api/carros - Listar carros con filtros
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      tipo = '',
      estadoOperativo = '',
      sortBy = 'nombre',
      sortOrder = 'asc'
    } = req.query

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)
    const skip = (pageNumber - 1) * limitNumber

    // Construir filtros
    const filterConditions = [{ activo: true }]

    if (tipo) {
      filterConditions.push({ tipo })
    }

    if (estadoOperativo) {
      filterConditions.push({ estadoOperativo })
    }

    if (search) {
      filterConditions.push({
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { marca: { contains: search, mode: 'insensitive' } },
          { modelo: { contains: search, mode: 'insensitive' } },
          { patente: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    const filters = { AND: filterConditions }

    // Obtener carros con paginación
    const [carros, total] = await Promise.all([
      prisma.carro.findMany({
        where: filters,
        skip,
        take: limitNumber,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              cajoneras: true,
              asignacionesMaterial: { where: { activo: true } },
              conductoresHabilitados: { where: { activo: true } },
              mantenciones: true
            }
          },
          creador: {
            select: { nombre: true }
          }
        }
      }),
      prisma.carro.count({ where: filters })
    ])

    const totalPages = Math.ceil(total / limitNumber)

    res.json({
      success: true,
      data: {
        data: carros,
        pagination: {
          current: pageNumber,
          pages: totalPages,
          total,
          hasNext: pageNumber < totalPages,
          hasPrev: pageNumber > 1
        }
      }
    })
  } catch (error) {
    console.error('Error al obtener carros:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener lista de carros',
      error: error.message
    })
  }
})

// GET /api/carros/estadisticas - Estadísticas generales
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const [
      totalCarros,
      operativos,
      enMantenimiento,
      fueraServicio,
      porTipo,
      alertasMantencion,
      alertasRevision,
      alertasPermiso
    ] = await Promise.all([
      prisma.carro.count({ where: { activo: true } }),
      prisma.carro.count({ where: { activo: true, estadoOperativo: 'Operativo' } }),
      prisma.carro.count({ where: { activo: true, estadoOperativo: 'Mantenimiento' } }),
      prisma.carro.count({ where: { activo: true, estadoOperativo: 'Fuera de servicio' } }),
      prisma.carro.groupBy({
        by: ['tipo'],
        where: { activo: true },
        _count: { id: true }
      }),
      // Alertas de mantenimiento próximo (dentro de 30 días)
      prisma.carro.count({
        where: {
          activo: true,
          fechaProximaMantencion: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date()
          }
        }
      }),
      // Alertas de revisión técnica próxima (dentro de 60 días)
      prisma.carro.count({
        where: {
          activo: true,
          fechaRevisionTecnica: {
            lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            gte: new Date()
          }
        }
      }),
      // Alertas de permiso circulación próximo (dentro de 60 días)
      prisma.carro.count({
        where: {
          activo: true,
          fechaPermisoCirculacion: {
            lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            gte: new Date()
          }
        }
      })
    ])

    res.json({
      success: true,
      data: {
        totalCarros,
        operativos,
        enMantenimiento,
        fueraServicio,
        porTipo: porTipo.map(item => ({
          tipo: item.tipo,
          cantidad: item._count.id
        })),
        alertas: {
          mantencion: alertasMantencion,
          revisionTecnica: alertasRevision,
          permisoCirculacion: alertasPermiso,
          total: alertasMantencion + alertasRevision + alertasPermiso
        }
      }
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    })
  }
})

// GET /api/carros/alertas - Sistema de alertas
router.get('/alertas', authenticateToken, async (req, res) => {
  try {
    const ahora = new Date()
    const en30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const en60Dias = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)

    const [
      mantencionAtrasada,
      mantencionProxima,
      revisionAtrasada,
      revisionProxima,
      permisoAtrasado,
      permisoProximo
    ] = await Promise.all([
      // Mantenimiento atrasado
      prisma.carro.findMany({
        where: {
          activo: true,
          fechaProximaMantencion: { lt: ahora }
        },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          patente: true,
          fechaProximaMantencion: true
        }
      }),
      // Mantenimiento próximo (dentro de 30 días)
      prisma.carro.findMany({
        where: {
          activo: true,
          fechaProximaMantencion: { gte: ahora, lte: en30Dias }
        },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          patente: true,
          fechaProximaMantencion: true
        }
      }),
      // Revisión técnica atrasada
      prisma.carro.findMany({
        where: {
          activo: true,
          fechaRevisionTecnica: { lt: ahora }
        },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          patente: true,
          fechaRevisionTecnica: true
        }
      }),
      // Revisión técnica próxima (dentro de 60 días)
      prisma.carro.findMany({
        where: {
          activo: true,
          fechaRevisionTecnica: { gte: ahora, lte: en60Dias }
        },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          patente: true,
          fechaRevisionTecnica: true
        }
      }),
      // Permiso circulación atrasado
      prisma.carro.findMany({
        where: {
          activo: true,
          fechaPermisoCirculacion: { lt: ahora }
        },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          patente: true,
          fechaPermisoCirculacion: true
        }
      }),
      // Permiso circulación próximo (dentro de 60 días)
      prisma.carro.findMany({
        where: {
          activo: true,
          fechaPermisoCirculacion: { gte: ahora, lte: en60Dias }
        },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          patente: true,
          fechaPermisoCirculacion: true
        }
      })
    ])

    res.json({
      success: true,
      data: {
        mantencion: {
          atrasadas: mantencionAtrasada.map(c => ({
            ...c,
            tipo: 'MANTENCION_ATRASADA',
            prioridad: 'alta',
            diasRetraso: Math.floor((ahora - c.fechaProximaMantencion) / (1000 * 60 * 60 * 24))
          })),
          proximas: mantencionProxima.map(c => ({
            ...c,
            tipo: 'MANTENCION_PROXIMA',
            prioridad: 'media',
            diasRestantes: Math.floor((c.fechaProximaMantencion - ahora) / (1000 * 60 * 60 * 24))
          }))
        },
        revisionTecnica: {
          atrasadas: revisionAtrasada.map(c => ({
            ...c,
            tipo: 'REVISION_ATRASADA',
            prioridad: 'alta',
            diasRetraso: Math.floor((ahora - c.fechaRevisionTecnica) / (1000 * 60 * 60 * 24))
          })),
          proximas: revisionProxima.map(c => ({
            ...c,
            tipo: 'REVISION_PROXIMA',
            prioridad: 'media',
            diasRestantes: Math.floor((c.fechaRevisionTecnica - ahora) / (1000 * 60 * 60 * 24))
          }))
        },
        permisoCirculacion: {
          atrasados: permisoAtrasado.map(c => ({
            ...c,
            tipo: 'PERMISO_ATRASADO',
            prioridad: 'alta',
            diasRetraso: Math.floor((ahora - c.fechaPermisoCirculacion) / (1000 * 60 * 60 * 24))
          })),
          proximos: permisoProximo.map(c => ({
            ...c,
            tipo: 'PERMISO_PROXIMO',
            prioridad: 'media',
            diasRestantes: Math.floor((c.fechaPermisoCirculacion - ahora) / (1000 * 60 * 60 * 24))
          }))
        },
        totales: {
          criticas: mantencionAtrasada.length + revisionAtrasada.length + permisoAtrasado.length,
          advertencias: mantencionProxima.length + revisionProxima.length + permisoProximo.length
        }
      }
    })
  } catch (error) {
    console.error('Error al obtener alertas:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    })
  }
})

// GET /api/carros/:id - Obtener carro específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const carro = await prisma.carro.findUnique({
      where: { id: parseInt(id) },
      include: {
        cajoneras: {
          where: { activo: true },
          include: {
            _count: {
              select: { materiales: { where: { activo: true } } }
            }
          }
        },
        asignacionesMaterial: {
          where: { activo: true },
          include: {
            material: true,
            cajonera: true
          }
        },
        conductoresHabilitados: {
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
        mantenciones: {
          orderBy: { fechaRealizada: 'desc' },
          take: 10
        },
        historial: {
          include: {
            usuario: {
              select: { nombre: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        creador: {
          select: { nombre: true }
        }
      }
    })

    if (!carro) {
      return res.status(404).json({
        success: false,
        message: 'Carro no encontrado'
      })
    }

    res.json({
      success: true,
      data: carro
    })
  } catch (error) {
    console.error('Error al obtener carro:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener carro',
      error: error.message
    })
  }
})

// POST /api/carros - Crear nuevo carro
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = carroSchema.validate(req.body, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        details: error.details.map(d => d.message)
      })
    }

    // Verificar que la patente no esté en uso
    const patenteExistente = await prisma.carro.findFirst({
      where: {
        patente: value.patente,
        activo: true
      }
    })

    if (patenteExistente) {
      return res.status(400).json({
        success: false,
        message: `La patente ${value.patente} ya está registrada`
      })
    }

    const carro = await prisma.carro.create({
      data: {
        ...value,
        creadoPor: req.user.id
      },
      include: {
        creador: {
          select: { nombre: true }
        }
      }
    })

    // Registrar en historial
    await prisma.historialCarro.create({
      data: {
        carroId: carro.id,
        tipo: 'CREACION',
        descripcion: `Carro ${carro.nombre} creado en el sistema`,
        cambios: { datos: value },
        usuarioId: req.user.id
      }
    })

    res.status(201).json({
      success: true,
      message: 'Carro creado exitosamente',
      data: carro
    })
  } catch (error) {
    console.error('Error al crear carro:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear carro',
      error: error.message
    })
  }
})

// PUT /api/carros/:id - Actualizar carro
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { error, value } = carroSchema.validate(req.body, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        details: error.details.map(d => d.message)
      })
    }

    const carroAnterior = await prisma.carro.findUnique({
      where: { id: parseInt(id) }
    })

    if (!carroAnterior) {
      return res.status(404).json({
        success: false,
        message: 'Carro no encontrado'
      })
    }

    // Si cambió la patente, verificar que no esté en uso
    if (value.patente !== carroAnterior.patente) {
      const patenteExistente = await prisma.carro.findFirst({
        where: {
          patente: value.patente,
          activo: true,
          id: { not: parseInt(id) }
        }
      })

      if (patenteExistente) {
        return res.status(400).json({
          success: false,
          message: `La patente ${value.patente} ya está registrada en otro carro`
        })
      }
    }

    const carro = await prisma.carro.update({
      where: { id: parseInt(id) },
      data: value,
      include: {
        creador: {
          select: { nombre: true }
        }
      }
    })

    // Detectar cambios importantes
    const cambiosImportantes = {}
    if (value.estadoOperativo !== carroAnterior.estadoOperativo) {
      cambiosImportantes.estadoOperativo = {
        anterior: carroAnterior.estadoOperativo,
        nuevo: value.estadoOperativo
      }
    }

    // Registrar en historial
    await prisma.historialCarro.create({
      data: {
        carroId: carro.id,
        tipo: Object.keys(cambiosImportantes).length > 0 ? 'CAMBIO_ESTADO' : 'ACTUALIZACION',
        descripcion: `Carro ${carro.nombre} actualizado`,
        cambios: { modificaciones: value, cambiosDestacados: cambiosImportantes },
        usuarioId: req.user.id
      }
    })

    res.json({
      success: true,
      message: 'Carro actualizado exitosamente',
      data: carro
    })
  } catch (error) {
    console.error('Error al actualizar carro:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar carro',
      error: error.message
    })
  }
})

// DELETE /api/carros/:id - Eliminar carro (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const carro = await prisma.carro.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            asignacionesMaterial: { where: { activo: true } },
            cajoneras: { where: { activo: true } }
          }
        }
      }
    })

    if (!carro) {
      return res.status(404).json({
        success: false,
        message: 'Carro no encontrado'
      })
    }

    // Verificar si tiene material asignado
    if (carro._count.asignacionesMaterial > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el carro porque tiene ${carro._count.asignacionesMaterial} material(es) asignado(s). Debe desasignar todo el material primero.`
      })
    }

    // Soft delete
    await prisma.carro.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    })

    // Registrar en historial
    await prisma.historialCarro.create({
      data: {
        carroId: parseInt(id),
        tipo: 'ELIMINACION',
        descripcion: `Carro ${carro.nombre} eliminado del sistema`,
        usuarioId: req.user.id
      }
    })

    res.json({
      success: true,
      message: 'Carro eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar carro:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar carro',
      error: error.message
    })
  }
})

// ============================================
// ENDPOINTS - CAJONERAS
// ============================================

// GET /api/carros/:id/cajoneras - Obtener cajoneras de un carro
router.get('/:id/cajoneras', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const cajoneras = await prisma.cajonera.findMany({
      where: {
        carroId: parseInt(id),
        activo: true
      },
      include: {
        materiales: {
          where: { activo: true },
          include: {
            material: true
          }
        },
        _count: {
          select: {
            materiales: { where: { activo: true } }
          }
        }
      },
      orderBy: { posicion: 'asc' }
    })

    res.json({
      success: true,
      data: cajoneras
    })
  } catch (error) {
    console.error('Error al obtener cajoneras:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener cajoneras',
      error: error.message
    })
  }
})

// POST /api/carros/:id/cajoneras - Crear cajonera
router.post('/:id/cajoneras', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { error, value } = cajoneraSchema.validate(req.body, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        details: error.details.map(d => d.message)
      })
    }

    // Verificar que el carro existe
    const carro = await prisma.carro.findUnique({
      where: { id: parseInt(id) }
    })

    if (!carro) {
      return res.status(404).json({
        success: false,
        message: 'Carro no encontrado'
      })
    }

    const cajonera = await prisma.cajonera.create({
      data: {
        ...value,
        carroId: parseInt(id)
      }
    })

    // Registrar en historial de cajonera
    await prisma.historialCajonera.create({
      data: {
        cajoneraId: cajonera.id,
        tipo: 'CREACION',
        descripcion: `Cajonera "${cajonera.nombre}" creada en ${carro.nombre}`,
        cambios: { datos: value },
        usuarioId: req.user.id
      }
    })

    // Registrar en historial del carro
    await prisma.historialCarro.create({
      data: {
        carroId: parseInt(id),
        tipo: 'ACTUALIZACION',
        descripcion: `Nueva cajonera "${cajonera.nombre}" agregada`,
        usuarioId: req.user.id
      }
    })

    res.status(201).json({
      success: true,
      message: 'Cajonera creada exitosamente',
      data: cajonera
    })
  } catch (error) {
    console.error('Error al crear cajonera:', error)
    res.status(500).json({
      success: false,
      message: 'Error al crear cajonera',
      error: error.message
    })
  }
})

// PUT /api/carros/cajoneras/:id - Actualizar cajonera
router.put('/cajoneras/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { error, value } = cajoneraSchema.validate(req.body, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        details: error.details.map(d => d.message)
      })
    }

    const cajoneraAnterior = await prisma.cajonera.findUnique({
      where: { id: parseInt(id) },
      include: { carro: true }
    })

    if (!cajoneraAnterior) {
      return res.status(404).json({
        success: false,
        message: 'Cajonera no encontrada'
      })
    }

    const cajonera = await prisma.cajonera.update({
      where: { id: parseInt(id) },
      data: value
    })

    // Registrar cambios en historial
    await prisma.historialCajonera.create({
      data: {
        cajoneraId: cajonera.id,
        tipo: value.estado !== cajoneraAnterior.estado ? 'CAMBIO_ESTADO' : 'ACTUALIZACION',
        descripcion: `Cajonera "${cajonera.nombre}" actualizada`,
        cambios: {
          anterior: {
            nombre: cajoneraAnterior.nombre,
            estado: cajoneraAnterior.estado
          },
          nuevo: value
        },
        usuarioId: req.user.id
      }
    })

    res.json({
      success: true,
      message: 'Cajonera actualizada exitosamente',
      data: cajonera
    })
  } catch (error) {
    console.error('Error al actualizar cajonera:', error)
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cajonera',
      error: error.message
    })
  }
})

// DELETE /api/carros/cajoneras/:id - Eliminar cajonera
router.delete('/cajoneras/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const cajonera = await prisma.cajonera.findUnique({
      where: { id: parseInt(id) },
      include: {
        carro: true,
        _count: {
          select: { materiales: { where: { activo: true } } }
        }
      }
    })

    if (!cajonera) {
      return res.status(404).json({
        success: false,
        message: 'Cajonera no encontrada'
      })
    }

    // Verificar si tiene material asignado
    if (cajonera._count.materiales > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar la cajonera porque tiene ${cajonera._count.materiales} material(es) asignado(s). Debe reubicar el material primero.`
      })
    }

    // Soft delete
    await prisma.cajonera.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    })

    // Registrar en historial
    await prisma.historialCajonera.create({
      data: {
        cajoneraId: parseInt(id),
        tipo: 'ELIMINACION',
        descripcion: `Cajonera "${cajonera.nombre}" eliminada`,
        usuarioId: req.user.id
      }
    })

    res.json({
      success: true,
      message: 'Cajonera eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar cajonera:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar cajonera',
      error: error.message
    })
  }
})

// ============================================
// ENDPOINTS - CONDUCTORES HABILITADOS
// ============================================

// GET /api/carros/:id/conductores - Obtener conductores habilitados de un carro
router.get('/:id/conductores', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const conductores = await prisma.conductorHabilitado.findMany({
      where: {
        carroId: parseInt(id),
        activo: true
      },
      include: {
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true,
            especialidad: true,
            fotoUrl: true
          }
        }
      },
      orderBy: { fechaDesde: 'desc' }
    })

    res.json({
      success: true,
      data: conductores
    })
  } catch (error) {
    console.error('Error al obtener conductores:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener conductores',
      error: error.message
    })
  }
})

// POST /api/carros/:id/conductores - Asignar conductor habilitado
router.post('/:id/conductores', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { error, value } = conductorSchema.validate(req.body, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        details: error.details.map(d => d.message)
      })
    }

    // Verificar que el carro existe
    const carro = await prisma.carro.findUnique({
      where: { id: parseInt(id) }
    })

    if (!carro) {
      return res.status(404).json({
        success: false,
        message: 'Carro no encontrado'
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

    // Verificar si ya está habilitado
    const yaHabilitado = await prisma.conductorHabilitado.findFirst({
      where: {
        carroId: parseInt(id),
        bomberoId: value.bomberoId,
        activo: true
      }
    })

    if (yaHabilitado) {
      return res.status(400).json({
        success: false,
        message: `${bombero.nombres} ${bombero.apellidos} ya está habilitado para conducir este carro`
      })
    }

    const conductor = await prisma.conductorHabilitado.create({
      data: {
        ...value,
        carroId: parseInt(id),
        fechaDesde: value.fechaDesde || new Date()
      },
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
    })

    // Registrar en historial del carro
    await prisma.historialCarro.create({
      data: {
        carroId: parseInt(id),
        tipo: 'ACTUALIZACION',
        descripcion: `${bombero.nombres} ${bombero.apellidos} habilitado como conductor`,
        cambios: { conductor: value },
        usuarioId: req.user.id
      }
    })

    res.status(201).json({
      success: true,
      message: 'Conductor habilitado exitosamente',
      data: conductor
    })
  } catch (error) {
    console.error('Error al habilitar conductor:', error)
    res.status(500).json({
      success: false,
      message: 'Error al habilitar conductor',
      error: error.message
    })
  }
})

// DELETE /api/carros/:carroId/conductores/:bomberoId - Eliminar conductor habilitado
router.delete('/:carroId/conductores/:bomberoId', authenticateToken, async (req, res) => {
  try {
    const { carroId, bomberoId } = req.params

    const conductor = await prisma.conductorHabilitado.findFirst({
      where: {
        carroId: parseInt(carroId),
        bomberoId: parseInt(bomberoId),
        activo: true
      },
      include: {
        bombero: true,
        carro: true
      }
    })

    if (!conductor) {
      return res.status(404).json({
        success: false,
        message: 'Conductor habilitado no encontrado'
      })
    }

    // Soft delete
    await prisma.conductorHabilitado.update({
      where: { id: conductor.id },
      data: {
        activo: false,
        fechaHasta: new Date()
      }
    })

    // Registrar en historial
    await prisma.historialCarro.create({
      data: {
        carroId: parseInt(carroId),
        tipo: 'ACTUALIZACION',
        descripcion: `${conductor.bombero.nombres} ${conductor.bombero.apellidos} removido como conductor habilitado`,
        usuarioId: req.user.id
      }
    })

    res.json({
      success: true,
      message: 'Conductor removido exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar conductor:', error)
    res.status(500).json({
      success: false,
      message: 'Error al eliminar conductor',
      error: error.message
    })
  }
})

// ============================================
// ENDPOINTS - MANTENCIONES
// ============================================

// GET /api/carros/:id/mantenciones - Obtener mantenciones de un carro
router.get('/:id/mantenciones', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { tipo, limit = 20 } = req.query

    const where = { carroId: parseInt(id) }
    if (tipo) {
      where.tipo = tipo
    }

    const mantenciones = await prisma.mantencionCarro.findMany({
      where,
      orderBy: { fechaRealizada: 'desc' },
      take: parseInt(limit)
    })

    res.json({
      success: true,
      data: mantenciones
    })
  } catch (error) {
    console.error('Error al obtener mantenciones:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener mantenciones',
      error: error.message
    })
  }
})

// POST /api/carros/:id/mantenciones - Registrar nueva mantención
router.post('/:id/mantenciones', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { error, value } = mantencionSchema.validate(req.body, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        details: error.details.map(d => d.message)
      })
    }

    // Verificar que el carro existe
    const carro = await prisma.carro.findUnique({
      where: { id: parseInt(id) }
    })

    if (!carro) {
      return res.status(404).json({
        success: false,
        message: 'Carro no encontrado'
      })
    }

    const mantencion = await prisma.mantencionCarro.create({
      data: {
        ...value,
        carroId: parseInt(id)
      }
    })

    // Actualizar fecha de próxima mantención en el carro si corresponde
    if (value.tipo === 'Mecánica' && value.proximaFecha) {
      await prisma.carro.update({
        where: { id: parseInt(id) },
        data: { fechaProximaMantencion: value.proximaFecha }
      })
    } else if (value.tipo === 'Revisión Técnica' && value.proximaFecha) {
      await prisma.carro.update({
        where: { id: parseInt(id) },
        data: { fechaRevisionTecnica: value.proximaFecha }
      })
    } else if (value.tipo === 'Permiso Circulación' && value.proximaFecha) {
      await prisma.carro.update({
        where: { id: parseInt(id) },
        data: { fechaPermisoCirculacion: value.proximaFecha }
      })
    }

    // Registrar en historial del carro
    await prisma.historialCarro.create({
      data: {
        carroId: parseInt(id),
        tipo: 'MANTENCION',
        descripcion: `Mantención ${value.tipo}: ${value.descripcion}`,
        cambios: { mantencion: value },
        usuarioId: req.user.id
      }
    })

    res.status(201).json({
      success: true,
      message: 'Mantención registrada exitosamente',
      data: mantencion
    })
  } catch (error) {
    console.error('Error al registrar mantención:', error)
    res.status(500).json({
      success: false,
      message: 'Error al registrar mantención',
      error: error.message
    })
  }
})

// GET /api/carros/:id/historial - Obtener historial completo del carro
router.get('/:id/historial', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { limit = 50, tipo } = req.query

    const where = { carroId: parseInt(id) }
    if (tipo) {
      where.tipo = tipo
    }

    const historial = await prisma.historialCarro.findMany({
      where,
      include: {
        usuario: {
          select: { nombre: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    })

    res.json({
      success: true,
      data: historial
    })
  } catch (error) {
    console.error('Error al obtener historial:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message
    })
  }
})

// ============================================
// ENDPOINTS - ASIGNACIÓN DE MATERIAL A CARROS
// ============================================

// GET /api/carros/:id/material - Obtener material asignado al carro
router.get('/:id/material', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { cajoneraId, tipo } = req.query

    const where = {
      carroId: parseInt(id),
      activo: true
    }

    // Filtro opcional por cajonera
    if (cajoneraId) {
      if (cajoneraId === 'null' || cajoneraId === 'sin-cajonera') {
        where.cajoneraId = null // Material sin cajonera específica
      } else {
        where.cajoneraId = parseInt(cajoneraId)
      }
    }

    // Filtro opcional por tipo de material
    if (tipo) {
      where.material = {
        tipo: tipo
      }
    }

    const materialesAsignados = await prisma.asignacionMaterial.findMany({
      where,
      include: {
        material: {
          include: {
            categoria: true
          }
        },
        cajonera: true
      },
      orderBy: { fechaAsignacion: 'desc' }
    })

    res.json({
      success: true,
      data: materialesAsignados
    })
  } catch (error) {
    console.error('Error al obtener material:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener material del carro',
      error: error.message
    })
  }
})

// POST /api/carros/:id/asignar-material - Asignar material a un carro
router.post('/:id/asignar-material', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { error, value } = asignacionMaterialSchema.validate(req.body, { abortEarly: false })

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        details: error.details.map(d => d.message)
      })
    }

    // Verificar que el carro existe
    const carro = await prisma.carro.findUnique({
      where: { id: parseInt(id) }
    })

    if (!carro) {
      return res.status(404).json({
        success: false,
        message: 'Carro no encontrado'
      })
    }

    // Verificar que el material existe y obtener su tipo
    const material = await prisma.material.findUnique({
      where: { id: value.materialId },
      include: { categoria: true }
    })

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material no encontrado'
      })
    }

    if (!material.activo) {
      return res.status(400).json({
        success: false,
        message: 'El material no está activo'
      })
    }

    // Verificar disponibilidad según el tipo de material
    if (material.tipo === 'INDIVIDUAL') {
      // Para material individual, verificar que no esté asignado
      const yaAsignado = await prisma.asignacionMaterial.findFirst({
        where: {
          materialId: value.materialId,
          activo: true
        }
      })

      if (yaAsignado) {
        return res.status(400).json({
          success: false,
          message: `El material "${material.nombre}" ya está asignado y no puede asignarse a múltiples destinos`
        })
      }
    } else if (material.tipo === 'CANTIDAD') {
      // Para material de cantidad, verificar que la cantidad solicitada no exceda el stock disponible
      if (!value.cantidadAsignada || value.cantidadAsignada <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar la cantidad a asignar para material tipo CANTIDAD'
        })
      }

      // Calcular stock disponible
      const asignacionesActivas = await prisma.asignacionMaterial.findMany({
        where: {
          materialId: value.materialId,
          activo: true
        }
      })

      const totalAsignado = asignacionesActivas.reduce((sum, a) => sum + (a.cantidadAsignada || 0), 0)
      const disponible = material.stockActual - totalAsignado

      if (value.cantidadAsignada > disponible) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Disponible: ${disponible}, solicitado: ${value.cantidadAsignada}`
        })
      }
    }

    // Si se especifica cajonera, verificar que existe y pertenece al carro
    if (value.cajoneraId) {
      const cajonera = await prisma.cajonera.findUnique({
        where: { id: value.cajoneraId }
      })

      if (!cajonera) {
        return res.status(404).json({
          success: false,
          message: 'Cajonera no encontrada'
        })
      }

      if (cajonera.carroId !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'La cajonera no pertenece a este carro'
        })
      }

      if (!cajonera.activo) {
        return res.status(400).json({
          success: false,
          message: 'La cajonera no está activa'
        })
      }
    }

    // Crear asignación
    const asignacion = await prisma.asignacionMaterial.create({
      data: {
        materialId: value.materialId,
        carroId: parseInt(id),
        cajoneraId: value.cajoneraId || null,
        cantidadAsignada: material.tipo === 'CANTIDAD' ? value.cantidadAsignada : null,
        motivo: value.motivo || `Asignado a ${carro.nombre}`,
        observaciones: value.observaciones,
        fechaAsignacion: new Date(),
        activo: true
      },
      include: {
        material: true,
        cajonera: true
      }
    })

    // Registrar en historial del carro
    const ubicacion = value.cajoneraId 
      ? `en cajonera ${asignacion.cajonera.nombre}` 
      : 'sin cajonera específica'
    
    const cantidad = material.tipo === 'CANTIDAD' 
      ? ` (${value.cantidadAsignada} unidades)` 
      : ''

    await prisma.historialCarro.create({
      data: {
        carroId: parseInt(id),
        tipo: 'ASIGNACION_MATERIAL',
        descripcion: `Material "${material.nombre}" asignado ${ubicacion}${cantidad}`,
        cambios: { asignacion: value },
        usuarioId: req.user.id
      }
    })

    res.status(201).json({
      success: true,
      message: 'Material asignado exitosamente al carro',
      data: asignacion
    })
  } catch (error) {
    console.error('Error al asignar material:', error)
    res.status(500).json({
      success: false,
      message: 'Error al asignar material',
      error: error.message
    })
  }
})

// PUT /api/carros/asignaciones/:id/cambiar-cajonera - Cambiar material de cajonera
router.put('/asignaciones/:id/cambiar-cajonera', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { cajoneraId } = req.body

    const asignacion = await prisma.asignacionMaterial.findUnique({
      where: { id: parseInt(id) },
      include: {
        material: true,
        carro: true,
        cajonera: true
      }
    })

    if (!asignacion) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada'
      })
    }

    if (!asignacion.carroId) {
      return res.status(400).json({
        success: false,
        message: 'Esta asignación no pertenece a un carro'
      })
    }

    // Si se especifica nueva cajonera, verificar que existe y pertenece al mismo carro
    if (cajoneraId) {
      const nuevaCajonera = await prisma.cajonera.findUnique({
        where: { id: parseInt(cajoneraId) }
      })

      if (!nuevaCajonera) {
        return res.status(404).json({
          success: false,
          message: 'Cajonera de destino no encontrada'
        })
      }

      if (nuevaCajonera.carroId !== asignacion.carroId) {
        return res.status(400).json({
          success: false,
          message: 'La cajonera no pertenece al mismo carro'
        })
      }
    }

    const cajoneraAnteriorNombre = asignacion.cajonera?.nombre || 'Sin cajonera'
    const cajoneraNuevaNombre = cajoneraId 
      ? (await prisma.cajonera.findUnique({ where: { id: parseInt(cajoneraId) } })).nombre 
      : 'Sin cajonera'

    // Actualizar asignación
    const asignacionActualizada = await prisma.asignacionMaterial.update({
      where: { id: parseInt(id) },
      data: {
        cajoneraId: cajoneraId ? parseInt(cajoneraId) : null
      },
      include: {
        material: true,
        cajonera: true,
        carro: true
      }
    })

    // Registrar en historial del carro
    await prisma.historialCarro.create({
      data: {
        carroId: asignacion.carroId,
        tipo: 'ACTUALIZACION',
        descripcion: `Material "${asignacion.material.nombre}" movido de "${cajoneraAnteriorNombre}" a "${cajoneraNuevaNombre}"`,
        cambios: {
          materialId: asignacion.materialId,
          cajoneraAnterior: cajoneraAnteriorNombre,
          cajoneraNueva: cajoneraNuevaNombre
        },
        usuarioId: req.user.id
      }
    })

    res.json({
      success: true,
      message: 'Material reubicado exitosamente',
      data: asignacionActualizada
    })
  } catch (error) {
    console.error('Error al cambiar cajonera:', error)
    res.status(500).json({
      success: false,
      message: 'Error al cambiar cajonera',
      error: error.message
    })
  }
})

// DELETE /api/carros/asignaciones/:id - Desasignar material de un carro
router.delete('/asignaciones/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const asignacion = await prisma.asignacionMaterial.findUnique({
      where: { id: parseInt(id) },
      include: {
        material: true,
        carro: true,
        cajonera: true
      }
    })

    if (!asignacion) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada'
      })
    }

    if (!asignacion.carroId) {
      return res.status(400).json({
        success: false,
        message: 'Esta asignación no pertenece a un carro'
      })
    }

    // Desactivar asignación y registrar fecha de devolución
    await prisma.asignacionMaterial.update({
      where: { id: parseInt(id) },
      data: {
        activo: false,
        fechaDevolucion: new Date()
      }
    })

    // Registrar en historial del carro
    const ubicacion = asignacion.cajonera 
      ? `de cajonera "${asignacion.cajonera.nombre}"` 
      : ''
    
    const cantidad = asignacion.cantidadAsignada 
      ? ` (${asignacion.cantidadAsignada} unidades)` 
      : ''

    await prisma.historialCarro.create({
      data: {
        carroId: asignacion.carroId,
        tipo: 'ASIGNACION_MATERIAL',
        descripcion: `Material "${asignacion.material.nombre}" desasignado ${ubicacion}${cantidad}`,
        usuarioId: req.user.id
      }
    })

    res.json({
      success: true,
      message: 'Material desasignado exitosamente'
    })
  } catch (error) {
    console.error('Error al desasignar material:', error)
    res.status(500).json({
      success: false,
      message: 'Error al desasignar material',
      error: error.message
    })
  }
})

export default router
