// Script para verificar la conexión activa de Prisma
import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('\n🔍 VERIFICANDO CONEXIÓN A BASE DE DATOS...\n');
    
    // 1. Verificar provider
    console.log('📊 Provider:', prisma._engineConfig?.activeProvider || 'N/A');
    
    // 2. Conectar
    await prisma.$connect();
    console.log('✅ Conexión establecida\n');
    
    // 3. Contar bomberos
    const bomberosCount = await prisma.bombero.count();
    console.log(`👨‍🚒 Total de bomberos en la base de datos: ${bomberosCount}`);
    
    // 4. Obtener un bombero de ejemplo
    const primerBombero = await prisma.bombero.findFirst({
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
      }
    });
    
    console.log('\n📋 Primer bombero encontrado:');
    console.log('   ID:', primerBombero.id);
    console.log('   Nombre completo:', primerBombero.nombres, primerBombero.apellidos);
    console.log('   Email:', primerBombero.email);
    
    // 5. CLAVE: Verificar tipo de ID (MongoDB usa ObjectId de 24 caracteres)
    const idLength = primerBombero.id.length;
    const isObjectId = /^[a-f0-9]{24}$/i.test(primerBombero.id);
    
    console.log('\n🔑 ANÁLISIS DEL ID:');
    console.log('   Longitud del ID:', idLength, 'caracteres');
    console.log('   Formato ObjectId:', isObjectId ? '✅ SÍ (MongoDB)' : '❌ NO (SQLite usa números)');
    
    if (isObjectId) {
      console.log('\n✅✅✅ CONFIRMADO: Estás usando MongoDB Atlas ✅✅✅');
      console.log('   Los IDs tienen formato ObjectId (24 caracteres hexadecimales)');
      console.log('   SQLite usaría IDs numéricos como 1, 2, 3...');
    } else {
      console.log('\n⚠️ ADVERTENCIA: No parece ser MongoDB');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
