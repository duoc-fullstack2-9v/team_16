-- CreateTable
CREATE TABLE "categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "parentId" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categorias_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fotoUrl" TEXT,
    "categoriaId" INTEGER,
    "estado" TEXT NOT NULL DEFAULT 'Disponible',
    "tipo" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "cantidad" INTEGER,
    "unidadMedida" TEXT,
    "fechaAdquisicion" DATETIME,
    "ubicacionFisica" TEXT,
    "fechaVencimiento" DATETIME,
    "fechaMantencion" DATETIME,
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "material_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "asignaciones_material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    "bomberoId" INTEGER,
    "carroId" INTEGER,
    "fechaAsignacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDevolucion" DATETIME,
    "motivo" TEXT,
    "observaciones" TEXT,
    "cantidadAsignada" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "asignaciones_material_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "material" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "asignaciones_material_bomberoId_fkey" FOREIGN KEY ("bomberoId") REFERENCES "bomberos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");
