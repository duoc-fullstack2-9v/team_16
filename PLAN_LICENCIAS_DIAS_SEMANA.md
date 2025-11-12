# 📋 ANÁLISIS: Implementación de Licencias por Días de la Semana

## 🎯 OBJETIVO
Cambiar el sistema de licencias para que permita:
1. Seleccionar días específicos de la semana (Lunes a Domingo)
2. Opción de mismo horario para todos los días
3. Opción de horario personalizado para cada día seleccionado

---

## 📊 MODELO ACTUAL vs NUEVO

### MODELO ACTUAL (Rango de fechas)
```prisma
model Licencia {
  fechaInicio       DateTime
  fechaFin          DateTime
  esPorHoras        Boolean
  horaInicio        String?
  horaFin           String?
  diasSolicitados   Float
}
```

**Limitaciones:**
- Solo permite rangos continuos de fechas
- Un solo horario para todo el periodo
- No permite días específicos de la semana

### MODELO NUEVO PROPUESTO (Días de la semana)

**Opción 1: Modelo Simple con JSON**
```prisma
model Licencia {
  fechaInicio           DateTime  // Fecha de inicio del periodo
  fechaFin              DateTime  // Fecha de fin del periodo
  diasSemana            Json      // Array de configuración de días
  mismoHorarioTodos     Boolean   @default(true)
  horarioGeneral        Json?     // { inicio: "08:00", fin: "17:00" }
  diasSolicitados       Float     // Total de días/horas
}
```

**Estructura de `diasSemana` JSON:**
```json
[
  {
    "dia": "lunes",
    "activo": true,
    "horario": { "inicio": "08:00", "fin": "17:00" }
  },
  {
    "dia": "martes",
    "activo": true,
    "horario": { "inicio": "08:00", "fin": "17:00" }
  },
  {
    "dia": "miercoles",
    "activo": false,
    "horario": null
  },
  // ... resto de días
]
```

**Opción 2: Modelo con Relación (Más normalizado)**
```prisma
model Licencia {
  id                    String    @id @default(auto()) @map("_id") @db.ObjectId
  // ... campos existentes ...
  fechaInicio           DateTime
  fechaFin              DateTime
  mismoHorarioTodos     Boolean   @default(true)
  horaInicioGeneral     String?   // Si mismoHorarioTodos = true
  horaFinGeneral        String?   // Si mismoHorarioTodos = true
  diasConfig            DiaLicenciaConfig[]
  diasSolicitados       Float
}

model DiaLicenciaConfig {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  licenciaId    String   @db.ObjectId
  diaSemana     Int      // 1=Lunes, 2=Martes, ..., 7=Domingo
  activo        Boolean  @default(false)
  horaInicio    String?  // Solo si mismoHorarioTodos = false
  horaFin       String?  // Solo si mismoHorarioTodos = false
  
  licencia      Licencia @relation(fields: [licenciaId], references: [id], onDelete: Cascade)
  
  @@map("dias_licencia_config")
}
```

---

## ✅ RECOMENDACIÓN: Opción 1 (JSON)

**Ventajas:**
- ✅ Más simple de implementar
- ✅ Menos queries a la BD
- ✅ Mejor para MongoDB (orientado a documentos)
- ✅ Datos de configuración siempre juntos
- ✅ Fácil de migrar desde el modelo actual

**Desventajas:**
- ⚠️ No se pueden hacer queries complejas sobre días específicos
- ⚠️ Validación en código, no en BD

---

## 🗄️ CAMBIOS EN BASE DE DATOS (Prisma Schema)

```prisma
model Licencia {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  bomberoId         String    @db.ObjectId
  tipoLicenciaId    String    @db.ObjectId
  otroMotivo        String?
  
  // NUEVA LÓGICA: Fechas del periodo y días de la semana
  fechaInicio           DateTime  // Inicio del periodo de licencia
  fechaFin              DateTime  // Fin del periodo de licencia
  
  // Configuración de días de la semana
  diasSemana            Json      // Array con configuración de cada día
  mismoHorarioTodos     Boolean   @default(true)
  
  // Horario general (si mismoHorarioTodos = true)
  horaInicioGeneral     String?   // "08:00"
  horaFinGeneral        String?   // "17:00"
  
  // Cálculos
  diasSolicitados       Float     // Total calculado
  horasTotales          Float?    // Total de horas (si es por horas)
  
  // CAMPOS ELIMINADOS:
  // esPorHoras (ahora se deduce de los horarios)
  // horaInicio (reemplazado por horaInicioGeneral)
  // horaFin (reemplazado por horaFinGeneral)
  
  // ... resto de campos igual
  motivo            String?
  documentosUrls    String[]  @default([])
  estado            String    @default("Pendiente")
  revisadoPorId     String?   @db.ObjectId
  fechaRevision     DateTime?
  observacionesAdmin String?
  tieneConflictoGuardia Boolean @default(false)
  creadoPorId       String?   @db.ObjectId
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  bombero       Bombero       @relation(fields: [bomberoId], references: [id], onDelete: Cascade)
  tipoLicencia  TipoLicencia  @relation(fields: [tipoLicenciaId], references: [id])
  revisadoPor   User?         @relation("LicenciasRevisadas", fields: [revisadoPorId], references: [id])
  creadoPor     User?         @relation("LicenciasCreadasPorAdmin", fields: [creadoPorId], references: [id])
  
  @@map("licencias")
}
```

**Estructura del campo `diasSemana` (JSON):**
```javascript
[
  {
    dia: "lunes",
    numero: 1,
    activo: true,
    horaInicio: "08:00",  // Solo si mismoHorarioTodos = false
    horaFin: "17:00"      // Solo si mismoHorarioTodos = false
  },
  {
    dia: "martes",
    numero: 2,
    activo: true,
    horaInicio: "09:00",
    horaFin: "18:00"
  },
  {
    dia: "miercoles",
    numero: 3,
    activo: false,
    horaInicio: null,
    horaFin: null
  },
  // ... miércoles a domingo
]
```

---

## 🔧 CAMBIOS EN BACKEND

### 1. Validación Joi (server/src/routes/licencias.js)

```javascript
const licenciaSchema = Joi.object({
  bomberoId: Joi.string().length(24).hex().optional(), // Solo para admin
  tipoLicenciaId: Joi.string().length(24).hex().required(),
  otroMotivo: Joi.string().max(200).optional(),
  
  // Fechas del periodo
  fechaInicio: Joi.date().required(),
  fechaFin: Joi.date().min(Joi.ref('fechaInicio')).required(),
  
  // Configuración de días
  diasSemana: Joi.array().items(
    Joi.object({
      dia: Joi.string().valid('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo').required(),
      numero: Joi.number().min(1).max(7).required(),
      activo: Joi.boolean().required(),
      horaInicio: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null).optional(),
      horaFin: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null).optional()
    })
  ).length(7).required(),
  
  mismoHorarioTodos: Joi.boolean().required(),
  horaInicioGeneral: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null).optional(),
  horaFinGeneral: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).allow(null).optional(),
  
  motivo: Joi.string().max(500).optional(),
  documentosUrls: Joi.array().items(Joi.string().uri()).optional()
});
```

### 2. Función de Cálculo de Días/Horas

```javascript
function calcularDiasYHoras(fechaInicio, fechaFin, diasSemana, mismoHorarioTodos, horaInicioGeneral, horaFinGeneral) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  
  let diasTotales = 0;
  let horasTotales = 0;
  
  // Mapear días activos por número (1-7)
  const diasActivosMap = {};
  diasSemana.forEach(dia => {
    if (dia.activo) {
      diasActivosMap[dia.numero] = dia;
    }
  });
  
  // Iterar cada día del periodo
  const currentDate = new Date(inicio);
  while (currentDate <= fin) {
    const diaSemana = currentDate.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const numeroNormalizado = diaSemana === 0 ? 7 : diaSemana; // Convertir a 1-7
    
    if (diasActivosMap[numeroNormalizado]) {
      const diaConfig = diasActivosMap[numeroNormalizado];
      
      // Determinar horario
      let horaInicio, horaFin;
      if (mismoHorarioTodos) {
        horaInicio = horaInicioGeneral;
        horaFin = horaFinGeneral;
      } else {
        horaInicio = diaConfig.horaInicio;
        horaFin = diaConfig.horaFin;
      }
      
      if (horaInicio && horaFin) {
        // Calcular horas
        const [hI, mI] = horaInicio.split(':').map(Number);
        const [hF, mF] = horaFin.split(':').map(Number);
        const horas = (hF * 60 + mF - hI * 60 - mI) / 60;
        horasTotales += horas;
        diasTotales += horas / 8; // Asumiendo 8 horas = 1 día
      } else {
        // Día completo
        diasTotales += 1;
        horasTotales += 8;
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return { 
    diasSolicitados: parseFloat(diasTotales.toFixed(2)),
    horasTotales: parseFloat(horasTotales.toFixed(2))
  };
}
```

### 3. Endpoint de Creación (Actualizado)

```javascript
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = licenciaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    const {
      bomberoId,
      tipoLicenciaId,
      otroMotivo,
      fechaInicio,
      fechaFin,
      diasSemana,
      mismoHorarioTodos,
      horaInicioGeneral,
      horaFinGeneral,
      motivo,
      documentosUrls
    } = value;
    
    // Validar que al menos un día esté activo
    const diasActivos = diasSemana.filter(d => d.activo);
    if (diasActivos.length === 0) {
      return res.status(400).json({ 
        mensaje: 'Debe seleccionar al menos un día de la semana' 
      });
    }
    
    // Validar horarios
    if (mismoHorarioTodos) {
      if (!horaInicioGeneral || !horaFinGeneral) {
        return res.status(400).json({ 
          mensaje: 'Debe especificar horario general para todos los días' 
        });
      }
    } else {
      // Validar que cada día activo tenga horario
      for (const dia of diasActivos) {
        if (!dia.horaInicio || !dia.horaFin) {
          return res.status(400).json({ 
            mensaje: `El día ${dia.dia} debe tener horario especificado` 
          });
        }
      }
    }
    
    // Calcular días y horas
    const { diasSolicitados, horasTotales } = calcularDiasYHoras(
      fechaInicio,
      fechaFin,
      diasSemana,
      mismoHorarioTodos,
      horaInicioGeneral,
      horaFinGeneral
    );
    
    // Crear licencia
    const licencia = await prisma.licencia.create({
      data: {
        bomberoId: bomberoId || req.user.id,
        tipoLicenciaId,
        otroMotivo,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        diasSemana,
        mismoHorarioTodos,
        horaInicioGeneral,
        horaFinGeneral,
        diasSolicitados,
        horasTotales,
        motivo,
        documentosUrls: documentosUrls || [],
        creadoPorId: req.user.id,
        tieneConflictoGuardia: false // TODO: Implementar detección de conflictos
      },
      include: {
        bombero: true,
        tipoLicencia: true
      }
    });
    
    res.status(201).json(licencia);
  } catch (error) {
    console.error('Error al crear licencia:', error);
    res.status(500).json({ mensaje: 'Error al crear licencia' });
  }
});
```

---

## 🎨 CAMBIOS EN FRONTEND

### 1. Componente de Selección de Días (Nuevo)

**Ubicación:** `client/src/components/licencias/DiasSemanaSelectoretector.jsx`

```jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
  Switch,
  TextField,
  Paper,
  Divider
} from '@mui/material';

const diasSemanaDefault = [
  { dia: 'lunes', numero: 1, label: 'Lunes', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'martes', numero: 2, label: 'Martes', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'miercoles', numero: 3, label: 'Miércoles', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'jueves', numero: 4, label: 'Jueves', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'viernes', numero: 5, label: 'Viernes', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'sabado', numero: 6, label: 'Sábado', activo: false, horaInicio: '', horaFin: '' },
  { dia: 'domingo', numero: 7, label: 'Domingo', activo: false, horaInicio: '', horaFin: '' }
];

const DiasSemanaSelectoretector = ({ value, onChange, mismoHorarioTodos, onMismoHorarioChange }) => {
  const [horaGeneral, setHoraGeneral] = useState({ inicio: '08:00', fin: '17:00' });
  
  const handleToggleDia = (numero) => {
    const newValue = value.map(dia => 
      dia.numero === numero ? { ...dia, activo: !dia.activo } : dia
    );
    onChange(newValue);
  };
  
  const handleHorarioChange = (numero, campo, valor) => {
    const newValue = value.map(dia => 
      dia.numero === numero ? { ...dia, [campo]: valor } : dia
    );
    onChange(newValue);
  };
  
  const handleHorarioGeneralChange = (campo, valor) => {
    setHoraGeneral(prev => ({ ...prev, [campo]: valor }));
    // Aplicar a todos los días activos
    if (mismoHorarioTodos) {
      const newValue = value.map(dia => ({
        ...dia,
        horaInicio: campo === 'inicio' ? valor : horaGeneral.inicio,
        horaFin: campo === 'fin' ? valor : horaGeneral.fin
      }));
      onChange(newValue);
    }
  };
  
  const diasActivos = value.filter(d => d.activo);
  
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        Días de la Semana *
      </Typography>
      
      {/* Selector de días */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <FormGroup row>
          {value.map((dia) => (
            <FormControlLabel
              key={dia.numero}
              control={
                <Checkbox
                  checked={dia.activo}
                  onChange={() => handleToggleDia(dia.numero)}
                />
              }
              label={dia.label}
            />
          ))}
        </FormGroup>
      </Paper>
      
      {diasActivos.length > 0 && (
        <>
          {/* Switch de mismo horario */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={mismoHorarioTodos}
                  onChange={(e) => onMismoHorarioChange(e.target.checked)}
                />
              }
              label="Mismo horario para todos los días"
            />
          </Box>
          
          {mismoHorarioTodos ? (
            /* Horario general */
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Horario General
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora Inicio"
                    value={horaGeneral.inicio}
                    onChange={(e) => handleHorarioGeneralChange('inicio', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Hora Fin"
                    value={horaGeneral.fin}
                    onChange={(e) => handleHorarioGeneralChange('fin', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>
          ) : (
            /* Horarios personalizados */
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Horarios Personalizados
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {diasActivos.map((dia) => (
                  <Grid item xs={12} key={dia.numero}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 100 }} variant="body2">
                        {dia.label}:
                      </Typography>
                      <TextField
                        size="small"
                        type="time"
                        label="Hora Inicio"
                        value={dia.horaInicio}
                        onChange={(e) => handleHorarioChange(dia.numero, 'horaInicio', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        size="small"
                        type="time"
                        label="Hora Fin"
                        value={dia.horaFin}
                        onChange={(e) => handleHorarioChange(dia.numero, 'horaFin', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          {/* Resumen */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              📅 Días seleccionados: {diasActivos.map(d => d.label).join(', ')}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DiasSemanaSelectoretector;
```

### 2. Actualizar LicenciaForm.jsx

Cambios principales:
- Eliminar campos `esPorHoras`, `horaInicio`, `horaFin`
- Agregar componente `DiasSemanaSelectoretector`
- Agregar estado para `diasSemana` y `mismoHorarioTodos`
- Actualizar validaciones y submit

---

## 📋 MIGRACIÓN DE DATOS

Script para migrar licencias existentes al nuevo formato:

```javascript
// server/scripts/migrar-licencias-dias-semana.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrarLicencias() {
  const licencias = await prisma.licencia.findMany();
  
  for (const licencia of licencias) {
    // Crear configuración de días (todos activos por defecto)
    const diasSemana = [
      { dia: 'lunes', numero: 1, activo: true, horaInicio: licencia.horaInicio || null, horaFin: licencia.horaFin || null },
      { dia: 'martes', numero: 2, activo: true, horaInicio: licencia.horaInicio || null, horaFin: licencia.horaFin || null },
      { dia: 'miercoles', numero: 3, activo: true, horaInicio: licencia.horaInicio || null, horaFin: licencia.horaFin || null },
      { dia: 'jueves', numero: 4, activo: true, horaInicio: licencia.horaInicio || null, horaFin: licencia.horaFin || null },
      { dia: 'viernes', numero: 5, activo: true, horaInicio: licencia.horaInicio || null, horaFin: licencia.horaFin || null },
      { dia: 'sabado', numero: 6, activo: true, horaInicio: licencia.horaInicio || null, horaFin: licencia.horaFin || null },
      { dia: 'domingo', numero: 7, activo: true, horaInicio: licencia.horaInicio || null, horaFin: licencia.horaFin || null }
    ];
    
    await prisma.licencia.update({
      where: { id: licencia.id },
      data: {
        diasSemana,
        mismoHorarioTodos: licencia.esPorHoras ? true : false,
        horaInicioGeneral: licencia.horaInicio,
        horaFinGeneral: licencia.horaFin
      }
    });
  }
  
  console.log(`✅ Migradas ${licencias.length} licencias`);
}
```

---

## 📝 RESUMEN DE ARCHIVOS A MODIFICAR

### Base de Datos
- ✅ `server/prisma/schema.prisma` - Actualizar modelo Licencia

### Backend
- ✅ `server/src/routes/licencias.js` - Actualizar validaciones y endpoints
- ✅ Agregar función `calcularDiasYHoras()`
- ✅ `server/scripts/migrar-licencias-dias-semana.js` - Script de migración

### Frontend
- ✅ `client/src/components/licencias/DiasSemanaSelectoretector.jsx` - NUEVO componente
- ✅ `client/src/components/licencias/LicenciaForm.jsx` - Actualizar formulario
- ✅ `client/src/components/licencias/LicenciaCard.jsx` - Mostrar días seleccionados
- ✅ `client/src/components/licencias/LicenciaDetalle.jsx` - Mostrar horarios por día

### Redux
- ✅ `client/src/store/slices/licenciasSlice.js` - Actualizar tipos y acciones

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

1. **Actualizar Prisma Schema** ✅
2. **Generar migración de Prisma** ✅
3. **Crear script de migración de datos** ✅
4. **Actualizar backend (validaciones y cálculos)** ✅
5. **Crear componente DiasSemanaSelectoretector** ✅
6. **Actualizar LicenciaForm** ✅
7. **Actualizar componentes de visualización** ✅
8. **Probar flujo completo** ✅

---

¿Quieres que proceda con la implementación paso a paso?
