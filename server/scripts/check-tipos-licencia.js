import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkTiposLicencia() {
  try {
    const tipos = await prisma.tipoLicencia.findMany();
    
    console.log('\n📋 TIPOS DE LICENCIA EN DB:');
    console.log('═'.repeat(50));
    console.log(`Total encontrados: ${tipos.length}\n`);
    
    if (tipos.length === 0) {
      console.log('⚠️  No hay tipos de licencia en la base de datos');
      console.log('Creando tipos de licencia por defecto...\n');
      
      const tiposDefault = [
        { nombre: 'Médica', descripcion: 'Licencia médica por enfermedad o lesión', activo: true },
        { nombre: 'Vacaciones', descripcion: 'Licencia por vacaciones anuales', activo: true },
        { nombre: 'Asuntos Personales', descripcion: 'Licencia por asuntos personales', activo: true },
        { nombre: 'Estudios', descripcion: 'Licencia por estudios o capacitación', activo: true },
        { nombre: 'Laboral', descripcion: 'Licencia por asuntos laborales', activo: true },
        { nombre: 'Otro', descripcion: 'Otro tipo de licencia', activo: true }
      ];
      
      for (const tipo of tiposDefault) {
        const created = await prisma.tipoLicencia.create({
          data: tipo
        });
        console.log(`✅ Creado: ${created.nombre} (ID: ${created.id})`);
      }
      
      console.log('\n✅ Tipos de licencia creados exitosamente');
    } else {
      tipos.forEach(tipo => {
        console.log(`ID: ${tipo.id}`);
        console.log(`Nombre: ${tipo.nombre}`);
        console.log(`Descripción: ${tipo.descripcion || 'N/A'}`);
        console.log(`Activo: ${tipo.activo ? 'Sí' : 'No'}`);
        console.log('─'.repeat(50));
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTiposLicencia();
