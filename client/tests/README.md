# 🧪 Guía de Pruebas Unitarias - Sistema Bomberos

Esta guía documenta la configuración y ejecución de pruebas unitarias en React utilizando **Vitest** y **Testing Library**, siguiendo las indicaciones del profesor.

## 📦 Stack de Testing

| Herramienta | Versión | Propósito |
|------------|---------|-----------|
| **Vitest** | ^2.1.8 | Framework de testing rápido e integrado con Vite |
| **@testing-library/react** | ^16.1.0 | Pruebas de componentes React |
| **@testing-library/jest-dom** | ^6.9.1 | Matchers adicionales (toBeInTheDocument, etc.) |
| **@testing-library/user-event** | ^14.6.1 | Simulación realista de eventos de usuario |
| **@vitest/coverage-v8** | ^2.1.8 | Reportes de cobertura de código |
| **jsdom** | ^25.0.2 | DOM virtual para ejecutar pruebas en Node.js |

## ⚙️ Configuración Realizada

### 1. Instalación de Dependencias

```bash
cd client
npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 2. Configuración de Vitest en `vite.config.js`

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
  // ... resto de configuración
});
```

### 3. Archivo de Setup Global (`tests/setup.js`)

```javascript
import "@testing-library/jest-dom";
```

### 4. Scripts en `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 🧪 Estructura de Pruebas

```
client/
├── tests/
│   ├── setup.js                    # Configuración global
│   ├── BomberoCard.spec.jsx        # Pruebas de tarjeta de bombero
│   ├── BomberoForm.spec.jsx        # Pruebas de formulario
│   └── LoginPage.spec.jsx          # Pruebas de página de login
└── src/
    └── components/
        └── bomberos/
            ├── BomberoCard.jsx
            └── BomberoForm.jsx
```

## 🚀 Ejecutar Pruebas

### Modo Consola (Recomendado para CI/CD)

```bash
# Ejecutar todas las pruebas
npm run test

# Ejecutar en modo watch (re-ejecuta al guardar cambios)
npm run test -- --watch

# Ejecutar una prueba específica
npm run test BomberoCard
```

### Modo Visual (UI Interactiva)

```bash
npm run test:ui
```

**Nota:** La primera vez solicitará instalar `@vitest/ui`. Responder **Y** (Yes).

### Reporte de Cobertura

```bash
npm run test:coverage
```

Esto generará:
- Reporte en consola con porcentajes de cobertura
- Reporte HTML en `coverage/index.html`

Para abrir el reporte HTML:

```bash
# Windows
start coverage/index.html

# Linux/Mac
open coverage/index.html
```

## 📝 Ejemplos de Pruebas

### Patrón Básico: Renderizar y Verificar Texto

```javascript
import { render, screen } from "@testing-library/react";
import MiComponente from "./MiComponente";

describe("MiComponente", () => {
  it("renderiza el título correctamente", () => {
    render(<MiComponente />);
    expect(screen.getByText(/Título del componente/i)).toBeInTheDocument();
  });
});
```

### Patrón: Interacción de Usuario

```javascript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("permite escribir en un campo de texto", async () => {
  const user = userEvent.setup();
  render(<FormularioEjemplo />);
  
  const input = screen.getByLabelText(/nombre/i);
  await user.type(input, "Juan Pérez");
  
  expect(input).toHaveValue("Juan Pérez");
});
```

### Patrón: Simulación de Clicks

```javascript
import { render, screen, fireEvent } from "@testing-library/react";

it("ejecuta una función al hacer clic", () => {
  const handleClick = vi.fn();
  render(<Boton onClick={handleClick} />);
  
  const button = screen.getByRole("button");
  fireEvent.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Patrón: Componentes con Redux

```javascript
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import bomberosReducer from "../store/slices/bomberosSlice";

const renderWithProviders = (component) => {
  const store = configureStore({
    reducer: {
      bomberos: bomberosReducer,
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};
```

## 🎯 Buenas Prácticas Recomendadas por el Profesor

1. ✅ **Prueba lo que el usuario ve/hace**, no la implementación interna
2. ✅ **Usa `user-event`** para simular interacciones realistas (clics, tipeo)
3. ✅ **Mantén los tests simples y descriptivos**
4. ✅ **Organiza las pruebas en la carpeta `tests/`** al mismo nivel que `src/`
5. ✅ **Usa `describe()` para agrupar pruebas relacionadas**
6. ✅ **Nombres descriptivos**: `it("hace algo específico cuando...")`

## 📊 Cobertura Esperada

El profesor espera una cobertura mínima de:
- **Statements:** 70%+
- **Branches:** 60%+
- **Functions:** 70%+
- **Lines:** 70%+

## 🔍 Matchers Comunes de Testing Library

| Matcher | Uso |
|---------|-----|
| `toBeInTheDocument()` | Verifica que un elemento existe en el DOM |
| `toHaveValue()` | Verifica el valor de un input |
| `toHaveAttribute()` | Verifica que un elemento tiene cierto atributo |
| `toBeDisabled()` | Verifica que un elemento está deshabilitado |
| `toHaveBeenCalled()` | Verifica que una función fue llamada |
| `toHaveBeenCalledWith()` | Verifica con qué argumentos se llamó |

## 🛠️ Queries Comunes

| Query | Uso |
|-------|-----|
| `getByText()` | Busca por texto visible |
| `getByLabelText()` | Busca inputs por su label |
| `getByRole()` | Busca por rol ARIA (button, textbox, etc.) |
| `getByTestId()` | Busca por atributo `data-testid` |
| `queryBy*()` | Igual que `getBy*` pero retorna `null` si no existe |
| `findBy*()` | Versión asíncrona de `getBy*` |

## 📁 Pruebas Implementadas

### ✅ BomberoCard.spec.jsx (10 pruebas | Cobertura: 51.85%)
- Renderizado de datos del bombero (nombre, rango, email, teléfono)
- Visualización de estados con chips (Activo, Inactivo, Licencia)
- Interacción con botones de acción (Ver, Editar, Eliminar)
- Carga y renderizado de imagen/foto

### ✅ BomberoForm.spec.jsx (10 pruebas | Cobertura: 48.48%)
- Renderizado de formulario completo
- Validaciones de campos requeridos
- Modo creación vs edición (títulos dinámicos)
- Interacciones de usuario (tipeo en nombres, apellidos, email, teléfono)
- Carga de datos en modo edición
- Callbacks de botones (Guardar, Cancelar)

### ✅ LoginPage.spec.jsx (12 pruebas | Cobertura: 64.44%)
- Renderizado de página de login (título, subtítulo, emoji)
- Campos de formulario (usuario/email, contraseña)
- Validaciones de credenciales
- Estado de carga (botón deshabilitado)
- Botones de acceso rápido para usuarios de prueba
- Mensajes instructivos

### ✅ CitacionCard.spec.jsx (13 pruebas | Cobertura: 77.77%)
- Renderizado de título y descripción
- Formato de fecha en español (date-fns locale)
- Formato de hora (HH:mm desde HH:mm:ss)
- Visualización de ubicación
- Estados con chips (Programada, Realizada, Cancelada)
- Contadores de bomberos (total, confirmados, pendientes)
- Botones de acción (Ver, Editar, Asignar)
- Visualización de avatares de bomberos
- Manejo de arrays vacíos

### ✅ CarroCard.spec.jsx (14 pruebas | Cobertura: 87.5%)
- Renderizado de nombre de carro
- Tipos de vehículo con chips (Bomba, Escala, Rescate, Ambulancia)
- Estados operativos con colores (Operativo, Mantenimiento, Fuera de Servicio)
- Información básica (patente, marca, modelo, año)
- Botones de acción (Ver detalle completo, Editar)
- Efecto hover en Card
- Contadores de recursos (cajoneras, material, conductores)

### ✅ ErrorBoundary.spec.jsx (11 pruebas | Cobertura: 72.72%)
- Renderizado normal de children sin errores
- Captura de errores de componentes hijos
- Interfaz de error con mensajes descriptivos
- Botón de recarga de página
- Botón de volver atrás
- Icono de alerta de error
- Renderizado de múltiples children
- Captura de errores en componentes anidados profundamente
- Título "Oops! Algo salió mal"

### ✅ ProtectedRoute.spec.jsx (10 pruebas | Cobertura: 100%)
- Renderizado de contenido cuando usuario está autenticado
- Bloqueo de contenido cuando no está autenticado
- Spinner de carga (CircularProgress) mientras loading=true
- Redirección a /login cuando no hay autenticación
- Renderizado de múltiples children
- Manejo correcto del estado de autenticación
- Verificación de token vs isAuthenticated

---

**Total: 80 tests pasando | Tiempo de ejecución: ~50 segundos**

**Cobertura Global:**
- Statements: 32.01%
- Branches: 37.95%  
- Functions: 21.29%
- Lines: 32.86%

**Componentes con mejor cobertura:**
1. ✅ ProtectedRoute.jsx - **100%** (10 tests)
2. ✅ CarroCard.jsx - **87.5%** (14 tests)
3. ✅ CitacionCard.jsx - **77.77%** (13 tests)
4. ✅ ErrorBoundary.jsx - **72.72%** (11 tests)
5. ✅ LoginPage.jsx - **64.44%** (12 tests)

## 🎓 Recursos Adicionales

- [Documentación Vitest](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Guía de Buenas Prácticas](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🚀 Siguiente Paso

Para ejecutar las pruebas:

```bash
cd client
npm run test
```

Para ver el reporte de cobertura:

```bash
npm run test:coverage
open coverage/index.html
```

---

**Fecha de Actualización:** 15 de Enero, 2025  
**Evaluación:** Segunda Evaluación - Pruebas Unitarias con Vitest + Testing Library  
**Profesor:** Según indicaciones del PDF proporcionado  
**Total de Tests:** 80 pruebas pasando en 7 archivos
