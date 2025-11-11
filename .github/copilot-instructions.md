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
*   **Frontend:** Use Redux for state management. Organize components by module. When working with IDs in the frontend, ensure that you are not using `parseInt()` on IDs obtained from MongoDB. When interacting with local storage, ensure the correct token name (`bomberosToken`) is used. When sending `bomberoId` from the frontend, ensure it is sent as a string, not an integer.
*   **Backend:** Use Joi for input validation. Implement proper authentication and authorization. Access user data from `req.user`, not `req.usuario`.
*   **IDs:** When working with MongoDB and Prisma, handle IDs as strings (ObjectIds), not integers. Avoid using `parseInt()` on IDs obtained from `req.params.id`. Validate ObjectIds using `!cargoId || cargoId.length !== 24` and `Joi.string().length(24).hex()`.
*   **Authentication:** Ensure the correct token name (`bomberosToken`) is used when retrieving the token from local storage.
*   **Backend Authentication:** Use `req.user` to access user data from the authentication middleware. When accessing user data in the backend, always use `req.user` and not `req.usuario`.

## WORKFLOW & RELEASE RULES

*   **Git:** Use feature branches for all new development. When encountering issues checking out a branch due to untracked files, consider stashing changes (`git stash`), removing the conflicting directory, or cleaning the working directory.
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

1.  **License Types:** The system must support the following license types: Medical, Vacation, Personal Reasons, Studies, Labor, and Other (with a field for specifying the reason). Administrators should be able to add additional license types to the system. Administrators should be able to add additional license types to the system.
2.  **License Duration:** Licenses must have a start and end date. They can be for hours or full days. There is no limit to the number of days per license type.
3.  **Supporting Documentation:** Users can attach supporting documentation (images and PDF documents) to their license requests, but this is not mandatory.
4.  **License Statuses:** The license statuses are: Pending, Approved, Rejected, Cancelled, Active, and Finalized.
5.  **Permissions:** Both administrators and firefighters can create license requests. Administrators can also create licenses for a firefighter. Future development will include roles that can approve licenses in addition to administrators.
6.  **Notifications:** Firefighters should be notified when their license request is approved or rejected. The administrator in charge should also receive a notification when a new request is created.
7.  **History and Statistics:** The system must maintain a history of licenses for each firefighter and provide statistics on license usage.
8.  **Guard Conflicts:** The system must generate an alert if a firefighter requests a license for a date when they are scheduled for guard duty. This should not automatically reject the license request, but should alert both the firefighter and the administrator. Approving the license does not automatically remove the firefighter from guard duty.
9.  **Justification:** Firefighters can justify their requests with a text box limited to 500 characters, but this is not mandatory. Administrators can add observations.

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
*   Fields for tracking state changes: `motivoCambioEstado` (String, optional), `fechaCambioEstado` (DateTime, optional)
*   Relation to a new model `HistorialEstadoBombero` to store state change history.