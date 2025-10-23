import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Esquemas de validación Joi
const categoriaSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  descripcion: Joi.string().max(500).allow('', null),
  icono: Joi.string().max(100).allow('', null),
  parentId: Joi.number().integer().allow(null),
  activo: Joi.boolean()
})

const categoriaUpdateSchema = Joi.object({
  nombre: Joi.string().min(2).max(100),
  descripcion: Joi.string().max(500).allow('', null),
  icono: Joi.string().max(100).allow('', null),
  parentId: Joi.number().integer().allow(null),
  activo: Joi.boolean()
})

// ==================== GET ALL CATEGORÍAS ====================
// GET /api/categorias - Obtener todas las categorías con estructura jerárquica
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { flat = 'false', includeInactive = 'false' } = req.query

    const where = includeInactive === 'true' ? {} : { activo: true }

    const categorias = await prisma.categoria.findMany({
      where,
      include: {
        parent: true,
        subcategorias: {
          where: includeInactive === 'true' ? {} : { activo: true },
          include: {
            subcategorias: {
              where: includeInactive === 'true' ? {} : { activo: true }
            }
          }
        },
        materiales: {
          where: { activo: true },
          select: {
            id: true,
            nombre: true,
            estado: true,
            tipo: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    })

    // Si flat=true, devolver lista plana; si no, estructurar en árbol
    if (flat === 'true') {
      return res.json(categorias)
    }

    // Construir estructura jerárquica (solo categorías raíz)
    const categoriasRaiz = categorias.filter(cat => !cat.parentId)
    
    res.json(categoriasRaiz)
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    res.status(500).json({ 
      error: 'Error al obtener categorías',
      details: error.message 
    })
  }
})

// ==================== GET ESTADÍSTICAS ====================
// GET /api/categorias/estadisticas - Obtener estadísticas de categorías
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const totalCategorias = await prisma.categoria.count({ where: { activo: true } })
    
    const categoriasConMaterial = await prisma.categoria.count({
      where: {
        activo: true,
        materiales: {
          some: { activo: true }
        }
      }
    })

    const categoriasSinMaterial = totalCategorias - categoriasConMaterial

    // Obtener categorías con más material
    const categoriasConConteo = await prisma.categoria.findMany({
      where: { activo: true },
      include: {
        materiales: {
          where: { activo: true }
        }
      }
    })

    const topCategorias = categoriasConConteo
      .map(cat => ({
        id: cat.id,
        nombre: cat.nombre,
        cantidadMaterial: cat.materiales.length
      }))
      .sort((a, b) => b.cantidadMaterial - a.cantidadMaterial)
      .slice(0, 5)

    res.json({
      totalCategorias,
      categoriasConMaterial,
      categoriasSinMaterial,
      topCategorias
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: error.message 
    })
  }
})

// ==================== GET BY ID ====================
// GET /api/categorias/:id - Obtener una categoría por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        parent: true,
        subcategorias: {
          include: {
            materiales: {
              where: { activo: true }
            }
          }
        },
        materiales: {
          where: { activo: true },
          include: {
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
        }
      }
    })

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    res.json(categoria)
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    res.status(500).json({ 
      error: 'Error al obtener categoría',
      details: error.message 
    })
  }
})

// ==================== CREATE ====================
// POST /api/categorias - Crear nueva categoría
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validar datos
    const { error, value } = categoriaSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: error.details[0].message 
      })
    }

    // Verificar si el nombre ya existe
    const existente = await prisma.categoria.findUnique({
      where: { nombre: value.nombre }
    })

    if (existente) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' })
    }

    // Si tiene parent, verificar que exista
    if (value.parentId) {
      const parent = await prisma.categoria.findUnique({
        where: { id: value.parentId }
      })

      if (!parent) {
        return res.status(400).json({ error: 'La categoría padre no existe' })
      }
    }

    // Crear categoría
    const categoria = await prisma.categoria.create({
      data: value,
      include: {
        parent: true,
        subcategorias: true
      }
    })

    res.status(201).json(categoria)
  } catch (error) {
    console.error('Error al crear categoría:', error)
    res.status(500).json({ 
      error: 'Error al crear categoría',
      details: error.message 
    })
  }
})

// ==================== UPDATE ====================
// PUT /api/categorias/:id - Actualizar categoría
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Validar datos
    const { error, value } = categoriaUpdateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: error.details[0].message 
      })
    }

    // Verificar que existe
    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id: parseInt(id) }
    })

    if (!categoriaExistente) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    // Si cambia el nombre, verificar que no exista otro con ese nombre
    if (value.nombre && value.nombre !== categoriaExistente.nombre) {
      const nombreExiste = await prisma.categoria.findUnique({
        where: { nombre: value.nombre }
      })

      if (nombreExiste) {
        return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' })
      }
    }

    // Si cambia el parent, verificar que no se cree un ciclo
    if (value.parentId !== undefined) {
      if (value.parentId === parseInt(id)) {
        return res.status(400).json({ error: 'Una categoría no puede ser su propia padre' })
      }

      // Verificar que el nuevo parent no sea un descendiente de esta categoría
      if (value.parentId) {
        let currentParent = await prisma.categoria.findUnique({
          where: { id: value.parentId }
        })

        while (currentParent && currentParent.parentId) {
          if (currentParent.parentId === parseInt(id)) {
            return res.status(400).json({ 
              error: 'No se puede crear una jerarquía circular' 
            })
          }
          currentParent = await prisma.categoria.findUnique({
            where: { id: currentParent.parentId }
          })
        }
      }
    }

    // Actualizar categoría
    const categoria = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: value,
      include: {
        parent: true,
        subcategorias: true,
        materiales: {
          where: { activo: true }
        }
      }
    })

    res.json(categoria)
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    res.status(500).json({ 
      error: 'Error al actualizar categoría',
      details: error.message 
    })
  }
})

// ==================== SOFT DELETE ====================
// DELETE /api/categorias/:id - Desactivar categoría (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        subcategorias: { where: { activo: true } },
        materiales: { where: { activo: true } }
      }
    })

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    // Verificar si tiene subcategorías activas
    if (categoria.subcategorias.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede desactivar una categoría con subcategorías activas',
        subcategorias: categoria.subcategorias.length
      })
    }

    // Verificar si tiene material activo
    if (categoria.materiales.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede desactivar una categoría con material activo',
        material: categoria.materiales.length
      })
    }

    // Desactivar categoría
    const categoriaActualizada = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { activo: false }
    })

    res.json({ 
      message: 'Categoría desactivada exitosamente',
      categoria: categoriaActualizada 
    })
  } catch (error) {
    console.error('Error al desactivar categoría:', error)
    res.status(500).json({ 
      error: 'Error al desactivar categoría',
      details: error.message 
    })
  }
})

// ==================== REACTIVAR ====================
// POST /api/categorias/:id/reactivar - Reactivar categoría
router.post('/:id/reactivar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) }
    })

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' })
    }

    // Reactivar categoría
    const categoriaActualizada = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { activo: true },
      include: {
        parent: true,
        subcategorias: true
      }
    })

    res.json({ 
      message: 'Categoría reactivada exitosamente',
      categoria: categoriaActualizada 
    })
  } catch (error) {
    console.error('Error al reactivar categoría:', error)
    res.status(500).json({ 
      error: 'Error al reactivar categoría',
      details: error.message 
    })
  }
})

export default router
