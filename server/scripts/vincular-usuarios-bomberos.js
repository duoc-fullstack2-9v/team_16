import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Script para vincular usuarios con sus bomberos correspondientes
 * 
 * Lógica:
 * 1. Para cada usuario con tipo 'usuario' (no admin)
 * 2. Buscar un bombero que:
 *    - Tenga el mismo email que el usuario, O
 *    - Tenga un email similar (primera parte coincide), O
 *    - Tenga el mismo nombre en el campo nombre del usuario
 * 3. Vincular el usuario con el bombero encontrado
 */

async function vincularUsuariosConBomberos() {
  try {
    console.log('🔍 Buscando usuarios sin bombero asociado...\n');

    // Obtener todos los usuarios tipo 'usuario' (no admins)
    const usuarios = await prisma.user.findMany({
      where: {
        tipo: 'usuario'
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true
      }
    });

    console.log(`📋 Encontrados ${usuarios.length} usuarios tipo 'usuario'\n`);

    for (const usuario of usuarios) {
      console.log(`\n👤 Procesando usuario: ${usuario.nombre} (${usuario.email})`);

      // Verificar si ya tiene un bombero asociado
      const bomberoExistente = await prisma.bombero.findFirst({
        where: { usuarioId: usuario.id }
      });

      if (bomberoExistente) {
        console.log(`   ✅ Ya tiene bombero asociado: ${bomberoExistente.nombres} ${bomberoExistente.apellidos}`);
        continue;
      }

      // Estrategia 1: Buscar por email exacto
      let bombero = await prisma.bombero.findFirst({
        where: { email: usuario.email }
      });

      if (!bombero) {
        // Estrategia 2: Buscar por email similar (primera parte antes del @)
        const emailPrefix = usuario.email.split('@')[0];
        const bomberos = await prisma.bombero.findMany({
          where: {
            email: {
              contains: emailPrefix
            }
          }
        });

        if (bomberos.length === 1) {
          bombero = bomberos[0];
          console.log(`   🔍 Encontrado por email similar: ${bombero.email}`);
        } else if (bomberos.length > 1) {
          console.log(`   ⚠️  Múltiples bomberos encontrados con email similar, saltando...`);
          continue;
        }
      } else {
        console.log(`   ✅ Encontrado por email exacto: ${bombero.email}`);
      }

      if (!bombero) {
        // Estrategia 3: Buscar por nombre
        const nombreParts = usuario.nombre.split(' ');
        const primerNombre = nombreParts[0];
        
        const bomberosPorNombre = await prisma.bombero.findMany({
          where: {
            nombres: {
              contains: primerNombre,
              mode: 'insensitive'
            }
          }
        });

        if (bomberosPorNombre.length === 1) {
          bombero = bomberosPorNombre[0];
          console.log(`   🔍 Encontrado por nombre: ${bombero.nombres} ${bombero.apellidos}`);
        } else if (bomberosPorNombre.length > 1) {
          console.log(`   ⚠️  Múltiples bomberos encontrados con nombre similar, saltando...`);
          continue;
        }
      }

      if (bombero) {
        // Vincular el usuario con el bombero
        await prisma.bombero.update({
          where: { id: bombero.id },
          data: { usuarioId: usuario.id }
        });

        console.log(`   ✅ VINCULADO: ${usuario.nombre} (${usuario.email}) ↔ ${bombero.nombres} ${bombero.apellidos} (${bombero.email})`);
      } else {
        console.log(`   ❌ No se encontró bombero para vincular`);
      }
    }

    console.log('\n\n📊 RESUMEN:\n');
    
    // Mostrar todos los vínculos actuales
    const bomberosVinculados = await prisma.bombero.findMany({
      where: {
        usuarioId: { not: null }
      },
      include: {
        usuario: {
          select: {
            email: true,
            nombre: true
          }
        }
      }
    });

    console.log(`Total de bomberos vinculados: ${bomberosVinculados.length}\n`);
    
    bomberosVinculados.forEach(b => {
      console.log(`✅ ${b.nombres} ${b.apellidos} (${b.email}) ↔ ${b.usuario.nombre} (${b.usuario.email})`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

vincularUsuariosConBomberos();
