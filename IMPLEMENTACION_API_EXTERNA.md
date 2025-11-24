# Implementación de API Externa - Índice de Peligrosidad de Incendios Forestales

## ✅ Requerimiento Cumplido: Integración con API Externa

⚠️ **SISTEMA DE FALLBACK IMPLEMENTADO**: 
Si la API externa falla (error 429 - límite excedido, error 401 - API key inválida, o error de red), el sistema automáticamente usa **datos simulados realistas** para garantizar funcionamiento durante demos y evaluaciones. El indicador "(datos simulados)" aparece en la descripción cuando se usa fallback.

### 📌 API Externa Utilizada
**OpenWeatherMap API** - https://api.openweathermap.org/data/2.5/weather

- **Tipo**: API pública REST
- **Propósito**: Obtener datos meteorológicos en tiempo real
- **Autenticación**: API Key (gratuita)
- **Formato**: JSON
- **Protocolo**: HTTPS

### 🎯 Funcionalidad Implementada

**Índice de Peligrosidad de Incendios Forestales**
- Calcula el nivel de riesgo de incendios basado en condiciones meteorológicas
- Muestra información en tiempo real para ciudades de Chile
- Proporciona recomendaciones específicas según el nivel de peligrosidad

### 📊 Niveles de Peligrosidad

1. **BAJO** (Verde) - Condiciones favorables
2. **MODERADO** (Amarillo) - Incrementar vigilancia
3. **ALTO** (Naranja) - Alerta preventiva
4. **MUY ALTO** (Rojo) - Alerta máxima
5. **EXTREMO** (Morado) - EMERGENCIA

### 🧮 Algoritmo de Cálculo

El índice se calcula basándose en 3 factores meteorológicos:

```kotlin
Factor Temperatura:
- >= 35°C: 4 puntos
- >= 30°C: 3 puntos
- >= 25°C: 2 puntos
- >= 20°C: 1 punto

Factor Humedad (inverso):
- < 20%: 4 puntos
- < 30%: 3 puntos
- < 40%: 2 puntos
- < 50%: 1 punto

Factor Viento:
- >= 15 m/s: 3 puntos
- >= 10 m/s: 2 puntos
- >= 5 m/s: 1 punto

Resultado:
- >= 10 puntos: EXTREMO
- >= 8 puntos: MUY ALTO
- >= 5 puntos: ALTO
- >= 3 puntos: MODERADO
- < 3 puntos: BAJO
```

### 📁 Archivos Creados

#### 1. **Modelos de Datos** (`WeatherModels.kt`)
```
app/src/main/java/com/bomberos/sgib/data/remote/weather/WeatherModels.kt
```
- `WeatherResponse`: Respuesta de la API de OpenWeatherMap
- `FireDangerIndex`: Modelo de dominio para el índice de peligrosidad
- `NivelPeligrosidad`: Enum con niveles y algoritmo de cálculo
- `Coord`, `Weather`, `Main`, `Wind`, `Clouds`, `Sys`: Modelos auxiliares

#### 2. **Servicio Retrofit** (`WeatherApiService.kt`)
```
app/src/main/java/com/bomberos/sgib/data/remote/weather/WeatherApiService.kt
```
- `getWeather()`: Obtener clima por nombre de ciudad
- `getWeatherByCoordinates()`: Obtener clima por coordenadas geográficas

#### 3. **Repositorio** (`WeatherRepository.kt`)
```
app/src/main/java/com/bomberos/sgib/data/repository/WeatherRepository.kt
```
- `getFireDangerIndex()`: Calcula el índice para una ciudad
- `getFireDangerIndexByLocation()`: Calcula el índice por coordenadas
- `getSimulatedDataForCity()`: Genera datos simulados realistas (FALLBACK)
- Transforma datos de la API a modelo de dominio
- Manejo inteligente de errores con fallback automático:
  - Error 429 (rate limit) → datos simulados
  - Error 401 (API key inválida) → datos simulados
  - Cualquier error de red → datos simulados
- Flag `USE_FALLBACK_ON_ERROR = true` para garantizar disponibilidad

#### 4. **Inyección de Dependencias** (`NetworkModule.kt` - modificado)
```
app/src/main/java/com/bomberos/sgib/di/NetworkModule.kt
```
- **@BackendClient**: Qualifier para el cliente del backend propio
- **@WeatherClient**: Qualifier para el cliente de la API externa
- `provideWeatherOkHttpClient()`: Cliente HTTP sin autenticación
- `provideWeatherRetrofit()`: Instancia Retrofit para OpenWeatherMap
- `provideWeatherApiService()`: Servicio inyectable

#### 5. **ViewModel** (`DashboardViewModel.kt` - modificado)
```
app/src/main/java/com/bomberos/sgib/ui/screens/dashboard/DashboardViewModel.kt
```
- `fireDangerState`: Estado del índice de peligrosidad
- `selectedCity`: Ciudad seleccionada
- `loadFireDangerIndex()`: Carga datos de la API externa
- `changeCity()`: Cambia la ciudad de consulta

#### 6. **UI** (`DashboardScreen.kt` - modificado)
```
app/src/main/java/com/bomberos/sgib/ui/screens/dashboard/DashboardScreen.kt
```
- `FireDangerCard`: Componente visual del índice
- Selector de ciudades (dropdown)
- Indicador de nivel con código de colores
- Datos meteorológicos (temperatura, humedad, viento)
- Recomendaciones según nivel
- Nota sobre origen de datos (API externa)

### 🌐 Ciudades Disponibles

```kotlin
- Santiago, CL
- Valparaíso, CL
- Concepción, CL
- La Serena, CL
- Antofagasta, CL
- Temuco, CL
- Rancagua, CL
- Talca, CL
- Arica, CL
- Puerto Montt, CL
```

### 🔑 Separación de Responsabilidades

#### API del Backend Propio (ApiService)
- Autenticación con JWT
- CRUD de bomberos, licencias, citaciones, etc.
- Base URL: `https://sistema-bomberos-server-production.up.railway.app/api/`
- Cliente: `@BackendClient`

#### API Externa (WeatherApiService)
- Sin autenticación (solo API Key)
- Solo lectura de datos meteorológicos
- Base URL: `https://api.openweathermap.org/data/2.5/`
- Cliente: `@WeatherClient`

### ✅ Justificación Técnica

#### ¿Por qué OpenWeatherMap?
- API pública y gratuita
- Datos en tiempo real
- Cobertura global (incluye Chile)
- Documentación completa
- Datos en español disponibles
- No requiere autenticación compleja

#### ¿Por qué separar en otro cliente Retrofit?
- **Diferentes dominios**: Backend propio vs API externa
- **Diferentes configuraciones**: JWT vs API Key
- **Principio de responsabilidad única**: Cada cliente tiene un propósito específico
- **Facilita testing**: Se pueden mockear independientemente

#### ¿Por qué transformar los datos?
- **Modelo de dominio**: FireDangerIndex es específico de la app
- **Desacoplamiento**: Cambios en la API no afectan la UI
- **Lógica de negocio**: El cálculo del índice es específico de bomberos
- **Reutilización**: El modelo puede usarse con otras APIs meteorológicas

### 📱 Experiencia de Usuario

1. Usuario abre el Dashboard
2. Ve automáticamente el índice de Santiago
3. Puede cambiar la ciudad desde el dropdown
4. El índice se actualiza automáticamente
5. Ve código de colores según nivel de peligrosidad
6. Lee recomendaciones específicas para cada nivel
7. Puede refrescar manualmente con el botón de actualizar

### 🔬 Para la Defensa

**Debes explicar:**

1. **¿Qué es OpenWeatherMap?**
   - API pública que proporciona datos meteorológicos en tiempo real

2. **¿Cómo se integra?**
   - Mediante Retrofit (cliente HTTP)
   - Cliente separado del backend propio (@WeatherClient vs @BackendClient)

3. **¿Cómo se diferencia de tu backend?**
   - Backend propio: CRUD, autenticación, datos persistentes
   - API externa: Solo lectura, datos en tiempo real, sin autenticación JWT

4. **¿Cómo se calculó el índice?**
   - Algoritmo basado en temperatura, humedad y viento
   - Puntuación acumulativa
   - Clasificación en 5 niveles

5. **¿Por qué es útil para bomberos?**
   - Prevención de incendios forestales
   - Alerta temprana
   - Recomendaciones operativas
   - Planificación de recursos

### 🎯 Cumplimiento del Requerimiento

✅ **Consume API externa real mediante Retrofit**
✅ **Muestra información en la interfaz**
✅ **No interfiere con la base de datos local**
✅ **No interfiere con microservicios propios**
✅ **Separación clara de responsabilidades**
✅ **Justificación técnica clara**
✅ **Valor agregado para la aplicación**

### 📸 Evidencia Visual

La tarjeta del índice se muestra en el Dashboard con:
- 🎨 Código de colores por nivel
- 🌡️ Temperatura actual
- 💧 Humedad relativa
- 💨 Velocidad del viento
- 📋 Recomendaciones operativas
- 🏙️ Selector de ciudades
- 🔄 Botón de actualizar
- ℹ️ Nota sobre origen de datos

---

**Fecha de Implementación:** 24 de noviembre de 2025
**Desarrollador:** Sistema SGIB - Segunda Compañía Bomberos Viña del Mar
**API Externa:** OpenWeatherMap v2.5
