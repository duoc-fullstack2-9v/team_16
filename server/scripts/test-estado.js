import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testEstado() {
  try {
    // Buscar un bombero activo
    const bombero = await prisma.bombero.findFirst({
      where: { estado: 'Activo' }
    });

    if (!bombero) {
      console.log('No se encontró ningún bombero activo');
      return;
    }

    console.log('\n📋 BOMBERO ENCONTRADO:');
    console.log('═'.repeat(50));
    console.log(`ID: ${bombero.id}`);
    console.log(`Nombre: ${bombero.nombres} ${bombero.apellidos}`);
    console.log(`Estado actual: ${bombero.estado}`);
    console.log(`Motivo estado: ${bombero.motivoEstado || 'N/A'}`);
    console.log(`Fecha cambio: ${bombero.fechaCambioEstado || 'N/A'}`);
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEstado();
