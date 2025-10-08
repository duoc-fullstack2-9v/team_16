import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Importar rutas
import authRoutes from './routes/auth.js'
import bomberosRoutes from './routes/bomberos.js'
import citacionesRoutes from './routes/citaciones.js'
import oficialesRoutes from './routes/oficiales.js'
import adminRoutes from './routes/admin.js'

// Configurar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ========================================
// MIDDLEWARE GLOBAL
// ========================================

// Seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'http://localhost:5174' // Puerto alternativo para desarrollo
  ],
  credentials: true,
  optionsSuccessStatus: 200
}))

// Rate Limiting
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

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

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
app.use('/api/oficiales', oficialesRoutes)
app.use('/api/admin', adminRoutes)

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