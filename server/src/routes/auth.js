import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { 
  generateToken, 
  hashPassword, 
  comparePassword, 
  sanitizeUser 
} from '../utils/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Validaciones con Joi
const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    'string.empty': 'El email es requerido',
    'any.required': 'El email es requerido'
  }),
  password: Joi.string().min(4).required().messages({
    'string.empty': 'La contraseña es requerida',
    'string.min': 'La contraseña debe tener al menos 4 caracteres',
    'any.required': 'La contraseña es requerida'
  })
})

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    // Validar datos de entrada
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => detail.message)
      })
    }

    const { email, password } = value

    // Buscar usuario por email o como username (compatibilidad con sistema anterior)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { email: email.includes('@') ? email : `${email}@bomberos.cl` }
        ]
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      })
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador.'
      })
    }

    // Comparar contraseña
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      })
    }

    // Generar token JWT
    const token = generateToken(user.id, user.email)

    // Sanitizar datos del usuario
    const sanitizedUser = sanitizeUser(user)

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: sanitizedUser,
        token
      }
    })

  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

// POST /api/auth/logout - Cerrar sesión (opcional, principalmente del lado del cliente)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  })
})

export default router