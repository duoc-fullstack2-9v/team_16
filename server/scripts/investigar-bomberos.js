import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function investigarBomberos() {
  try {
    // Usuario de prueba
    const usuario = await prisma.user.findUnique({
      where: { email: 'bombero@bomberos.cl' },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true
      }
    });

    console.log('👤 Usuario:', usuario);
    console.log('\n');

    // Buscar bomberos con email similar
    const emailPrefix = usuario.email.split('@')[0];
    const bomberos = await prisma.bombero.findMany({
      where: {
        email: {
          contains: emailPrefix
        }
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        rango: true
      }
    });

    console.log(`🔍 Bomberos con email similar a "${emailPrefix}":\n`);
    bomberos.forEach((b, index) => {
      console.log(`${index + 1}. ${b.nombres} ${b.apellidos}`);
      console.log(`   Email: ${b.email}`);
      console.log(`   Rango: ${b.rango}`);
      console.log(`   ID: ${b.id}\n`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

investigarBomberos();
