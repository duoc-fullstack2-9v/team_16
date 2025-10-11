/*
  Warnings:

  - You are about to drop the column `nombre` on the `bomberos` table. All the data in the column will be lost.
  - Added the required column `apellidos` to the `bomberos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `bomberos` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bomberos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "rango" TEXT NOT NULL,
    "especialidad" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "fechaIngreso" DATETIME,
    "fotoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" INTEGER,
    CONSTRAINT "bomberos_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_bomberos" ("createdAt", "createdById", "direccion", "email", "especialidad", "estado", "fechaIngreso", "fotoUrl", "id", "rango", "telefono", "updatedAt") SELECT "createdAt", "createdById", "direccion", "email", "especialidad", "estado", "fechaIngreso", "fotoUrl", "id", "rango", "telefono", "updatedAt" FROM "bomberos";
DROP TABLE "bomberos";
ALTER TABLE "new_bomberos" RENAME TO "bomberos";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
