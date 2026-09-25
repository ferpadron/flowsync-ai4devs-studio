# Capability: tasks

Puerta de entrada operativa a la capability de tareas de FlowSync: dónde vive el código, qué expone, qué reglas aplica y cómo comprobarla en local. No es la especificación — para eso está la spec viva enlazada abajo — sino el mapa para llegar a ella y al código.

## 1. Qué hace y alcance actual

Da al equipo una lista de trabajo compartida: crear una tarea escribiendo solo un título, verla junto a las demás con su responsable y su estado, cambiar ese estado desde la propia fila, y opcionalmente ponerle una fecha de vencimiento y saber si está vencida. No hay tareas privadas ni una vista "mis tareas": existe una sola lista por espacio, igual para cualquier cuenta con sesión.

El alcance actual, tal como lo implementa el código y lo fija la spec, es: título, responsable (siempre quien crea la tarea, nunca elegible), tres estados fijos, fecha de vencimiento opcional y su condición de vencida, y un filtro de la lista por estado.

## 2. Dónde vive la implementación

- **Backend** (AdonisJS 7 + Lucid): rutas en [`backend/start/routes.ts`](../../../backend/start/routes.ts); controladores en [`backend/app/controllers/tasks_controller.ts`](../../../backend/app/controllers/tasks_controller.ts), [`task_statuses_controller.ts`](../../../backend/app/controllers/task_statuses_controller.ts) y [`task_due_dates_controller.ts`](../../../backend/app/controllers/task_due_dates_controller.ts); validadores en [`backend/app/validators/task.ts`](../../../backend/app/validators/task.ts); modelo en [`backend/app/models/task.ts`](../../../backend/app/models/task.ts) (incluye la regla de vencimiento, `isOverdueOn`); transformers en [`backend/app/transformers/`](../../../backend/app/transformers/) (`task_transformer.ts`, `task_detail_transformer.ts`, `task_assignee_transformer.ts`); esquemas OpenAPI en [`backend/app/openapi/task_schemas.ts`](../../../backend/app/openapi/task_schemas.ts).
- **Frontend** (React 19 + Vite): pantallas en [`frontend/src/pages/tasks-page.tsx`](../../../frontend/src/pages/tasks-page.tsx) (lista) y [`frontend/src/pages/task-page.tsx`](../../../frontend/src/pages/task-page.tsx) (detalle); componentes en [`frontend/src/components/task-item.tsx`](../../../frontend/src/components/task-item.tsx) y [`frontend/src/components/task-filter.tsx`](../../../frontend/src/components/task-filter.tsx); llamadas a la API en [`frontend/src/lib/api.ts`](../../../frontend/src/lib/api.ts); tipos compartidos en [`frontend/src/lib/types.ts`](../../../frontend/src/lib/types.ts); rutas protegidas en [`frontend/src/routes/app-routes.tsx`](../../../frontend/src/routes/app-routes.tsx) (`/tasks` y `/tasks/:id`).
- **Tests**: [`backend/tests/functional/tasks/`](../../../backend/tests/functional/tasks/). El frontend no tiene ningún runner de tests instalado, así que no hay tests de interfaz.
- **Documentación relacionada**: spec viva en [`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md); contrato HTTP generado por `@foadonis/openapi` a partir de [`backend/config/openapi.ts`](../../../backend/config/openapi.ts) y de los decoradores de los controladores anteriores; arquitectura general en [`docs/architecture.md`](../../architecture.md); decisión sobre esta misma spec como fuente de verdad en [`docs/adr/0001-openspec-como-fuente-de-verdad.md`](../../adr/0001-openspec-como-fuente-de-verdad.md).

## 3. Endpoints

Todos bajo `/api/v1/tasks`, protegidos con el mismo guard de token que el resto del espacio (`middleware.auth()` en `routes.ts`):

| Método | Ruta | Controlador |
|---|---|---|
| `GET` | `/api/v1/tasks` | `TasksController.index` — lista compartida, opcionalmente acotada con `?status=` |
| `POST` | `/api/v1/tasks` | `TasksController.store` — crea una tarea a partir de un título |
| `GET` | `/api/v1/tasks/:id` | `TasksController.show` — una tarea suelta, con fecha de vencimiento y condición de vencida |
| `PATCH` | `/api/v1/tasks/:id/status` | `TaskStatusesController.update` — cambia el estado |
| `PUT` | `/api/v1/tasks/:id/due-date` | `TaskDueDatesController.update` — fija, cambia o retira la fecha de vencimiento |

El contrato completo (parámetros, cuerpos, respuestas por código) es el documento OpenAPI — ver sección 7, no se duplica aquí.

## 4. Reglas de negocio, por grupo

La spec viva agrupa sus requisitos en, a grandes rasgos, estas categorías — el detalle exacto (SHALL, scenarios) está en [`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md), no aquí:

- **Creación y validación del título**: solo el título es obligatorio; vacío, solo espacios o más de 200 caracteres se rechaza; responsable y estado enviados al crear se ignoran.
- **Responsable y visibilidad**: la tarea nace a nombre de quien la crea; la lista es única y compartida por el espacio; el `assignee` solo expone nombre e iniciales, nunca el email.
- **Estados**: tres estados fijos (`pending`, `in_progress`, `done`); cualquier cuenta puede cambiar el estado de cualquier tarea, en cualquier dirección; la lista se puede acotar por un estado válido, y uno inventado se rechaza (no se responde vacío).
- **Fecha de vencimiento**: opcional, se fija por separado de la creación; se calcula "vencida" en el momento de mirar contra un día de referencia que pone quien pregunta, nunca contra el reloj del servidor; la lista nunca lleva vencimiento.
- **Sesión**: listar, crear y cambiar estado o fecha exigen token válido; sin él, `401` y ningún dato.
- **Interfaz**: pantalla de lista y de detalle, mensajes distintos para "espacio sin tareas" vs. "filtro sin resultados" vs. "estado inventado", control de filtro en la URL, señal explícita (no solo color) de tarea vencida, sin señales de presencia ni vista de "mis tareas".

## 5. Cómo ejecutarla y comprobarla en local

Backend (`cd backend`):

```bash
npm install
```

Configuración inicial, **solo si todavía no existe `.env`** en `backend/` (si ya existe, no lo sobrescribas con estos comandos):

```bash
cp .env.example .env
node ace generate:key
```

Migraciones y arranque, en cada entorno nuevo o cada vez que se necesite:

```bash
node ace migration:run   # crea/actualiza tmp/db.sqlite3
npm run dev              # API en http://localhost:3333
```

Frontend (`cd frontend`, en otra terminal):

```bash
npm install
npm run dev                                     # SPA en http://localhost:5173, apunta a VITE_API_URL
```

Con ambos arriba: entrar en `http://localhost:5173`, crear una cuenta, y `/tasks` es la pantalla a la que se llega. Para probar solo la API, cualquier cliente HTTP con `Authorization: Bearer <token>` obtenido de `POST /api/v1/auth/login`.

Tests (desde `backend/`):

```bash
npm test                        # toda la suite (unit + functional)
node ace test --files=assignee  # solo los tests del requisito sobre el responsable
```

## 6. Qué queda fuera de alcance

Respaldado por la spec y por ausencia en el código:

- No hay "mis tareas" ni ninguna vista de tareas distinta de la lista compartida.
- No hay reasignación de responsable, ni edición de título, ni borrado de tarea: no existen endpoints ni pantallas para ello.
- No hay más de un estado por filtro, ni combinación de filtros; el estado es la única dimensión por la que se puede acotar la lista.
- No hay señales de presencia: no se muestra quién está conectado, ni actividad por persona, ni ninguna señal equivalente.
- La lista (`GET /api/v1/tasks`) nunca lleva fecha de vencimiento ni condición de vencida, por diseño — eso solo lo da la tarea suelta.
- No tener fecha de vencimiento no se marca ni se avisa en ningún sitio: es el estado normal de una tarea.

## 7. Autoridad documental y verificación

Cada fuente cumple un papel distinto, no intercambiable:

- **[ADR 0001](../../adr/0001-openspec-como-fuente-de-verdad.md)** — registra y justifica la decisión vigente de usar las delta-specs de OpenSpec como fuente de verdad viva del proyecto. Es el porqué.
- **[`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md)** — la fuente de verdad funcional de esta capability: qué debe hacer el sistema, en prosa SHALL/scenario.
- **El documento OpenAPI** (generado en runtime por `@foadonis/openapi` a partir de `backend/config/openapi.ts` y los decoradores de los controladores; servible en `http://localhost:3333/api.json`, `/api.yaml` o su interfaz en `/api` con el backend arrancado) — el contrato/documentación HTTP: qué parámetros, cuerpos y códigos de respuesta expone realmente cada endpoint.
- **Los tests existentes** (`backend/tests/functional/tasks/`) — evidencia ejecutable parcial, no una fuente funcional completa hoy: verifican solo una parte del comportamiento descrito en la spec; el resto no tiene una prueba automática que lo respalde, y el frontend no tiene ningún runner de tests instalado.

El [ADR 0002](../../adr/0002-tests-como-fuente-de-verdad-ejecutable.md) — usar los tests como única fuente de verdad ejecutable, en sustitución de la spec — es un escenario hipotético y futuro, no una decisión vigente.
