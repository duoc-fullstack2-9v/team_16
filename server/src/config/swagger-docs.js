/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticación de usuarios
 *   - name: Bomberos
 *     description: Gestión de bomberos
 *   - name: Citaciones
 *     description: Gestión de citaciones
 *   - name: Cargos
 *     description: Gestión de cargos
 *   - name: Guardias
 *     description: Gestión de guardias nocturnas
 *   - name: Licencias
 *     description: Gestión de licencias
 *   - name: Carros
 *     description: Gestión de carros bomba
 *   - name: Material
 *     description: Gestión de material
 *   - name: Admin
 *     description: Administración del sistema
 */

// ==================== AUTH ====================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 */

// ==================== BOMBEROS ====================

/**
 * @swagger
 * /bomberos:
 *   get:
 *     summary: Listar todos los bomberos
 *     tags: [Bomberos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Activo, Suspendido, Dado de Baja, Renuncia]
 *     responses:
 *       200:
 *         description: Lista de bomberos
 *   post:
 *     summary: Crear un nuevo bombero
 *     tags: [Bomberos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBombero'
 *     responses:
 *       201:
 *         description: Bombero creado
 *       400:
 *         description: Datos inválidos
 */

/**
 * @swagger
 * /bomberos/me:
 *   get:
 *     summary: Obtener bombero del usuario autenticado
 *     tags: [Bomberos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del bombero
 *       404:
 *         description: No encontrado
 */

/**
 * @swagger
 * /bomberos/{id}:
 *   get:
 *     summary: Obtener un bombero por ID
 *     tags: [Bomberos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del bombero
 *       404:
 *         description: No encontrado
 *   put:
 *     summary: Actualizar un bombero
 *     tags: [Bomberos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBombero'
 *     responses:
 *       200:
 *         description: Bombero actualizado
 *   delete:
 *     summary: Eliminar un bombero
 *     tags: [Bomberos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bombero eliminado
 */

/**
 * @swagger
 * /bomberos/{id}/cambiar-estado:
 *   post:
 *     summary: Cambiar estado de un bombero
 *     tags: [Bomberos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevoEstado
 *               - motivo
 *             properties:
 *               nuevoEstado:
 *                 type: string
 *                 enum: [Activo, Suspendido, Dado de Baja, Renuncia]
 *               motivo:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado cambiado
 */

// ==================== CITACIONES ====================

/**
 * @swagger
 * /citaciones:
 *   get:
 *     summary: Listar todas las citaciones
 *     tags: [Citaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de citaciones
 *   post:
 *     summary: Crear una nueva citación
 *     tags: [Citaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Citacion'
 *     responses:
 *       201:
 *         description: Citación creada
 */

/**
 * @swagger
 * /citaciones/{id}:
 *   get:
 *     summary: Obtener una citación por ID
 *     tags: [Citaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la citación
 *   put:
 *     summary: Actualizar una citación
 *     tags: [Citaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Citación actualizada
 *   delete:
 *     summary: Eliminar una citación
 *     tags: [Citaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Citación eliminada
 */

// ==================== CARGOS ====================

/**
 * @swagger
 * /cargos:
 *   get:
 *     summary: Listar todos los cargos
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cargos
 *   post:
 *     summary: Crear un nuevo cargo
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cargo'
 *     responses:
 *       201:
 *         description: Cargo creado
 */

/**
 * @swagger
 * /cargos/{id}:
 *   get:
 *     summary: Obtener un cargo por ID
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del cargo
 *   put:
 *     summary: Actualizar un cargo
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cargo actualizado
 *   delete:
 *     summary: Eliminar un cargo
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cargo eliminado
 */

// ==================== GUARDIAS ====================

/**
 * @swagger
 * /guardias/mensuales:
 *   get:
 *     summary: Listar guardias mensuales
 *     tags: [Guardias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de guardias mensuales
 *   post:
 *     summary: Crear una guardia mensual
 *     tags: [Guardias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GuardiaMensual'
 *     responses:
 *       201:
 *         description: Guardia creada
 */

/**
 * @swagger
 * /guardias/mensuales/{id}:
 *   get:
 *     summary: Obtener una guardia mensual por ID
 *     tags: [Guardias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la guardia
 *   put:
 *     summary: Actualizar una guardia mensual
 *     tags: [Guardias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guardia actualizada
 *   delete:
 *     summary: Eliminar una guardia mensual
 *     tags: [Guardias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guardia eliminada
 */

/**
 * @swagger
 * /guardias/plantillas:
 *   get:
 *     summary: Listar plantillas de guardia
 *     tags: [Guardias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de plantillas
 *   post:
 *     summary: Crear una plantilla de guardia
 *     tags: [Guardias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Plantilla creada
 */

/**
 * @swagger
 * /guardias/bomberos:
 *   get:
 *     summary: Listar bomberos disponibles para guardias
 *     tags: [Guardias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de bomberos
 */

// ==================== LICENCIAS ====================

/**
 * @swagger
 * /licencias:
 *   get:
 *     summary: Listar todas las licencias
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Pendiente, Aprobada, Rechazada, Cancelada, Activa, Finalizada]
 *       - in: query
 *         name: bomberoId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de licencias
 *   post:
 *     summary: Crear una nueva licencia
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Licencia'
 *     responses:
 *       201:
 *         description: Licencia creada
 */

/**
 * @swagger
 * /licencias/{id}:
 *   get:
 *     summary: Obtener una licencia por ID
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos de la licencia
 *   put:
 *     summary: Actualizar una licencia
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Licencia actualizada
 *   delete:
 *     summary: Eliminar una licencia
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Licencia eliminada
 */

/**
 * @swagger
 * /licencias/{id}/aprobar:
 *   post:
 *     summary: Aprobar una licencia
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Licencia aprobada
 */

/**
 * @swagger
 * /licencias/{id}/rechazar:
 *   post:
 *     summary: Rechazar una licencia
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Licencia rechazada
 */

/**
 * @swagger
 * /licencias/tipos:
 *   get:
 *     summary: Listar tipos de licencia
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de licencia
 */

/**
 * @swagger
 * /licencias/actualizar-estados:
 *   post:
 *     summary: Actualizar estados de licencias automáticamente
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estados actualizados
 */

// ==================== CARROS ====================

/**
 * @swagger
 * /carros:
 *   get:
 *     summary: Listar todos los carros bomba
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carros
 *   post:
 *     summary: Crear un nuevo carro
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Carro creado
 */

/**
 * @swagger
 * /carros/{id}:
 *   get:
 *     summary: Obtener un carro por ID
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del carro
 *   put:
 *     summary: Actualizar un carro
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carro actualizado
 *   delete:
 *     summary: Eliminar un carro
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carro eliminado
 */

// ==================== MATERIAL ====================

/**
 * @swagger
 * /material:
 *   get:
 *     summary: Listar todo el material
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de material
 *   post:
 *     summary: Crear nuevo material
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Material creado
 */

/**
 * @swagger
 * /material/{id}:
 *   get:
 *     summary: Obtener material por ID
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del material
 *   put:
 *     summary: Actualizar material
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Material actualizado
 *   delete:
 *     summary: Eliminar material
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Material eliminado
 */

// ==================== CATEGORIAS ====================

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Listar todas las categorías
 *     tags: [Material]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */

// ==================== ADMIN ====================

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Obtener estadísticas del sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Usuario creado
 */

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */

export default {};
