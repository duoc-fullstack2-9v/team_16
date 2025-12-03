/*
  Warnings:

  - You are about to drop the column `fechaInicio` on the `oficiales` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `oficiales` table. All the data in the column will be lost.
  - You are about to drop the column `responsabilidad` on the `oficiales` table. All the data in the column will be lost.
  - Added the required column `apellidos` to the `oficiales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `oficiales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rango` to the `oficiales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rut` to the `oficiales` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_oficiales" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "rango" TEXT NOT NULL,
    "cargo" TEXT,
    "especialidades" TEXT,
    "departamento" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "fechaIngreso" DATETIME,
    "fechaNacimiento" DATETIME,
    "direccion" TEXT,
    "estadoCivil" TEXT,
    "nivelEducacion" TEXT,
    "certificaciones" TEXT,
    "experienciaAnios" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "fotoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" INTEGER,
    "superiornId" INTEGER,
    CONSTRAINT "oficiales_superiornId_fkey" FOREIGN KEY ("superiornId") REFERENCES "oficiales" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "oficiales_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_oficiales" ("cargo", "createdAt", "email", "id", "telefono", "updatedAt") SELECT "cargo", "createdAt", "email", "id", "telefono", "updatedAt" FROM "oficiales";
DROP TABLE "oficiales";
ALTER TABLE "new_oficiales" RENAME TO "oficiales";
CREATE UNIQUE INDEX "oficiales_rut_key" ON "oficiales"("rut");
CREATE UNIQUE INDEX "oficiales_email_key" ON "oficiales"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
