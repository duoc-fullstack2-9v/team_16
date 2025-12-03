/**
 * Tests de integración para estructura de respuestas API
 */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'

// Crear app con diferentes tipos de respuestas
const createApiTestApp = () => {
  const app = express()
  app.use(express.json())

  // Respuesta exitosa estándar
  app.get('/api/success', (req, res) => {
    res.json({
      success: true,
      message: 'Operación exitosa',
      data: { id: '123', nombre: 'Test' }
    })
  })

  // Respuesta de lista con paginación
  app.get('/api/list', (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    res.json({
      success: true,
      data: [
        { id: '1', nombre: 'Item 1' },
        { id: '2', nombre: 'Item 2' }
      ],
      pagination: {
        page,
        limit,
        total: 50,
        totalPages: 5
      }
    })
  })

  // Error 400 - Bad Request
  app.post('/api/validate', (req, res) => {
    if (!req.body.nombre) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: ['El nombre es requerido']
      })
    }
    res.json({ success: true })
  })

  // Error 404 - Not Found
  app.get('/api/notfound', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Recurso no encontrado'
    })
  })

  // Error 500 - Internal Server Error
  app.get('/api/error', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  })

  return app
}

describe('API Response Structure', () => {
  let app

  beforeAll(() => {
    app = createApiTestApp()
  })

  describe('Respuestas exitosas', () => {
    
    it('debería tener estructura success/message/data', async () => {
      const response = await request(app)
        .get('/api/success')
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('data')
    })

    it('lista debería incluir paginación', async () => {
      const response = await request(app)
        .get('/api/list?page=2&limit=20')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.page).toBe(2)
      expect(response.body.pagination.limit).toBe(20)
      expect(response.body.pagination.total).toBeDefined()
      expect(response.body.pagination.totalPages).toBeDefined()
    })
  })

  describe('Respuestas de error', () => {
    
    it('400 debería incluir success false y details', async () => {
      const response = await request(app)
        .post('/api/validate')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toBeDefined()
      expect(response.body.details).toBeInstanceOf(Array)
    })

    it('404 debería tener estructura correcta', async () => {
      const response = await request(app)
        .get('/api/notfound')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('no encontrado')
    })

    it('500 debería tener estructura correcta', async () => {
      const response = await request(app)
        .get('/api/error')
        .expect(500)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Error')
    })
  })

  describe('Headers', () => {
    
    it('debería retornar content-type application/json', async () => {
      await request(app)
        .get('/api/success')
        .expect('Content-Type', /application\/json/)
    })
  })
})
