import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Vincular manualmente el usuario bombero@bomberos.cl con Arturo Contreras
 */
async function vincularUsuarioBomberoConArturo() {
  try {
    console.log('🔗 Vinculando usuario bombero@bomberos.cl con Arturo Contreras...\n');

    const usuarioId = '6912425455ab61873dc9c8b8'; // bombero@bomberos.cl
    const bomberoId = '6912425455ab61873dc9c8b9'; // Arturo Contreras Cortés

    // Actualizar el bombero con el usuarioId
    const bomberoActualizado = await prisma.bombero.update({
      where: { id: bomberoId },
      data: { usuarioId: usuarioId }
    });

    console.log('✅ Vínculo creado exitosamente:\n');
    
    // Verificar el vínculo
    const bombero = await prisma.bombero.findUnique({
      where: { id: bomberoId },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: true
          }
        }
      }
    });

    console.log('Bombero:', {
      id: bombero.id,
      nombres: bombero.nombres,
      apellidos: bombero.apellidos,
      email: bombero.email,
      rango: bombero.rango
    });

    console.log('\nUsuario vinculado:', bombero.usuario);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

vincularUsuarioBomberoConArturo();
