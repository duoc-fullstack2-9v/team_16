/**
 * Tests de integración para endpoints de autenticación
 * Nota: Estos tests requieren una base de datos de prueba o mocks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Mock de usuario
const mockUser = {
  id: '507f1f77bcf86cd799439011',
  email: 'admin@bomberos.cl',
  nombre: 'Admin',
  password: '$2a$04$mock.hashed.password', // bcrypt hash
  rol: 'Administrador',
  tipo: 'admin',
  activo: true
}

// Mock de Prisma
const mockPrisma = {
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn()
  }
}

// Schema de validación
const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(4).required()
})

// Crear app de prueba con auth routes
const createAuthTestApp = () => {
  const app = express()
  app.use(express.json())

  // Simular endpoint de login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { error, value } = loginSchema.validate(req.body)
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          details: error.details.map(d => d.message)
        })
      }

      const { email, password } = value
      const user = await mockPrisma.user.findFirst()

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        })
      }

      if (!user.activo) {
        return res.status(401).json({
          success: false,
          message: 'Usuario inactivo. Contacte al administrador.'
        })
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        })
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      res.json({
        success: true,
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  })

  // Endpoint protegido de prueba
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      res.json({
        success: true,
        user: { userId: decoded.userId, email: decoded.email }
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      })
    }
  })

  return app
}

describe('Auth Endpoints', () => {
  let app

  beforeEach(() => {
    app = createAuthTestApp()
    vi.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    
    it('debería rechazar request sin body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('debería rechazar email vacío', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: '', password: '1234' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('inválidos')
    })

    it('debería rechazar password corto', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin', password: '123' })
        .expect(400)

      expect(response.body.success).toBe(false)
    })

    it('debería retornar 401 para usuario no encontrado', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null)

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noexiste@test.com', password: '1234' })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Credenciales inválidas')
    })

    it('debería retornar 401 para usuario inactivo', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        ...mockUser,
        activo: false
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin', password: '1234' })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('inactivo')
    })

    it('debería retornar token para login correcto', async () => {
      // Hash de '1234' para el test
      const hashedPassword = await bcrypt.hash('1234', 4)
      mockPrisma.user.findFirst.mockResolvedValue({
        ...mockUser,
        password: hashedPassword
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin', password: '1234' })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
      expect(response.body.user).toBeDefined()
      expect(response.body.user.id).toBe(mockUser.id)
    })
  })

  describe('GET /api/auth/me', () => {

    it('debería rechazar request sin token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Token')
    })

    it('debería rechazar token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('debería aceptar token válido', async () => {
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.user.userId).toBe(mockUser.id)
    })
  })
})
