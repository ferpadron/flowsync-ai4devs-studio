# Arquitectura — diagrama de contenedores (C4)

Diagrama de contenedores (nivel 2 de C4) de FlowSync, construido leyendo el código del
repo: las rutas de `backend/start/routes.ts`, la configuración de conexión de
`backend/config/database.ts`, y el punto de contacto único con la API en
`frontend/src/lib/api.ts`. Solo hay dos contenedores de aplicación —el SPA de React y la
API de AdonisJS— y un único almacén de datos, SQLite vía Lucid; no hay cola, caché,
servicio de email ni ninguna API de terceros en el código, así que no aparecen en el
diagrama.

```mermaid
C4Container
    title FlowSync — contenedores

    Person(usuario, "Persona del equipo", "Cuenta con sesión iniciada")

    System_Boundary(flowsync, "FlowSync") {
        Container(spa, "SPA de tareas", "React 19, Vite 8, react-router", "Pantallas de login, lista compartida y detalle de tarea. Guarda el token en localStorage (frontend/src/auth/auth-provider.tsx) y llama a la API desde un único módulo, frontend/src/lib/api.ts.")
        Container(api, "API de FlowSync", "AdonisJS 7, VineJS, Lucid", "Expone /api/v1/auth, /api/v1/account y /api/v1/tasks (backend/start/routes.ts). Autentica con access tokens opacos (config/auth.ts) y valida con VineJS antes de tocar los modelos.")
        ContainerDb(db, "Base de datos", "SQLite (better-sqlite3) vía Lucid ORM", "Tablas de usuarios y tareas; fichero único en tmp/db.sqlite3 (backend/config/database.ts). Sin overrides por entorno: dev y tests functional comparten el mismo fichero.")
    }

    Rel(usuario, spa, "Usa desde su navegador")
    Rel(spa, api, "Pide y envía tareas y sesión", "JSON sobre HTTP, Authorization: Bearer")
    Rel(api, db, "Lee y escribe", "SQL vía Lucid")
```
