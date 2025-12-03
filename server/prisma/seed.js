import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeders...')

  // Limpiar datos existentes (orden importante por relaciones)
  await prisma.historialCajonera.deleteMany()
  await prisma.historialCarro.deleteMany()
  await prisma.mantencionCarro.deleteMany()
  await prisma.conductorHabilitado.deleteMany()
  await prisma.asignacionMaterial.deleteMany()
  await prisma.cajonera.deleteMany()
  await prisma.carro.deleteMany()
  await prisma.material.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.asignacionCargo.deleteMany()
  await prisma.cargo.deleteMany()
  await prisma.bomberoCitacion.deleteMany()
  await prisma.citacion.deleteMany()
  await prisma.bombero.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('🧹 Datos existentes eliminados')

  // Crear usuarios del sistema
  const adminPassword = await bcrypt.hash('1234', 12)
  const userPassword = await bcrypt.hash('bomb345', 12)

  const admin = await prisma.user.create({
    data: {
      email: 'admin',
      password: adminPassword,
      nombre: 'Administrador',
      rol: 'Comandante',
      tipo: 'admin'
    }
  })

  const pedro = await prisma.user.create({
    data: {
      email: 'bombero@bomberos.cl',
      password: userPassword,
      nombre: 'Pedro Sánchez',
      rol: 'Bombero',
      tipo: 'usuario'
    }
  })

  console.log('👥 Usuarios creados:', { admin: admin.nombre, pedro: pedro.nombre })

  // Crear bomberos (incluyendo a Pedro)
  const bomberos = await Promise.all([
    prisma.bombero.create({
      data: {
        nombres: 'Pedro',
        apellidos: 'Sánchez',
        rango: 'Bombero',
        especialidad: 'Rescate urbano',
        telefono: '+56 9 1234 5678',
        email: 'bombero@bomberos.cl',
        fotoUrl: '/assets/bomberos/bombero-1.jpg',
        createdById: admin.id
      }
    }),
    prisma.bombero.create({
      data: {
        nombres: 'Carlos',
        apellidos: 'Mendoza',
        rango: 'Cabo',
        especialidad: 'Materiales peligrosos',
        telefono: '+56 9 2345 6789',
        fotoUrl: '/assets/bomberos/bombero-2.jpg',
        createdById: admin.id
      }
    }),
    prisma.bombero.create({
      data: {
        nombres: 'Ana',
        apellidos: 'García',
        rango: 'Sargento',
        especialidad: 'Primeros auxilios',
        telefono: '+56 9 3456 7890',
        fotoUrl: '/assets/bomberos/bombero-3.jpg',
        createdById: admin.id
      }
    }),
    prisma.bombero.create({
      data: {
        nombres: 'Miguel',
        apellidos: 'Torres',
        rango: 'Bombero',
        especialidad: 'Conductor máquina bomba',
        telefono: '+56 9 4567 8901',
        fotoUrl: '/assets/bomberos/bombero-4.jpg',
        createdById: admin.id
      }
    }),
    prisma.bombero.create({
      data: {
        nombres: 'Laura',
        apellidos: 'Vargas',
        rango: 'Teniente',
        especialidad: 'Incendios forestales',
        telefono: '+56 9 5678 9012',
        email: 'laura.vargas@bomberos.cl',
        fotoUrl: '/assets/bomberos/bombero-5.jpg',
        createdById: admin.id
      }
    }),
    prisma.bombero.create({
      data: {
        nombres: 'Roberto',
        apellidos: 'Silva',
        rango: 'Capitán',
        especialidad: 'Rescate en altura',
        telefono: '+56 9 6789 0123',
        email: 'roberto.silva@bomberos.cl',
        fotoUrl: '/assets/bomberos/bombero-6.jpg',
        createdById: admin.id
      }
    }),
    prisma.bombero.create({
      data: {
        nombres: 'Patricia',
        apellidos: 'Morales',
        rango: 'Cabo',
        especialidad: 'Comunicaciones',
        telefono: '+56 9 7890 1234',
        email: 'patricia.morales@bomberos.cl',
        fotoUrl: '/assets/bomberos/bombero-7.jpg',
        createdById: admin.id
      }
    }),
    prisma.bombero.create({
      data: {
        nombres: 'Jorge',
        apellidos: 'Ramírez',
        rango: 'Bombero',
        especialidad: 'Rescate vehicular',
        telefono: '+56 9 8901 2345',
        email: 'jorge.ramirez@bomberos.cl',
        fotoUrl: '/assets/bomberos/bombero-8.jpg',
        createdById: admin.id
      }
    }),
    prisma.bombero.create({
      data: {
        nombres: 'Isabel',
        apellidos: 'Rojas',
        rango: 'Sargento',
        especialidad: 'Prevención de riesgos',
        telefono: '+56 9 9012 3456',
        email: 'isabel.rojas@bomberos.cl',
        fotoUrl: '/assets/bomberos/bombero-5.jpg',
        estado: 'Licencia',
        createdById: admin.id
      }
    }),
    prisma.bombero.create({
      data: {
        nombres: 'Fernando',
        apellidos: 'Castillo',
        rango: 'Teniente',
        especialidad: 'Buceo y rescate acuático',
        telefono: '+56 9 0123 4567',
        email: 'fernando.castillo@bomberos.cl',
        fotoUrl: '/assets/bomberos/bombero-6.jpg',
        createdById: admin.id
      }
    })
  ])

  console.log('🚒 Bomberos creados:', bomberos.length)

  // Crear citaciones variadas
  const citaciones = await Promise.all([
    // 1. Reunión Mensual Ordinaria (pasada - se convertirá en Realizada)
    prisma.citacion.create({
      data: {
        titulo: 'Reunión Mensual Ordinaria',
        fecha: new Date('2025-09-30T19:00:00'),
        hora: '19:00',
        lugar: 'Cuartel Segunda Compañía',
        motivo: 'Reunión mensual ordinaria para revisar actividades y planificación del próximo mes',
        estado: 'Programada',
        createdById: admin.id
      }
    }),

    // 2. Reunión Extraordinaria (próxima)
    prisma.citacion.create({
      data: {
        titulo: 'Reunión Extraordinaria',
        fecha: new Date('2025-10-15T20:00:00'),
        hora: '20:00',
        lugar: 'Cuartel Segunda Compañía',
        motivo: 'Reunión extraordinaria para tratar asuntos urgentes relacionados con la adquisición de nuevo equipamiento y modificaciones al protocolo de emergencias',
        estado: 'Programada',
        createdById: admin.id
      }
    }),

    // 3. Academia de Rescate Vehicular
    prisma.citacion.create({
      data: {
        titulo: 'Academia de Rescate Vehicular',
        fecha: new Date('2025-10-20T09:00:00'),
        hora: '09:00',
        lugar: 'Patio de Maniobras - Cuartel',
        motivo: 'Capacitación teórico-práctica en técnicas de rescate vehicular, uso de equipos de corte y extracción de víctimas en accidentes de tránsito',
        estado: 'Programada',
        createdById: admin.id
      }
    }),

    // 4. Academia de Rescate con Cuerda
    prisma.citacion.create({
      data: {
        titulo: 'Academia de Rescate con Cuerda',
        fecha: new Date('2025-10-25T08:00:00'),
        hora: '08:00',
        lugar: 'Torre de Entrenamiento',
        motivo: 'Entrenamiento en técnicas de rescate vertical, nudos de seguridad, anclajes y descenso controlado para rescate en altura',
        estado: 'Programada',
        createdById: admin.id
      }
    }),

    // 5. Academia de Rescate Urbano
    prisma.citacion.create({
      data: {
        titulo: 'Academia de Rescate Urbano',
        fecha: new Date('2025-11-05T09:00:00'),
        hora: '09:00',
        lugar: 'Zona de Entrenamiento Urbano',
        motivo: 'Capacitación en técnicas de búsqueda y rescate en estructuras colapsadas, uso de herramientas de remoción de escombros y localización de víctimas',
        estado: 'Programada',
        createdById: admin.id
      }
    }),

    // 6. Academia de Ventilación en Incendios Estructurales
    prisma.citacion.create({
      data: {
        titulo: 'Academia de Ventilación en Incendios Estructurales',
        fecha: new Date('2025-11-10T10:00:00'),
        hora: '10:00',
        lugar: 'Casa de Humo - Centro de Entrenamiento',
        motivo: 'Entrenamiento en técnicas de ventilación positiva y negativa, control de humo y gases en incendios estructurales para mejorar condiciones de rescate',
        estado: 'Programada',
        createdById: admin.id
      }
    }),

    // 7. Academia de Incendios Forestales
    prisma.citacion.create({
      data: {
        titulo: 'Academia de Incendios Forestales',
        fecha: new Date('2025-11-18T08:30:00'),
        hora: '08:30',
        lugar: 'Zona Forestal - Sector El Salto',
        motivo: 'Capacitación en combate de incendios forestales, técnicas de línea de fuego, uso de herramientas forestales y coordinación con brigadas CONAF',
        estado: 'Programada',
        createdById: admin.id
      }
    }),

    // 8. Reunión de Oficiales
    prisma.citacion.create({
      data: {
        titulo: 'Reunión de Oficiales',
        fecha: new Date('2025-11-22T19:30:00'),
        hora: '19:30',
        lugar: 'Sala de Oficiales - Cuartel',
        motivo: 'Reunión mensual del cuerpo de oficiales para evaluar el desempeño operacional, planificar capacitaciones y coordinar actividades administrativas',
        estado: 'Programada',
        createdById: admin.id
      }
    }),

    // 9. Consejo de Disciplina - Caso 1
    prisma.citacion.create({
      data: {
        titulo: 'Consejo de Disciplina',
        fecha: new Date('2025-11-28T18:00:00'),
        hora: '18:00',
        lugar: 'Sala de Consejo - Cuartel',
        motivo: 'Sesión del consejo de disciplina para revisar y resolver procedimientos disciplinarios conforme al reglamento interno de la compañía',
        estado: 'Programada',
        createdById: admin.id
      }
    }),

    // 10. Consejo de Disciplina - Caso 2
    prisma.citacion.create({
      data: {
        titulo: 'Consejo de Disciplina',
        fecha: new Date('2025-12-05T18:00:00'),
        hora: '18:00',
        lugar: 'Sala de Consejo - Cuartel',
        motivo: 'Segunda sesión del consejo de disciplina para tratar casos pendientes y resolver apelaciones presentadas por el cuerpo activo',
        estado: 'Programada',
        createdById: admin.id
      }
    })
  ])

  // Asignar bomberos a las citaciones de forma variada
  await Promise.all([
    // Reunión Ordinaria - 3 bomberos
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[0].id, citacionId: citaciones[0].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[1].id, citacionId: citaciones[0].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[2].id, citacionId: citaciones[0].id }
    }),

    // Reunión Extraordinaria - 5 bomberos
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[0].id, citacionId: citaciones[1].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[1].id, citacionId: citaciones[1].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[3].id, citacionId: citaciones[1].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[4].id, citacionId: citaciones[1].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[5].id, citacionId: citaciones[1].id }
    }),

    // Academia Rescate Vehicular - 6 bomberos
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[0].id, citacionId: citaciones[2].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[1].id, citacionId: citaciones[2].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[2].id, citacionId: citaciones[2].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[6].id, citacionId: citaciones[2].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[7].id, citacionId: citaciones[2].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[8].id, citacionId: citaciones[2].id }
    }),

    // Academia Rescate con Cuerda - 4 bomberos
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[2].id, citacionId: citaciones[3].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[3].id, citacionId: citaciones[3].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[4].id, citacionId: citaciones[3].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[9].id, citacionId: citaciones[3].id }
    }),

    // Academia Rescate Urbano - 7 bomberos
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[0].id, citacionId: citaciones[4].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[1].id, citacionId: citaciones[4].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[3].id, citacionId: citaciones[4].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[5].id, citacionId: citaciones[4].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[6].id, citacionId: citaciones[4].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[7].id, citacionId: citaciones[4].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[8].id, citacionId: citaciones[4].id }
    }),

    // Academia Ventilación - 5 bomberos
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[1].id, citacionId: citaciones[5].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[2].id, citacionId: citaciones[5].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[4].id, citacionId: citaciones[5].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[7].id, citacionId: citaciones[5].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[9].id, citacionId: citaciones[5].id }
    }),

    // Academia Incendios Forestales - 8 bomberos
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[0].id, citacionId: citaciones[6].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[1].id, citacionId: citaciones[6].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[2].id, citacionId: citaciones[6].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[3].id, citacionId: citaciones[6].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[5].id, citacionId: citaciones[6].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[6].id, citacionId: citaciones[6].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[8].id, citacionId: citaciones[6].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[9].id, citacionId: citaciones[6].id }
    }),

    // Reunión de Oficiales - 4 bomberos (los de mayor rango)
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[0].id, citacionId: citaciones[7].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[1].id, citacionId: citaciones[7].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[3].id, citacionId: citaciones[7].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[5].id, citacionId: citaciones[7].id }
    }),

    // Consejo de Disciplina 1 - 3 bomberos
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[0].id, citacionId: citaciones[8].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[1].id, citacionId: citaciones[8].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[3].id, citacionId: citaciones[8].id }
    }),

    // Consejo de Disciplina 2 - 3 bomberos
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[0].id, citacionId: citaciones[9].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[1].id, citacionId: citaciones[9].id }
    }),
    prisma.bomberoCitacion.create({
      data: { bomberoId: bomberos[5].id, citacionId: citaciones[9].id }
    })
  ])

  console.log('📅 Citaciones creadas:', citaciones.length)
  console.log('📅 Bomberos asignados a citaciones')

  // Crear cargos de la compañía
  const cargos = await Promise.all([
    // RAMA ADMINISTRATIVA
    prisma.cargo.create({
      data: {
        nombre: 'Director',
        descripcion: 'Autoridad máxima de la compañía. Representa legalmente a la institución y dirige todas las operaciones.',
        rama: 'ADMINISTRATIVA',
        jerarquia: 1,
        maxOcupantes: 1,
        activo: true
      }
    }),
    prisma.cargo.create({
      data: {
        nombre: 'Secretario',
        descripcion: 'Responsable de la documentación oficial, actas y comunicaciones de la compañía.',
        rama: 'ADMINISTRATIVA',
        jerarquia: 2,
        maxOcupantes: 1,
        activo: true
      }
    }),
    prisma.cargo.create({
      data: {
        nombre: 'Tesorero',
        descripcion: 'Administra los recursos financieros, presupuesto y contabilidad de la compañía.',
        rama: 'ADMINISTRATIVA',
        jerarquia: 3,
        maxOcupantes: 1,
        activo: true
      }
    }),
    
    // RAMA OPERATIVA
    prisma.cargo.create({
      data: {
        nombre: 'Capitán',
        descripcion: 'Comandante de las operaciones de emergencia. Máxima autoridad en el terreno.',
        rama: 'OPERATIVA',
        jerarquia: 1,
        maxOcupantes: 1,
        activo: true
      }
    }),
    prisma.cargo.create({
      data: {
        nombre: 'Teniente Primero',
        descripcion: 'Segundo al mando en operaciones. Asiste al Capitán en la coordinación de emergencias.',
        rama: 'OPERATIVA',
        jerarquia: 2,
        maxOcupantes: 1,
        activo: true
      }
    }),
    prisma.cargo.create({
      data: {
        nombre: 'Teniente Segundo',
        descripcion: 'Tercer oficial en la línea de mando operativo.',
        rama: 'OPERATIVA',
        jerarquia: 3,
        maxOcupantes: 1,
        activo: true
      }
    }),
    prisma.cargo.create({
      data: {
        nombre: 'Teniente Tercero',
        descripcion: 'Cuarto oficial en la línea de mando operativo.',
        rama: 'OPERATIVA',
        jerarquia: 4,
        maxOcupantes: 1,
        activo: true
      }
    }),
    prisma.cargo.create({
      data: {
        nombre: 'Ayudante',
        descripcion: 'Asiste en las operaciones y coordina el personal en terreno.',
        rama: 'OPERATIVA',
        jerarquia: 5,
        maxOcupantes: 1,
        activo: true
      }
    }),
    
    // CONSEJOS DE DISCIPLINA
    prisma.cargo.create({
      data: {
        nombre: 'Consejero de Disciplina 1',
        descripcion: 'Miembro del consejo encargado de velar por el cumplimiento del reglamento y la disciplina.',
        rama: 'CONSEJOS',
        jerarquia: 1,
        maxOcupantes: 1,
        activo: true
      }
    }),
    prisma.cargo.create({
      data: {
        nombre: 'Consejero de Disciplina 2',
        descripcion: 'Miembro del consejo encargado de velar por el cumplimiento del reglamento y la disciplina.',
        rama: 'CONSEJOS',
        jerarquia: 2,
        maxOcupantes: 1,
        activo: true
      }
    }),
    prisma.cargo.create({
      data: {
        nombre: 'Consejero de Disciplina 3',
        descripcion: 'Miembro del consejo encargado de velar por el cumplimiento del reglamento y la disciplina.',
        rama: 'CONSEJOS',
        jerarquia: 3,
        maxOcupantes: 1,
        activo: true
      }
    }),
    prisma.cargo.create({
      data: {
        nombre: 'Consejero de Disciplina 4',
        descripcion: 'Miembro del consejo encargado de velar por el cumplimiento del reglamento y la disciplina.',
        rama: 'CONSEJOS',
        jerarquia: 4,
        maxOcupantes: 1,
        activo: true
      }
    })
  ])

  console.log('🏛️ Cargos creados:', cargos.length)

  // Crear algunas asignaciones de ejemplo (Director, Capitán y 2 Consejeros)
  const añoActual = new Date().getFullYear()
  
  await prisma.asignacionCargo.create({
    data: {
      cargoId: cargos[0].id, // Director
      bomberoId: bomberos[2].id, // Ana García (Sargento)
      fechaInicio: new Date(`${añoActual}-01-01`),
      periodoAnio: añoActual,
      activo: true,
      observaciones: 'Asignación período ' + añoActual
    }
  })

  await prisma.asignacionCargo.create({
    data: {
      cargoId: cargos[3].id, // Capitán
      bomberoId: bomberos[4].id, // Laura Vargas (Teniente)
      fechaInicio: new Date(`${añoActual}-01-01`),
      periodoAnio: añoActual,
      activo: true,
      observaciones: 'Asignación período ' + añoActual
    }
  })

  await prisma.asignacionCargo.create({
    data: {
      cargoId: cargos[8].id, // Consejero 1
      bomberoId: bomberos[1].id, // Carlos Mendoza (Cabo)
      fechaInicio: new Date(`${añoActual}-01-01`),
      periodoAnio: añoActual,
      activo: true,
      observaciones: 'Asignación período ' + añoActual
    }
  })

  await prisma.asignacionCargo.create({
    data: {
      cargoId: cargos[9].id, // Consejero 2
      bomberoId: bomberos[6].id, // Fernando Rojas (Cabo)
      fechaInicio: new Date(`${añoActual}-01-01`),
      periodoAnio: añoActual,
      activo: true,
      observaciones: 'Asignación período ' + añoActual
    }
  })

  console.log('� Asignaciones de cargos creadas: 4')
  console.log('👨‍✈️ Sistema de cargos configurado')

  // ==================== MATERIAL MENOR ====================
  
  // Crear categorías con jerarquía
  const categorias = await Promise.all([
    // Categorías principales (sin parent)
    prisma.categoria.create({
      data: {
        nombre: 'Equipos de Protección Personal',
        descripcion: 'Equipamiento de protección individual para bomberos',
        icono: 'Shield',
        activo: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Herramientas de Rescate',
        descripcion: 'Herramientas especializadas para operaciones de rescate',
        icono: 'Build',
        activo: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Equipos de Comunicación',
        descripcion: 'Dispositivos de comunicación y señalización',
        icono: 'PhoneInTalk',
        activo: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Material Médico',
        descripcion: 'Equipamiento para primeros auxilios y atención médica',
        icono: 'LocalHospital',
        activo: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Equipamiento Vehicular',
        descripcion: 'Material y accesorios para vehículos de emergencia',
        icono: 'DirectionsCar',
        activo: true
      }
    })
  ])

  // Subcategorías (con parent)
  const subcategorias = await Promise.all([
    // Subcategorías de EPP
    prisma.categoria.create({
      data: {
        nombre: 'Cascos',
        descripcion: 'Cascos de protección contra impactos',
        icono: 'Security',
        parentId: categorias[0].id,
        activo: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Guantes',
        descripcion: 'Guantes de protección térmica y mecánica',
        icono: 'PanTool',
        parentId: categorias[0].id,
        activo: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Botas',
        descripcion: 'Calzado de seguridad especializado',
        icono: 'DirectionsWalk',
        parentId: categorias[0].id,
        activo: true
      }
    }),
    
    // Subcategorías de Herramientas
    prisma.categoria.create({
      data: {
        nombre: 'Herramientas Manuales',
        descripcion: 'Herramientas de mano para rescate y corte',
        icono: 'Handyman',
        parentId: categorias[1].id,
        activo: true
      }
    }),
    prisma.categoria.create({
      data: {
        nombre: 'Herramientas Hidráulicas',
        descripcion: 'Equipos hidráulicos de rescate vehicular',
        icono: 'Settings',
        parentId: categorias[1].id,
        activo: true
      }
    }),
    
    // Subcategorías de Comunicación
    prisma.categoria.create({
      data: {
        nombre: 'Radios',
        descripcion: 'Equipos de radio comunicación',
        icono: 'Radio',
        parentId: categorias[2].id,
        activo: true
      }
    }),
    
    // Subcategorías de Material Médico
    prisma.categoria.create({
      data: {
        nombre: 'Botiquines',
        descripcion: 'Kits de primeros auxilios',
        icono: 'MedicalServices',
        parentId: categorias[3].id,
        activo: true
      }
    })
  ])

  console.log('📦 Categorías creadas:', categorias.length + subcategorias.length)

  // Crear material de ejemplo (mixto: individual y cantidad)
  const materiales = await Promise.all([
    // Material individual (con número de serie)
    prisma.material.create({
      data: {
        nombre: 'Casco Structura MSA',
        descripcion: 'Casco estructural MSA, certificado NFPA 1971',
        categoriaId: subcategorias[0].id, // Cascos
        estado: 'En Uso',
        tipo: 'individual',
        numeroSerie: 'CSC-001',
        fechaAdquisicion: new Date('2024-03-15'),
        ubicacionFisica: 'Cuartel - Bodega A',
        fechaMantencion: new Date('2025-12-15'),
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Casco Structura MSA',
        descripcion: 'Casco estructural MSA, certificado NFPA 1971',
        categoriaId: subcategorias[0].id,
        estado: 'Disponible',
        tipo: 'individual',
        numeroSerie: 'CSC-002',
        fechaAdquisicion: new Date('2024-03-15'),
        ubicacionFisica: 'Cuartel - Bodega A',
        fechaMantencion: new Date('2025-12-15'),
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Radio Motorola XPR7550',
        descripcion: 'Radio portátil digital VHF/UHF',
        categoriaId: subcategorias[5].id, // Radios
        estado: 'En Uso',
        tipo: 'individual',
        numeroSerie: 'RAD-101',
        fechaAdquisicion: new Date('2024-06-20'),
        ubicacionFisica: 'Cuartel - Sala de Comunicaciones',
        fechaMantencion: new Date('2025-11-20'),
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Radio Motorola XPR7550',
        descripcion: 'Radio portátil digital VHF/UHF',
        categoriaId: subcategorias[5].id,
        estado: 'Mantenimiento',
        tipo: 'individual',
        numeroSerie: 'RAD-102',
        fechaAdquisicion: new Date('2024-06-20'),
        ubicacionFisica: 'Taller - Mantención',
        fechaMantencion: new Date('2025-11-20'),
        observaciones: 'En reparación por problema con batería',
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Spreader Hidráulico Holmatro',
        descripcion: 'Separador hidráulico para rescate vehicular',
        categoriaId: subcategorias[4].id, // Herramientas Hidráulicas
        estado: 'Disponible',
        tipo: 'individual',
        numeroSerie: 'SPR-HID-001',
        fechaAdquisicion: new Date('2023-11-10'),
        ubicacionFisica: 'Maquina 21',
        fechaMantencion: new Date('2025-10-20'),
        observaciones: 'Próximo a mantención programada',
        activo: true
      }
    }),

    // Material por cantidad
    prisma.material.create({
      data: {
        nombre: 'Guantes Structura Dragonfire',
        descripcion: 'Guantes de protección estructural, resistentes al calor',
        categoriaId: subcategorias[1].id, // Guantes
        estado: 'Disponible',
        tipo: 'cantidad',
        cantidad: 25,
        unidadMedida: 'pares',
        fechaAdquisicion: new Date('2024-08-10'),
        ubicacionFisica: 'Cuartel - Bodega A',
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Botas Structura Globe',
        descripcion: 'Botas de seguridad estructural, certificadas',
        categoriaId: subcategorias[2].id, // Botas
        estado: 'Disponible',
        tipo: 'cantidad',
        cantidad: 18,
        unidadMedida: 'pares',
        fechaAdquisicion: new Date('2024-07-05'),
        ubicacionFisica: 'Cuartel - Bodega B',
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Vendas Elásticas',
        descripcion: 'Vendas elásticas para primeros auxilios',
        categoriaId: subcategorias[6].id, // Botiquines
        estado: 'Disponible',
        tipo: 'cantidad',
        cantidad: 50,
        unidadMedida: 'unidades',
        fechaAdquisicion: new Date('2024-09-12'),
        ubicacionFisica: 'Cuartel - Enfermería',
        fechaVencimiento: new Date('2026-09-12'),
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Suero Fisiológico 500ml',
        descripcion: 'Solución salina estéril para lavado',
        categoriaId: subcategorias[6].id,
        estado: 'Disponible',
        tipo: 'cantidad',
        cantidad: 30,
        unidadMedida: 'unidades',
        fechaAdquisicion: new Date('2024-05-20'),
        ubicacionFisica: 'Cuartel - Enfermería',
        fechaVencimiento: new Date('2025-11-20'),
        observaciones: 'Revisar vencimiento próximamente',
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Hacha Forestral',
        descripcion: 'Hacha de mano para combate de incendios forestales',
        categoriaId: subcategorias[3].id, // Herramientas Manuales
        estado: 'Disponible',
        tipo: 'cantidad',
        cantidad: 8,
        unidadMedida: 'unidades',
        fechaAdquisicion: new Date('2023-12-01'),
        ubicacionFisica: 'Cuartel - Bodega C',
        fechaMantencion: new Date('2025-11-01'),
        activo: true
      }
    })
  ])

  console.log('🔧 Material creado:', materiales.length)

  // Crear asignaciones de material (algunas activas, otras como historial)
  const asignaciones = await Promise.all([
    // Asignación activa de casco
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[0].id, // Casco CSC-001
        bomberoId: bomberos[0].id, // Pedro Sánchez
        fechaAsignacion: new Date('2024-09-01'),
        motivo: 'Asignación de EPP operativo',
        observaciones: 'Verificar estado antes de cada guardia',
        activo: true
      }
    }),

    // Asignación activa de radio
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[2].id, // Radio RAD-101
        bomberoId: bomberos[4].id, // Laura Vargas (Teniente)
        fechaAsignacion: new Date('2024-10-05'),
        motivo: 'Radio para oficial al mando',
        activo: true
      }
    }),

    // Asignación histórica (devuelta)
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[3].id, // Radio RAD-102
        bomberoId: bomberos[1].id, // Carlos Mendoza
        fechaAsignacion: new Date('2024-08-15'),
        fechaDevolucion: new Date('2024-10-01'),
        motivo: 'Radio operativa guardia',
        observaciones: 'Devuelto por falla en batería',
        activo: false
      }
    }),

    // Asignación activa de cantidad (guantes)
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[5].id, // Guantes
        bomberoId: bomberos[3].id, // Miguel Torres
        fechaAsignacion: new Date('2024-09-10'),
        cantidadAsignada: 1,
        motivo: 'EPP personal operativo',
        activo: true
      }
    }),

    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[5].id, // Guantes (otro par del mismo stock)
        bomberoId: bomberos[7].id, // Jorge Ramírez
        fechaAsignacion: new Date('2024-09-12'),
        cantidadAsignada: 1,
        motivo: 'EPP personal operativo',
        activo: true
      }
    })
  ])

  console.log('📋 Asignaciones de material creadas:', asignaciones.length)
  console.log('📦 Sistema de Material Menor configurado')

  // ============================================
  // MÓDULO: MATERIAL MAYOR (CARROS DE BOMBEROS)
  // ============================================

  console.log('')
  console.log('🚒 Creando carros de bomberos...')

  const carros = await Promise.all([
    // Carro 1 - Bomba Principal
    prisma.carro.create({
      data: {
        nombre: 'Bomba B1',
        tipo: 'Bomba',
        marca: 'Mercedes-Benz',
        modelo: 'Atego 1725',
        anioFabricacion: 2018,
        patente: 'XXXX-11',
        estadoOperativo: 'Operativo',
        capacidadAgua: 3000, // litros
        capacidadEspuma: 200,
        potenciaMotobomba: '500 GPM',
        capacidadMotobomba: '2000 L/min a 10 bar',
        capacidadCarga: '6 personas',
        fechaProximaMantencion: new Date('2025-12-15'),
        fechaRevisionTecnica: new Date('2026-03-20'),
        fechaPermisoCirculacion: new Date('2025-12-31'),
        caracteristicas: {
          altura_maxima: '3.5m',
          peso: '12000kg',
          largo: '8.5m',
          ancho: '2.5m',
          traccion: '4x2',
          capacidad_tanque_combustible: '200L'
        },
        observaciones: 'Carro principal para incendios estructurales y forestales',
        creadoPor: admin.id
      }
    }),

    // Carro 2 - Escala Mecánica
    prisma.carro.create({
      data: {
        nombre: 'Escala E1',
        tipo: 'Escala',
        marca: 'Scania',
        modelo: 'P 320',
        anioFabricacion: 2016,
        patente: 'YYYY-22',
        estadoOperativo: 'Operativo',
        capacidadAgua: 1500,
        capacidadEspuma: 100,
        potenciaMotobomba: '300 GPM',
        capacidadMotobomba: '1200 L/min',
        capacidadCarga: '4 personas',
        fechaProximaMantencion: new Date('2026-01-10'),
        fechaRevisionTecnica: new Date('2026-02-15'),
        fechaPermisoCirculacion: new Date('2025-11-30'),
        caracteristicas: {
          altura_maxima_escala: '30m',
          peso: '15000kg',
          largo: '10m',
          ancho: '2.5m',
          traccion: '4x2',
          capacidad_cesta: '2 personas - 250kg'
        },
        observaciones: 'Escala mecánica para rescates en altura',
        creadoPor: admin.id
      }
    }),

    // Carro 3 - Rescate Vehicular
    prisma.carro.create({
      data: {
        nombre: 'Rescate R1',
        tipo: 'Rescate',
        marca: 'Iveco',
        modelo: 'Daily 70C17',
        anioFabricacion: 2020,
        patente: 'ZZZZ-33',
        estadoOperativo: 'Mantenimiento',
        capacidadAgua: null,
        capacidadEspuma: null,
        potenciaMotobomba: null,
        capacidadMotobomba: null,
        capacidadCarga: '5 personas + equipo',
        fechaProximaMantencion: new Date('2025-10-20'),
        fechaRevisionTecnica: new Date('2026-04-10'),
        fechaPermisoCirculacion: new Date('2025-12-15'),
        caracteristicas: {
          peso: '7000kg',
          largo: '6.5m',
          ancho: '2.2m',
          traccion: '4x2',
          equipamiento: 'Herramientas hidráulicas, extricación vehicular'
        },
        observaciones: 'En mantenimiento preventivo programado. Vuelve a servicio el 18/10/2025',
        creadoPor: admin.id
      }
    }),

    // Carro 4 - Ambulancia
    prisma.carro.create({
      data: {
        nombre: 'Ambulancia A1',
        tipo: 'Ambulancia',
        marca: 'Renault',
        modelo: 'Master',
        anioFabricacion: 2019,
        patente: 'AAAA-44',
        estadoOperativo: 'Operativo',
        capacidadAgua: null,
        capacidadEspuma: null,
        potenciaMotobomba: null,
        capacidadMotobomba: null,
        capacidadCarga: '2 camillados + 3 acompañantes',
        fechaProximaMantencion: new Date('2025-11-05'),
        fechaRevisionTecnica: new Date('2026-01-20'),
        fechaPermisoCirculacion: new Date('2025-12-31'),
        caracteristicas: {
          peso: '3500kg',
          largo: '5.5m',
          ancho: '2m',
          equipamiento_medico: 'Completo',
          categoria: 'Tipo B - Soporte Vital Básico'
        },
        observaciones: 'Ambulancia equipada para emergencias médicas',
        creadoPor: admin.id
      }
    })
  ])

  console.log('🚒 Carros creados:', carros.map(c => c.nombre).join(', '))

  // Crear cajoneras para los carros
  console.log('📦 Creando cajoneras...')

  const cajoneras = await Promise.all([
    // Cajoneras para Bomba B1
    prisma.cajonera.create({
      data: {
        carroId: carros[0].id,
        nombre: 'Cajonera 1 - Mangueras',
        estado: 'Operativa',
        posicion: 1,
        observaciones: 'Contiene mangueras de 45mm y 70mm'
      }
    }),
    prisma.cajonera.create({
      data: {
        carroId: carros[0].id,
        nombre: 'Cajonera 2 - Herramientas de Corte',
        estado: 'Operativa',
        posicion: 2,
        observaciones: 'Herramientas de corte y extricación'
      }
    }),
    prisma.cajonera.create({
      data: {
        carroId: carros[0].id,
        nombre: 'Cajonera 3 - EPP',
        estado: 'Operativa',
        posicion: 3,
        observaciones: 'Equipos de protección personal adicionales'
      }
    }),

    // Cajoneras para Escala E1
    prisma.cajonera.create({
      data: {
        carroId: carros[1].id,
        nombre: 'Compartimento Lateral Izquierdo',
        estado: 'Operativa',
        posicion: 1,
        observaciones: 'Equipos de rescate en altura'
      }
    }),
    prisma.cajonera.create({
      data: {
        carroId: carros[1].id,
        nombre: 'Compartimento Lateral Derecho',
        estado: 'Operativa',
        posicion: 2
      }
    }),

    // Cajoneras para Rescate R1
    prisma.cajonera.create({
      data: {
        carroId: carros[2].id,
        nombre: 'Cajonera Principal',
        estado: 'Operativa',
        posicion: 1,
        observaciones: 'Herramientas hidráulicas de rescate'
      }
    }),
    prisma.cajonera.create({
      data: {
        carroId: carros[2].id,
        nombre: 'Cajonera Secundaria',
        estado: 'Dañada',
        posicion: 2,
        observaciones: 'Cerradura dañada, requiere reparación'
      }
    }),

    // Cajoneras para Ambulancia A1
    prisma.cajonera.create({
      data: {
        carroId: carros[3].id,
        nombre: 'Compartimento de Medicamentos',
        estado: 'Operativa',
        posicion: 1,
        observaciones: 'Medicamentos de emergencia'
      }
    }),
    prisma.cajonera.create({
      data: {
        carroId: carros[3].id,
        nombre: 'Compartimento de Equipos',
        estado: 'Operativa',
        posicion: 2,
        observaciones: 'Monitor de signos vitales, desfibrilador'
      }
    })
  ])

  console.log('📦 Cajoneras creadas:', cajoneras.length)

  // Asignar conductores habilitados
  console.log('👨‍✈️ Asignando conductores habilitados...')

  const conductores = await Promise.all([
    // Comandante puede conducir Bomba B1 y Escala E1
    prisma.conductorHabilitado.create({
      data: {
        carroId: carros[0].id,
        bomberoId: bomberos[0].id, // Carlos Muñoz (Comandante)
        fechaDesde: new Date('2024-01-01'),
        observaciones: 'Conductor principal de Bomba B1'
      }
    }),
    prisma.conductorHabilitado.create({
      data: {
        carroId: carros[1].id,
        bomberoId: bomberos[0].id, // Carlos Muñoz
        fechaDesde: new Date('2024-01-01'),
        observaciones: 'Habilitado para escala mecánica'
      }
    }),

    // Capitán puede conducir todos excepto ambulancia
    prisma.conductorHabilitado.create({
      data: {
        carroId: carros[0].id,
        bomberoId: bomberos[1].id, // Pedro Sánchez (Capitán)
        fechaDesde: new Date('2024-01-15')
      }
    }),
    prisma.conductorHabilitado.create({
      data: {
        carroId: carros[1].id,
        bomberoId: bomberos[1].id,
        fechaDesde: new Date('2024-02-01')
      }
    }),
    prisma.conductorHabilitado.create({
      data: {
        carroId: carros[2].id,
        bomberoId: bomberos[1].id,
        fechaDesde: new Date('2024-01-15')
      }
    }),

    // Teniente conduce Rescate y Ambulancia
    prisma.conductorHabilitado.create({
      data: {
        carroId: carros[2].id,
        bomberoId: bomberos[2].id, // Luis González (Teniente)
        fechaDesde: new Date('2024-03-01'),
        observaciones: 'Especialista en rescate vehicular'
      }
    }),
    prisma.conductorHabilitado.create({
      data: {
        carroId: carros[3].id,
        bomberoId: bomberos[2].id,
        fechaDesde: new Date('2024-03-01'),
        observaciones: 'Paramédico certificado'
      }
    }),

    // Sargento conduce ambulancia
    prisma.conductorHabilitado.create({
      data: {
        carroId: carros[3].id,
        bomberoId: bomberos[3].id, // Miguel Torres (Sargento)
        fechaDesde: new Date('2024-04-01'),
        observaciones: 'Técnico en urgencias médicas'
      }
    })
  ])

  console.log('👨‍✈️ Conductores habilitados asignados:', conductores.length)

  // Crear mantenciones
  console.log('🔧 Registrando mantenciones...')

  const mantenciones = await Promise.all([
    // Mantenciones Bomba B1
    prisma.mantencionCarro.create({
      data: {
        carroId: carros[0].id,
        tipo: 'Mecánica',
        descripcion: 'Cambio de aceite, filtros y revisión general del motor',
        fechaRealizada: new Date('2025-06-15'),
        proximaFecha: new Date('2025-12-15'),
        costo: 450000,
        realizadoPor: 'Taller Mercedes-Benz Oficial',
        observaciones: 'Mantenimiento preventivo programado cumplido'
      }
    }),
    prisma.mantencionCarro.create({
      data: {
        carroId: carros[0].id,
        tipo: 'Revisión Técnica',
        descripcion: 'Revisión técnica anual obligatoria',
        fechaRealizada: new Date('2025-03-20'),
        proximaFecha: new Date('2026-03-20'),
        costo: 35000,
        realizadoPor: 'Planta Revisora Técnica Sur',
        observaciones: 'Aprobada sin observaciones'
      }
    }),

    // Mantenciones Escala E1
    prisma.mantencionCarro.create({
      data: {
        carroId: carros[1].id,
        tipo: 'Preventiva',
        descripcion: 'Revisión sistema hidráulico de escala mecánica',
        fechaRealizada: new Date('2025-07-10'),
        proximaFecha: new Date('2026-01-10'),
        costo: 850000,
        realizadoPor: 'Scania Service Center',
        observaciones: 'Sistema hidráulico en perfecto estado'
      }
    }),

    // Mantenciones Rescate R1
    prisma.mantencionCarro.create({
      data: {
        carroId: carros[2].id,
        tipo: 'Correctiva',
        descripcion: 'Reparación sistema de frenos y reemplazo de neumáticos',
        fechaRealizada: new Date('2025-09-28'),
        proximaFecha: new Date('2026-03-28'),
        costo: 680000,
        realizadoPor: 'Taller Iveco Autorizado',
        observaciones: 'Carro en mantenimiento hasta el 18/10/2025'
      }
    }),

    // Mantenciones Ambulancia A1
    prisma.mantencionCarro.create({
      data: {
        carroId: carros[3].id,
        tipo: 'Mecánica',
        descripcion: 'Servicio de mantención 10.000 km',
        fechaRealizada: new Date('2025-05-05'),
        proximaFecha: new Date('2025-11-05'),
        costo: 280000,
        realizadoPor: 'Renault Service',
        observaciones: 'Próximo a vencer'
      }
    })
  ])

  console.log('🔧 Mantenciones registradas:', mantenciones.length)

  // Asignar material menor a carros (usando materiales ya creados)
  console.log('🔗 Asignando material menor a carros...')

  const asignacionesCarros = await Promise.all([
    // Asignar hacha a Bomba B1 en cajonera 2
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[0].id, // Hacha
        carroId: carros[0].id,
        cajoneraId: cajoneras[1].id, // Cajonera 2 - Herramientas de Corte
        fechaAsignacion: new Date('2024-01-15'),
        motivo: 'Equipo de corte de emergencia',
        activo: true
      }
    }),

    // Asignar casco a Bomba B1 directamente (sin cajonera)
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[1].id, // Casco
        carroId: carros[0].id,
        cajoneraId: null, // Sin cajonera específica
        fechaAsignacion: new Date('2024-01-15'),
        motivo: 'EPP adicional de emergencia',
        activo: true
      }
    }),

    // Asignar manguera a Bomba B1 en cajonera 1
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[2].id, // Manguera
        carroId: carros[0].id,
        cajoneraId: cajoneras[0].id, // Cajonera 1 - Mangueras
        fechaAsignacion: new Date('2024-01-15'),
        motivo: 'Equipamiento principal contraincendios',
        activo: true
      }
    }),

    // Asignar extintor a Escala E1
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[3].id, // Extintor
        carroId: carros[1].id,
        cajoneraId: cajoneras[3].id, // Compartimento Lateral Izquierdo
        fechaAsignacion: new Date('2024-02-01'),
        motivo: 'Equipamiento de seguridad',
        activo: true
      }
    }),

    // Asignar mascarilla a Ambulancia en cajonera de equipos
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[4].id, // Mascarilla
        carroId: carros[3].id,
        cajoneraId: cajoneras[8].id, // Compartimento de Equipos
        fechaAsignacion: new Date('2024-03-01'),
        motivo: 'EPP médico',
        activo: true
      }
    }),

    // Asignar cantidad de guantes a Bomba B1
    prisma.asignacionMaterial.create({
      data: {
        materialId: materiales[5].id, // Guantes (tipo cantidad)
        carroId: carros[0].id,
        cajoneraId: cajoneras[2].id, // Cajonera 3 - EPP
        cantidadAsignada: 10,
        fechaAsignacion: new Date('2024-01-20'),
        motivo: 'Stock de guantes para la tripulación',
        activo: true
      }
    })
  ])

  console.log('🔗 Material menor asignado a carros:', asignacionesCarros.length)

  // Crear historial de carros
  console.log('📚 Registrando historial de carros...')

  const historialCarros = await Promise.all([
    prisma.historialCarro.create({
      data: {
        carroId: carros[0].id,
        tipo: 'CREACION',
        descripcion: 'Carro Bomba B1 creado en el sistema',
        usuarioId: admin.id
      }
    }),
    prisma.historialCarro.create({
      data: {
        carroId: carros[2].id,
        tipo: 'CAMBIO_ESTADO',
        descripcion: 'Carro R1 cambió de estado Operativo a Mantenimiento',
        cambios: {
          estadoAnterior: 'Operativo',
          estadoNuevo: 'Mantenimiento',
          motivo: 'Mantenimiento correctivo de frenos'
        },
        usuarioId: admin.id
      }
    }),
    prisma.historialCarro.create({
      data: {
        carroId: carros[0].id,
        tipo: 'ASIGNACION_MATERIAL',
        descripcion: 'Se asignaron 6 materiales menores al carro',
        usuarioId: admin.id
      }
    })
  ])

  console.log('📚 Historial de carros registrado:', historialCarros.length)
  console.log('🚒 Sistema de Material Mayor configurado')

  console.log('')
  console.log('✅ Seeders completados exitosamente!')
  console.log('')
  console.log('🔐 Credenciales de prueba:')
  console.log('📊 Admin: admin / 1234')
  console.log('👤 Usuario: bombero@bomberos.cl / bomb345')
  console.log('')
  console.log('📊 Datos creados:')
  console.log(`  - ${carros.length} carros de bomberos`)
  console.log(`  - ${cajoneras.length} cajoneras`)
  console.log(`  - ${conductores.length} conductores habilitados`)
  console.log(`  - ${mantenciones.length} mantenciones registradas`)
  console.log(`  - ${asignacionesCarros.length} materiales asignados a carros`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seeders:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })