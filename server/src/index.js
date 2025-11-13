import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Importar rutas
import authRoutes from './routes/auth.js'
import bomberosRoutes from './routes/bomberos.js'
import citacionesRoutes from './routes/citaciones.js'
import cargosRoutes from './routes/cargos.js'
import adminRoutes from './routes/admin.js'
import categoriasRoutes from './routes/categorias.js'
import materialRoutes from './routes/material.js'
import carrosRoutes from './routes/carros.js'
import guardiasRoutes from './routes/guardias.js'
import licenciasRoutes from './routes/licencias.js'

// Configurar variables de entorno
dotenv.config()

// Asegurar que NODE_ENV tenga un valor por defecto
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

// Para ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3002 // Cambio de puerto temporal

// ========================================
// MIDDLEWARE GLOBAL
// ========================================

// Seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS - Configuración dinámica para desarrollo y producción
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}))

// Rate Limiting (deshabilitado por defecto en desarrollo)
if (process.env.ENABLE_RATE_LIMIT === 'true') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
    message: {
      success: false,
      message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use('/api', limiter)
}

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Servir archivos estáticos (imágenes de bomberos)
app.use('/assets', express.static(path.join(__dirname, '../../assets')))

// ========================================
// RUTAS
// ========================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🚒 Sistema Bomberos API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/bomberos', bomberosRoutes)
app.use('/api/citaciones', citacionesRoutes)
app.use('/api/cargos', cargosRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/material', materialRoutes)
app.use('/api/carros', carrosRoutes)
app.use('/api/guardias', guardiasRoutes)
app.use('/api/licencias', licenciasRoutes)

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  })
})

// ========================================
// MANEJO DE ERRORES GLOBAL
// ========================================
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack)
  
  // Error de Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Ya existe un registro con esos datos únicos',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
  
  // Error de validación
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      details: err.details.map(detail => detail.message),
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
  
  // Error JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    })
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    })
  }
  
  // Error interno del servidor
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// ========================================
// INICIAR SERVIDOR
// ========================================
const server = app.listen(PORT, () => {
  console.log(`
🚒============================================🚒
   SISTEMA BOMBEROS - SERVIDOR INICIADO
🚒============================================🚒
🚀 Servidor corriendo en: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📊 Health Check: http://localhost:${PORT}/health
📡 API Base: http://localhost:${PORT}/api
🔒 CORS Origin: ${process.env.CORS_ORIGIN}
⏰ Timestamp: ${new Date().toLocaleString()}
🚒============================================🚒
  `)
})

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor gracefully...')
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor gracefully...')
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente')
    process.exit(0)
  })
})

export default app
