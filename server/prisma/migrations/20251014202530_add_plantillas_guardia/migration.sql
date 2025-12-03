-- CreateTable
CREATE TABLE "plantillas_guardia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "creadoPorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "plantillas_guardia_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plantillas_dias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plantillaId" INTEGER NOT NULL,
    "diaNumero" INTEGER,
    "diaSemana" INTEGER,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "plantillas_dias_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "plantillas_guardia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plantillas_dias_bomberos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plantillaDiaId" INTEGER NOT NULL,
    "bomberoId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plantillas_dias_bomberos_plantillaDiaId_fkey" FOREIGN KEY ("plantillaDiaId") REFERENCES "plantillas_dias" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "plantillas_dias_bomberos_bomberoId_fkey" FOREIGN KEY ("bomberoId") REFERENCES "bomberos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_guardia_nombre_key" ON "plantillas_guardia"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_dias_bomberos_plantillaDiaId_bomberoId_key" ON "plantillas_dias_bomberos"("plantillaDiaId", "bomberoId");
