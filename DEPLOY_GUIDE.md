# 📋 GUÍA COMPLETA DE DESPLIEGUE - VERCEL + RAILWAY

## 🎯 RESUMEN EJECUTIVO

Este documento detalla **TODOS** los cambios necesarios para desplegar el proyecto SGIB-WEB como monorepo en:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas (ya configurado)

---

## 📊 ANÁLISIS DEL ESTADO ACTUAL

### ✅ **LO QUE YA ESTÁ BIEN**
1. **MongoDB Atlas**: Ya configurado correctamente en `server/.env`
   - URL: `mongodb+srv://beheresmann_admin:***@sgib-hero.bshxmvv.mongodb.net/sistema-bomberos`
   - Prisma schema configurado para MongoDB
   - No requiere cambios adicionales

2. **Estructura de proyecto**: Monorepo bien organizado
   ```
   team_16/
   ├── client/          # Frontend React + Vite
   ├── server/          # Backend Node.js + Express
   └── package.json     # Root con workspaces
   ```

3. **Variables de entorno parcialmente implementadas**:
   - `licenciasSlice.js` ya usa `import.meta.env.VITE_API_URL`
   - Backend ya lee de `process.env`

### ❌ **LO QUE NECESITA CAMBIOS**

#### **CRÍTICO - URLs Hardcodeadas**
| Archivo | Línea | Problema | Impacto |
|---------|-------|----------|---------|
| `client/src/services/api.js` | 5 | `baseURL: 'http://localhost:3002/api'` | **CRÍTICO** - Todas las llamadas API fallarán |
| `client/src/components/licencias/LicenciaForm.jsx` | 64 | `fetch('http://localhost:3002/api/bomberos/me')` | **ALTO** - Falla creación de licencias |
| `client/src/components/carros/AsignarMaterialDialog.jsx` | 51 | `axios.get('http://localhost:3001/api/material')` | **MEDIO** - Puerto incorrecto (3001 vs 3002) |
| `client/vite.config.js` | 21-29 | Proxy local configurado | **BAJO** - Solo para desarrollo |

#### **CONFIGURACIÓN FALTANTE**
1. **Frontend**: No existe archivo `.env` en `client/`
2. **CORS**: Backend solo acepta `http://localhost:5173`
3. **Archivos de despliegue**: No existen `vercel.json` ni `railway.json`

---

## 🔧 CAMBIOS REQUERIDOS (DETALLADOS)

### 1️⃣ **FRONTEND - Configuración de Variables de Entorno**

#### A) Crear `client/.env.example`
```env
# API Backend URL
VITE_API_URL=http://localhost:3002/api

# Environment
VITE_ENV=development
```

#### B) Crear `client/.env` (para desarrollo local)
```env
VITE_API_URL=http://localhost:3002/api
VITE_ENV=development
```

#### C) Actualizar `.gitignore`
Asegurar que `.env` esté ignorado (ya está ✅)

---

### 2️⃣ **FRONTEND - Modificar Archivos con URLs Hardcodeadas**

#### **Archivo 1: `client/src/services/api.js`** (CRÍTICO)

**ANTES:**
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

**DESPUÉS:**
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

---

#### **Archivo 2: `client/src/components/licencias/LicenciaForm.jsx`** (ALTO)

**ANTES (línea ~64):**
```javascript
const response = await fetch('http://localhost:3002/api/bomberos/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**DESPUÉS:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
const response = await fetch(`${API_URL}/bomberos/me`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

#### **Archivo 3: `client/src/components/carros/AsignarMaterialDialog.jsx`** (MEDIO)

**ANTES (línea ~51):**
```javascript
const response = await axios.get('http://localhost:3001/api/material', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

**DESPUÉS:**
```javascript
import api from '../../services/api'; // Usar instancia configurada de axios

// Cambiar fetch directo por:
const response = await api.get('/material');
```

**NOTA**: Este archivo usa puerto 3001 (incorrecto). Usar `api.js` resuelve el problema.

---

### 3️⃣ **BACKEND - Configuración CORS para Producción**

#### **Archivo: `server/src/index.js`** (líneas 47-54)

**ANTES:**
```javascript
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}))
```

**DESPUÉS:**
```javascript
// CORS dinámico para desarrollo y producción
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}))
```

---

### 4️⃣ **BACKEND - Variables de Entorno para Railway**

#### **Actualizar `server/.env.example`**
```env
# Environment
NODE_ENV=production
PORT=3002

# Database MongoDB Atlas
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT
JWT_SECRET=CHANGE_THIS_IN_PRODUCTION
JWT_EXPIRE=7d

# CORS (separar múltiples origins con comas)
CORS_ORIGIN=https://tu-app.vercel.app,https://www.tu-app.vercel.app

# Rate Limiting
ENABLE_RATE_LIMIT=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=12
```

---

### 5️⃣ **ARCHIVOS DE CONFIGURACIÓN PARA DESPLIEGUE**

#### A) Crear `vercel.json` (en la raíz del proyecto)
```json
{
  "version": 2,
  "name": "sgib-web-frontend",
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "client/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### B) Crear `railway.json` (en la raíz del proyecto)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd server && npm install && npx prisma generate"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### C) Crear `Procfile` (en server/)
```
web: node src/index.js
```

---

### 6️⃣ **OPTIMIZACIONES ADICIONALES**

#### A) **Actualizar `server/package.json`**
Agregar script de inicio para producción:
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "build": "npx prisma generate",
    "postinstall": "npx prisma generate"
  }
}
```

#### B) **Actualizar `client/package.json`**
Asegurar que el build sea optimizado:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 📝 CHECKLIST DE CAMBIOS

### Frontend (7 cambios)
- [ ] Crear `client/.env.example`
- [ ] Crear `client/.env`
- [ ] Modificar `client/src/services/api.js` (línea 5)
- [ ] Modificar `client/src/components/licencias/LicenciaForm.jsx` (línea 64)
- [ ] Modificar `client/src/components/carros/AsignarMaterialDialog.jsx` (línea 51)
- [ ] Crear `vercel.json` en raíz
- [ ] Actualizar `client/package.json`

### Backend (5 cambios)
- [ ] Modificar `server/src/index.js` (CORS dinámico)
- [ ] Actualizar `server/.env.example`
- [ ] Crear `railway.json` en raíz
- [ ] Crear `Procfile` en server/
- [ ] Actualizar `server/package.json`

### Database (0 cambios)
- ✅ MongoDB Atlas ya configurado correctamente
- ✅ Prisma schema correcto
- ✅ DATABASE_URL en formato correcto

---

## 🚀 PASOS DE DESPLIEGUE

### **PASO 1: Preparar el Código**
```bash
# 1. Realizar todos los cambios listados arriba
# 2. Commit y push
git add .
git commit -m "feat: Preparar proyecto para despliegue en Vercel y Railway"
git push origin main
```

### **PASO 2: Desplegar Backend en Railway**
1. Ir a [railway.app](https://railway.app)
2. Crear nuevo proyecto desde GitHub (SGIB-WEB)
3. Configurar variables de entorno:
   ```env
   NODE_ENV=production
   PORT=3002
   DATABASE_URL=mongodb+srv://beheresmann_admin:vNbPnQIFeiBqmMhS@sgib-hero.bshxmvv.mongodb.net/sistema-bomberos?retryWrites=true&w=majority&appName=SGIB-HERO
   JWT_SECRET=sistema_bomberos_super_secret_key_2024_PRODUCTION
   JWT_EXPIRE=7d
   CORS_ORIGIN=https://sgib-web.vercel.app
   ENABLE_RATE_LIMIT=true
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   BCRYPT_SALT_ROUNDS=12
   ```
4. Configurar directorio raíz: `server`
5. Deploy automático se ejecutará
6. Copiar la URL pública (ej: `https://sgib-web-production.up.railway.app`)

### **PASO 3: Desplegar Frontend en Vercel**
1. Ir a [vercel.com](https://vercel.com)
2. Importar proyecto desde GitHub (SGIB-WEB)
3. Configurar:
   - Framework Preset: **Vite**
   - Root Directory: `./` (raíz)
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
4. Agregar variables de entorno:
   ```env
   VITE_API_URL=https://sgib-web-production.up.railway.app/api
   VITE_ENV=production
   ```
5. Deploy

### **PASO 4: Actualizar CORS en Railway**
1. Una vez que Vercel te dé la URL final (ej: `https://sgib-web.vercel.app`)
2. Volver a Railway
3. Actualizar variable `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://sgib-web.vercel.app,https://www.sgib-web.vercel.app
   ```
4. Redeploy automático

### **PASO 5: Verificación**
```bash
# Test backend
curl https://sgib-web-production.up.railway.app/health

# Test frontend
# Visitar https://sgib-web.vercel.app
# Intentar login
```

---

## ⚠️ PROBLEMAS POTENCIALES Y SOLUCIONES

### Problema 1: "Network Error" en Producción
**Causa**: CORS mal configurado
**Solución**: Verificar que `CORS_ORIGIN` en Railway incluye el dominio de Vercel exacto

### Problema 2: "Invalid token" después de deploy
**Causa**: JWT_SECRET diferente entre deploys
**Solución**: Usar el mismo JWT_SECRET en Railway que en desarrollo (o generar uno nuevo y limpiar tokens)

### Problema 3: Prisma no genera el cliente
**Causa**: Falta `prisma generate` en el build
**Solución**: Ya incluido en `postinstall` script

### Problema 4: Assets no cargan (imágenes de bomberos)
**Causa**: Ruta `/assets` no servida correctamente
**Solución**: Verificar que Railway sirve archivos estáticos desde `assets/`

### Problema 5: Build de Vercel falla
**Causa**: Dependencias del monorepo
**Solución**: Usar `buildCommand` personalizado en `vercel.json`

---

## 🔒 SEGURIDAD EN PRODUCCIÓN

### CRÍTICO - Cambiar en Producción:
1. **JWT_SECRET**: Generar nuevo secreto fuerte
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
2. **MongoDB Password**: Considerar rotar después de deploy
3. **Rate Limiting**: Habilitar en producción (`ENABLE_RATE_LIMIT=true`)

### Variables sensibles a proteger:
- ✅ `.env` ya está en `.gitignore`
- ⚠️ **NO SUBIR** `.env` al repositorio
- ✅ Usar variables de entorno en Railway/Vercel

---

## 📊 RESUMEN DE IMPACTO

| Categoría | Cambios | Complejidad | Tiempo Estimado |
|-----------|---------|-------------|-----------------|
| Frontend | 7 archivos | Media | 30 min |
| Backend | 5 archivos | Baja | 20 min |
| Database | 0 cambios | N/A | 0 min |
| Configuración | 3 archivos nuevos | Media | 20 min |
| Testing | Verificación | Media | 30 min |
| **TOTAL** | **15 cambios** | **Media** | **~2 horas** |

---

## ✅ CONCLUSIÓN

**¿Se necesitan muchos cambios?** 
- **NO para la lógica de negocio** (0 cambios)
- **SÍ para la configuración** (15 archivos)

**Cambios críticos**: Solo 3 archivos JS necesitan modificación real
- `api.js` → 1 línea
- `LicenciaForm.jsx` → 2 líneas
- `AsignarMaterialDialog.jsx` → Usar `api.js`

**El resto son configuraciones** (`.env`, `vercel.json`, `railway.json`)

**Base de datos**: ✅ MongoDB Atlas ya está listo, 0 cambios necesarios

---

## 📞 PRÓXIMOS PASOS

¿Quieres que proceda a hacer estos cambios ahora? Puedo:

1. ✅ Crear todos los archivos de configuración
2. ✅ Modificar los archivos JS necesarios
3. ✅ Actualizar la documentación
4. ✅ Hacer commit y push
5. ✅ Darte instrucciones paso a paso para deploy en Railway/Vercel

**Responde "sí" para comenzar** 🚀
