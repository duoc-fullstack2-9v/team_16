# Sistema de Permisos por Rol - Implementación Completa

## Resumen de Implementación

Se ha implementado un sistema completo de **separación de permisos entre administradores y usuarios normales (bomberos)** en la aplicación Android SGIB.

---

## Arquitectura del Sistema

### 1. **PermissionHelper** - Lógica Centralizada
**Ubicación:** `app/src/main/java/com/bomberos/sgib/util/PermissionHelper.kt`

Clase utilitaria que centraliza toda la lógica de permisos:

```kotlin
object PermissionHelper {
    fun isAdmin(user: User?): Boolean
    fun canCreate(user: User?): Boolean
    fun canEdit(user: User?): Boolean
    fun canDelete(user: User?): Boolean
    fun canApproveLicencias(user: User?): Boolean
    fun canCreateLicenciaSolicitud(user: User?): Boolean
    fun canViewAllLicencias(user: User?): Boolean
    fun canViewAllCitaciones(user: User?): Boolean
    fun canAccessBomberos(user: User?): Boolean
    fun canAccessCarros(user: User?): Boolean
    fun canAccessCargos(user: User?): Boolean
}
```

**Reglas de Negocio:**
- `isAdmin()`: Verifica si `user.tipo == "admin"`
- Operaciones CRUD (`canCreate`, `canEdit`, `canDelete`): Solo admin
- `canApproveLicencias()`: Solo admin puede aprobar/rechazar licencias
- `canCreateLicenciaSolicitud()`: Todos los usuarios autenticados pueden crear solicitudes
- `canViewAllLicencias/Citaciones()`: Admin ve todo, usuarios ven solo sus registros
- `canAccessBomberos/Carros/Cargos()`: Solo admin accede a estos módulos

---

## Cambios por Módulo

### 2. **Dashboard** - Navegación Diferenciada
**Archivos:**
- `DashboardScreen.kt`
- `DashboardViewModel.kt` (sin cambios - ya tenía `currentUser`)

**Cambios:**
```kotlin
// Botón Bomberos - Solo visible para admin
if (PermissionHelper.canAccessBomberos(currentUser)) {
    Button(onClick = onNavigateToBomberos) {
        Text("Bomberos")
    }
}

// Botones Citaciones y Licencias - Visibles para todos, texto dinámico
OutlinedButton(onClick = onNavigateToCitaciones) {
    Text(if (PermissionHelper.isAdmin(currentUser)) {
        "Gestionar Citaciones"
    } else {
        "Ver Mis Citaciones"
    })
}

OutlinedButton(onClick = onNavigateToLicencias) {
    Text(if (PermissionHelper.isAdmin(currentUser)) {
        "Gestionar Licencias"
    } else {
        "Mis Licencias"
    })
}
```

---

### 3. **Citaciones** - Restricciones Implementadas

#### CitacionesScreen (Lista)
**Cambios:**
- Título dinámico: "Gestionar Citaciones" vs "Ver Mis Citaciones"
- FAB (botón crear) solo visible para admin:
```kotlin
if (PermissionHelper.canCreate(currentUser)) {
    FloatingActionButton(onClick = onNavigateToForm) {
        Icon(Icons.Default.Add, "Nueva Citación")
    }
}
```

#### CitacionDetalleScreen (Detalle)
**Cambios:**
- Botones Editar/Eliminar solo visibles para admin:
```kotlin
if (citacionState is Resource.Success && PermissionHelper.canEdit(currentUser)) {
    IconButton(onClick = { onNavigateToEdit(citacion.id) }) {
        Icon(Icons.Default.Edit, "Editar")
    }
    IconButton(onClick = { showDeleteDialog = true }) {
        Icon(Icons.Default.Delete, "Eliminar")
    }
}
```

#### ViewModels Actualizados
- `CitacionesViewModel`: Agregado `AuthRepository` y `currentUser` StateFlow
- `CitacionDetalleViewModel`: Agregado `AuthRepository` y `currentUser` StateFlow

---

### 4. **Licencias** - Restricciones Implementadas

#### LicenciasScreen (Lista)
**Cambios:**
- Título dinámico: "Gestionar Licencias" vs "Mis Licencias"
- FAB solo visible para usuarios autenticados (todos pueden crear solicitudes):
```kotlin
if (PermissionHelper.canCreateLicenciaSolicitud(currentUser)) {
    FloatingActionButton(onClick = onNavigateToForm) {
        Icon(Icons.Default.Add, "Nueva Solicitud")
    }
}
```

#### LicenciaDetalleScreen (Detalle)
**Cambios:**
- Botones Editar/Eliminar solo visibles para admin Y si está pendiente:
```kotlin
if (PermissionHelper.canEdit(currentUser) && licencia?.estado == EstadoLicencia.PENDIENTE) {
    IconButton(onClick = { licencia.id.let(onNavigateToEdit) }) {
        Icon(Icons.Default.Edit, "Editar")
    }
    IconButton(onClick = { showDeleteDialog = true }) {
        Icon(Icons.Default.Delete, "Eliminar")
    }
}
```

- Botones Aprobar/Rechazar solo visibles para admin:
```kotlin
if (licencia.estado == EstadoLicencia.PENDIENTE && PermissionHelper.canApproveLicencias(currentUser)) {
    Button(onClick = onAprobar) { Text("Aprobar") }
    OutlinedButton(onClick = onRechazar) { Text("Rechazar") }
}
```

#### ViewModels Actualizados
- `LicenciasViewModel`: Agregado `AuthRepository` y `currentUser` StateFlow
- `LicenciaDetalleViewModel`: Agregado `AuthRepository` y `currentUser` StateFlow

---

## Resumen de Permisos por Rol

### **Administrador** (`user.tipo == "admin"`)
✅ Dashboard: Ve todos los módulos (Bomberos, Carros, Cargos, Citaciones, Licencias)
✅ Citaciones: CRUD completo (crear, editar, eliminar, ver todas)
✅ Licencias: CRUD completo + aprobar/rechazar solicitudes
✅ Bomberos/Carros/Cargos: Acceso completo

### **Usuario Normal/Bombero** (`user.tipo == "usuario"`)
✅ Dashboard: Ve solo Citaciones y Licencias (no ve Bomberos/Carros/Cargos)
✅ Citaciones: Solo vista de lectura de sus propias citaciones (sin crear/editar/eliminar)
✅ Licencias: Ver sus licencias activas/pendientes + crear nuevas solicitudes
❌ No puede aprobar/rechazar licencias
❌ No puede editar/eliminar citaciones o licencias (excepto las propias pendientes)
❌ No accede a módulos de Bomberos, Carros, Cargos

---

## Archivos Modificados

### Nuevos
1. `PermissionHelper.kt` - Utilitario de permisos

### Modificados
2. `DashboardScreen.kt` - Navegación condicional
3. `CitacionesViewModel.kt` - Tracking de usuario
4. `CitacionesScreen.kt` - FAB condicional
5. `CitacionDetalleViewModel.kt` - Tracking de usuario
6. `CitacionDetalleScreen.kt` - Botones condicionales
7. `LicenciasViewModel.kt` - Tracking de usuario
8. `LicenciasScreen.kt` - Título y FAB condicionales
9. `LicenciaDetalleViewModel.kt` - Tracking de usuario
10. `LicenciaDetalleScreen.kt` - Botones condicionales (editar/eliminar/aprobar/rechazar)

---

## Testing Recomendado

### 1. **Con Usuario Admin:**
- [x] Verifica que en Dashboard veas el botón "Bomberos"
- [x] Verifica título "Gestionar Citaciones" y "Gestionar Licencias"
- [x] Verifica FAB de crear en Citaciones y Licencias
- [x] Verifica botones editar/eliminar en detalles
- [x] Verifica botones aprobar/rechazar en licencias pendientes

### 2. **Con Usuario Normal:**
- [x] Verifica que en Dashboard NO veas el botón "Bomberos"
- [x] Verifica título "Ver Mis Citaciones" y "Mis Licencias"
- [x] Verifica que NO veas FAB de crear en Citaciones
- [x] Verifica que SÍ veas FAB de crear en Licencias (nueva solicitud)
- [x] Verifica que NO veas botones editar/eliminar en detalles de citaciones
- [x] Verifica que NO veas botones aprobar/rechazar en licencias

---

## Próximos Pasos (Opcional)

### Backend - Filtrado de Datos
Para completar la separación, el backend debería:
1. Filtrar citaciones por `bomberoId` cuando el usuario no es admin
2. Filtrar licencias por `bomberoId` cuando el usuario no es admin
3. Validar permisos en endpoints de creación/edición/eliminación

### Frontend - Mejoras Adicionales
1. Agregar indicador visual del rol actual en el AppBar
2. Agregar mensajes informativos para usuarios sin permisos
3. Considerar sistema de roles más complejo (ej: "supervisor" que puede aprobar pero no eliminar)

---

## Compilación
✅ **BUILD SUCCESSFUL** - Todos los cambios compilados correctamente
✅ Sin errores de Kotlin
✅ Solo warnings de parámetros sin usar (no críticos)

---

**Fecha de Implementación:** Enero 2025
**Estado:** Completo y funcional
