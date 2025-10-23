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

// Función para obtener un elemento aleatorio de un array
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

// Función para generar teléfono chileno
const generarTelefono = (index) => {
  const prefijos = ['9', '8', '7', '6']
  const prefijo = randomElement(prefijos)
  const numero = String(1000 + index).padStart(4, '0')
  const sufijo = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `+56 ${prefijo} ${numero} ${sufijo}`
}

// Función para generar email
const generarEmail = (nombres, apellidos, index) => {
  const nombre = nombres.toLowerCase().split(' ')[0]
  const apellido = apellidos.toLowerCase().split(' ')[0]
  return `${nombre}.${apellido}${index}@bomberos.cl`
}

// Función para obtener foto cíclica (1-8)
const obtenerFoto = (index) => {
  const fotoNum = ((index - 1) % 8) + 1
  return `/assets/bomberos/bombero-${fotoNum}.jpg`
}

// Función para mezclar array (shuffle)
const shuffle = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function main() {
  console.log('🌱 Iniciando seeders con 100 bomberos...')

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
  
  // Mezclar estados para distribución aleatoria
  const estadosMezclados = shuffle(estadosPool)
  
  const bomberos = []
  
  // Crear 100 bomberos (60% hombres, 40% mujeres aproximadamente)
  for (let i = 1; i <= 100; i++) {
    const esHombre = i <= 60
    const nombres = esHombre ? randomElement(nombresHombres) : randomElement(nombresMujeres)
    const apellidoPaterno = randomElement(apellidos)
    const apellidoMaterno = randomElement(apellidos)
    const apellidosCompletos = `${apellidoPaterno} ${apellidoMaterno}`
    
    const bomberoData = {
      nombres,
      apellidos: apellidosCompletos,
      rango: 'Bombero', // Todos con rango base
      especialidad: null, // Sin especialidades
      estado: estadosMezclados[i - 1], // Estado aleatorio según distribución
      telefono: generarTelefono(i),
      email: generarEmail(nombres, apellidosCompletos, i),
      direccion: null,
      fechaIngreso: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      fotoUrl: obtenerFoto(i),
      createdById: admin.id
    }
    
    const bombero = await prisma.bombero.create({ data: bomberoData })
    bomberos.push(bombero)
    
    if (i % 10 === 0) {
      console.log(`   ✓ ${i} bomberos creados...`)
    }
  }
  
  console.log(`✅ 100 bomberos creados exitosamente`)
  console.log(`   📊 Estados: ${estadosMezclados.filter(e => e === 'Activo').length} Activos, ${estadosMezclados.filter(e => e === 'Licencia').length} Licencia, ${estadosMezclados.filter(e => e === 'Inactivo').length} Inactivos`)

  // ==================== CARGOS ====================
  console.log('🏛️ Creando cargos de la compañía...')
  
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

  // ==================== CITACIONES ====================
  console.log('📋 Creando citaciones de ejemplo...')
  
  const citaciones = await Promise.all([
    prisma.citacion.create({
      data: {
        titulo: 'Reunión General Mensual',
        fecha: new Date('2025-10-20'),
        hora: '19:00',
        lugar: 'Cuartel Central',
        motivo: 'Reunión ordinaria mensual de la compañía',
        estado: 'Programada',
        createdById: admin.id
      }
    }),
    prisma.citacion.create({
      data: {
        titulo: 'Entrenamiento de Rescate',
        fecha: new Date('2025-10-25'),
        hora: '10:00',
        lugar: 'Campo de Entrenamiento',
        motivo: 'Práctica de técnicas de rescate vehicular',
        estado: 'Programada',
        createdById: admin.id
      }
    }),
    prisma.citacion.create({
      data: {
        titulo: 'Capacitación Primeros Auxilios',
        fecha: new Date('2025-11-05'),
        hora: '15:00',
        lugar: 'Sala de Capacitación',
        motivo: 'Actualización en protocolos de primeros auxilios',
        estado: 'Programada',
        createdById: admin.id
      }
    }),
    prisma.citacion.create({
      data: {
        titulo: 'Ceremonia Aniversario',
        fecha: new Date('2025-11-15'),
        hora: '18:00',
        lugar: 'Cuartel Central',
        motivo: 'Celebración del aniversario de la compañía',
        estado: 'Programada',
        createdById: admin.id
      }
    }),
    prisma.citacion.create({
      data: {
        titulo: 'Mantenimiento de Equipos',
        fecha: new Date('2025-09-15'),
        hora: '09:00',
        lugar: 'Taller de Mantención',
        motivo: 'Revisión y mantención de equipos de seguridad',
        estado: 'Realizada',
        createdById: admin.id
      }
    })
  ])

  console.log(`✅ ${citaciones.length} citaciones creadas`)

  // ==================== CATEGORÍAS DE MATERIAL ====================
  console.log('📦 Creando categorías de material...')
  
  const categorias = await Promise.all([
    // Categorías principales
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
    })
  ])

  // Subcategorías
  const subcategorias = await Promise.all([
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
        nombre: 'Radios',
        descripcion: 'Equipos de radio comunicación',
        icono: 'Radio',
        parentId: categorias[2].id,
        activo: true
      }
    }),
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

  console.log(`✅ ${categorias.length + subcategorias.length} categorías creadas`)

  // ==================== MATERIAL MENOR ====================
  console.log('🔧 Creando material menor...')
  
  const materiales = await Promise.all([
    // Cascos individuales
    prisma.material.create({
      data: {
        nombre: 'Casco Structura MSA',
        descripcion: 'Casco estructural MSA, certificado NFPA 1971',
        categoriaId: subcategorias[0].id,
        estado: 'Disponible',
        tipo: 'individual',
        numeroSerie: 'CSC-001',
        fechaAdquisicion: new Date('2024-03-15'),
        ubicacionFisica: 'Cuartel - Bodega A',
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Casco Structura MSA',
        descripcion: 'Casco estructural MSA, certificado NFPA 1971',
        categoriaId: subcategorias[0].id,
        estado: 'En Uso',
        tipo: 'individual',
        numeroSerie: 'CSC-002',
        fechaAdquisicion: new Date('2024-03-15'),
        ubicacionFisica: 'Cuartel - Bodega A',
        activo: true
      }
    }),
    
    // Guantes por cantidad
    prisma.material.create({
      data: {
        nombre: 'Guantes Estructurales',
        descripcion: 'Guantes de protección térmica para incendios estructurales',
        categoriaId: subcategorias[1].id,
        estado: 'Disponible',
        tipo: 'cantidad',
        cantidad: 25,
        unidadMedida: 'pares',
        fechaAdquisicion: new Date('2024-05-10'),
        ubicacionFisica: 'Cuartel - Bodega B',
        activo: true
      }
    }),
    
    // Radios
    prisma.material.create({
      data: {
        nombre: 'Radio Motorola XPR7550',
        descripcion: 'Radio portátil digital VHF/UHF',
        categoriaId: subcategorias[2].id,
        estado: 'En Uso',
        tipo: 'individual',
        numeroSerie: 'RAD-101',
        fechaAdquisicion: new Date('2024-06-20'),
        ubicacionFisica: 'Cuartel - Comunicaciones',
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Radio Motorola XPR7550',
        descripcion: 'Radio portátil digital VHF/UHF',
        categoriaId: subcategorias[2].id,
        estado: 'Disponible',
        tipo: 'individual',
        numeroSerie: 'RAD-102',
        fechaAdquisicion: new Date('2024-06-20'),
        ubicacionFisica: 'Cuartel - Comunicaciones',
        activo: true
      }
    }),
    
    // Botiquines
    prisma.material.create({
      data: {
        nombre: 'Botiquín Tipo A',
        descripcion: 'Botiquín completo de primeros auxilios',
        categoriaId: subcategorias[3].id,
        estado: 'Disponible',
        tipo: 'cantidad',
        cantidad: 8,
        unidadMedida: 'unidades',
        fechaAdquisicion: new Date('2024-04-01'),
        ubicacionFisica: 'Cuartel - Enfermería',
        activo: true
      }
    }),
    
    // Herramientas
    prisma.material.create({
      data: {
        nombre: 'Hacha de Bombero',
        descripcion: 'Hacha de rescate con punta y filo',
        categoriaId: categorias[1].id,
        estado: 'Disponible',
        tipo: 'cantidad',
        cantidad: 12,
        unidadMedida: 'unidades',
        fechaAdquisicion: new Date('2024-02-15'),
        ubicacionFisica: 'Cuartel - Sala de Herramientas',
        activo: true
      }
    }),
    prisma.material.create({
      data: {
        nombre: 'Linterna LED Recargable',
        descripcion: 'Linterna profesional de alta potencia',
        categoriaId: categorias[0].id,
        estado: 'Disponible',
        tipo: 'cantidad',
        cantidad: 15,
        unidadMedida: 'unidades',
        fechaAdquisicion: new Date('2024-07-10'),
        ubicacionFisica: 'Cuartel - Bodega A',
        activo: true
      }
    })
  ])

  console.log(`✅ ${materiales.length} items de material menor creados`)

  // ==================== CARROS BOMBEROS ====================
  console.log('🚛 Creando carros bomberos...')
  
  const carros = await Promise.all([
    prisma.carro.create({
      data: {
        nombre: 'B-1',
        tipo: 'Bomba',
        patente: 'WXYZ12',
        marca: 'Mercedes-Benz',
        modelo: 'Atego 1725',
        anioFabricacion: 2020,
        capacidadAgua: 3000,
        capacidadEspuma: 500,
        potenciaMotobomba: '2000 L/min',
        estadoOperativo: 'Operativo',
        observaciones: 'Carro bomba principal'
      }
    }),
    prisma.carro.create({
      data: {
        nombre: 'B-2',
        tipo: 'Bomba',
        patente: 'ABCD34',
        marca: 'Scania',
        modelo: 'P320',
        anioFabricacion: 2018,
        capacidadAgua: 2500,
        capacidadEspuma: 300,
        potenciaMotobomba: '1800 L/min',
        estadoOperativo: 'Operativo'
      }
    }),
    prisma.carro.create({
      data: {
        nombre: 'E-1',
        tipo: 'Escala',
        patente: 'EFGH56',
        marca: 'Magirus',
        modelo: 'DLK 30',
        anioFabricacion: 2019,
        estadoOperativo: 'Operativo',
        caracteristicas: { altura_maxima: '30m' },
        observaciones: 'Escala mecánica 30 metros'
      }
    }),
    prisma.carro.create({
      data: {
        nombre: 'R-1',
        tipo: 'Rescate',
        patente: 'IJKL78',
        marca: 'Ford',
        modelo: 'F-550',
        anioFabricacion: 2021,
        estadoOperativo: 'Mantenimiento',
        capacidadCarga: '8 personas',
        observaciones: 'En mantención preventiva'
      }
    })
  ])

  console.log(`✅ ${carros.length} carros creados`)

  console.log('\n🎉 ¡Seed completado exitosamente!')
  console.log('═'.repeat(50))
  console.log(`📊 RESUMEN:`)
  console.log(`   👥 Usuarios: 2`)
  console.log(`   🚒 Bomberos: ${bomberos.length}`)
  console.log(`   🏛️ Cargos: ${cargos.length}`)
  console.log(`   📋 Citaciones: ${citaciones.length}`)
  console.log(`   📦 Categorías: ${categorias.length + subcategorias.length}`)
  console.log(`   🔧 Material Menor: ${materiales.length}`)
  console.log(`   🚛 Carros: ${carros.length}`)
  console.log('═'.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
