/**
 * Tests unitarios para utilidades de autenticación
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { 
  generateToken, 
  verifyToken, 
  hashPassword, 
  comparePassword,
  generateTemporaryPassword,
  sanitizeUser 
} from '../../src/utils/auth.js'

describe('Auth Utils', () => {
  
  describe('generateToken', () => {
    it('debería generar un token JWT válido', () => {
      const token = generateToken('user123', 'test@test.com')
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT tiene 3 partes
    })

    it('debería incluir userId y email en el payload', () => {
      const token = generateToken('user123', 'test@test.com', 'Administrador', 'admin')
      const decoded = verifyToken(token)
      
      expect(decoded.userId).toBe('user123')
      expect(decoded.email).toBe('test@test.com')
      expect(decoded.rol).toBe('Administrador')
      expect(decoded.tipo).toBe('admin')
    })

    it('debería incluir issuer y audience', () => {
      const token = generateToken('user123', 'test@test.com')
      const decoded = verifyToken(token)
      
      expect(decoded.iss).toBe('sistema-bomberos')
      expect(decoded.aud).toBe('bomberos-client')
    })
  })

  describe('verifyToken', () => {
    it('debería verificar un token válido', () => {
      const token = generateToken('user123', 'test@test.com')
      const decoded = verifyToken(token)
      
      expect(decoded.userId).toBe('user123')
      expect(decoded.email).toBe('test@test.com')
    })

    it('debería lanzar error con token inválido', () => {
      expect(() => verifyToken('token-invalido')).toThrow('Token inválido')
    })

    it('debería lanzar error con token vacío', () => {
      expect(() => verifyToken('')).toThrow('Token inválido')
    })
  })

  describe('hashPassword', () => {
    it('debería hashear una contraseña', async () => {
      const password = 'miPassword123'
      const hashed = await hashPassword(password)
      
      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.startsWith('$2')).toBe(true) // bcrypt prefix
    })

    it('debería generar hashes diferentes para la misma contraseña', async () => {
      const password = 'miPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2) // Salt diferente
    })
  })

  describe('comparePassword', () => {
    it('debería retornar true para contraseña correcta', async () => {
      const password = 'miPassword123'
      const hashed = await hashPassword(password)
      const result = await comparePassword(password, hashed)
      
      expect(result).toBe(true)
    })

    it('debería retornar false para contraseña incorrecta', async () => {
      const password = 'miPassword123'
      const hashed = await hashPassword(password)
      const result = await comparePassword('otraPassword', hashed)
      
      expect(result).toBe(false)
    })
  })

  describe('generateTemporaryPassword', () => {
    it('debería generar contraseña de 12 caracteres', () => {
      const password = generateTemporaryPassword()
      
      expect(password).toHaveLength(12)
    })

    it('debería generar contraseñas únicas', () => {
      const passwords = new Set()
      for (let i = 0; i < 10; i++) {
        passwords.add(generateTemporaryPassword())
      }
      
      expect(passwords.size).toBe(10) // Todas deberían ser únicas
    })

    it('debería contener solo caracteres alfanuméricos', () => {
      const password = generateTemporaryPassword()
      const regex = /^[A-Za-z0-9]+$/
      
      expect(regex.test(password)).toBe(true)
    })
  })

  describe('sanitizeUser', () => {
    it('debería remover el campo password', () => {
      const user = {
        id: '123',
        email: 'test@test.com',
        nombre: 'Test User',
        password: 'secret123',
        rol: 'Administrador'
      }
      
      const sanitized = sanitizeUser(user)
      
      expect(sanitized.id).toBe('123')
      expect(sanitized.email).toBe('test@test.com')
      expect(sanitized.password).toBeUndefined()
    })

    it('debería mantener todos los demás campos', () => {
      const user = {
        id: '123',
        email: 'test@test.com',
        nombre: 'Test User',
        password: 'secret123',
        rol: 'Administrador',
        activo: true
      }
      
      const sanitized = sanitizeUser(user)
      
      // 6 campos - 1 password = 5 campos restantes
      expect(Object.keys(sanitized)).toHaveLength(5)
      expect(sanitized.activo).toBe(true)
      expect(sanitized.id).toBe('123')
      expect(sanitized.email).toBe('test@test.com')
      expect(sanitized.nombre).toBe('Test User')
      expect(sanitized.rol).toBe('Administrador')
    })
  })
})
