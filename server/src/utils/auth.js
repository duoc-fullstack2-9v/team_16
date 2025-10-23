import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Generar token JWT
export const generateToken = (userId, email) => {
  return jwt.sign(
    { 
      userId, 
      email,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'sistema-bomberos',
      audience: 'bomberos-client'
    }
  )
}

// Verificar token JWT
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new Error('Token inválido')
  }
}

// Hashear contraseña
export const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
  return await bcrypt.hash(password, saltRounds)
}

// Comparar contraseña
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Generar contraseña temporal
export const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Sanitizar datos de usuario para respuesta (remover password)
export const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user
  return sanitizedUser
}