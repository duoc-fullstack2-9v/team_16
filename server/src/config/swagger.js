import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Determinar la URL base según el entorno
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'http://18.207.241.25:3002/api';
  }
  return 'http://localhost:3002/api';
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gestión de Bomberos API',
      version: '1.0.0',
      description: 'API REST para el Sistema de Gestión Integral de Bomberos (SGIB)',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'soporte@bomberos.cl'
      }
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Servidor de Producción (EC2)' : 'Servidor de Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT obtenido del login'
        }
      },
      schemas: {
        // Auth
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin' },
            password: { type: 'string', example: '1234' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            nombre: { type: 'string' },
            rol: { type: 'string', enum: ['Administrador', 'Bombero', 'Oficial'] }
          }
        },
        // Bombero
        Bombero: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            rut: { type: 'string', example: '12345678-9' },
            nombres: { type: 'string', example: 'Juan Carlos' },
            apellidoPaterno: { type: 'string', example: 'Pérez' },
            apellidoMaterno: { type: 'string', example: 'González' },
            fechaNacimiento: { type: 'string', format: 'date' },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string' },
            direccion: { type: 'string' },
            estado: { 
              type: 'string', 
              enum: ['Activo', 'Suspendido', 'Dado de Baja', 'Renuncia'],
              example: 'Activo'
            },
            cargoId: { type: 'string' },
            fotoUrl: { type: 'string' },
            fechaIngreso: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateBombero: {
          type: 'object',
          required: ['rut', 'nombres', 'apellidoPaterno', 'email'],
          properties: {
            rut: { type: 'string', example: '12345678-9' },
            nombres: { type: 'string', example: 'Juan Carlos' },
            apellidoPaterno: { type: 'string', example: 'Pérez' },
            apellidoMaterno: { type: 'string', example: 'González' },
            fechaNacimiento: { type: 'string', format: 'date' },
            email: { type: 'string', format: 'email' },
            telefono: { type: 'string' },
            direccion: { type: 'string' },
            cargoId: { type: 'string' }
          }
        },
        // Citación
        Citacion: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            titulo: { type: 'string' },
            descripcion: { type: 'string' },
            fecha: { type: 'string', format: 'date-time' },
            lugar: { type: 'string' },
            tipo: { type: 'string', enum: ['Reunión', 'Capacitación', 'Emergencia', 'Otro'] },
            estado: { type: 'string', enum: ['Programada', 'En Curso', 'Finalizada', 'Cancelada'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        // Licencia
        Licencia: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bomberoId: { type: 'string' },
            tipoLicenciaId: { type: 'string' },
            fechaInicio: { type: 'string', format: 'date' },
            fechaFin: { type: 'string', format: 'date' },
            estado: { 
              type: 'string', 
              enum: ['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada', 'Activa', 'Finalizada'] 
            },
            motivo: { type: 'string' },
            observaciones: { type: 'string' }
          }
        },
        // Guardia
        GuardiaMensual: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            mes: { type: 'integer', minimum: 1, maximum: 12 },
            anio: { type: 'integer' },
            estado: { type: 'string', enum: ['Borrador', 'Publicada', 'Cerrada'] },
            dias: { type: 'array', items: { $ref: '#/components/schemas/GuardiaDia' } }
          }
        },
        GuardiaDia: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fecha: { type: 'string', format: 'date' },
            bomberos: { type: 'array', items: { type: 'string' } }
          }
        },
        // Cargo
        Cargo: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            jerarquia: { type: 'integer' }
          }
        },
        // Error
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/config/swagger-docs.js', './src/routes/*.js'], // Archivos donde buscar anotaciones
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
