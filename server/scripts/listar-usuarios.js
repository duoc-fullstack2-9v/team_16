import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Listar todos los usuarios en la base de datos
 */
async function listarUsuarios() {
  try {
    console.log('📋 Listando usuarios en la base de datos...\n');

    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        tipo: true,
        bombero: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    console.log(`Total de usuarios: ${usuarios.length}\n`);

    usuarios.forEach((usuario, index) => {
      console.log(`${index + 1}. Usuario:`);
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Nombre: ${usuario.nombre}`);
      console.log(`   Rol: ${usuario.rol}`);
      console.log(`   Tipo: ${usuario.tipo}`);
      if (usuario.bombero) {
        console.log(`   Bombero vinculado: ${usuario.bombero.nombres} ${usuario.bombero.apellidos}`);
      } else {
        console.log(`   Bombero vinculado: NO`);
      }
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

listarUsuarios();
