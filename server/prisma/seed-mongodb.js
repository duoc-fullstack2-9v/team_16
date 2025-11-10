import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Nombres chilenos comunes
const nombresHombres = [
  'Juan', 'Pedro', 'Carlos', 'Luis', 'Diego', 'Miguel', 'Jorge', 'Roberto', 'Francisco', 'Andrés',
  'Felipe', 'Sebastián', 'Nicolás', 'Matías', 'Ricardo', 'Fernando', 'Héctor', 'Alejandro', 'Pablo', 'Cristian',
  'Rodrigo', 'Manuel', 'Gonzalo', 'Javier', 'Eduardo', 'Sergio', 'Raúl', 'Mauricio', 'Claudio', 'Patricio',
  'Daniel', 'Gabriel', 'Ignacio', 'José', 'Tomás', 'Víctor', 'Rafael', 'Marcelo', 'Arturo', 'Ernesto'
]

const nombresMujeres = [
  'María', 'Ana', 'Carmen', 'Patricia', 'Isabel', 'Rosa', 'Laura', 'Claudia', 'Verónica', 'Andrea',
  'Carolina', 'Daniela', 'Francisca', 'Valentina', 'Gabriela', 'Camila', 'Sofía', 'Paula', 'Alejandra', 'Mónica',
  'Beatriz', 'Constanza', 'Natalia', 'Margarita', 'Lorena', 'Pilar', 'Marcela', 'Soledad', 'Cristina', 'Elena'
]

const apellidos = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda',
  'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela',
  'Castillo', 'Núñez', 'Tapia', 'Reyes', 'Gutiérrez', 'Ramírez', 'Castro', 'Vargas', 'Álvarez', 'Garrido',
  'Vega', 'Ortiz', 'Sánchez', 'Cárdenas', 'Jiménez', 'Navarro', 'Parra', 'Méndez', 'Campos', 'Bravo',
  'Vera', 'Molina', 'Valdés', 'Riquelme', 'Medina', 'Cortés', 'Aguilar', 'Figueroa', 'Herrera', 'Lagos'
]

// Estados: 85% Activo, 10% Licencia, 5% Inactivo
const estadosPool = [
  ...Array(85).fill('Activo'),
  ...Array(10).fill('Licencia'),
  ...Array(5).fill('Inactivo')
]

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

const generarTelefono = (index) => {
  const prefijos = ['9', '8', '7', '6']
  const prefijo = randomElement(prefijos)
  const numero = String(1000 + index).padStart(4, '0')
  const sufijo = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `+56 ${prefijo} ${numero} ${sufijo}`
}

const generarEmail = (nombres, apellidos, index) => {
  const nombre = nombres.toLowerCase().split(' ')[0]
  const apellido = apellidos.toLowerCase().split(' ')[0]
  return `${nombre}.${apellido}${index}@bomberos.cl`
}

const obtenerFoto = (index) => {
  const fotoNum = ((index - 1) % 8) + 1
  return `/assets/bomberos/bombero-${fotoNum}.jpg`
}

const shuffle = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function main() {
  console.log('🌱 Iniciando seeders con 100 bomberos para MongoDB...')

  // Limpiar datos existentes
  console.log('🧹 Limpiando base de datos...')
  await prisma.plantillaDiaBombero.deleteMany()
  await prisma.plantillaDia.deleteMany()
  await prisma.plantillaGuardia.deleteMany()
  await prisma.guardiaDiaBombero.deleteMany()
  await prisma.guardiaDia.deleteMany()
  await prisma.guardiaMensual.deleteMany()
  await prisma.historialCajonera.deleteMany()
  await prisma.historialCarro.deleteMany()
  await prisma.mantencionCarro.deleteMany()
  await prisma.conductorHabilitado.deleteMany()
  await prisma.asignacionMaterial.deleteMany()
  await prisma.cajonera.deleteMany()
  await prisma.carro.deleteMany()
  await prisma.material.deleteMany()
  // Borrar categorías en dos pasos: primero las que tienen parent (subcategorías)
  await prisma.categoria.deleteMany({ where: { parentId: { not: null } } })
  // Luego las categorías principales
  await prisma.categoria.deleteMany()
  await prisma.asignacionCargo.deleteMany()
  await prisma.cargo.deleteMany()
  await prisma.bomberoCitacion.deleteMany()
  await prisma.citacion.deleteMany()
  await prisma.bombero.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('✅ Base de datos limpiada')

  // ==================== USUARIOS ====================
  console.log('👥 Creando usuarios del sistema...')
  
  const adminPassword = await bcrypt.hash('1234', 12)
  const userPassword = await bcrypt.hash('bomb345', 12)

  const admin = await prisma.user.create({
    data: {
      email: 'admin',
      password: adminPassword,
      nombre: 'Administrador del Sistema',
      rol: 'Comandante',
      tipo: 'admin'
    }
  })

  const usuario = await prisma.user.create({
    data: {
      email: 'bombero@bomberos.cl',
      password: userPassword,
      nombre: 'Usuario Bombero',
      rol: 'Bombero',
      tipo: 'usuario'
    }
  })

  console.log(`✅ Usuarios creados: ${admin.nombre}, ${usuario.nombre}`)

  // ==================== 100 BOMBEROS ====================
  console.log('🚒 Creando 100 bomberos...')
  
  const estadosMezclados = shuffle(estadosPool)
  const bomberos = []
  
  for (let i = 1; i <= 100; i++) {
    const esHombre = i <= 60
    const nombres = esHombre ? randomElement(nombresHombres) : randomElement(nombresMujeres)
    const apellidoPaterno = randomElement(apellidos)
    const apellidoMaterno = randomElement(apellidos)
    const apellidosCompletos = `${apellidoPaterno} ${apellidoMaterno}`
    
    const bomberoData = {
      nombres,
      apellidos: apellidosCompletos,
      rango: 'Bombero',
      especialidad: null,
      estado: estadosMezclados[i - 1],
      telefono: generarTelefono(i),
      email: generarEmail(nombres, apellidosCompletos, i),
      direccion: null,
      fechaIngreso: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      fotoUrl: obtenerFoto(i),
      createdById: admin.id // Ahora es ObjectId (String)
    }
    
    const bombero = await prisma.bombero.create({ data: bomberoData })
    bomberos.push(bombero)
    
    if (i % 10 === 0) {
      console.log(`   ✓ ${i} bomberos creados...`)
    }
  }
  
  console.log(`✅ 100 bomberos creados exitosamente`)

  // ==================== CITACIONES ====================
  console.log('📅 Creando citaciones...')
  
  const citacionesData = [
    // 1. Reunión Mensual Ordinaria (pasada - se convertirá en Realizada)
    {
      titulo: 'Reunión Mensual Ordinaria',
      fecha: new Date('2025-09-30T19:00:00'),
      hora: '19:00',
      lugar: 'Cuartel Segunda Compañía',
      motivo: 'Reunión mensual ordinaria para revisar actividades y planificación del próximo mes',
      estado: 'Programada',
      createdById: admin.id
    },

    // 2. Reunión Extraordinaria (próxima)
    {
      titulo: 'Reunión Extraordinaria',
      fecha: new Date('2025-10-15T20:00:00'),
      hora: '20:00',
      lugar: 'Cuartel Segunda Compañía',
      motivo: 'Reunión extraordinaria para tratar asuntos urgentes relacionados con la adquisición de nuevo equipamiento y modificaciones al protocolo de emergencias',
      estado: 'Programada',
      createdById: admin.id
    },

    // 3. Academia de Rescate Vehicular
    {
      titulo: 'Academia de Rescate Vehicular',
      fecha: new Date('2025-10-20T09:00:00'),
      hora: '09:00',
      lugar: 'Patio de Maniobras - Cuartel',
      motivo: 'Capacitación teórico-práctica en técnicas de rescate vehicular, uso de equipos de corte y extracción de víctimas en accidentes de tránsito',
      estado: 'Programada',
      createdById: admin.id
    },

    // 4. Academia de Rescate con Cuerda
    {
      titulo: 'Academia de Rescate con Cuerda',
      fecha: new Date('2025-10-25T08:00:00'),
      hora: '08:00',
      lugar: 'Torre de Entrenamiento',
      motivo: 'Entrenamiento en técnicas de rescate vertical, nudos de seguridad, anclajes y descenso controlado para rescate en altura',
      estado: 'Programada',
      createdById: admin.id
    },

    // 5. Academia de Rescate Urbano
    {
      titulo: 'Academia de Rescate Urbano',
      fecha: new Date('2025-11-05T09:00:00'),
      hora: '09:00',
      lugar: 'Zona de Entrenamiento Urbano',
      motivo: 'Capacitación en técnicas de búsqueda y rescate en estructuras colapsadas, uso de herramientas de remoción de escombros y localización de víctimas',
      estado: 'Programada',
      createdById: admin.id
    },

    // 6. Academia de Ventilación en Incendios Estructurales
    {
      titulo: 'Academia de Ventilación en Incendios Estructurales',
      fecha: new Date('2025-11-10T10:00:00'),
      hora: '10:00',
      lugar: 'Casa de Humo - Centro de Entrenamiento',
      motivo: 'Entrenamiento en técnicas de ventilación positiva y negativa, control de humo y gases en incendios estructurales para mejorar condiciones de rescate',
      estado: 'Programada',
      createdById: admin.id
    },

    // 7. Academia de Incendios Forestales
    {
      titulo: 'Academia de Incendios Forestales',
      fecha: new Date('2025-11-18T08:30:00'),
      hora: '08:30',
      lugar: 'Zona Forestal - Sector El Salto',
      motivo: 'Capacitación en combate de incendios forestales, técnicas de línea de fuego, uso de herramientas forestales y coordinación con brigadas CONAF',
      estado: 'Programada',
      createdById: admin.id
    },

    // 8. Reunión de Oficiales
    {
      titulo: 'Reunión de Oficiales',
      fecha: new Date('2025-11-22T19:30:00'),
      hora: '19:30',
      lugar: 'Sala de Oficiales - Cuartel',
      motivo: 'Reunión mensual del cuerpo de oficiales para evaluar el desempeño operacional, planificar capacitaciones y coordinar actividades administrativas',
      estado: 'Programada',
      createdById: admin.id
    },

    // 9. Consejo de Disciplina - Caso 1
    {
      titulo: 'Consejo de Disciplina',
      fecha: new Date('2025-11-28T18:00:00'),
      hora: '18:00',
      lugar: 'Sala de Consejo - Cuartel',
      motivo: 'Sesión del consejo de disciplina para revisar y resolver procedimientos disciplinarios conforme al reglamento interno de la compañía',
      estado: 'Programada',
      createdById: admin.id
    },

    // 10. Consejo de Disciplina - Caso 2
    {
      titulo: 'Consejo de Disciplina',
      fecha: new Date('2025-12-05T18:00:00'),
      hora: '18:00',
      lugar: 'Sala de Consejo - Cuartel',
      motivo: 'Segunda sesión del consejo de disciplina para tratar casos pendientes y resolver apelaciones presentadas por el cuerpo activo',
      estado: 'Programada',
      createdById: admin.id
    }
  ]

  const citaciones = []
  for (const citacionData of citacionesData) {
    const citacion = await prisma.citacion.create({ data: citacionData })
    citaciones.push(citacion)
  }

  console.log(`✅ ${citaciones.length} citaciones creadas`)

  // Asignar bomberos a las citaciones de forma variada
  console.log('👥 Asignando bomberos a citaciones...')

  const asignacionesCitaciones = [
    // Reunión Ordinaria - 3 bomberos
    { bomberoId: bomberos[0].id, citacionId: citaciones[0].id },
    { bomberoId: bomberos[1].id, citacionId: citaciones[0].id },
    { bomberoId: bomberos[2].id, citacionId: citaciones[0].id },

    // Reunión Extraordinaria - 5 bomberos
    { bomberoId: bomberos[0].id, citacionId: citaciones[1].id },
    { bomberoId: bomberos[1].id, citacionId: citaciones[1].id },
    { bomberoId: bomberos[3].id, citacionId: citaciones[1].id },
    { bomberoId: bomberos[4].id, citacionId: citaciones[1].id },
    { bomberoId: bomberos[5].id, citacionId: citaciones[1].id },

    // Academia Rescate Vehicular - 6 bomberos
    { bomberoId: bomberos[0].id, citacionId: citaciones[2].id },
    { bomberoId: bomberos[1].id, citacionId: citaciones[2].id },
    { bomberoId: bomberos[2].id, citacionId: citaciones[2].id },
    { bomberoId: bomberos[6].id, citacionId: citaciones[2].id },
    { bomberoId: bomberos[7].id, citacionId: citaciones[2].id },
    { bomberoId: bomberos[8].id, citacionId: citaciones[2].id },

    // Academia Rescate con Cuerda - 4 bomberos
    { bomberoId: bomberos[2].id, citacionId: citaciones[3].id },
    { bomberoId: bomberos[3].id, citacionId: citaciones[3].id },
    { bomberoId: bomberos[4].id, citacionId: citaciones[3].id },
    { bomberoId: bomberos[9].id, citacionId: citaciones[3].id },

    // Academia Rescate Urbano - 7 bomberos
    { bomberoId: bomberos[0].id, citacionId: citaciones[4].id },
    { bomberoId: bomberos[1].id, citacionId: citaciones[4].id },
    { bomberoId: bomberos[3].id, citacionId: citaciones[4].id },
    { bomberoId: bomberos[5].id, citacionId: citaciones[4].id },
    { bomberoId: bomberos[6].id, citacionId: citaciones[4].id },
    { bomberoId: bomberos[7].id, citacionId: citaciones[4].id },
    { bomberoId: bomberos[8].id, citacionId: citaciones[4].id },

    // Academia Ventilación - 5 bomberos
    { bomberoId: bomberos[1].id, citacionId: citaciones[5].id },
    { bomberoId: bomberos[2].id, citacionId: citaciones[5].id },
    { bomberoId: bomberos[4].id, citacionId: citaciones[5].id },
    { bomberoId: bomberos[7].id, citacionId: citaciones[5].id },
    { bomberoId: bomberos[9].id, citacionId: citaciones[5].id },

    // Academia Incendios Forestales - 8 bomberos
    { bomberoId: bomberos[0].id, citacionId: citaciones[6].id },
    { bomberoId: bomberos[1].id, citacionId: citaciones[6].id },
    { bomberoId: bomberos[2].id, citacionId: citaciones[6].id },
    { bomberoId: bomberos[3].id, citacionId: citaciones[6].id },
    { bomberoId: bomberos[5].id, citacionId: citaciones[6].id },
    { bomberoId: bomberos[6].id, citacionId: citaciones[6].id },
    { bomberoId: bomberos[8].id, citacionId: citaciones[6].id },
    { bomberoId: bomberos[9].id, citacionId: citaciones[6].id },

    // Reunión de Oficiales - 4 bomberos (los de mayor rango)
    { bomberoId: bomberos[0].id, citacionId: citaciones[7].id },
    { bomberoId: bomberos[1].id, citacionId: citaciones[7].id },
    { bomberoId: bomberos[3].id, citacionId: citaciones[7].id },
    { bomberoId: bomberos[5].id, citacionId: citaciones[7].id },

    // Consejo de Disciplina 1 - 3 bomberos
    { bomberoId: bomberos[0].id, citacionId: citaciones[8].id },
    { bomberoId: bomberos[1].id, citacionId: citaciones[8].id },
    { bomberoId: bomberos[3].id, citacionId: citaciones[8].id },

    // Consejo de Disciplina 2 - 3 bomberos
    { bomberoId: bomberos[0].id, citacionId: citaciones[9].id },
    { bomberoId: bomberos[1].id, citacionId: citaciones[9].id },
    { bomberoId: bomberos[5].id, citacionId: citaciones[9].id }
  ]

  for (const asignacion of asignacionesCitaciones) {
    await prisma.bomberoCitacion.create({ data: asignacion })
  }

  console.log(`✅ ${asignacionesCitaciones.length} bomberos asignados a citaciones`)

  // ==================== CARGOS ====================
  console.log('🏛️ Creando cargos de la compañía...')
  
  const cargosData = [
    // RAMA ADMINISTRATIVA
    { nombre: 'Director', descripcion: 'Autoridad máxima de la compañía', rama: 'ADMINISTRATIVA', jerarquia: 1, maxOcupantes: 1 },
    { nombre: 'Secretario', descripcion: 'Documentación oficial y actas', rama: 'ADMINISTRATIVA', jerarquia: 2, maxOcupantes: 1 },
    { nombre: 'Tesorero', descripcion: 'Recursos financieros y presupuesto', rama: 'ADMINISTRATIVA', jerarquia: 3, maxOcupantes: 1 },
    { nombre: 'Protesorero', descripcion: 'Asistente del tesorero', rama: 'ADMINISTRATIVA', jerarquia: 4, maxOcupantes: 1 },
    
    // RAMA OPERATIVA
    { nombre: 'Superintendente', descripcion: 'Jefe operativo de la compañía', rama: 'OPERATIVA', jerarquia: 1, maxOcupantes: 1 },
    { nombre: 'Ayudante Superintendente', descripcion: 'Asistente del superintendente', rama: 'OPERATIVA', jerarquia: 2, maxOcupantes: 1 },
    { nombre: 'Capitán de Guardia', descripcion: 'Responsable de guardia nocturna', rama: 'OPERATIVA', jerarquia: 3, maxOcupantes: 2 },
    { nombre: 'Jefe de Material', descripcion: 'Encargado de material y equipamiento', rama: 'OPERATIVA', jerarquia: 4, maxOcupantes: 1 },
    { nombre: 'Jefe de Instrucción', descripcion: 'Capacitación y entrenamiento', rama: 'OPERATIVA', jerarquia: 5, maxOcupantes: 1 },
    
    // CONSEJOS
    { nombre: 'Presidente Consejo Disciplina', descripcion: 'Presidente del consejo disciplinario', rama: 'CONSEJOS', jerarquia: 1, maxOcupantes: 1 },
    { nombre: 'Consejero Disciplina', descripcion: 'Miembro del consejo disciplinario', rama: 'CONSEJOS', jerarquia: 2, maxOcupantes: 4 },
    { nombre: 'Presidente Consejo Administración', descripcion: 'Presidente del consejo administrativo', rama: 'CONSEJOS', jerarquia: 3, maxOcupantes: 1 },
    { nombre: 'Consejero Administración', descripcion: 'Miembro del consejo administrativo', rama: 'CONSEJOS', jerarquia: 4, maxOcupantes: 4 },
    { nombre: 'Consejero Vigilancia', descripcion: 'Miembro del consejo de vigilancia', rama: 'CONSEJOS', jerarquia: 5, maxOcupantes: 3 }
  ]

  const cargos = []
  for (const cargoData of cargosData) {
    const cargo = await prisma.cargo.create({ data: cargoData })
    cargos.push(cargo)
  }
  
  console.log(`✅ ${cargos.length} cargos creados`)

  // ==================== CATEGORÍAS MATERIAL MENOR ====================
  console.log('📦 Creando categorías de material...')
  
  // Categorías principales
  const categoriaEquipoProteccion = await prisma.categoria.create({
    data: { nombre: 'Equipo de Protección Personal', descripcion: 'EPP para bomberos', icono: 'Shield' }
  })

  const categoriaHerramientas = await prisma.categoria.create({
    data: { nombre: 'Herramientas', descripcion: 'Herramientas de trabajo', icono: 'Build' }
  })

  const categoriaComunicaciones = await prisma.categoria.create({
    data: { nombre: 'Comunicaciones', descripcion: 'Equipos de comunicación', icono: 'Radio' }
  })

  const categoriaPrimerosAuxilios = await prisma.categoria.create({
    data: { nombre: 'Primeros Auxilios', descripcion: 'Material médico y primeros auxilios', icono: 'MedicalServices' }
  })

  // Subcategorías de EPP
  const subCascos = await prisma.categoria.create({
    data: { nombre: 'Cascos', parentId: categoriaEquipoProteccion.id, icono: 'HardHat' }
  })

  const subGuantes = await prisma.categoria.create({
    data: { nombre: 'Guantes', parentId: categoriaEquipoProteccion.id, icono: 'BackHand' }
  })

  const subBotas = await prisma.categoria.create({
    data: { nombre: 'Botas', parentId: categoriaEquipoProteccion.id, icono: 'ShoppingBag' }
  })

  // Subcategorías de Herramientas
  const subHerramientasManuales = await prisma.categoria.create({
    data: { nombre: 'Herramientas Manuales', parentId: categoriaHerramientas.id, icono: 'Construction' }
  })

  const subHerramientasHidraulicas = await prisma.categoria.create({
    data: { nombre: 'Herramientas Hidráulicas', parentId: categoriaHerramientas.id, icono: 'Engineering' }
  })

  // Subcategorías de Comunicaciones
  const subRadios = await prisma.categoria.create({
    data: { nombre: 'Radios', parentId: categoriaComunicaciones.id, icono: 'SettingsInputAntenna' }
  })

  // Subcategorías de Primeros Auxilios
  const subBotiquines = await prisma.categoria.create({
    data: { nombre: 'Botiquines', parentId: categoriaPrimerosAuxilios.id, icono: 'LocalHospital' }
  })

  console.log('✅ 11 categorías creadas')

  // ==================== MATERIAL MENOR ====================
  console.log('🔧 Creando material menor...')

  const materialesData = [
    // Material individual (con número de serie) - Cascos
    {
      nombre: 'Casco Structura MSA',
      descripcion: 'Casco estructural MSA, certificado NFPA 1971',
      categoriaId: subCascos.id,
      estado: 'En Uso',
      tipo: 'individual',
      numeroSerie: 'CSC-001',
      fechaAdquisicion: new Date('2024-03-15'),
      ubicacionFisica: 'Cuartel - Bodega A',
      fechaMantencion: new Date('2025-12-15'),
      activo: true
    },
    {
      nombre: 'Casco Structura MSA',
      descripcion: 'Casco estructural MSA, certificado NFPA 1971',
      categoriaId: subCascos.id,
      estado: 'Disponible',
      tipo: 'individual',
      numeroSerie: 'CSC-002',
      fechaAdquisicion: new Date('2024-03-15'),
      ubicacionFisica: 'Cuartel - Bodega A',
      fechaMantencion: new Date('2025-12-15'),
      activo: true
    },
    {
      nombre: 'Casco Structura MSA',
      descripcion: 'Casco estructural MSA, certificado NFPA 1971',
      categoriaId: subCascos.id,
      estado: 'Disponible',
      tipo: 'individual',
      numeroSerie: 'CSC-003',
      fechaAdquisicion: new Date('2024-03-15'),
      ubicacionFisica: 'Cuartel - Bodega A',
      fechaMantencion: new Date('2025-12-15'),
      activo: true
    },

    // Radios
    {
      nombre: 'Radio Motorola XPR7550',
      descripcion: 'Radio portátil digital VHF/UHF',
      categoriaId: subRadios.id,
      estado: 'En Uso',
      tipo: 'individual',
      numeroSerie: 'RAD-101',
      fechaAdquisicion: new Date('2024-06-20'),
      ubicacionFisica: 'Cuartel - Sala de Comunicaciones',
      fechaMantencion: new Date('2025-11-20'),
      activo: true
    },
    {
      nombre: 'Radio Motorola XPR7550',
      descripcion: 'Radio portátil digital VHF/UHF',
      categoriaId: subRadios.id,
      estado: 'Mantenimiento',
      tipo: 'individual',
      numeroSerie: 'RAD-102',
      fechaAdquisicion: new Date('2024-06-20'),
      ubicacionFisica: 'Taller - Mantención',
      fechaMantencion: new Date('2025-11-20'),
      observaciones: 'En reparación por problema con batería',
      activo: true
    },
    {
      nombre: 'Radio Motorola XPR7550',
      descripcion: 'Radio portátil digital VHF/UHF',
      categoriaId: subRadios.id,
      estado: 'Disponible',
      tipo: 'individual',
      numeroSerie: 'RAD-103',
      fechaAdquisicion: new Date('2024-06-20'),
      ubicacionFisica: 'Cuartel - Sala de Comunicaciones',
      fechaMantencion: new Date('2025-11-20'),
      activo: true
    },

    // Herramientas Hidráulicas
    {
      nombre: 'Spreader Hidráulico Holmatro',
      descripcion: 'Separador hidráulico para rescate vehicular',
      categoriaId: subHerramientasHidraulicas.id,
      estado: 'Disponible',
      tipo: 'individual',
      numeroSerie: 'SPR-HID-001',
      fechaAdquisicion: new Date('2023-11-10'),
      ubicacionFisica: 'Maquina 21',
      fechaMantencion: new Date('2025-10-20'),
      observaciones: 'Próximo a mantención programada',
      activo: true
    },
    {
      nombre: 'Spreader Hidráulico Holmatro',
      descripcion: 'Separador hidráulico para rescate vehicular',
      categoriaId: subHerramientasHidraulicas.id,
      estado: 'En Uso',
      tipo: 'individual',
      numeroSerie: 'SPR-HID-002',
      fechaAdquisicion: new Date('2023-11-10'),
      ubicacionFisica: 'Maquina 21',
      fechaMantencion: new Date('2025-10-20'),
      activo: true
    },

    // Material por cantidad - Guantes
    {
      nombre: 'Guantes Structura Dragonfire',
      descripcion: 'Guantes de protección estructural, resistentes al calor',
      categoriaId: subGuantes.id,
      estado: 'Disponible',
      tipo: 'cantidad',
      cantidad: 25,
      unidadMedida: 'pares',
      fechaAdquisicion: new Date('2024-08-10'),
      ubicacionFisica: 'Cuartel - Bodega A',
      activo: true
    },

    // Botas
    {
      nombre: 'Botas Structura Globe',
      descripcion: 'Botas de seguridad estructural, certificadas',
      categoriaId: subBotas.id,
      estado: 'Disponible',
      tipo: 'cantidad',
      cantidad: 18,
      unidadMedida: 'pares',
      fechaAdquisicion: new Date('2024-07-05'),
      ubicacionFisica: 'Cuartel - Bodega B',
      activo: true
    },

    // Botiquines
    {
      nombre: 'Vendas Elásticas',
      descripcion: 'Vendas elásticas para primeros auxilios',
      categoriaId: subBotiquines.id,
      estado: 'Disponible',
      tipo: 'cantidad',
      cantidad: 50,
      unidadMedida: 'unidades',
      fechaAdquisicion: new Date('2024-09-12'),
      ubicacionFisica: 'Cuartel - Enfermería',
      fechaVencimiento: new Date('2026-09-12'),
      activo: true
    },
    {
      nombre: 'Suero Fisiológico 500ml',
      descripcion: 'Solución salina estéril para lavado',
      categoriaId: subBotiquines.id,
      estado: 'Disponible',
      tipo: 'cantidad',
      cantidad: 30,
      unidadMedida: 'unidades',
      fechaAdquisicion: new Date('2024-05-20'),
      ubicacionFisica: 'Cuartel - Enfermería',
      fechaVencimiento: new Date('2025-11-20'),
      observaciones: 'Revisar vencimiento próximamente',
      activo: true
    },

    // Herramientas Manuales
    {
      nombre: 'Hacha Forestral',
      descripcion: 'Hacha de mano para combate de incendios forestales',
      categoriaId: subHerramientasManuales.id,
      estado: 'Disponible',
      tipo: 'cantidad',
      cantidad: 8,
      unidadMedida: 'unidades',
      fechaAdquisicion: new Date('2023-12-01'),
      ubicacionFisica: 'Cuartel - Bodega C',
      fechaMantencion: new Date('2025-11-01'),
      activo: true
    }
  ]

  const materiales = []
  for (const materialData of materialesData) {
    const material = await prisma.material.create({ data: materialData })
    materiales.push(material)
  }

  console.log(`✅ ${materiales.length} materiales creados`)

  // ==================== CARROS ====================
  console.log('🚒 Creando carros de bomberos...')
  
  const carrosData = [
    {
      nombre: 'Bomba B1',
      tipo: 'Bomba',
      marca: 'Mercedes-Benz',
      modelo: 'Atego 1725',
      anioFabricacion: 2018,
      patente: 'CBVV-01',
      estadoOperativo: 'Operativo',
      capacidadAgua: 3000,
      capacidadEspuma: 300,
      potenciaMotobomba: '2000 L/min',
      capacidadMotobomba: 'Alta presión',
      caracteristicas: {
        altura_maxima: '3.5m',
        peso: '12000kg',
        tripulacion: 6
      },
      creadoPor: admin.id
    },
    {
      nombre: 'Escala E2',
      tipo: 'Escala',
      marca: 'Scania',
      modelo: 'P320',
      anioFabricacion: 2020,
      patente: 'CBVV-02',
      estadoOperativo: 'Operativo',
      capacidadCarga: '500kg en punta',
      caracteristicas: {
        altura_maxima: '30m',
        angulo_elevacion: '75°',
        tripulacion: 4
      },
      creadoPor: admin.id
    },
    {
      nombre: 'Rescate R3',
      tipo: 'Rescate',
      marca: 'Iveco',
      modelo: 'Daily 70C17',
      anioFabricacion: 2019,
      patente: 'CBVV-03',
      estadoOperativo: 'Operativo',
      capacidadCarga: '3.5 toneladas',
      caracteristicas: {
        equipamiento: 'Herramientas hidráulicas, camillas, material rescate',
        tripulacion: 5
      },
      creadoPor: admin.id
    },
    {
      nombre: 'Ambulancia A4',
      tipo: 'Ambulancia',
      marca: 'Ford',
      modelo: 'Transit',
      anioFabricacion: 2021,
      patente: 'CBVV-04',
      estadoOperativo: 'Operativo',
      caracteristicas: {
        equipamiento_medico: 'Avanzado',
        camillas: 2,
        tripulacion: 3
      },
      creadoPor: admin.id
    }
  ]

  for (const carroData of carrosData) {
    await prisma.carro.create({ data: carroData })
  }
  
  console.log('✅ 4 carros creados')

  console.log('\n🎉 Seed completado exitosamente para MongoDB!')
  console.log('📊 Resumen:')
  console.log(`   - 2 usuarios (admin, bombero)`)
  console.log(`   - 100 bomberos`)
  console.log(`   - ${citaciones.length} citaciones con ${asignacionesCitaciones.length} asignaciones`)
  console.log(`   - 14 cargos jerárquicos`)
  console.log(`   - 11 categorías de material (4 principales + 7 subcategorías)`)
  console.log(`   - ${materiales.length} materiales menores (individual y cantidad)`)
  console.log(`   - 4 carros de bomberos`)
  console.log('\n🔐 Credenciales de acceso:')
  console.log('   📊 Admin: admin / 1234')
  console.log('   👤 Usuario: bombero@bomberos.cl / bomb345')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
