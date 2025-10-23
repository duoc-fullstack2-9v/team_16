-- CreateTable
CREATE TABLE "guardias_mensuales" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "minimoBomberos" INTEGER NOT NULL DEFAULT 4,
    "notas" TEXT,
    "creadoPorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "guardias_mensuales_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "guardias_dias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "notas" TEXT,
    "guardiaMensualId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "guardias_dias_guardiaMensualId_fkey" FOREIGN KEY ("guardiaMensualId") REFERENCES "guardias_mensuales" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "guardias_dias_bomberos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guardiaDiaId" INTEGER NOT NULL,
    "bomberoId" INTEGER NOT NULL,
    "comentario" TEXT,
    "asignadoPorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "guardias_dias_bomberos_guardiaDiaId_fkey" FOREIGN KEY ("guardiaDiaId") REFERENCES "guardias_dias" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "guardias_dias_bomberos_bomberoId_fkey" FOREIGN KEY ("bomberoId") REFERENCES "bomberos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "guardias_dias_bomberos_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "guardias_mensuales_mes_anio_key" ON "guardias_mensuales"("mes", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "guardias_dias_guardiaMensualId_fecha_key" ON "guardias_dias"("guardiaMensualId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "guardias_dias_bomberos_guardiaDiaId_bomberoId_key" ON "guardias_dias_bomberos"("guardiaDiaId", "bomberoId");
