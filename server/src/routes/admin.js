import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// ========================================
// RUTAS DE ADMINISTRACIÓN
// ========================================

// GET /api/admin/stats - Obtener estadísticas generales
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalBomberos,
      totalOficiales,
      totalCitaciones,
      totalUsuarios,
      citacionesActivas
    ] = await Promise.all([
      prisma.bombero.count({ where: { estado: 'Activo' } }),
      prisma.oficial.count(),
      prisma.citacion.count(),
      prisma.user.count({ where: { activo: true } }),
      prisma.citacion.count({ 
        where: { 
          estado: 'Programada',
          fecha: { gte: new Date() }
        } 
      })
    ])

    res.json({
      success: true,
      data: {
        totalBomberos,
        totalOficiales,
        totalCitaciones,
        totalUsuarios,
        citacionesActivas,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del sistema'
    })
  }
})

export default router