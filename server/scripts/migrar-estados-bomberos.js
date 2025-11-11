/**
 * Script de migración: Actualizar estados antiguos de bomberos
 * Cambia "Licencia" e "Inactivo" a "Activo"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrarEstados() {
  try {
    console.log('🚀 Iniciando migración de estados de bomberos...\n');

    // Contar bomberos con estados antiguos
    const bomberosAntiguos = await prisma.bombero.count({
      where: {
        estado: {
          in: ['Licencia', 'Inactivo']
        }
      }
    });

    console.log(`📊 Bomberos con estados antiguos encontrados: ${bomberosAntiguos}`);

    if (bomberosAntiguos === 0) {
      console.log('✅ No hay bomberos con estados antiguos. Migración no necesaria.');
      return;
    }

    // Actualizar todos los bomberos con estados antiguos a "Activo"
    const resultado = await prisma.bombero.updateMany({
      where: {
        estado: {
          in: ['Licencia', 'Inactivo']
        }
      },
      data: {
        estado: 'Activo',
        motivoEstado: 'Migración automática: conversión de estados antiguos',
        fechaCambioEstado: new Date()
      }
    });

    console.log(`✅ Bomberos actualizados: ${resultado.count}`);
    console.log('\n🎉 Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrarEstados()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
