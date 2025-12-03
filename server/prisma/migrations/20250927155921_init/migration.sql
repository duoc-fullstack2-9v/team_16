-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'usuario',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bomberos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "rango" TEXT NOT NULL,
    "especialidad" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Activo',
    "telefono" TEXT,
    "email" TEXT,
    "direccion" TEXT,
    "fechaIngreso" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" INTEGER,
    CONSTRAINT "bomberos_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "oficiales" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "responsabilidad" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fechaInicio" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "citaciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "hora" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Programada',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" INTEGER,
    CONSTRAINT "citaciones_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bomberos_citaciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bomberoId" INTEGER NOT NULL,
    "citacionId" INTEGER NOT NULL,
    "asistio" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    CONSTRAINT "bomberos_citaciones_bomberoId_fkey" FOREIGN KEY ("bomberoId") REFERENCES "bomberos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bomberos_citaciones_citacionId_fkey" FOREIGN KEY ("citacionId") REFERENCES "citaciones" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bomberos_citaciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "solicitudes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "fechaSolicitud" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRespuesta" DATETIME,
    "observaciones" TEXT,
    "solicitanteId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "lugar" TEXT,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Programado',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "accion" TEXT NOT NULL,
    "tabla" TEXT,
    "registroId" INTEGER,
    "usuarioId" INTEGER,
    "detalles" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bomberos_citaciones_bomberoId_citacionId_key" ON "bomberos_citaciones"("bomberoId", "citacionId");
