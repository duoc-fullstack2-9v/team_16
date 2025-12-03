/**
 * Tests de integración para endpoints de health check
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'

// Crear app mínima para tests
const createTestApp = () => {
  const app = express()
  app.use(express.json())
  
  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test'
    })
  })

  // API health
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'API funcionando correctamente',
      version: '1.0.0'
    })
  })

  return app
}

describe('Health Endpoints', () => {
  let app

  beforeAll(() => {
    app = createTestApp()
  })

  describe('GET /health', () => {
    it('debería retornar status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)

      expect(response.body.status).toBe('OK')
      expect(response.body.timestamp).toBeDefined()
      expect(response.body.environment).toBe('test')
    })

    it('debería retornar content-type json', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
    })
  })

  describe('GET /api/health', () => {
    it('debería retornar success true', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('funcionando')
    })
  })
})
