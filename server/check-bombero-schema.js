import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  try {
    const bomberos = await prisma.bombero.findMany({
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        createdById: true
      },
      take: 5
    });
    
    console.log(JSON.stringify(bomberos, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
