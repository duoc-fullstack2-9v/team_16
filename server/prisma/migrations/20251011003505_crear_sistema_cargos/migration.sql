/*
  Warnings:

  - You are about to drop the `oficiales` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "oficiales";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "cargos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "rama" TEXT NOT NULL,
    "jerarquia" INTEGER NOT NULL,
    "maxOcupantes" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "asignaciones_cargos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cargoId" INTEGER NOT NULL,
    "bomberoId" INTEGER NOT NULL,
    "fechaInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" DATETIME,
    "periodoAnio" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "asignaciones_cargos_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "cargos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "asignaciones_cargos_bomberoId_fkey" FOREIGN KEY ("bomberoId") REFERENCES "bomberos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "cargos_nombre_key" ON "cargos"("nombre");
