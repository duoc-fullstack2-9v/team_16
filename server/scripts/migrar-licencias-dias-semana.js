import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Script de migración de licencias al nuevo formato de días de la semana
 * 
 * ANTES: esPorHoras, horaInicio, horaFin
 * DESPUÉS: diasSemana (JSON), mismoHorarioTodos, horaInicioGeneral, horaFinGeneral
 */

const diasSemanaDefault = [
  { dia: 'lunes', numero: 1, activo: true, horaInicio: null, horaFin: null },
  { dia: 'martes', numero: 2, activo: true, horaInicio: null, horaFin: null },
  { dia: 'miercoles', numero: 3, activo: true, horaInicio: null, horaFin: null },
  { dia: 'jueves', numero: 4, activo: true, horaInicio: null, horaFin: null },
  { dia: 'viernes', numero: 5, activo: true, horaInicio: null, horaFin: null },
  { dia: 'sabado', numero: 6, activo: true, horaInicio: null, horaFin: null },
  { dia: 'domingo', numero: 7, activo: true, horaInicio: null, horaFin: null }
];

async function migrarLicencias() {
  try {
    console.log('\n📋 MIGRACIÓN DE LICENCIAS A FORMATO DE DÍAS DE SEMANA');
    console.log('═'.repeat(60));
    
    // Obtener todas las licencias
    const licencias = await prisma.licencia.findMany();
    
    console.log(`\n📊 Total de licencias encontradas: ${licencias.length}`);
    
    if (licencias.length === 0) {
      console.log('\n✅ No hay licencias para migrar');
      return;
    }
    
    let migradas = 0;
    let errores = 0;
    
    for (const licencia of licencias) {
      try {
        // Verificar si ya tiene el nuevo formato
        if (licencia.diasSemana) {
          console.log(`⏭️  Licencia ${licencia.id} ya está migrada`);
          continue;
        }
        
        // Crear configuración de días
        // Por defecto, todos los días activos (simula el comportamiento anterior)
        const diasSemana = diasSemanaDefault.map(dia => ({
          ...dia,
          activo: true,
          horaInicio: licencia.horaInicio || null,
          horaFin: licencia.horaFin || null
        }));
        
        // Determinar si usa mismo horario para todos
        const mismoHorarioTodos = licencia.horaInicio && licencia.horaFin ? true : false;
        
        // Actualizar licencia
        await prisma.licencia.update({
          where: { id: licencia.id },
          data: {
            diasSemana,
            mismoHorarioTodos,
            horaInicioGeneral: licencia.horaInicio || null,
            horaFinGeneral: licencia.horaFin || null,
            horasTotales: licencia.horaInicio && licencia.horaFin 
              ? calcularHorasTotales(licencia.fechaInicio, licencia.fechaFin, licencia.horaInicio, licencia.horaFin)
              : null
          }
        });
        
        migradas++;
        console.log(`✅ Migrada licencia ${licencia.id} (${licencia.bomberoId})`);
        
      } catch (error) {
        errores++;
        console.error(`❌ Error al migrar licencia ${licencia.id}:`, error.message);
      }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN:');
    console.log('─'.repeat(60));
    console.log(`Total de licencias: ${licencias.length}`);
    console.log(`✅ Migradas exitosamente: ${migradas}`);
    console.log(`❌ Errores: ${errores}`);
    console.log('═'.repeat(60));
    
    if (errores === 0) {
      console.log('\n🎉 ¡Migración completada exitosamente!');
    } else {
      console.log('\n⚠️  Migración completada con algunos errores');
    }
    
  } catch (error) {
    console.error('\n❌ Error fatal en la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Calcula el total de horas entre dos fechas con un horario específico
 */
function calcularHorasTotales(fechaInicio, fechaFin, horaInicio, horaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  
  // Calcular días entre fechas
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  
  // Calcular horas por día
  const [hI, mI] = horaInicio.split(':').map(Number);
  const [hF, mF] = horaFin.split(':').map(Number);
  const horasPorDia = (hF * 60 + mF - hI * 60 - mI) / 60;
  
  return parseFloat((diffDays * horasPorDia).toFixed(2));
}

// Ejecutar migración
console.log('\n🚀 Iniciando migración de licencias...\n');
migrarLicencias()
  .then(() => {
    console.log('\n✅ Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
