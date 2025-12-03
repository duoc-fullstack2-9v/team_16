import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Esquemas de validación Joi
const materialSchema = Joi.object({
  nombre: Joi.string().min(2).max(200).required(),
  descripcion: Joi.string().max(1000).allow('', null),
  fotoUrl: Joi.string().max(500).allow('', null),
  categoriaId: Joi.number().integer().allow(null),
  estado: Joi.string().valid('Disponible', 'En Uso', 'Mantenimiento', 'Baja').required(),
  tipo: Joi.string().valid('individual', 'cantidad').required(),
  numeroSerie: Joi.string().max(100).when('tipo', {
    is: 'individual',
    then: Joi.required(),
    otherwise: Joi.allow('', null)
  }),
  cantidad: Joi.number().integer().min(0).when('tipo', {
    is: 'cantidad',
    then: Joi.required(),
    otherwise: Joi.allow(null)
  }),
  unidadMedida: Joi.string().max(50).when('tipo', {
    is: 'cantidad',
    then: Joi.required(),
    otherwise: Joi.allow('', null)
  }),
  fechaAdquisicion: Joi.date().allow(null),
  ubicacionFisica: Joi.string().max(200).allow('', null),
  fechaVencimiento: Joi.date().allow(null),
  fechaMantencion: Joi.date().allow(null),
  observaciones: Joi.string().max(1000).allow('', null),
  activo: Joi.boolean()
})

const materialUpdateSchema = materialSchema.fork([
  'nombre', 'estado', 'tipo'
], (schema) => schema.optional())

const asignacionSchema = Joi.object({
  materialId: Joi.number().integer().required(),
  bomberoId: Joi.number().integer().allow(null),
  carroId: Joi.number().integer().allow(null),
  motivo: Joi.string().max(500).allow('', null),
  observaciones: Joi.string().max(1000).allow('', null),
  cantidadAsignada: Joi.number().integer().min(1).allow(null)
}).or('bomberoId', 'carroId') // Al menos uno debe estar presente

// ==================== GET ALL MATERIAL ====================
// GET /api/material - Obtener todo el material con filtros y paginación
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      categoriaId,
      estado,
      tipo,
      ubicacion,
      sortBy = 'nombre',
      sortOrder = 'asc',
      conAlerta = 'false'
    } = req.query

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const take = parseInt(limit)

    // Construir filtros
    const where = {
      activo: true,
      AND: []
    }

    if (search) {
      where.AND.push({
        OR: [
          { nombre: { contains: search, mode: 'insensitive' } },
          { descripcion: { contains: search, mode: 'insensitive' } },
          { numeroSerie: { contains: search, mode: 'insensitive' } },
          { ubicacionFisica: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    if (categoriaId) {
      where.AND.push({ categoriaId: parseInt(categoriaId) })
    }

    if (estado) {
      where.AND.push({ estado })
    }

    if (tipo) {
      where.AND.push({ tipo })
    }

    if (ubicacion) {
      where.AND.push({ 
        ubicacionFisica: { contains: ubicacion, mode: 'insensitive' } 
      })
    }

    if (where.AND.length === 0) {
      delete where.AND
    }

    // Obtener material
    const material = await prisma.material.findMany({
      where,
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            icono: true
          }
        },
        asignaciones: {
          where: { activo: true },
          include: {
            bombero: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                rango: true
              }
            }
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take
    })

    // Si se solicita solo material con alertas
    let materialFiltrado = material
    if (conAlerta === 'true') {
      const ahora = new Date()
      const treintaDias = new Date()
      treintaDias.setDate(treintaDias.getDate() + 30)

      materialFiltrado = material.filter(m => {
        // Alerta: múltiples asignaciones activas
        const multipleAsignaciones = m.asignaciones.length > 1
        
        // Alerta: próximo a vencer (30 días)
        const proximoVencer = m.fechaVencimiento && 
          new Date(m.fechaVencimiento) <= treintaDias &&
          new Date(m.fechaVencimiento) >= ahora
        
        // Alerta: próximo a mantención (30 días)
        const proximoMantencion = m.fechaMantencion && 
          new Date(m.fechaMantencion) <= treintaDias &&
          new Date(m.fechaMantencion) >= ahora

        return multipleAsignaciones || proximoVencer || proximoMantencion
      })
    }

    // Contar total
    const total = await prisma.material.count({ where })

    res.json({
      material: materialFiltrado,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error al obtener material:', error)
    res.status(500).json({ 
      error: 'Error al obtener material',
      details: error.message 
    })
  }
})

// ==================== GET ESTADÍSTICAS ====================
// GET /api/material/estadisticas - Obtener estadísticas del material
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    // Total de material
    const totalMaterial = await prisma.material.count({ where: { activo: true } })

    // Por estado
    const porEstado = await prisma.material.groupBy({
      by: ['estado'],
      where: { activo: true },
      _count: true
    })

    // Por tipo
    const porTipo = await prisma.material.groupBy({
      by: ['tipo'],
      where: { activo: true },
      _count: true
    })

    // Material asignado vs disponible
    const materialConAsignacion = await prisma.material.findMany({
      where: {
        activo: true,
        asignaciones: {
          some: { activo: true }
        }
      }
    })

    const totalAsignado = materialConAsignacion.length
    const totalDisponible = totalMaterial - totalAsignado

    // Por categoría
    const porCategoria = await prisma.material.groupBy({
      by: ['categoriaId'],
      where: { activo: true },
      _count: true
    })

    // Obtener nombres de categorías
    const categoriasConMaterial = await Promise.all(
      porCategoria
        .filter(c => c.categoriaId)
        .map(async (c) => {
          const cat = await prisma.categoria.findUnique({
            where: { id: c.categoriaId },
            select: { nombre: true }
          })
          return {
            categoriaId: c.categoriaId,
            categoria: cat?.nombre || 'Sin categoría',
            cantidad: c._count
          }
        })
    )

    // Material sin categoría
    const sinCategoria = porCategoria.find(c => c.categoriaId === null)?._count || 0

    res.json({
      totalMaterial,
      totalAsignado,
      totalDisponible,
      porEstado: porEstado.map(e => ({
        estado: e.estado,
        cantidad: e._count
      })),
      porTipo: porTipo.map(t => ({
        tipo: t.tipo,
        cantidad: t._count
      })),
      porCategoria: [
        ...categoriasConMaterial,
        ...(sinCategoria > 0 ? [{ categoriaId: null, categoria: 'Sin categoría', cantidad: sinCategoria }] : [])
      ]
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: error.message 
    })
  }
})

// ==================== GET ALERTAS ====================
// GET /api/material/alertas - Obtener material con alertas
router.get('/alertas', authenticateToken, async (req, res) => {
  try {
    const ahora = new Date()
    const treintaDias = new Date()
    treintaDias.setDate(treintaDias.getDate() + 30)

    // Obtener todo el material activo
    const material = await prisma.material.findMany({
      where: { activo: true },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        },
        asignaciones: {
          where: { activo: true },
          include: {
            bombero: {
              select: {
                id: true,
                nombres: true,
                apellidos: true
              }
            }
          }
        }
      }
    })

    const alertas = {
      multipleAsignaciones: [],
      proximoVencer: [],
      proximoMantencion: [],
      vencido: [],
      mantencionAtrasada: []
    }

    material.forEach(m => {
      // Alerta: múltiples asignaciones activas
      if (m.asignaciones.length > 1) {
        alertas.multipleAsignaciones.push({
          ...m,
          tipoAlerta: 'multiple_asignaciones',
          mensaje: `Material asignado a ${m.asignaciones.length} personas/carros simultáneamente`,
          prioridad: 'alta'
        })
      }

      // Alerta: vencido
      if (m.fechaVencimiento && new Date(m.fechaVencimiento) < ahora) {
        alertas.vencido.push({
          ...m,
          tipoAlerta: 'vencido',
          mensaje: 'Material vencido',
          prioridad: 'critica'
        })
      }
      // Alerta: próximo a vencer (30 días)
      else if (m.fechaVencimiento && new Date(m.fechaVencimiento) <= treintaDias) {
        const diasRestantes = Math.ceil(
          (new Date(m.fechaVencimiento) - ahora) / (1000 * 60 * 60 * 24)
        )
        alertas.proximoVencer.push({
          ...m,
          tipoAlerta: 'proximo_vencer',
          mensaje: `Vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`,
          prioridad: diasRestantes <= 7 ? 'alta' : 'media',
          diasRestantes
        })
      }

      // Alerta: mantención atrasada
      if (m.fechaMantencion && new Date(m.fechaMantencion) < ahora) {
        alertas.mantencionAtrasada.push({
          ...m,
          tipoAlerta: 'mantencion_atrasada',
          mensaje: 'Mantención atrasada',
          prioridad: 'alta'
        })
      }
      // Alerta: próximo a mantención (30 días)
      else if (m.fechaMantencion && new Date(m.fechaMantencion) <= treintaDias) {
        const diasRestantes = Math.ceil(
          (new Date(m.fechaMantencion) - ahora) / (1000 * 60 * 60 * 24)
        )
        alertas.proximoMantencion.push({
          ...m,
          tipoAlerta: 'proximo_mantencion',
          mensaje: `Mantención programada en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`,
          prioridad: diasRestantes <= 7 ? 'media' : 'baja',
          diasRestantes
        })
      }
    })

    // Contar totales
    const totales = {
      multipleAsignaciones: alertas.multipleAsignaciones.length,
      proximoVencer: alertas.proximoVencer.length,
      proximoMantencion: alertas.proximoMantencion.length,
      vencido: alertas.vencido.length,
      mantencionAtrasada: alertas.mantencionAtrasada.length
    }

    const totalAlertas = Object.values(totales).reduce((a, b) => a + b, 0)

    res.json({
      totales,
      totalAlertas,
      alertas
    })
  } catch (error) {
    console.error('Error al obtener alertas:', error)
    res.status(500).json({ 
      error: 'Error al obtener alertas',
      details: error.message 
    })
  }
})

// ==================== GET BY ID ====================
// GET /api/material/:id - Obtener un material por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const material = await prisma.material.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
        asignaciones: {
          include: {
            bombero: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                rango: true,
                telefono: true,
                email: true
              }
            }
          },
          orderBy: { fechaAsignacion: 'desc' }
        }
      }
    })

    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' })
    }

    res.json(material)
  } catch (error) {
    console.error('Error al obtener material:', error)
    res.status(500).json({ 
      error: 'Error al obtener material',
      details: error.message 
    })
  }
})

// ==================== CREATE ====================
// POST /api/material - Crear nuevo material
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validar datos
    const { error, value } = materialSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: error.details[0].message 
      })
    }

    // Si es tipo individual y tiene número de serie, verificar que no exista
    if (value.tipo === 'individual' && value.numeroSerie) {
      const existente = await prisma.material.findFirst({
        where: {
          numeroSerie: value.numeroSerie,
          activo: true
        }
      })

      if (existente) {
        return res.status(400).json({ 
          error: 'Ya existe material con ese número de serie' 
        })
      }
    }

    // Si tiene categoría, verificar que exista
    if (value.categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: value.categoriaId }
      })

      if (!categoria || !categoria.activo) {
        return res.status(400).json({ error: 'La categoría no existe o está inactiva' })
      }
    }

    // Crear material
    const material = await prisma.material.create({
      data: value,
      include: {
        categoria: true
      }
    })

    res.status(201).json(material)
  } catch (error) {
    console.error('Error al crear material:', error)
    res.status(500).json({ 
      error: 'Error al crear material',
      details: error.message 
    })
  }
})

// ==================== UPDATE ====================
// PUT /api/material/:id - Actualizar material
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Validar datos
    const { error, value } = materialUpdateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: error.details[0].message 
      })
    }

    // Verificar que existe
    const materialExistente = await prisma.material.findUnique({
      where: { id: parseInt(id) }
    })

    if (!materialExistente) {
      return res.status(404).json({ error: 'Material no encontrado' })
    }

    // Si cambia el número de serie, verificar que no exista otro
    if (value.numeroSerie && value.numeroSerie !== materialExistente.numeroSerie) {
      const numeroExiste = await prisma.material.findFirst({
        where: {
          numeroSerie: value.numeroSerie,
          activo: true,
          id: { not: parseInt(id) }
        }
      })

      if (numeroExiste) {
        return res.status(400).json({ 
          error: 'Ya existe material con ese número de serie' 
        })
      }
    }

    // Actualizar material
    const material = await prisma.material.update({
      where: { id: parseInt(id) },
      data: value,
      include: {
        categoria: true,
        asignaciones: {
          where: { activo: true },
          include: {
            bombero: {
              select: {
                id: true,
                nombres: true,
                apellidos: true
              }
            }
          }
        }
      }
    })

    res.json(material)
  } catch (error) {
    console.error('Error al actualizar material:', error)
    res.status(500).json({ 
      error: 'Error al actualizar material',
      details: error.message 
    })
  }
})

// ==================== DELETE ====================
// DELETE /api/material/:id - Desactivar material (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const material = await prisma.material.findUnique({
      where: { id: parseInt(id) },
      include: {
        asignaciones: { where: { activo: true } }
      }
    })

    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' })
    }

    // Verificar si tiene asignaciones activas
    if (material.asignaciones.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede desactivar material con asignaciones activas',
        asignaciones: material.asignaciones.length
      })
    }

    // Desactivar material
    const materialActualizado = await prisma.material.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    })

    res.json({ 
      message: 'Material desactivado exitosamente',
      material: materialActualizado 
    })
  } catch (error) {
    console.error('Error al desactivar material:', error)
    res.status(500).json({ 
      error: 'Error al desactivar material',
      details: error.message 
    })
  }
})

// ==================== ASIGNAR MATERIAL ====================
// POST /api/material/:id/asignar - Asignar material a bombero o carro
router.post('/:id/asignar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Validar datos
    const { error, value } = asignacionSchema.validate({
      ...req.body,
      materialId: parseInt(id)
    })
    
    if (error) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: error.details[0].message 
      })
    }

    // Verificar que el material existe
    const material = await prisma.material.findUnique({
      where: { id: parseInt(id) },
      include: {
        asignaciones: { where: { activo: true } }
      }
    })

    if (!material || !material.activo) {
      return res.status(404).json({ error: 'Material no encontrado o inactivo' })
    }

    // Si es tipo individual, verificar que no tenga asignación activa
    if (material.tipo === 'individual' && material.asignaciones.length > 0) {
      return res.status(400).json({ 
        error: 'Material individual ya tiene una asignación activa',
        asignacionActual: material.asignaciones[0]
      })
    }

    // Si es tipo cantidad, verificar disponibilidad
    if (material.tipo === 'cantidad') {
      if (!value.cantidadAsignada) {
        return res.status(400).json({ 
          error: 'Debe especificar la cantidad a asignar para material tipo cantidad' 
        })
      }

      // Calcular cantidad asignada actualmente
      const asignacionesActivas = await prisma.asignacionMaterial.findMany({
        where: {
          materialId: parseInt(id),
          activo: true
        }
      })

      const totalAsignado = asignacionesActivas.reduce(
        (sum, a) => sum + (a.cantidadAsignada || 0), 
        0
      )

      if (totalAsignado + value.cantidadAsignada > material.cantidad) {
        return res.status(400).json({ 
          error: 'Cantidad insuficiente disponible',
          disponible: material.cantidad - totalAsignado,
          solicitado: value.cantidadAsignada
        })
      }
    }

    // Verificar que el bombero existe (si se especifica)
    if (value.bomberoId) {
      const bombero = await prisma.bombero.findUnique({
        where: { id: value.bomberoId }
      })

      if (!bombero || !bombero.estado === 'Activo') {
        return res.status(400).json({ error: 'Bombero no encontrado o inactivo' })
      }
    }

    // Crear asignación
    const asignacion = await prisma.asignacionMaterial.create({
      data: {
        materialId: parseInt(id),
        bomberoId: value.bomberoId,
        carroId: value.carroId,
        motivo: value.motivo,
        observaciones: value.observaciones,
        cantidadAsignada: value.cantidadAsignada,
        activo: true
      },
      include: {
        material: {
          include: {
            categoria: true
          }
        },
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true
          }
        }
      }
    })

    // Actualizar estado del material si es necesario
    if (material.estado === 'Disponible') {
      await prisma.material.update({
        where: { id: parseInt(id) },
        data: { estado: 'En Uso' }
      })
    }

    res.status(201).json(asignacion)
  } catch (error) {
    console.error('Error al asignar material:', error)
    res.status(500).json({ 
      error: 'Error al asignar material',
      details: error.message 
    })
  }
})

// ==================== DEVOLVER MATERIAL ====================
// PUT /api/material/asignaciones/:asignacionId/devolver - Devolver material asignado
router.put('/asignaciones/:asignacionId/devolver', authenticateToken, async (req, res) => {
  try {
    const { asignacionId } = req.params
    const { observaciones } = req.body

    // Verificar que la asignación existe y está activa
    const asignacion = await prisma.asignacionMaterial.findUnique({
      where: { id: parseInt(asignacionId) },
      include: {
        material: {
          include: {
            asignaciones: { where: { activo: true } }
          }
        }
      }
    })

    if (!asignacion) {
      return res.status(404).json({ error: 'Asignación no encontrada' })
    }

    if (!asignacion.activo) {
      return res.status(400).json({ error: 'Esta asignación ya fue devuelta' })
    }

    // Actualizar asignación
    const asignacionActualizada = await prisma.asignacionMaterial.update({
      where: { id: parseInt(asignacionId) },
      data: {
        fechaDevolucion: new Date(),
        activo: false,
        observaciones: observaciones || asignacion.observaciones
      },
      include: {
        material: true,
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    })

    // Si no quedan más asignaciones activas, cambiar estado a Disponible
    const asignacionesRestantes = asignacion.material.asignaciones.filter(
      a => a.id !== parseInt(asignacionId)
    )

    if (asignacionesRestantes.length === 0) {
      await prisma.material.update({
        where: { id: asignacion.materialId },
        data: { estado: 'Disponible' }
      })
    }

    res.json(asignacionActualizada)
  } catch (error) {
    console.error('Error al devolver material:', error)
    res.status(500).json({ 
      error: 'Error al devolver material',
      details: error.message 
    })
  }
})

// ==================== GET HISTORIAL ====================
// GET /api/material/:id/historial - Obtener historial completo de asignaciones
router.get('/:id/historial', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const material = await prisma.material.findUnique({
      where: { id: parseInt(id) }
    })

    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' })
    }

    const historial = await prisma.asignacionMaterial.findMany({
      where: { materialId: parseInt(id) },
      include: {
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            rango: true
          }
        }
      },
      orderBy: { fechaAsignacion: 'desc' }
    })

    res.json({
      material: {
        id: material.id,
        nombre: material.nombre,
        tipo: material.tipo,
        numeroSerie: material.numeroSerie
      },
      historial,
      totalAsignaciones: historial.length,
      asignacionesActivas: historial.filter(a => a.activo).length
    })
  } catch (error) {
    console.error('Error al obtener historial:', error)
    res.status(500).json({ 
      error: 'Error al obtener historial',
      details: error.message 
    })
  }
})

export default router
