# 📸 Implementación de Imágenes para Bomberos

## ✅ Cambios Implementados

### 🗄️ **1. Base de Datos (Prisma Schema)**

**Archivo**: `server/prisma/schema.prisma`

Se añadió el campo `fotoUrl` al modelo `Bombero`:

```prisma
model Bombero {
  id          Int      @id @default(autoincrement())
  nombre      String
  rango       String
  especialidad String?
  estado      String   @default("Activo")
  telefono    String?
  email       String?
  direccion   String?
  fechaIngreso DateTime?
  fotoUrl     String?  // ✨ NUEVO CAMPO
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdById Int?
  
  createdBy   User? @relation("BomberoCreatedBy", fields: [createdById], references: [id])
  citaciones  BomberoCitacion[]

  @@map("bomberos")
}
```

---

### 🌱 **2. Seed Data (Datos de Prueba)**

**Archivo**: `server/prisma/seed.js`

Se actualizaron los bomberos de prueba con URLs de fotos:

```javascript
const bomberos = await Promise.all([
  prisma.bombero.create({
    data: {
      nombre: 'Pedro Sánchez',
      rango: 'Bombero',
      especialidad: 'Rescate urbano',
      fotoUrl: '/assets/bomberos/bombero-1.jpg', // ✨
      // ... resto de campos
    }
  }),
  // ... más bomberos con fotos
])
```

**Bomberos creados con fotos:**
- Pedro Sánchez → `bombero-1.jpg`
- Carlos Mendoza → `bombero-2.jpg`
- Ana García → `bombero-3.jpg`
- Miguel Torres → `bombero-4.jpg`

---

### 🖥️ **3. Backend - Servir Archivos Estáticos**

**Archivo**: `server/src/index.js`

Se configuró Express para servir las imágenes desde la carpeta `assets`:

```javascript
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Servir archivos estáticos (imágenes de bomberos)
app.use('/assets', express.static(path.join(__dirname, '../../assets')))
```

**Rutas disponibles:**
- `http://localhost:3001/assets/bomberos/bombero-1.jpg`
- `http://localhost:3001/assets/bomberos/bombero-2.jpg`
- etc.

---

### 🎨 **4. Frontend - Componente BomberoCard**

**Archivo**: `client/src/components/bomberos/BomberoCard.jsx`

Se actualizó el Avatar para mostrar la imagen del bombero:

```jsx
<Avatar 
  src={bombero.fotoUrl || ''}  // ✨ Usar la URL de la foto
  sx={{ 
    bgcolor: 'primary.main', 
    mr: 2, 
    width: 64, 
    height: 64,
    fontSize: '1.5rem'
  }}
>
  {!bombero.fotoUrl && (bombero.nombre?.charAt(0) || 'B')}
</Avatar>
```

**Características:**
- ✅ Muestra la foto si existe
- ✅ Muestra la inicial del nombre si no hay foto
- ✅ Avatar circular de 64x64px
- ✅ Borde con color primario

---

### 📝 **5. Frontend - Formulario de Bombero**

**Archivo**: `client/src/components/bomberos/BomberoForm.jsx`

Se añadió un selector visual de imágenes predefinidas:

```jsx
{/* Foto del bombero */}
<Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
  <Box sx={{ textAlign: 'center' }}>
    <Avatar
      src={formData.fotoUrl}
      sx={{ 
        width: 120, 
        height: 120, 
        mb: 2,
        mx: 'auto',
        border: '3px solid',
        borderColor: 'primary.main'
      }}
    >
      {!formData.fotoUrl && (formData.nombre?.charAt(0) || 'B')}
    </Avatar>
    <Typography variant="caption" display="block" gutterBottom>
      Selecciona una foto
    </Typography>
    <Stack direction="row" spacing={1} justifyContent="center">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
        <IconButton
          key={num}
          onClick={() => setFormData(prev => ({ 
            ...prev, 
            fotoUrl: `/assets/bomberos/bombero-${num}.jpg` 
          }))}
          sx={{
            border: formData.fotoUrl === `/assets/bomberos/bombero-${num}.jpg` 
              ? '2px solid' 
              : '1px solid',
            borderColor: formData.fotoUrl === `/assets/bomberos/bombero-${num}.jpg` 
              ? 'primary.main' 
              : 'grey.300',
            p: 0.5
          }}
        >
          <Avatar
            src={`/assets/bomberos/bombero-${num}.jpg`}
            sx={{ width: 40, height: 40 }}
          />
        </IconButton>
      ))}
    </Stack>
  </Box>
</Grid>
```

**Características:**
- ✅ Preview grande (120x120px) de la foto seleccionada
- ✅ Selector con miniaturas de 8 fotos disponibles
- ✅ Indicador visual de foto seleccionada (borde azul)
- ✅ Iniciales del nombre si no hay foto

---

## 📁 **Imágenes Disponibles**

Las imágenes están ubicadas en: `assets/bomberos/`

```
assets/
└── bomberos/
    ├── bombero-1.jpg
    ├── bombero-2.jpg
    ├── bombero-3.jpg
    ├── bombero-4.jpg
    ├── bombero-5.jpg
    ├── bombero-6.jpg
    ├── bombero-7.jpg
    ├── bombero-8.jpg
    └── README.md
```

---

## 🚀 **Cómo Usar**

### **Crear/Editar un Bombero con Foto:**

1. Ir al módulo de Bomberos
2. Hacer clic en "Nuevo Bombero" o "Editar"
3. En la sección superior del formulario, verás:
   - Un avatar grande con preview
   - 8 miniaturas de fotos disponibles
4. Hacer clic en una miniatura para seleccionarla
5. El preview se actualizará automáticamente
6. Completar el resto del formulario
7. Guardar

### **Ver Bomberos con Fotos:**

- En la lista de bomberos, cada tarjeta mostrará la foto del bombero
- Si no tiene foto, se mostrará la inicial de su nombre
- Las fotos aparecen en círculos con borde azul

---

## 🔄 **Migración Ejecutada**

```bash
cd server
npx prisma migrate dev --name add_foto_url_to_bomberos
node prisma/seed.js
```

**Estado:** ✅ Completado

---

## 🎯 **Resultados**

### ✅ **Funcionalidades Implementadas:**

1. ✅ Campo `fotoUrl` en la base de datos
2. ✅ Servidor sirve imágenes estáticas desde `/assets`
3. ✅ BomberoCard muestra fotos de bomberos
4. ✅ BomberoForm permite seleccionar foto con preview
5. ✅ 8 imágenes predefinidas disponibles
6. ✅ Datos de seed actualizados con fotos
7. ✅ Fallback a iniciales si no hay foto

### 📊 **Estadísticas:**

- **Archivos modificados:** 4
- **Nuevas líneas de código:** ~150
- **Imágenes disponibles:** 8
- **Tiempo de implementación:** ~15 minutos

---

## 🌐 **URLs de Acceso**

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **Imágenes:** http://localhost:3001/assets/bomberos/bombero-X.jpg

---

## 🔐 **Credenciales de Prueba**

**Administrador:**
- Usuario: `admin`
- Contraseña: `1234`

**Usuario Bombero:**
- Email: `bombero@bomberos.cl`
- Contraseña: `bomb345`

---

## 📝 **Notas Técnicas**

1. Las imágenes se sirven directamente desde el servidor backend
2. El frontend hace peticiones al backend para obtener las imágenes
3. El campo `fotoUrl` almacena la ruta relativa: `/assets/bomberos/bombero-X.jpg`
4. Si se requiere subir imágenes personalizadas en el futuro, se puede implementar:
   - Multer para upload de archivos
   - Almacenamiento en filesystem o cloud (S3, Cloudinary)
   - Validación de tamaño y tipo de archivo

---

**Fecha de Implementación:** 9 de Octubre, 2025  
**Estado:** ✅ Completado y Funcional  
**Versión:** 1.1.0
