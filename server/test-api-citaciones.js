import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCitacionesAPI() {
  try {
    // Simular la misma consulta que hace la API
    const page = 1
    const limit = 10
    const skip = (page - 1) * limit
    const sortBy = 'fecha'
    const sortOrder = 'desc'
    
    // Sin filtros (como cuando cargas la página por primera vez)
    const filterConditions = []
    const filters = filterConditions.length > 0 ? { AND: filterConditions } : {}
    
    console.log('Filtros aplicados:', JSON.stringify(filters, null, 2))
    
    const [citaciones, total] = await Promise.all([
      prisma.citacion.findMany({
        where: filters,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: {
            select: { nombre: true }
          },
          bomberos: {
            include: {
              bombero: {
                select: {
                  id: true,
                  nombre: true,
                  rango: true,
                  estado: true
                }
              }
            }
          },
          _count: {
            select: { bomberos: true }
          }
        }
      }),
      prisma.citacion.count({ where: filters })
    ])
    
    console.log('\n📊 RESULTADO DE LA CONSULTA API:')
    console.log('Total en BD:', total)
    console.log('Citaciones retornadas:', citaciones.length)
    console.log('\nCitaciones:')
    citaciones.forEach(c => {
      console.log(`- ${c.titulo} (${c.fecha.toLocaleDateString()}) - Estado: ${c.estado}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCitacionesAPI()
