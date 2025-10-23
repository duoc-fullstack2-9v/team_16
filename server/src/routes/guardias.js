import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import PDFDocument from 'pdfkit'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

const mensualSchema = Joi.object({
  mes: Joi.number().integer().min(1).max(12).required(),
  anio: Joi.number().integer().min(2000).max(2100).required(),
  minimoBomberos: Joi.number().integer().min(1).default(4),
  notas: Joi.string().allow('', null).optional()
})

const mensualUpdateSchema = Joi.object({
  minimoBomberos: Joi.number().integer().min(1).optional(),
  notas: Joi.string().allow('', null).optional()
}).min(1)

const diaSchema = Joi.object({
  fecha: Joi.date().iso().required(),
  notas: Joi.string().allow('', null).optional(),
  bomberoIds: Joi.array().items(Joi.number().integer().positive()).default([])
})

const plantillaSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).required(),
  descripcion: Joi.string().allow('', null).optional(),
  tipo: Joi.string().valid('por_fecha', 'por_dia_semana').required(),
  dias: Joi.array().items(
    Joi.object({
      diaNumero: Joi.number().integer().min(1).max(31).when('$tipo', { is: 'por_fecha', then: Joi.required(), otherwise: Joi.forbidden() }),
      diaSemana: Joi.number().integer().min(0).max(6).when('$tipo', { is: 'por_dia_semana', then: Joi.required(), otherwise: Joi.forbidden() }),
      notas: Joi.string().allow('', null).optional(),
      bomberoIds: Joi.array().items(Joi.number().integer().positive()).default([])
    })
  ).default([])
})

const plantillaUpdateSchema = Joi.object({
  nombre: Joi.string().trim().min(1).max(100).optional(),
  descripcion: Joi.string().allow('', null).optional()
}).min(1)

const formatGuardiaMensual = (guardia) => ({
  id: guardia.id,
  mes: guardia.mes,
  anio: guardia.anio,
  minimoBomberos: guardia.minimoBomberos,
  notas: guardia.notas,
  createdAt: guardia.createdAt,
  updatedAt: guardia.updatedAt,
  dias: guardia.dias.map((dia) => ({
    id: dia.id,
    fecha: dia.fecha,
    notas: dia.notas,
    bomberos: dia.bomberos.map((asignacion) => ({
      id: asignacion.id,
      comentario: asignacion.comentario,
      createdAt: asignacion.createdAt,
      asignadoPor: asignacion.asignadoPor
        ? { id: asignacion.asignadoPor.id, nombre: asignacion.asignadoPor.nombre }
        : null,
      bombero: {
        id: asignacion.bombero.id,
        nombres: asignacion.bombero.nombres,
        apellidos: asignacion.bombero.apellidos,
        rango: asignacion.bombero.rango
      }
    }))
  }))
})

router.get('/mensuales', authenticateToken, async (req, res) => {
  try {
    const { anio, mes } = req.query

    const filters = {}
    if (anio) filters.anio = parseInt(anio, 10)
    if (mes) filters.mes = parseInt(mes, 10)

    const guardias = await prisma.guardiaMensual.findMany({
      where: filters,
      orderBy: [
        { anio: 'desc' },
        { mes: 'desc' }
      ],
      include: {
        dias: {
          orderBy: { fecha: 'asc' },
          include: {
            bomberos: {
              include: {
                bombero: {
                  select: { id: true, nombres: true, apellidos: true, rango: true }
                },
                asignadoPor: {
                  select: { id: true, nombre: true }
                }
              }
            }
          }
        }
      }
    })

    res.json({
      success: true,
      data: guardias.map(formatGuardiaMensual)
    })
  } catch (error) {
    console.error('Error al listar guardias mensuales:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

router.get('/mensuales/:id', authenticateToken, async (req, res) => {
  try {
    const guardiaId = parseInt(req.params.id, 10)
    if (Number.isNaN(guardiaId)) {
      return res.status(400).json({ success: false, message: 'ID de guardia inválido' })
    }

    const guardia = await prisma.guardiaMensual.findUnique({
      where: { id: guardiaId },
      include: {
        dias: {
          orderBy: { fecha: 'asc' },
          include: {
            bomberos: {
              include: {
                bombero: {
                  select: { id: true, nombres: true, apellidos: true, rango: true }
                },
                asignadoPor: {
                  select: { id: true, nombre: true }
                }
              }
            }
          }
        }
      }
    })

    if (!guardia) {
      return res.status(404).json({ success: false, message: 'Guardia mensual no encontrada' })
    }

    res.json({ success: true, data: formatGuardiaMensual(guardia) })
  } catch (error) {
    console.error('Error al obtener guardia mensual:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

router.post('/mensuales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { value, error } = mensualSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    const guardia = await prisma.guardiaMensual.create({
      data: {
        mes: value.mes,
        anio: value.anio,
        minimoBomberos: value.minimoBomberos ?? 4,
        notas: value.notas || null,
        creadoPorId: req.user.id
      }
    })

    res.status(201).json({ success: true, data: guardia })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una guardia configurada para ese mes y año'
      })
    }

    console.error('Error al crear guardia mensual:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

router.put('/mensuales/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const guardiaId = parseInt(req.params.id, 10)
    if (Number.isNaN(guardiaId)) {
      return res.status(400).json({ success: false, message: 'ID de guardia inválido' })
    }

    const { value, error } = mensualUpdateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    const guardia = await prisma.guardiaMensual.update({
      where: { id: guardiaId },
      data: {
        ...value,
        notas: Object.prototype.hasOwnProperty.call(value, 'notas') ? value.notas || null : undefined
      }
    })

    res.json({ success: true, data: guardia })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Guardia mensual no encontrada' })
    }

    console.error('Error al actualizar guardia mensual:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

router.delete('/mensuales/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const guardiaId = parseInt(req.params.id, 10)
    if (Number.isNaN(guardiaId)) {
      return res.status(400).json({ success: false, message: 'ID de guardia inválido' })
    }

    await prisma.guardiaMensual.delete({ where: { id: guardiaId } })
    res.json({ success: true, message: 'Guardia mensual eliminada correctamente' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Guardia mensual no encontrada' })
    }

    console.error('Error al eliminar guardia mensual:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

router.post('/mensuales/:id/dias', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const guardiaId = parseInt(req.params.id, 10)
    if (Number.isNaN(guardiaId)) {
      return res.status(400).json({ success: false, message: 'ID de guardia inválido' })
    }

    const { value, error } = diaSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    const guardia = await prisma.guardiaMensual.findUnique({ where: { id: guardiaId } })
    if (!guardia) {
      return res.status(404).json({ success: false, message: 'Guardia mensual no encontrada' })
    }

    const fecha = new Date(value.fecha)

    if (Number.isNaN(fecha.getTime())) {
      return res.status(400).json({ success: false, message: 'Fecha inválida' })
    }

    const guardiaDia = await prisma.guardiaDia.upsert({
      where: {
        guardiaMensualId_fecha: {
          guardiaMensualId: guardiaId,
          fecha
        }
      },
      update: {
        notas: value.notas || null
      },
      create: {
        guardiaMensualId: guardiaId,
        fecha,
        notas: value.notas || null
      }
    })

    const uniqueBomberoIds = Array.from(new Set((value.bomberoIds || []).map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id))))

    const existingAssignments = await prisma.guardiaDiaBombero.findMany({
      where: { guardiaDiaId: guardiaDia.id }
    })

    const existingIds = existingAssignments.map((a) => a.bomberoId)
    const toCreate = uniqueBomberoIds.filter((id) => !existingIds.includes(id))
    const toDelete = existingAssignments
      .filter((assignment) => !uniqueBomberoIds.includes(assignment.bomberoId))
      .map((assignment) => assignment.id)

    const operations = []

    if (toDelete.length) {
      operations.push(
        prisma.guardiaDiaBombero.deleteMany({ where: { id: { in: toDelete } } })
      )
    }

    if (toCreate.length) {
      for (const bomberoId of toCreate) {
        operations.push(
          prisma.guardiaDiaBombero.create({
            data: {
              guardiaDiaId: guardiaDia.id,
              bomberoId,
              asignadoPorId: req.user.id
            }
          })
        )
      }
    }

    if (operations.length) {
      await prisma.$transaction(operations)
    }

    const diaActualizado = await prisma.guardiaDia.findUnique({
      where: { id: guardiaDia.id },
      include: {
        bomberos: {
          include: {
            bombero: {
              select: { id: true, nombres: true, apellidos: true, rango: true }
            },
            asignadoPor: {
              select: { id: true, nombre: true }
            }
          }
        }
      }
    })

    res.json({
      success: true,
      data: {
        id: diaActualizado.id,
        fecha: diaActualizado.fecha,
        notas: diaActualizado.notas,
        bomberos: diaActualizado.bomberos.map((asignacion) => ({
          id: asignacion.id,
          comentario: asignacion.comentario,
          createdAt: asignacion.createdAt,
          asignadoPor: asignacion.asignadoPor
            ? { id: asignacion.asignadoPor.id, nombre: asignacion.asignadoPor.nombre }
            : null,
          bombero: {
            id: asignacion.bombero.id,
            nombres: asignacion.bombero.nombres,
            apellidos: asignacion.bombero.apellidos,
            rango: asignacion.bombero.rango
          }
        }))
      }
    })
  } catch (error) {
    console.error('Error al registrar guardia diaria:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

router.delete('/dias/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const diaId = parseInt(req.params.id, 10)
    if (Number.isNaN(diaId)) {
      return res.status(400).json({ success: false, message: 'ID de día inválido' })
    }

    await prisma.guardiaDia.delete({ where: { id: diaId } })
    res.json({ success: true, message: 'Guardia diaria eliminada correctamente' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Guardia diaria no encontrada' })
    }

    console.error('Error al eliminar guardia diaria:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

router.get('/bomberos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bomberos = await prisma.bombero.findMany({
      where: { estado: 'Activo' },
      orderBy: [{ apellidos: 'asc' }, { nombres: 'asc' }],
      select: { id: true, nombres: true, apellidos: true, rango: true }
    })

    res.json({ success: true, data: bomberos })
  } catch (error) {
    console.error('Error al listar bomberos para guardias:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

router.get('/mensuales/:id/export/pdf', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const guardiaId = parseInt(req.params.id, 10)
    if (Number.isNaN(guardiaId)) {
      return res.status(400).json({ success: false, message: 'ID de guardia inválido' })
    }

    const guardia = await prisma.guardiaMensual.findUnique({
      where: { id: guardiaId },
      include: {
        dias: {
          orderBy: { fecha: 'asc' },
          include: {
            bomberos: {
              include: {
                bombero: {
                  select: { id: true, nombres: true, apellidos: true, rango: true }
                }
              }
            }
          }
        }
      }
    })

    if (!guardia) {
      return res.status(404).json({ success: false, message: 'Guardia mensual no encontrada' })
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="guardia_nocturna_${guardia.anio}_${guardia.mes}.pdf"`)

    doc.pipe(res)

    doc.fontSize(22).text(`Guardia nocturna ${guardia.mes}/${guardia.anio}`, { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).text(`Mínimo de bomberos por día: ${guardia.minimoBomberos}`)
    if (guardia.notas) {
      doc.moveDown(0.2)
      doc.fontSize(11).text(`Notas: ${guardia.notas}`)
    }

    doc.moveDown(0.8)

    const columnHeaders = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    const cellWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / columnHeaders.length
    const cellHeight = 90
    let currentY = doc.y

    doc.fontSize(11)
    columnHeaders.forEach((header, index) => {
      const x = doc.page.margins.left + index * cellWidth
      doc.rect(x, currentY, cellWidth, 20).stroke()
      doc.text(header, x + 5, currentY + 5, { width: cellWidth - 10, align: 'center' })
    })

    currentY += 20

    const firstDay = new Date(guardia.anio, guardia.mes - 1, 1)
    const offset = (firstDay.getDay() + 6) % 7 // Ajustar para que lunes sea primer día

    const daysInMonth = new Date(guardia.anio, guardia.mes, 0).getDate()

    let dayCounter = 1 - offset

    while (dayCounter <= daysInMonth) {
      for (let col = 0; col < 7; col += 1) {
        const x = doc.page.margins.left + col * cellWidth
        doc.rect(x, currentY, cellWidth, cellHeight).stroke()

        if (dayCounter > 0 && dayCounter <= daysInMonth) {
          const date = new Date(guardia.anio, guardia.mes - 1, dayCounter)
          doc.fontSize(10).text(`${dayCounter}`, x + 5, currentY + 5)

          const dia = guardia.dias.find((d) => d.fecha.toISOString().slice(0, 10) === date.toISOString().slice(0, 10))

          if (dia) {
            const nombres = dia.bomberos
              .map((asignacion) => `${asignacion.bombero.apellidos}, ${asignacion.bombero.nombres}`)
              .join('\n')

            doc.fontSize(9).text(nombres || 'Sin asignaciones', x + 5, currentY + 20, {
              width: cellWidth - 10
            })
          } else {
            doc.fontSize(9).text('Sin asignaciones', x + 5, currentY + 20, {
              width: cellWidth - 10
            })
          }
        }

        dayCounter += 1
      }

      currentY += cellHeight
      if (currentY + cellHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage({ layout: 'landscape' })
        currentY = doc.page.margins.top
      }
    }

    doc.end()
  } catch (error) {
    console.error('Error al exportar guardia mensual:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

// ============================================
// RUTAS DE PLANTILLAS
// ============================================

// Listar todas las plantillas
router.get('/plantillas', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const plantillas = await prisma.plantillaGuardia.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        dias: {
          include: {
            bomberos: {
              include: {
                bombero: {
                  select: { id: true, nombres: true, apellidos: true, rango: true, estado: true }
                }
              }
            }
          }
        }
      }
    })

    res.json({ success: true, data: plantillas })
  } catch (error) {
    console.error('Error al listar plantillas:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

// Obtener una plantilla por ID
router.get('/plantillas/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const plantillaId = parseInt(req.params.id, 10)
    if (Number.isNaN(plantillaId)) {
      return res.status(400).json({ success: false, message: 'ID de plantilla inválido' })
    }

    const plantilla = await prisma.plantillaGuardia.findUnique({
      where: { id: plantillaId },
      include: {
        dias: {
          include: {
            bomberos: {
              include: {
                bombero: {
                  select: { id: true, nombres: true, apellidos: true, rango: true, estado: true }
                }
              }
            }
          }
        }
      }
    })

    if (!plantilla) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' })
    }

    res.json({ success: true, data: plantilla })
  } catch (error) {
    console.error('Error al obtener plantilla:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

// Crear nueva plantilla
router.post('/plantillas', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { value, error } = plantillaSchema.validate(req.body, { context: { tipo: req.body.tipo } })
    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    const plantilla = await prisma.plantillaGuardia.create({
      data: {
        nombre: value.nombre,
        descripcion: value.descripcion || null,
        tipo: value.tipo,
        creadoPorId: req.user.id,
        dias: {
          create: value.dias.map((dia) => ({
            diaNumero: dia.diaNumero || null,
            diaSemana: dia.diaSemana !== undefined ? dia.diaSemana : null,
            notas: dia.notas || null,
            bomberos: {
              create: (dia.bomberoIds || []).map((bomberoId) => ({
                bomberoId
              }))
            }
          }))
        }
      },
      include: {
        dias: {
          include: {
            bomberos: {
              include: {
                bombero: {
                  select: { id: true, nombres: true, apellidos: true, rango: true }
                }
              }
            }
          }
        }
      }
    })

    res.status(201).json({ success: true, data: plantilla })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Ya existe una plantilla con ese nombre' })
    }
    console.error('Error al crear plantilla:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

// Actualizar plantilla (solo nombre y descripción)
router.put('/plantillas/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const plantillaId = parseInt(req.params.id, 10)
    if (Number.isNaN(plantillaId)) {
      return res.status(400).json({ success: false, message: 'ID de plantilla inválido' })
    }

    const { value, error } = plantillaUpdateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    const plantilla = await prisma.plantillaGuardia.update({
      where: { id: plantillaId },
      data: value
    })

    res.json({ success: true, data: plantilla })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' })
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Ya existe una plantilla con ese nombre' })
    }
    console.error('Error al actualizar plantilla:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

// Eliminar plantilla
router.delete('/plantillas/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const plantillaId = parseInt(req.params.id, 10)
    if (Number.isNaN(plantillaId)) {
      return res.status(400).json({ success: false, message: 'ID de plantilla inválido' })
    }

    await prisma.plantillaGuardia.delete({ where: { id: plantillaId } })
    res.json({ success: true, message: 'Plantilla eliminada correctamente' })
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' })
    }
    console.error('Error al eliminar plantilla:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

// Aplicar plantilla a una guardia mensual
router.post('/mensuales/:guardiaId/aplicar-plantilla/:plantillaId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const guardiaId = parseInt(req.params.guardiaId, 10)
    const plantillaId = parseInt(req.params.plantillaId, 10)

    if (Number.isNaN(guardiaId) || Number.isNaN(plantillaId)) {
      return res.status(400).json({ success: false, message: 'IDs inválidos' })
    }

    const [guardia, plantilla] = await Promise.all([
      prisma.guardiaMensual.findUnique({ where: { id: guardiaId } }),
      prisma.plantillaGuardia.findUnique({
        where: { id: plantillaId },
        include: {
          dias: {
            include: {
              bomberos: {
                include: {
                  bombero: { select: { id: true, estado: true } }
                }
              }
            }
          }
        }
      })
    ])

    if (!guardia) {
      return res.status(404).json({ success: false, message: 'Guardia mensual no encontrada' })
    }

    if (!plantilla) {
      return res.status(404).json({ success: false, message: 'Plantilla no encontrada' })
    }

    // Generar asignaciones según el tipo de plantilla
    const operations = []

    for (const diaPlantilla of plantilla.dias) {
      let fechasAAplicar = []

      if (plantilla.tipo === 'por_fecha') {
        // Aplicar para el día específico del mes
        const fecha = new Date(guardia.anio, guardia.mes - 1, diaPlantilla.diaNumero)
        if (fecha.getMonth() === guardia.mes - 1) {
          fechasAAplicar.push(fecha)
        }
      } else {
        // por_dia_semana: Aplicar para todos los días de esa semana en el mes
        const firstDay = new Date(guardia.anio, guardia.mes - 1, 1)
        const lastDay = new Date(guardia.anio, guardia.mes, 0)

        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
          if (d.getDay() === diaPlantilla.diaSemana) {
            fechasAAplicar.push(new Date(d))
          }
        }
      }

      // Para cada fecha, crear/actualizar el día y agregar bomberos activos
      for (const fecha of fechasAAplicar) {
        // Filtrar solo bomberos activos (preparado para validación de licencias futuras)
        const bomberosActivos = diaPlantilla.bomberos
          .filter((item) => item.bombero.estado === 'Activo')
          .map((item) => item.bomberoId)

        if (bomberosActivos.length === 0) continue

        // Crear/obtener GuardiaDia
        const guardiaDia = await prisma.guardiaDia.upsert({
          where: {
            guardiaMensualId_fecha: {
              guardiaMensualId: guardiaId,
              fecha
            }
          },
          update: {
            notas: diaPlantilla.notas || null
          },
          create: {
            guardiaMensualId: guardiaId,
            fecha,
            notas: diaPlantilla.notas || null
          }
        })

        // Obtener asignaciones existentes
        const existingAssignments = await prisma.guardiaDiaBombero.findMany({
          where: { guardiaDiaId: guardiaDia.id },
          select: { bomberoId: true }
        })

        const existingBomberoIds = existingAssignments.map((a) => a.bomberoId)

        // Agregar solo bomberos que no estén ya asignados (validación silenciosa)
        for (const bomberoId of bomberosActivos) {
          if (!existingBomberoIds.includes(bomberoId)) {
            operations.push(
              prisma.guardiaDiaBombero.create({
                data: {
                  guardiaDiaId: guardiaDia.id,
                  bomberoId,
                  asignadoPorId: req.user.id
                }
              })
            )
          }
        }
      }
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations)
    }

    // Retornar guardia actualizada
    const guardiaActualizada = await prisma.guardiaMensual.findUnique({
      where: { id: guardiaId },
      include: {
        dias: {
          orderBy: { fecha: 'asc' },
          include: {
            bomberos: {
              include: {
                bombero: {
                  select: { id: true, nombres: true, apellidos: true, rango: true }
                },
                asignadoPor: {
                  select: { id: true, nombre: true }
                }
              }
            }
          }
        }
      }
    })

    res.json({
      success: true,
      message: `Plantilla "${plantilla.nombre}" aplicada correctamente`,
      data: formatGuardiaMensual(guardiaActualizada)
    })
  } catch (error) {
    console.error('Error al aplicar plantilla:', error)
    res.status(500).json({ success: false, message: 'Error interno del servidor' })
  }
})

export default router
