# Tests del Backend - Sistema de Bomberos

## Estructura

```
tests/
├── setup.js                    # Configuración global de tests
├── unit/                       # Tests unitarios
│   ├── auth.utils.spec.js      # Utilidades de autenticación
│   └── validation.spec.js      # Validaciones Joi
└── integration/                # Tests de integración
    ├── health.spec.js          # Endpoints de health check
    ├── auth.spec.js            # Endpoints de autenticación
    └── api-responses.spec.js   # Estructura de respuestas API
```

## Comandos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con interfaz visual
npm run test:ui

# Ejecutar con cobertura
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## Tests incluidos

### Unit Tests

#### `auth.utils.spec.js`
- ✅ Generación de tokens JWT
- ✅ Verificación de tokens
- ✅ Hash de contraseñas con bcrypt
- ✅ Comparación de contraseñas
- ✅ Generación de contraseñas temporales
- ✅ Sanitización de usuarios

#### `validation.spec.js`
- ✅ Validación de login
- ✅ Validación de bomberos (rangos, estados, email, teléfono)
- ✅ Validación de licencias (tipos, fechas, ObjectIds)

### Integration Tests

#### `health.spec.js`
- ✅ GET /health - Status del servidor
- ✅ GET /api/health - Health check de la API

#### `auth.spec.js`
- ✅ POST /api/auth/login - Login con credenciales
- ✅ GET /api/auth/me - Obtener usuario actual con token
- ✅ Manejo de errores (401, 400, 500)

#### `api-responses.spec.js`
- ✅ Estructura de respuestas exitosas
- ✅ Paginación en listas
- ✅ Estructura de errores (400, 404, 500)
- ✅ Headers correctos

## Tecnologías

- **Vitest** - Framework de testing
- **Supertest** - Testing de HTTP/APIs
- **Mocks** - Simulación de Prisma y base de datos

## Notas

- Los tests usan `JWT_SECRET` y otras variables de entorno definidas en `setup.js`
- Los tests de integración usan mocks de Prisma, no requieren base de datos
- El puerto de tests es 3099 para evitar conflictos
