-- CreateTable
CREATE TABLE "carros" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "anioFabricacion" INTEGER,
    "patente" TEXT NOT NULL,
    "estadoOperativo" TEXT NOT NULL DEFAULT 'Operativo',
    "capacidadAgua" INTEGER,
    "capacidadEspuma" INTEGER,
    "potenciaMotobomba" TEXT,
    "capacidadMotobomba" TEXT,
    "capacidadCarga" TEXT,
    "fechaProximaMantencion" DATETIME,
    "fechaRevisionTecnica" DATETIME,
    "fechaPermisoCirculacion" DATETIME,
    "caracteristicas" JSONB,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPor" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "carros_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cajoneras" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carroId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Operativa',
    "observaciones" TEXT,
    "posicion" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cajoneras_carroId_fkey" FOREIGN KEY ("carroId") REFERENCES "carros" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conductores_habilitados" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carroId" INTEGER NOT NULL,
    "bomberoId" INTEGER NOT NULL,
    "fechaDesde" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHasta" DATETIME,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "conductores_habilitados_carroId_fkey" FOREIGN KEY ("carroId") REFERENCES "carros" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conductores_habilitados_bomberoId_fkey" FOREIGN KEY ("bomberoId") REFERENCES "bomberos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mantenciones_carro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carroId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaRealizada" DATETIME NOT NULL,
    "proximaFecha" DATETIME,
    "costo" REAL,
    "realizadoPor" TEXT,
    "observaciones" TEXT,
    "documentos" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "mantenciones_carro_carroId_fkey" FOREIGN KEY ("carroId") REFERENCES "carros" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historial_carro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carroId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cambios" JSONB,
    "usuarioId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_carro_carroId_fkey" FOREIGN KEY ("carroId") REFERENCES "carros" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "historial_carro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historial_cajonera" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cajoneraId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cambios" JSONB,
    "usuarioId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_cajonera_cajoneraId_fkey" FOREIGN KEY ("cajoneraId") REFERENCES "cajoneras" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "historial_cajonera_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_asignaciones_material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    "bomberoId" INTEGER,
    "carroId" INTEGER,
    "cajoneraId" INTEGER,
    "fechaAsignacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDevolucion" DATETIME,
    "motivo" TEXT,
    "observaciones" TEXT,
    "cantidadAsignada" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "asignaciones_material_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "material" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "asignaciones_material_bomberoId_fkey" FOREIGN KEY ("bomberoId") REFERENCES "bomberos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "asignaciones_material_carroId_fkey" FOREIGN KEY ("carroId") REFERENCES "carros" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "asignaciones_material_cajoneraId_fkey" FOREIGN KEY ("cajoneraId") REFERENCES "cajoneras" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_asignaciones_material" ("activo", "bomberoId", "cantidadAsignada", "carroId", "createdAt", "fechaAsignacion", "fechaDevolucion", "id", "materialId", "motivo", "observaciones", "updatedAt") SELECT "activo", "bomberoId", "cantidadAsignada", "carroId", "createdAt", "fechaAsignacion", "fechaDevolucion", "id", "materialId", "motivo", "observaciones", "updatedAt" FROM "asignaciones_material";
DROP TABLE "asignaciones_material";
ALTER TABLE "new_asignaciones_material" RENAME TO "asignaciones_material";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "carros_patente_key" ON "carros"("patente");

-- CreateIndex
CREATE UNIQUE INDEX "conductores_habilitados_carroId_bomberoId_key" ON "conductores_habilitados"("carroId", "bomberoId");
