/**
 * Setup para tests del backend
 * Configura variables de entorno y mocks necesarios
 */
import { beforeAll, afterAll } from 'vitest'

// Variables de entorno para tests
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only'
process.env.JWT_EXPIRE = '1h'
process.env.BCRYPT_SALT_ROUNDS = '4' // Menor para tests más rápidos
process.env.PORT = '3099' // Puerto diferente para tests

beforeAll(() => {
  console.log('🧪 Iniciando tests del backend...')
})

afterAll(() => {
  console.log('✅ Tests del backend finalizados')
})
