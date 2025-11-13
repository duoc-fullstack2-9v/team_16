---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

## Headers

This file defines all project rules, coding standards, workflow guidelines, references, documentation structures, and best practices for the AI coding assistant. It is a living document that evolves with the project.

## TECH STACK

*   **Frontend:** React, Vite, Material UI, Redux
*   **Backend:** Node.js, Express
*   **Database:** MongoDB, Prisma
*   **Other:** Joi for validation, JWT for authentication, bcrypt for password hashing, concurrently for running multiple servers.

## PROJECT DOCUMENTATION & CONTEXT SYSTEM

*   All project-related information is stored in markdown files in the root directory.
*   `ANALISIS_COMPLETO_PROYECTO.md`: Comprehensive project analysis document, including architecture, database schema, API endpoints, authentication system, frontend structure, data flows, resolved issues, and a guide for creating new modules. This document is automatically updated after major feature implementations.

## CODING STANDARDS

*   **General:** Follow established coding conventions for Javascript/Typescript, React, Node.js and MongoDB.
*   **Prisma:** Use Prisma for database interactions. Ensure correct handling of MongoDB ObjectIds. When querying data from the `Bombero` model, use `nombres` instead of `nombre`. Ensure you are using `fotoUrl` instead of `fotoPerfil`. Ensure that the `User` model does not use the `apellido` field.
*   **Frontend:** Use Redux for state management. Organize components by module. When working with IDs in the frontend, ensure that you are not using `parseInt()` on IDs obtained from MongoDB. When interacting with local storage, ensure the correct token name (`bomberosToken`) is used. When sending `bomberoId` from the frontend, ensure it is sent as a string, not an integer. The `LicenciaForm` component should only return the content of the form (without the Dialog wrapper). The `Dialog` component should be handled in the parent component (`LicenciasPage.jsx`).
*   **Backend:** Use Joi for input validation. Implement proper authentication and authorization. Access user data from `req.user`, not `req.usuario`. When validating user roles, ensure the correct role name is being checked (e.g., `'Administrador'`).
*   **IDs:** When working with MongoDB and Prisma, handle IDs as strings (ObjectIds), not integers. Avoid using `parseInt()` on IDs obtained from `req.params.id`. Validate ObjectIds using `!cargoId || cargoId.length !== 24` and `Joi.string().length(24).hex()`.
*   **Authentication:** Ensure the correct token name (`bomberosToken`) is used when retrieving the token from local storage.
*   **Backend Authentication:** Use `req.user` to access user data from the authentication middleware. When accessing user data in the backend, always use `req.user` and not `req.usuario`.

## WORKFLOW & RELEASE RULES

*   **Git:** Use feature branches for all new development. When encountering issues checking out a branch due to untracked files, consider stashing changes (`git stash`), removing the conflicting directory, or cleaning the working directory. The project's sole repository is `https://github.com/BenjaminHeresmann/SGIB-WEB.git` on the `main` branch.
*   **Testing:** Thoroughly test all new code before committing.
*   **Deployment:** Automated deployment pipeline to be defined.
*   **Git Workflow:** When encountering issues checking out a branch due to untracked files, consider stashing changes (`git stash`), removing the conflicting directory, or cleaning the working directory.

## DEBUGGING

*   Check browser console for errors.
*   Examine server logs for errors.
*   Use debugging tools to step through code.
*   When debugging API calls, pay close attention to status codes (e.g., 500 Internal Server Error).
*   When debugging Prisma issues with MongoDB, check if IDs are being handled as strings (ObjectIds) instead of integers.
*   When encountering "403 Forbidden" errors, especially after implementing new modules, immediately verify the authentication middleware and ensure the correct tokens are being used and validated. Verify the correct token name is being used (`bomberosToken`). Also, ensure that `req.user` is being used in the backend to access user data from the authentication middleware.
*   When encountering 500 Internal Server Errors related to database queries, verify the Prisma schema and ensure that the field names used in the queries match the field names defined in the schema. For example, ensure that you are using `nombres` instead of `nombre` when querying the `Bombero` model. Also, verify that the fields exist in the model, e.g. `fotoUrl` instead of `fotoPerfil` and that the data types match. Also, ensure the field `apellido` is not being used for `User` model as it does not exist.
*   When debugging issues related to the `open` prop in Material UI Dialogs, ensure that the `open` and `onClose` props are correctly passed down from the parent component to the child component that contains the Dialog. Ensure that the `Dialog` component is only wrapped once and that there are no nested or conflicting `Dialog` wrappers.

## MODULE DEVELOPMENT GUIDELINES

When creating new modules, follow these steps:

1.  **Planning:**
    *   Define module requirements and functionality.
    *   Design database schema and API endpoints.
    *   Plan frontend components and UI.
2.  **Backend Implementation:**
    *   Update Prisma schema with new models and relations.
    *   Generate Prisma client.
    *   Create API routes and controllers.
    *   Implement input validation using Joi.
    *   Implement authentication and authorization.
3.  **Frontend Implementation:**
    *   Create Redux slice for managing module state.
    *   Create React components for UI.
    *   Connect components to Redux store.
4.  **Testing:**
    *   Thoroughly test all new code.
5.  **Documentation:**
    *   Update `ANALISIS_COMPLETO_PROYECTO.md` with module details.
6.  **Integration:**
    *   Integrate module into existing application.
7.  **Review:**
    *   Get code reviewed by another developer.

## LICENSING MODULE SPECIFIC RULES

1.  **License Types:** The system must support the following license types: Medical, Vacation, Personal Reasons, Studies, Labor, and Other (with a field for specifying the reason). Administrators should be able to add additional license types to the system.
2.  **License Duration:** Licenses must have a start and end date. They can be for hours or full days. There is no limit to the number of days per license type.
3.  **Supporting Documentation:** Users can attach supporting documentation (images and PDF documents) to their license requests, but this is not mandatory.
4.  **License Statuses:** The license statuses are: Pending, Approved, Rejected, Cancelled, Active, and Finalized.
5.  **Permissions:** Both administrators and firefighters can create license requests. Administrators can also create licenses for a firefighter. Future development will include roles that can approve licenses in addition to administrators.
6.  **Notifications:** Firefighters should be notified when their license request is approved or rejected. The administrator in charge should also receive a notification when a new request is created.
7.  **History and Statistics:** The system must maintain a history of licenses for each firefighter and provide statistics on license usage.
8.  **Guard Conflicts:** The system must generate an alert if a firefighter requests a license for a date when they are scheduled for guard duty. This should not automatically reject the license request, but should alert both the firefighter and the administrator. Approving the license does not automatically remove the firefighter from guard duty.
9.  **Justification:** Firefighters can justify their requests with a text box limited to 500 characters, but this is not mandatory. Administrators can add observations.
10. **License Scheduling:** Licenses must allow the selection of specific days of the week via checkboxes (Monday-Sunday), with options for same hours across all days or custom hours per day.

## LICENSING MODULE SPECIFIC BACKEND RULES

When creating a license for a firefighter:

1.  **Automatic `bomberoId` Handling:** If the `bomberoId` is not provided in the request (e.g., when a firefighter is creating a license for themselves), the backend must automatically determine the `bomberoId` of the logged-in user and use that.
2.   **Joi Validation:** The `bomberoId` field should be optional in the Joi schema for the `/api/licencias` endpoint, to accommodate scenarios where the backend automatically determines the ID.

## LICENSING MODULE SPECIFIC FRONTEND RULES

When creating a license for a firefighter:

1.  **Obtain `bomberoId`:** If `mostrarSelectorBombero` is false, the frontend must obtain the `bomberoId` from the authentication state.
2.  **`LicenciaForm` Component:** The `LicenciaForm` should only return the content of the form (without the Dialog wrapper). The `Dialog` component should be handled in the parent component (`LicenciasPage.jsx`).

## GIT REPOSITORY RULES

1.  **Main Repository:** The project's sole repository is `https://github.com/BenjaminHeresmann/SGIB-WEB.git` on the `main` branch.

## DEPLOYMENT RULES

When deploying to Vercel (frontend) and Railway (backend) as a monorepo:

1. **Variables of Environment and URLs**
   - **Backend (Railway):**
     - Railway will provide a public URL (e.g., `https://tu-app.railway.app`).
     - Update `CORS_ORIGIN` in the `.env` of Railway to allow the Vercel domain.
   - **Frontend (Vercel):**
     - Instead of `http://localhost:3002`, use an environment variable for the backend URL.

2. **Files to Modify**
   - Create a `.env` file in the frontend.
   - Modify:
     - `api.js`: Use environment variable.
     - `LicenciaForm.jsx`: Use environment variable.
     - `AsignarMaterialDialog.jsx`: Use `api.js`.

## BOMBERO (FIREFIGHTER) STATES

The `estado` field in the `Bombero` model represents the firefighter's work/administrative status. The valid states are:

1.  **"Activo"** - Firefighter is in normal service.
2.  **"Suspendido"** - Administrative sanction.
3.  **"Dado de Baja"** - Separated from service.
4.  **"Renuncia"** - Voluntarily resigned.

The old states "Licencia" and "Inactivo" are no longer valid. A firefighter's `estado` should be updated by an administrator. A firefighter's `estado` of "Activo" does not preclude them from having a license.

## INTEGRATION RULES: BOMBERO STATES AND LICENSES

When a license is approved, rejected, or cancelled, the following rules apply to maintain consistency between the `Bombero` state and the `Licencia` status:

1.  **When a license is APPROVED:** No changes to the `Bombero` state should occur automatically. A firefighter can be "Activo" and simultaneously have an approved license.

2.  **When a license is REJECTED:** No changes to the `Bombero` state should occur.

3.  **When a license is CANCELLED:** No changes to the `Bombero` state should occur.

It is acceptable for a Bombero to be "Activo" while holding an "Active" license. The `estado` of a Bombero should only be changed by an administrator.

## BOMBERO (FIREFIGHTER) STATE MANAGEMENT

These rules govern the management of a firefighter's `estado` (work/administrative status) by an administrator.

1.  **Valid States:** The valid states for a firefighter are: "Activo", "Suspendido", "Dado de Baja", and "Renuncia".

2.  **State Transitions:** Only administrators can change a firefighter's `estado`.

3.  **State Change Reasons:** When changing a firefighter's state, the administrator must provide a reason for the change. This reason, along with the date of the change, must be recorded in the `HistorialEstadoBombero` model.

4.  **License Validation:** Only firefighters with the state "Activo" can request licenses.

5.  **License Handling on State Change:** When a firefighter's state is changed to "Suspendido", "Dado de Baja", or "Renuncia", a warning should be displayed if the firefighter has any pending licenses. Auto-cancellation of pending licenses is optional.

## AUTOMATIC LICENSE STATE UPDATES

The system should automatically update the state of licenses based on their start and end dates.

1.  **Daily Update:** A function should run daily (or upon license consultation) to update license states.

2.  **State Transitions:**
    *   Licenses with state "Aprobada" and `fechaInicio` <= today's date should transition to "Activa".
    *   Licenses with state "Activa" and `fechaFin` < today's date should transition to "Finalizada".

3.  **Manual Trigger:** An endpoint (`POST /api/licencias/actualizar-estados`) should be available for administrators to manually trigger the license state update function.

## DATA MIGRATION

1.  **"Inactivo" State Handling:** All firefighters with the state "Inactivo" should be changed to "Activo".

## PRISMA SCHEMA UPDATES

The `Bombero` model has been updated to include:

*   Valid states: "Activo", "Suspendido", "Dado de Baja", "Renuncia"
*   Fields for tracking state changes: `motivoEstado` (String, optional), `fechaCambioEstado` (DateTime, optional)
*   Relation to a new model `HistorialEstadoBombero` to store state change history.

The `User` model has been updated to include:

*   Relation to `HistorialEstadoBombero` to track state changes.

The `Licencia` model has been updated to include:

*   `diasSemana` (JSON array with configuration of each day)
*   `mismoHorarioTodos` (Boolean)
*   `horaInicioGeneral`
*   `horaFinGeneral`

The following fields have been removed from the `Licencia` model:
*   `esPorHoras`
*   `horaInicio`
*   `horaFin`

## ESTADO MANAGEMENT IMPLEMENTATION

The estado management system has been fully implemented with the following components:

### Backend Endpoints
*   **POST /api/bomberos/:id/cambiar-estado** - Change bombero estado (admin only)
    - Requires: `nuevoEstado`, `motivo` (required), `observaciones` (optional)
    - Creates automatic audit entry in `HistorialEstadoBombero`
    - Updates `Bombero.estado`, `motivoEstado`, and `fechaCambioEstado`
*   **GET /api/bomberos/:id/historial-estados** - Get estado change history
    - Returns complete audit trail with admin information
*   **POST /api/licencias/actualizar-estados** - Auto-update license states (admin only)
    - Updates Aprobada → Activa (if fechaInicio <= today)
    - Updates Activa → Finalizada (if fechaFin < today)

### Frontend Components
*   **CambiarEstadoDialog** - Dialog for changing bombero estado
    - Located at: `client/src/components/bomberos/CambiarEstadoDialog.jsx`
    - Fields: Estado dropdown, motivo (required, max 200 chars), observaciones (optional, max 500 chars)
    - Validations: Prevents same estado, requires motivo
    - Warnings for different estados
*   **BomberosList** - Integrated estado management button
    - Button with SwapHorizIcon (warning color)
    - Handlers: handleOpenCambiarEstado, handleCloseCambiarEstado, handleConfirmCambioEstado
    - Auto-refresh list after estado change

### Redux State Management
*   **bomberosSlice** - Estado management actions
    - `cambiarEstadoBombero` thunk - Changes estado and updates state
    - `fetchHistorialEstados` thunk - Fetches audit history
    - State fields: `historialEstados`, `historialLoading`
    - Stats updated: `totalSuspendidos`, `totalBajas`, `totalRenuncias`, `totalNoActivos`

### UI Elements
*   Estado chips with colors:
    - Activo: success (green)
    - Suspendido: warning (orange)
    - Dado de Baja: error (red)
    - Renuncia: default (gray)

### Business Logic
*   Only Activo bomberos can create licenses (validated in backend)
*   Only administrators can change estados
*   All estado changes are audited in HistorialEstadoBombero
*   Estado and Licencias are independent systems
*   The `LicenciaForm` component should only return the content of the form (without the Dialog wrapper). The `Dialog` component should be handled in the parent component (`LicenciasPage.jsx`).

## LICENSING MODULE SPECIFIC RULES (UPDATED)

1.  **License Types:** The system must support the following license types: Medical, Vacation, Personal Reasons, Studies, Labor, and Other (with a field for specifying the reason). Administrators should be able to add additional license types to the system.
2.  **License Duration:** Licenses must have a start and end date. They can be for hours or full days. There is no limit to the number of days per license type.
3.  **Supporting Documentation:** Users can attach supporting documentation (images and PDF documents) to their license requests, but this is not mandatory.
4.  **License Statuses:** The license statuses are: Pending, Approved, Rejected, Cancelled, Active, and Finalized.
5.  **Permissions:** Both administrators and firefighters can create license requests. Administrators can also create licenses for a firefighter. Future development will include roles that can approve licenses in addition to administrators.
6.  **Notifications:** Firefighters should be notified when their license request is approved or rejected. The administrator in charge should also receive a notification when a new request is created.
7.  **History and Statistics:** The system must maintain a history of licenses for each firefighter and provide statistics on license usage.
8.  **Guard Conflicts:** The system must generate an alert if a firefighter requests a license for a date when they are scheduled for guard duty. This should not automatically reject the license request, but should alert both the firefighter and the administrator. Approving the license does not automatically remove the firefighter from guard duty.
9.  **Justification:** Firefighters can justify their requests with a text box limited to 500 characters, but this is not mandatory. Administrators can add observations.
10. **License Scheduling:** Licenses must allow the selection of specific days of the week via checkboxes (Monday-Sunday), with options for same hours across all days or custom hours per day.

## LICENSING MODULE SPECIFIC BACKEND RULES

When creating a license for a firefighter:

1.  **Automatic `bomberoId` Handling:** If the `bomberoId` is not provided in the request (e.g., when a firefighter is creating a license for themselves), the backend must automatically determine the `bomberoId` of the logged-in user and use that.
2.   **Joi Validation:** The `bomberoId` field should be optional in the Joi schema for the `/api/licencias` endpoint, to accommodate scenarios where the backend automatically determines the ID.

## LICENSING MODULE SPECIFIC FRONTEND RULES

When creating a license for a firefighter:

1.  **Obtain `bomberoId`:** If `mostrarSelectorBombero` is false, the frontend must obtain the `bomberoId` from the authentication state.
2.  **`LicenciaForm` Component:** The `LicenciaForm` should only return the content of the form (without the Dialog wrapper). The `Dialog` component should be handled in the parent component (`LicenciasPage.jsx`).

## GIT REPOSITORY RULES

1.  **Main Repository:** The project's sole repository is `https://github.com/BenjaminHeresmann/SGIB-WEB.git` on the `main` branch.

## DEPLOYMENT RULES

When deploying to Vercel (frontend) and Railway (backend) as a monorepo:

### **Environment Variables and URLs**

#### **Backend (Railway):**
- Railway will provide a public URL (e.g., `https://sgib-web-production.up.railway.app`)
- Configure the following environment variables in Railway:
  ```env
  NODE_ENV=production
  PORT=3002
  DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/sistema-bomberos?retryWrites=true&w=majority
  JWT_SECRET=<strong-random-secret>
  JWT_EXPIRE=7d
  CORS_ORIGIN=https://sgib-web.vercel.app,https://www.sgib-web.vercel.app
  ENABLE_RATE_LIMIT=true
  RATE_LIMIT_WINDOW_MS=900000
  RATE_LIMIT_MAX_REQUESTS=100
  BCRYPT_SALT_ROUNDS=12
  ```

#### **Frontend (Vercel):**
- Configure the following environment variables in Vercel:
  ```env
  VITE_API_URL=https://sgib-web-production.up.railway.app/api
  VITE_ENV=production
  ```

### **Files Modified for Deployment:**

1. **Frontend:**
   - ✅ `client/.env` and `client/.env.example` created
   - ✅ `client/src/services/api.js`: Uses `import.meta.env.VITE_API_URL`
   - ✅ `client/src/components/licencias/LicenciaForm.jsx`: Uses environment variable
   - ✅ `client/src/components/carros/AsignarMaterialDialog.jsx`: Uses `api.js` instance

2. **Backend:**
   - ✅ `server/src/index.js`: CORS configured dynamically with `CORS_ORIGIN.split(',')`
   - ✅ `server/.env.example`: Updated with production examples

3. **Configuration Files:**
   - ✅ `vercel.json`: Vercel deployment configuration
   - ✅ `railway.json`: Railway deployment configuration
   - ✅ `server/Procfile`: Railway process file
   - ✅ `server/package.json`: Added `postinstall` script for Prisma

### **Important Notes:**

- **vite.config.js:** Proxy is only for local development and does NOT affect production
- **CORS:** Backend accepts multiple origins separated by commas in `CORS_ORIGIN`
- **Database:** MongoDB Atlas connection string must be set in Railway's `DATABASE_URL`
- **JWT Secret:** Use a strong, unique secret for production (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)

### **Deployment Checklist:**

1. [ ] Push all changes to `main` branch
2. [ ] Deploy backend to Railway with correct environment variables
3. [ ] Copy Railway URL
4. [ ] Deploy frontend to Vercel with `VITE_API_URL` pointing to Railway
5. [ ] Update `CORS_ORIGIN` in Railway with Vercel URL
6. [ ] Test authentication and API calls
7. [ ] Verify MongoDB connection
8. [ ] Check CORS is working correctly