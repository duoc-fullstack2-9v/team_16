import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCitaciones() {
  try {
    const citaciones = await prisma.citacion.findMany({
      include: {
        bomberos: true,
        createdBy: true
      }
    })
    
    console.log('\n📅 CITACIONES EN LA BASE DE DATOS:')
    console.log('Total:', citaciones.length)
    console.log('\nDetalles:')
    console.log(JSON.stringify(citaciones, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCitaciones()
