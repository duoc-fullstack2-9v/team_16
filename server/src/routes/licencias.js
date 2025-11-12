import express from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// ========================
// SCHEMAS DE VALIDACIÓN
// ========================

const crearLicenciaSchema = Joi.object({
  bomberoId: Joi.string().length(24).hex().allow('', null).optional(),
  tipoLicenciaId: Joi.string().length(24).hex().required(),
  otroMotivo: Joi.string().max(200).allow(null, ''),
  fechaInicio: Joi.date().iso().required(),
  fechaFin: Joi.date().iso().min(Joi.ref('fechaInicio')).required(),
  diasSemana: Joi.array().items(
    Joi.object({
      dia: Joi.string().valid('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo').required(),
      numero: Joi.number().integer().min(1).max(7).required(),
      label: Joi.string().required(),
      activo: Joi.boolean().required(),
      horaInicio: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      horaFin: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
    })
  ).required(),
  mismoHorarioTodos: Joi.boolean().default(true),
  horaInicioGeneral: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow(null, ''),
  horaFinGeneral: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow(null, ''),
  motivo: Joi.string().max(500).allow(null, ''),
  documentosUrls: Joi.array().items(Joi.string().uri()).default([]),
});

const actualizarLicenciaSchema = Joi.object({
  tipoLicenciaId: Joi.string().length(24).hex(),
  otroMotivo: Joi.string().max(200).allow(null, ''),
  fechaInicio: Joi.date().iso(),
  fechaFin: Joi.date().iso(),
  diasSemana: Joi.array().items(
    Joi.object({
      dia: Joi.string().valid('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo').required(),
      numero: Joi.number().integer().min(1).max(7).required(),
      label: Joi.string().required(),
      activo: Joi.boolean().required(),
      horaInicio: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
      horaFin: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow('', null),
    })
  ),
  mismoHorarioTodos: Joi.boolean(),
  horaInicioGeneral: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow(null, ''),
  horaFinGeneral: Joi.string().pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).allow(null, ''),
  motivo: Joi.string().max(500).allow(null, ''),
  documentosUrls: Joi.array().items(Joi.string().uri()),
});

const aprobarRechazarSchema = Joi.object({
  observacionesAdmin: Joi.string().max(500).allow(null, ''),
});

const crearTipoLicenciaSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  descripcion: Joi.string().max(500).allow(null, ''),
  requiereDocumento: Joi.boolean().default(false),
  esPersonalizado: Joi.boolean().default(true),
});

// ========================
// FUNCIONES AUXILIARES
// ========================

/**
 * Calcula los días y horas totales de una licencia basándose en los días de la semana seleccionados
 * @param {Date} fechaInicio - Fecha de inicio del período
 * @param {Date} fechaFin - Fecha de fin del período
 * @param {Array} diasSemana - Array de objetos con configuración de cada día
 * @param {Boolean} mismoHorarioTodos - Si todos los días tienen el mismo horario
 * @param {String} horaInicioGeneral - Hora de inicio general (si mismoHorarioTodos = true)
 * @param {String} horaFinGeneral - Hora de fin general (si mismoHorarioTodos = true)
 * @returns {Object} - { diasSolicitados, horasTotales }
 */
function calcularDiasYHoras(fechaInicio, fechaFin, diasSemana, mismoHorarioTodos, horaInicioGeneral, horaFinGeneral) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  
  // Obtener qué días de la semana están activos
  const diasActivos = diasSemana.filter(d => d.activo);
  
  if (diasActivos.length === 0) {
    return { diasSolicitados: 0, horasTotales: 0 };
  }
  
  // Crear un Set con los números de días activos (1=lunes, 7=domingo)
  const numerosActivos = new Set(diasActivos.map(d => d.numero));
  
  let diasContados = 0;
  let horasTotales = 0;
  
  // Iterar sobre cada día del período
  const fechaActual = new Date(inicio);
  while (fechaActual <= fin) {
    // En JavaScript: 0=domingo, 1=lunes, ..., 6=sábado
    // Necesitamos convertir a nuestro sistema: 1=lunes, ..., 7=domingo
    const diaSemanaJS = fechaActual.getDay(); // 0-6
    const numeroDia = diaSemanaJS === 0 ? 7 : diaSemanaJS; // Convertir domingo de 0 a 7
    
    // Si este día de la semana está activo, contarlo
    if (numerosActivos.has(numeroDia)) {
      diasContados++;
      
      // Calcular horas para este día
      if (mismoHorarioTodos && horaInicioGeneral && horaFinGeneral) {
        // Usar horario general
        const [horaIni, minIni] = horaInicioGeneral.split(':').map(Number);
        const [horaFin, minFin] = horaFinGeneral.split(':').map(Number);
        const minutosInicio = horaIni * 60 + minIni;
        const minutosFin = horaFin * 60 + minFin;
        const minutosTotal = minutosFin - minutosInicio;
        horasTotales += minutosTotal / 60;
      } else {
        // Usar horario personalizado de este día
        const diaConfig = diasActivos.find(d => d.numero === numeroDia);
        if (diaConfig && diaConfig.horaInicio && diaConfig.horaFin) {
          const [horaIni, minIni] = diaConfig.horaInicio.split(':').map(Number);
          const [horaFin, minFin] = diaConfig.horaFin.split(':').map(Number);
          const minutosInicio = horaIni * 60 + minIni;
          const minutosFin = horaFin * 60 + minFin;
          const minutosTotal = minutosFin - minutosInicio;
          horasTotales += minutosTotal / 60;
        }
      }
    }
    
    // Avanzar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  
  return {
    diasSolicitados: diasContados,
    horasTotales: Number(horasTotales.toFixed(2))
  };
}

/**
 * Calcula los días solicitados entre dos fechas (FUNCIÓN LEGACY - MANTENER PARA COMPATIBILIDAD)
 * Si es por horas, calcula la fracción de días
 */
function calcularDiasSolicitados(fechaInicio, fechaFin, esPorHoras, horaInicio, horaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  
  if (esPorHoras && horaInicio && horaFin) {
    // Si es el mismo día
    if (inicio.toDateString() === fin.toDateString()) {
      const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
      const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
      
      const minutosInicio = horaInicioH * 60 + horaInicioM;
      const minutosFin = horaFinH * 60 + horaFinM;
      const minutosTotal = minutosFin - minutosInicio;
      
      // Asumimos 8 horas laborales = 1 día
      return Number((minutosTotal / (8 * 60)).toFixed(2));
    }
  }
  
  // Cálculo de días completos
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  return diffDays;
}

/**
 * Detecta si el bombero tiene guardias asignadas en el rango de fechas de la licencia
 */
async function detectarConflictoGuardia(bomberoId, fechaInicio, fechaFin) {
  try {
    const guardias = await prisma.guardia.findMany({
      where: {
        bomberoId: bomberoId,
        fecha: {
          gte: new Date(fechaInicio),
          lte: new Date(fechaFin),
        },
      },
    });
    
    return guardias.length > 0;
  } catch (error) {
    console.error('Error al detectar conflictos de guardia:', error);
    return false;
  }
}

/**
 * Actualiza el estado del bombero si tiene licencias activas
 */
async function actualizarEstadoBombero(bomberoId) {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Buscar licencias activas (aprobadas y dentro del rango de fechas)
    const licenciaActiva = await prisma.licencia.findFirst({
      where: {
        bomberoId: bomberoId,
        estado: 'Aprobada',
        fechaInicio: { lte: hoy },
        fechaFin: { gte: hoy },
      },
    });
    
    // Actualizar estado del bombero
    if (licenciaActiva) {
      await prisma.bombero.update({
        where: { id: bomberoId },
        data: { estado: 'Con Licencia' },
      });
    } else {
      // Volver a Activo si no hay licencias activas
      const bombero = await prisma.bombero.findUnique({
        where: { id: bomberoId },
      });
      
      if (bombero && bombero.estado === 'Con Licencia') {
        await prisma.bombero.update({
          where: { id: bomberoId },
          data: { estado: 'Activo' },
        });
      }
    }
  } catch (error) {
    console.error('Error al actualizar estado del bombero:', error);
  }
}

// ========================
// RUTAS - TIPOS DE LICENCIA
// ========================

/**
 * GET /api/licencias/tipos-licencia
 * Obtener todos los tipos de licencia activos
 */
router.get('/tipos-licencia', authenticateToken, async (req, res) => {
  try {
    const tiposLicencia = await prisma.tipoLicencia.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
    
    res.json(tiposLicencia);
  } catch (error) {
    console.error('Error al obtener tipos de licencia:', error);
    res.status(500).json({ mensaje: 'Error al obtener tipos de licencia' });
  }
});

/**
 * POST /api/licencias/tipos-licencia
 * Crear un nuevo tipo de licencia personalizado (solo admin)
 */
router.post('/tipos-licencia', authenticateToken, async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user.rol !== 'Administrador') {
      return res.status(403).json({ mensaje: 'No tienes permiso para crear tipos de licencia' });
    }
    
    const { error, value } = crearTipoLicenciaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    // Verificar que no exista un tipo con el mismo nombre
    const existente = await prisma.tipoLicencia.findUnique({
      where: { nombre: value.nombre },
    });
    
    if (existente) {
      return res.status(400).json({ mensaje: 'Ya existe un tipo de licencia con ese nombre' });
    }
    
    const nuevoTipo = await prisma.tipoLicencia.create({
      data: value,
    });
    
    res.status(201).json(nuevoTipo);
  } catch (error) {
    console.error('Error al crear tipo de licencia:', error);
    res.status(500).json({ mensaje: 'Error al crear tipo de licencia' });
  }
});

// ========================
// RUTAS - LICENCIAS
// ========================

/**
 * GET /api/licencias
 * Listar licencias con filtros
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      bomberoId,
      estado,
      tipoLicenciaId,
      fechaDesde,
      fechaHasta,
      sortBy = 'fechaInicio',
      sortOrder = 'desc',
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    // Construir filtros
    const where = {};
    
    // Si es bombero, solo ver sus propias licencias
    if (req.user.rol === 'Bombero') {
      // Obtener el bombero asociado al usuario
      const bombero = await prisma.bombero.findFirst({
        where: { usuarioId: req.user.id },
      });
      
      if (bombero) {
        where.bomberoId = bombero.id;
      }
    } else if (bomberoId) {
      // Si es admin y especifica bomberoId
      where.bomberoId = bomberoId;
    }
    
    if (estado) {
      where.estado = estado;
    }
    
    if (tipoLicenciaId) {
      where.tipoLicenciaId = tipoLicenciaId;
    }
    
    if (fechaDesde || fechaHasta) {
      where.fechaInicio = {};
      if (fechaDesde) {
        where.fechaInicio.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaInicio.lte = new Date(fechaHasta);
      }
    }
    
    // Ejecutar consulta
    const [licencias, total] = await Promise.all([
      prisma.licencia.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          bombero: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              
              fotoUrl: true,
            },
          },
          tipoLicencia: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
            },
          },
          revisadoPor: {
            select: {
              id: true,
              nombre: true,
              
            },
          },
          creadoPor: {
            select: {
              id: true,
              nombre: true,
              
            },
          },
        },
      }),
      prisma.licencia.count({ where }),
    ]);
    
    res.json({
      licencias,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Error al obtener licencias:', error);
    res.status(500).json({ mensaje: 'Error al obtener licencias' });
  }
});

/**
 * GET /api/licencias/estadisticas
 * Obtener estadísticas de licencias
 */
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver estadísticas' });
    }
    
    const { bomberoId, anio } = req.query;
    
    // Construir filtros de fecha si se especifica un año
    const fechaFiltro = {};
    if (anio) {
      fechaFiltro.fechaInicio = {
        gte: new Date(`${anio}-01-01`),
        lte: new Date(`${anio}-12-31`),
      };
    }
    
    // Filtro de bombero
    const bomberoFiltro = bomberoId ? { bomberoId } : {};
    
    // Total de licencias
    const totalLicencias = await prisma.licencia.count({
      where: { ...bomberoFiltro, ...fechaFiltro },
    });
    
    // Licencias por estado
    const licenciasPorEstado = await prisma.licencia.groupBy({
      by: ['estado'],
      where: { ...bomberoFiltro, ...fechaFiltro },
      _count: { id: true },
    });
    
    // Licencias por tipo
    const licenciasPorTipo = await prisma.licencia.groupBy({
      by: ['tipoLicenciaId'],
      where: { ...bomberoFiltro, ...fechaFiltro, estado: 'Aprobada' },
      _count: { id: true },
      _sum: { diasSolicitados: true },
    });
    
    // Obtener nombres de tipos de licencia
    const tiposConDatos = await Promise.all(
      licenciasPorTipo.map(async (tipo) => {
        const tipoLicencia = await prisma.tipoLicencia.findUnique({
          where: { id: tipo.tipoLicenciaId },
          select: { nombre: true },
        });
        
        return {
          tipo: tipoLicencia?.nombre || 'Desconocido',
          cantidad: tipo._count.id,
          diasTotales: tipo._sum.diasSolicitados || 0,
        };
      })
    );
    
    // Total de días de licencia (solo aprobadas)
    const totalDias = await prisma.licencia.aggregate({
      where: { ...bomberoFiltro, ...fechaFiltro, estado: 'Aprobada' },
      _sum: { diasSolicitados: true },
    });
    
    // Licencias pendientes
    const pendientes = await prisma.licencia.count({
      where: { ...bomberoFiltro, estado: 'Pendiente' },
    });
    
    res.json({
      totalLicencias,
      totalDiasAprobados: totalDias._sum.diasSolicitados || 0,
      pendientes,
      porEstado: licenciasPorEstado,
      porTipo: tiposConDatos,
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
});

/**
 * GET /api/licencias/:id
 * Obtener detalles de una licencia
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ mensaje: 'ID de licencia inválido' });
    }
    
    const licencia = await prisma.licencia.findUnique({
      where: { id },
      include: {
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            
            fotoUrl: true,
            rango: true,
          },
        },
        tipoLicencia: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            requiereDocumento: true,
          },
        },
        revisadoPor: {
          select: {
            id: true,
            nombre: true,
            
          },
        },
        creadoPor: {
          select: {
            id: true,
            nombre: true,
            
          },
        },
      },
    });
    
    if (!licencia) {
      return res.status(404).json({ mensaje: 'Licencia no encontrada' });
    }
    
    // Verificar permisos: admin o el bombero dueño de la licencia
    if (req.user.rol === 'Bombero') {
      const bombero = await prisma.bombero.findFirst({
        where: { usuarioId: req.user.id },
      });
      
      if (!bombero || bombero.id !== licencia.bomberoId) {
        return res.status(403).json({ mensaje: 'No tienes permiso para ver esta licencia' });
      }
    }
    
    res.json(licencia);
  } catch (error) {
    console.error('Error al obtener licencia:', error);
    res.status(500).json({ mensaje: 'Error al obtener licencia' });
  }
});

/**
 * POST /api/licencias
 * Crear una nueva licencia
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = crearLicenciaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    let {
      bomberoId,
      tipoLicenciaId,
      otroMotivo,
      fechaInicio,
      fechaFin,
      diasSemana,
      mismoHorarioTodos,
      horaInicioGeneral,
      horaFinGeneral,
      motivo,
      documentosUrls,
    } = value;
    
    // Si no se proporciona bomberoId, obtenerlo del usuario autenticado
    if (!bomberoId || bomberoId.trim() === '') {
      // Buscar el bombero asociado al usuario autenticado
      const bomberoUsuario = await prisma.bombero.findFirst({
        where: { 
          OR: [
            { email: req.user.email },
            { createdById: req.user.id }
          ]
        },
      });
      
      if (!bomberoUsuario) {
        return res.status(404).json({ 
          mensaje: 'No se encontró un bombero asociado a este usuario. Contacte al administrador.' 
        });
      }
      
      bomberoId = bomberoUsuario.id;
    }
    
    // Validar que al menos un día de la semana esté seleccionado
    const diasActivos = diasSemana.filter(d => d.activo);
    if (diasActivos.length === 0) {
      return res.status(400).json({ 
        mensaje: 'Debe seleccionar al menos un día de la semana para la licencia' 
      });
    }
    
    // Validar horarios
    if (mismoHorarioTodos) {
      if (!horaInicioGeneral || !horaFinGeneral) {
        return res.status(400).json({ 
          mensaje: 'Debe especificar hora de inicio y fin para todos los días' 
        });
      }
    } else {
      // Validar que cada día activo tenga horario
      const diasSinHorario = diasActivos.filter(d => !d.horaInicio || !d.horaFin);
      if (diasSinHorario.length > 0) {
        return res.status(400).json({ 
          mensaje: 'Todos los días seleccionados deben tener hora de inicio y fin' 
        });
      }
    }
    
    // Verificar que el bombero existe
    const bombero = await prisma.bombero.findUnique({
      where: { id: bomberoId },
    });
    
    if (!bombero) {
      return res.status(404).json({ mensaje: 'Bombero no encontrado' });
    }
    
    // Validar que el bombero esté en estado "Activo"
    if (bombero.estado !== 'Activo') {
      return res.status(400).json({ 
        mensaje: `No se pueden crear licencias para bomberos con estado "${bombero.estado}". Solo bomberos activos pueden solicitar licencias.`
      });
    }
    
    // Verificar que el tipo de licencia existe
    const tipoLicencia = await prisma.tipoLicencia.findUnique({
      where: { id: tipoLicenciaId },
    });
    
    if (!tipoLicencia) {
      return res.status(404).json({ mensaje: 'Tipo de licencia no encontrado' });
    }
    
    // Calcular días y horas totales usando la nueva función
    const { diasSolicitados, horasTotales } = calcularDiasYHoras(
      fechaInicio,
      fechaFin,
      diasSemana,
      mismoHorarioTodos,
      horaInicioGeneral,
      horaFinGeneral
    );
    
    // Detectar conflictos con guardias
    const tieneConflictoGuardia = await detectarConflictoGuardia(
      bomberoId,
      fechaInicio,
      fechaFin
    );
    
    // Crear la licencia
    const nuevaLicencia = await prisma.licencia.create({
      data: {
        bomberoId,
        tipoLicenciaId,
        otroMotivo: otroMotivo || null,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        diasSemana: diasSemana,
        mismoHorarioTodos: mismoHorarioTodos,
        horaInicioGeneral: horaInicioGeneral || null,
        horaFinGeneral: horaFinGeneral || null,
        diasSolicitados,
        horasTotales,
        motivo: motivo || null,
        documentosUrls: documentosUrls || [],
        tieneConflictoGuardia,
        creadoPorId: req.user.id,
      },
      include: {
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            
          },
        },
        tipoLicencia: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
    
    res.status(201).json(nuevaLicencia);
  } catch (error) {
    console.error('Error al crear licencia:', error);
    res.status(500).json({ mensaje: 'Error al crear licencia' });
  }
});

/**
 * PUT /api/licencias/:id
 * Actualizar una licencia (solo si está en estado Pendiente)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ mensaje: 'ID de licencia inválido' });
    }
    
    const { error, value } = actualizarLicenciaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    // Verificar que la licencia existe y está pendiente
    const licencia = await prisma.licencia.findUnique({
      where: { id },
    });
    
    if (!licencia) {
      return res.status(404).json({ mensaje: 'Licencia no encontrada' });
    }
    
    if (licencia.estado !== 'Pendiente') {
      return res.status(400).json({ 
        mensaje: 'Solo se pueden modificar licencias en estado Pendiente' 
      });
    }
    
    // Verificar permisos
    if (req.user.rol === 'Bombero') {
      const bombero = await prisma.bombero.findFirst({
        where: { usuarioId: req.user.id },
      });
      
      if (!bombero || bombero.id !== licencia.bomberoId) {
        return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta licencia' });
      }
    }
    
    // Preparar datos de actualización
    const updateData = { ...value };
    
    // Si se modifican las fechas o diasSemana, recalcular días, horas y conflictos
    if (value.fechaInicio || value.fechaFin || value.diasSemana) {
      const fechaInicio = value.fechaInicio || licencia.fechaInicio;
      const fechaFin = value.fechaFin || licencia.fechaFin;
      const diasSemana = value.diasSemana || licencia.diasSemana;
      const mismoHorarioTodos = value.mismoHorarioTodos !== undefined ? value.mismoHorarioTodos : licencia.mismoHorarioTodos;
      const horaInicioGeneral = value.horaInicioGeneral || licencia.horaInicioGeneral;
      const horaFinGeneral = value.horaFinGeneral || licencia.horaFinGeneral;
      
      // Validar que al menos un día esté seleccionado
      const diasActivos = diasSemana.filter(d => d.activo);
      if (diasActivos.length === 0) {
        return res.status(400).json({ 
          mensaje: 'Debe seleccionar al menos un día de la semana para la licencia' 
        });
      }
      
      // Validar horarios
      if (mismoHorarioTodos) {
        if (!horaInicioGeneral || !horaFinGeneral) {
          return res.status(400).json({ 
            mensaje: 'Debe especificar hora de inicio y fin para todos los días' 
          });
        }
      } else {
        const diasSinHorario = diasActivos.filter(d => !d.horaInicio || !d.horaFin);
        if (diasSinHorario.length > 0) {
          return res.status(400).json({ 
            mensaje: 'Todos los días seleccionados deben tener hora de inicio y fin' 
          });
        }
      }
      
      const { diasSolicitados, horasTotales } = calcularDiasYHoras(
        fechaInicio,
        fechaFin,
        diasSemana,
        mismoHorarioTodos,
        horaInicioGeneral,
        horaFinGeneral
      );
      
      updateData.diasSolicitados = diasSolicitados;
      updateData.horasTotales = horasTotales;
      
      updateData.tieneConflictoGuardia = await detectarConflictoGuardia(
        licencia.bomberoId,
        fechaInicio,
        fechaFin
      );
    }
    
    // Convertir fechas a objetos Date si existen
    if (updateData.fechaInicio) {
      updateData.fechaInicio = new Date(updateData.fechaInicio);
    }
    if (updateData.fechaFin) {
      updateData.fechaFin = new Date(updateData.fechaFin);
    }
    
    const licenciaActualizada = await prisma.licencia.update({
      where: { id },
      data: updateData,
      include: {
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            
          },
        },
        tipoLicencia: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
    
    res.json(licenciaActualizada);
  } catch (error) {
    console.error('Error al actualizar licencia:', error);
    res.status(500).json({ mensaje: 'Error al actualizar licencia' });
  }
});

/**
 * DELETE /api/licencias/:id
 * Cancelar una licencia (solo si está en estado Pendiente)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ mensaje: 'ID de licencia inválido' });
    }
    
    // Verificar que la licencia existe
    const licencia = await prisma.licencia.findUnique({
      where: { id },
    });
    
    if (!licencia) {
      return res.status(404).json({ mensaje: 'Licencia no encontrada' });
    }
    
    if (licencia.estado !== 'Pendiente') {
      return res.status(400).json({ 
        mensaje: 'Solo se pueden cancelar licencias en estado Pendiente' 
      });
    }
    
    // Verificar permisos
    if (req.user.rol === 'Bombero') {
      const bombero = await prisma.bombero.findFirst({
        where: { usuarioId: req.user.id },
      });
      
      if (!bombero || bombero.id !== licencia.bomberoId) {
        return res.status(403).json({ mensaje: 'No tienes permiso para cancelar esta licencia' });
      }
    }
    
    // Cambiar estado a Cancelada en lugar de eliminar
    const licenciaCancelada = await prisma.licencia.update({
      where: { id },
      data: { estado: 'Cancelada' },
    });
    
    res.json({ mensaje: 'Licencia cancelada exitosamente', licencia: licenciaCancelada });
  } catch (error) {
    console.error('Error al cancelar licencia:', error);
    res.status(500).json({ mensaje: 'Error al cancelar licencia' });
  }
});

/**
 * POST /api/licencias/:id/aprobar
 * Aprobar una licencia (solo admin)
 */
router.post('/:id/aprobar', authenticateToken, async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user.rol !== 'Administrador') {
      return res.status(403).json({ mensaje: 'No tienes permiso para aprobar licencias' });
    }
    
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ mensaje: 'ID de licencia inválido' });
    }
    
    const { error, value } = aprobarRechazarSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    // Verificar que la licencia existe
    const licencia = await prisma.licencia.findUnique({
      where: { id },
    });
    
    if (!licencia) {
      return res.status(404).json({ mensaje: 'Licencia no encontrada' });
    }
    
    if (licencia.estado !== 'Pendiente') {
      return res.status(400).json({ mensaje: 'Solo se pueden aprobar licencias pendientes' });
    }
    
    // Aprobar la licencia
    const licenciaAprobada = await prisma.licencia.update({
      where: { id },
      data: {
        estado: 'Aprobada',
        revisadoPorId: req.user.id,
        fechaRevision: new Date(),
        observacionesAdmin: value.observacionesAdmin || null,
      },
      include: {
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            
          },
        },
        tipoLicencia: {
          select: {
            id: true,
            nombre: true,
          },
        },
        revisadoPor: {
          select: {
            id: true,
            nombre: true,
            
          },
        },
      },
    });
    
    // Actualizar estado del bombero si la licencia está activa
    await actualizarEstadoBombero(licencia.bomberoId);
    
    res.json(licenciaAprobada);
  } catch (error) {
    console.error('Error al aprobar licencia:', error);
    res.status(500).json({ mensaje: 'Error al aprobar licencia' });
  }
});

/**
 * POST /api/licencias/:id/rechazar
 * Rechazar una licencia (solo admin)
 */
router.post('/:id/rechazar', authenticateToken, async (req, res) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user.rol !== 'Administrador') {
      return res.status(403).json({ mensaje: 'No tienes permiso para rechazar licencias' });
    }
    
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ mensaje: 'ID de licencia inválido' });
    }
    
    const { error, value } = aprobarRechazarSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    // Verificar que la licencia existe
    const licencia = await prisma.licencia.findUnique({
      where: { id },
    });
    
    if (!licencia) {
      return res.status(404).json({ mensaje: 'Licencia no encontrada' });
    }
    
    if (licencia.estado !== 'Pendiente') {
      return res.status(400).json({ mensaje: 'Solo se pueden rechazar licencias pendientes' });
    }
    
    // Rechazar la licencia
    const licenciaRechazada = await prisma.licencia.update({
      where: { id },
      data: {
        estado: 'Rechazada',
        revisadoPorId: req.user.id,
        fechaRevision: new Date(),
        observacionesAdmin: value.observacionesAdmin || null,
      },
      include: {
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            
          },
        },
        tipoLicencia: {
          select: {
            id: true,
            nombre: true,
          },
        },
        revisadoPor: {
          select: {
            id: true,
            nombre: true,
            
          },
        },
      },
    });
    
    res.json(licenciaRechazada);
  } catch (error) {
    console.error('Error al rechazar licencia:', error);
    res.status(500).json({ mensaje: 'Error al rechazar licencia' });
  }
});

// POST /api/licencias/actualizar-estados - Actualizar estados de licencias automáticamente
router.post('/actualizar-estados', authenticateToken, async (req, res) => {
  try {
    // Solo admin puede ejecutar este endpoint
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({ 
        mensaje: 'No tienes permisos para ejecutar esta acción' 
      });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let actualizadas = 0;

    // 1. Licencias Aprobadas que ya comenzaron → Cambiar a "Activa"
    const licenciasParaActivar = await prisma.licencia.updateMany({
      where: {
        estado: 'Aprobada',
        fechaInicio: {
          lte: hoy
        }
      },
      data: {
        estado: 'Activa'
      }
    });
    actualizadas += licenciasParaActivar.count;

    // 2. Licencias Activas que ya terminaron → Cambiar a "Finalizada"
    const licenciasParaFinalizar = await prisma.licencia.updateMany({
      where: {
        estado: 'Activa',
        fechaFin: {
          lt: hoy
        }
      },
      data: {
        estado: 'Finalizada'
      }
    });
    actualizadas += licenciasParaFinalizar.count;

    res.json({
      success: true,
      mensaje: `Se actualizaron ${actualizadas} licencias`,
      detalles: {
        activadas: licenciasParaActivar.count,
        finalizadas: licenciasParaFinalizar.count
      }
    });

  } catch (error) {
    console.error('Error al actualizar estados de licencias:', error);
    res.status(500).json({ mensaje: 'Error al actualizar estados de licencias' });
  }
});

export default router;
