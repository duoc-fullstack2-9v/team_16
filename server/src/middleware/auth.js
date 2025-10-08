import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de acceso requerido' 
    })
  }

  try {
    // Verificar el token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Buscar el usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        tipo: true,
        activo: true,
      }
    })

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      })
    }

    if (!user.activo) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario inactivo' 
      })
    }

    // Agregar la información del usuario al request
    req.user = user
    next()
  } catch (error) {
    console.error('Error en autenticación:', error.message)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido' 
      })
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token expirado' 
      })
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      })
    }
  }
}

// Middleware para verificar si el usuario es administrador
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Autenticación requerida' 
    })
  }

  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado: Se requieren permisos de administrador' 
    })
  }

  next()
}

// Middleware para verificar roles específicos
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Autenticación requerida' 
      })
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        success: false, 
        message: `Acceso denegado: Se requiere uno de los siguientes roles: ${roles.join(', ')}` 
      })
    }

    next()
  }
}