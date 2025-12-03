/**
 * Tests unitarios para validaciones Joi
 */
import { describe, it, expect } from 'vitest'
import Joi from 'joi'

// Schemas de validación (replicados para tests)
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

const bomberoSchema = Joi.object({
  nombres: Joi.string().min(2).max(100).required(),
  apellidos: Joi.string().min(2).max(100).required(),
  rango: Joi.string().valid('Bombero', 'Cabo', 'Sargento', 'Teniente', 'Capitán', 'Comandante').required(),
  especialidad: Joi.string().max(200).optional().allow(''),
  estado: Joi.string().valid('Activo', 'Suspendido', 'Dado de Baja', 'Renuncia').default('Activo'),
  telefono: Joi.string().min(8).max(25).pattern(/^[\+\d\s\-\(\)]+$/).optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  direccion: Joi.string().max(300).optional().allow('')
})

const licenciaSchema = Joi.object({
  bomberoId: Joi.string().length(24).hex().optional(),
  tipo: Joi.string().valid('Medica', 'Vacaciones', 'Personal', 'Estudios', 'Laboral', 'Otra').required(),
  fechaInicio: Joi.date().iso().required(),
  fechaFin: Joi.date().iso().min(Joi.ref('fechaInicio')).required(),
  motivo: Joi.string().max(500).optional().allow('')
})

describe('Validaciones Login', () => {
  
  it('debería validar login correcto', () => {
    const data = { email: 'admin', password: '1234' }
    const { error } = loginSchema.validate(data)
    
    expect(error).toBeUndefined()
  })

  it('debería rechazar email vacío', () => {
    const data = { email: '', password: '1234' }
    const { error } = loginSchema.validate(data)
    
    expect(error).toBeDefined()
    expect(error.details[0].message).toContain('email')
  })

  it('debería rechazar password corto', () => {
    const data = { email: 'admin', password: '123' }
    const { error } = loginSchema.validate(data)
    
    expect(error).toBeDefined()
    expect(error.details[0].message).toContain('4 caracteres')
  })

  it('debería rechazar sin password', () => {
    const data = { email: 'admin' }
    const { error } = loginSchema.validate(data)
    
    expect(error).toBeDefined()
  })
})

describe('Validaciones Bombero', () => {
  
  const bomberoValido = {
    nombres: 'Juan Carlos',
    apellidos: 'Pérez López',
    rango: 'Bombero',
    estado: 'Activo'
  }

  it('debería validar bombero correcto', () => {
    const { error } = bomberoSchema.validate(bomberoValido)
    
    expect(error).toBeUndefined()
  })

  it('debería aceptar todos los rangos válidos', () => {
    const rangos = ['Bombero', 'Cabo', 'Sargento', 'Teniente', 'Capitán', 'Comandante']
    
    rangos.forEach(rango => {
      const data = { ...bomberoValido, rango }
      const { error } = bomberoSchema.validate(data)
      expect(error).toBeUndefined()
    })
  })

  it('debería rechazar rango inválido', () => {
    const data = { ...bomberoValido, rango: 'General' }
    const { error } = bomberoSchema.validate(data)
    
    expect(error).toBeDefined()
  })

  it('debería aceptar todos los estados válidos', () => {
    const estados = ['Activo', 'Suspendido', 'Dado de Baja', 'Renuncia']
    
    estados.forEach(estado => {
      const data = { ...bomberoValido, estado }
      const { error } = bomberoSchema.validate(data)
      expect(error).toBeUndefined()
    })
  })

  it('debería rechazar nombres muy cortos', () => {
    const data = { ...bomberoValido, nombres: 'A' }
    const { error } = bomberoSchema.validate(data)
    
    expect(error).toBeDefined()
  })

  it('debería validar email correcto', () => {
    const data = { ...bomberoValido, email: 'test@example.com' }
    const { error } = bomberoSchema.validate(data)
    
    expect(error).toBeUndefined()
  })

  it('debería rechazar email inválido', () => {
    const data = { ...bomberoValido, email: 'email-invalido' }
    const { error } = bomberoSchema.validate(data)
    
    expect(error).toBeDefined()
  })

  it('debería validar teléfono correcto', () => {
    const telefonos = ['+56912345678', '912345678', '(02) 2345-6789']
    
    telefonos.forEach(telefono => {
      const data = { ...bomberoValido, telefono }
      const { error } = bomberoSchema.validate(data)
      expect(error).toBeUndefined()
    })
  })
})

describe('Validaciones Licencia', () => {
  
  const licenciaValida = {
    tipo: 'Medica',
    fechaInicio: '2025-01-15',
    fechaFin: '2025-01-20',
    motivo: 'Consulta médica'
  }

  it('debería validar licencia correcta', () => {
    const { error } = licenciaSchema.validate(licenciaValida)
    
    expect(error).toBeUndefined()
  })

  it('debería aceptar todos los tipos válidos', () => {
    const tipos = ['Medica', 'Vacaciones', 'Personal', 'Estudios', 'Laboral', 'Otra']
    
    tipos.forEach(tipo => {
      const data = { ...licenciaValida, tipo }
      const { error } = licenciaSchema.validate(data)
      expect(error).toBeUndefined()
    })
  })

  it('debería rechazar tipo inválido', () => {
    const data = { ...licenciaValida, tipo: 'Invalido' }
    const { error } = licenciaSchema.validate(data)
    
    expect(error).toBeDefined()
  })

  it('debería rechazar fechaFin anterior a fechaInicio', () => {
    const data = {
      ...licenciaValida,
      fechaInicio: '2025-01-20',
      fechaFin: '2025-01-15'
    }
    const { error } = licenciaSchema.validate(data)
    
    expect(error).toBeDefined()
  })

  it('debería validar bomberoId con formato correcto (24 hex)', () => {
    const data = { ...licenciaValida, bomberoId: '507f1f77bcf86cd799439011' }
    const { error } = licenciaSchema.validate(data)
    
    expect(error).toBeUndefined()
  })

  it('debería rechazar bomberoId con formato incorrecto', () => {
    const data = { ...licenciaValida, bomberoId: 'id-invalido' }
    const { error } = licenciaSchema.validate(data)
    
    expect(error).toBeDefined()
  })
})
