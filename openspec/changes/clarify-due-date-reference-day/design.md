## Context

`PUT /api/v1/tasks/:id/due-date` ya recibe `today` en el body y ya devuelve la tarea con `isOverdue` resuelto contra ese día (`backend/app/controllers/task_due_dates_controller.ts`, vía `TaskDetailTransformer.transform(task, toCalendarDay(today))`). El requirement transversal "El día de referencia lo pone quien mira" (`openspec/specs/tasks/spec.md`) ya establece la regla general: *"toda petición que deba informar del vencimiento SHALL exigir ese día [...] y responder `422` si no llega o no es una fecha válida"*. El requirement local de este endpoint, "Fijar, cambiar y retirar la fecha de vencimiento", nunca se actualizó para reflejar esa regla en su propio texto: sigue mostrando un body de solo `{"dueDate": ...}`.

## Goals / Non-Goals

**Goals:**
- Que el requirement de `PUT .../due-date` sea autosuficiente: quien lo lea no tiene que saber de memoria el requirement transversal para adivinar que `today` es obligatorio ahí también.
- Que los scenarios existentes describan el body real que la petición necesita, sin inventar ningún campo o regla que el código no tenga ya.

**Non-Goals:**
- No se cambia el contrato OpenAPI: `backend/app/openapi/task_schemas.ts` y los decoradores de `task_due_dates_controller.ts` ya declaran `required: ['today', 'dueDate']` y ya describen que la respuesta trae `isOverdue` resuelto. No hay nada que corregir ahí.
- No se cambia `frontend/src/lib/api.ts`: `setTaskDueDate` ya manda `{ dueDate, today: localToday() }` en cada llamada.
- El test funcional de este endpoint no está escrito todavía al proponer este change, pero sí es parte de su alcance: es verificación pendiente dentro de este mismo change (ver `tasks.md`), requerida antes de aplicarlo y archivarlo — no un trabajo que quede fuera de él.

## Decisions

### 1. `today` viaja en el body del `PUT`, no en la query

Los otros dos sitios donde este sistema exige `today` (`GET /tasks/:id` y, antes de este change, la lectura del requirement transversal) lo llevan en el query string, porque son lecturas. `PUT .../due-date` es una escritura con cuerpo, y `today` viaja junto a `dueDate` en ese mismo cuerpo — así lo implementa ya `setTaskDueDateValidator` (`today: calendarDay(), dueDate: calendarDay().nullable()`), y así lo consume ya `setTaskDueDate` en el frontend. Este change documenta esa forma existente; no elige una forma nueva.

### 2. `today` es obligatorio, sin valor por defecto — se remite al requirement transversal en vez de repetir la justificación

El *por qué* de que sea obligatorio (evitar que el reloj del servidor sustituya silenciosamente el día de quien pregunta, que es exactamente el fallo que "El día de referencia lo pone quien mira" prohíbe) ya está explicado allí y en `openspec/changes/archive/2026-08-13-add-task-due-date/design.md` (decisión 3: *"Toda petición que informe del vencimiento lleva `today=AAAA-MM-DD`, y si falta la respuesta es `422`"*). El requirement corregido de este change enlaza esa misma razón en vez de duplicar el texto, para que ambos requirements no puedan divergir de nuevo en el futuro por editarse por separado.

### 3. La respuesta `200` incluye la condición de vencida ya resuelta

No es un dato nuevo que se añade: es el comportamiento que "Aplazar resuelve el vencimiento" ya exige y que el código ya cumple. El texto corregido del requirement lo deja explícito para que quien lea solo este requirement (sin cruzar con el de vencimiento) entienda por qué `today` hace falta aquí y no solo en la lectura.

## Risks / Trade-offs

- **Ninguno de comportamiento**: no se toca código, OpenAPI ni frontend, todos ya alineados con el texto corregido.
- **Riesgo de proceso**: la spec corregida no debe leerse como si ya existiera un test que la respalde — no lo hay. `tasks.md` de este change deja explícito que aplicar y archivar solo procede después de escribir ese test, para no repetir el patrón de `add-task-status-filter` (documentar sin verificación) más veces de las estrictamente necesarias.
