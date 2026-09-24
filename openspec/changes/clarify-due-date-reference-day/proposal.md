## Why

`openspec/specs/tasks/spec.md` describe el requirement "Fijar, cambiar y retirar la fecha de vencimiento" con `PUT /api/v1/tasks/:id/due-date` aceptando solo `{"dueDate": "AAAA-MM-DD"}` o `{"dueDate": null}`. Seis de sus ocho scenarios repiten esa misma omisión. Pero el propio documento exige, en el requirement "El día de referencia lo pone quien mira", que **toda petición que informe del vencimiento** lleve un `today` obligatorio y responda `422` si falta — y el scenario "Aplazar resuelve el vencimiento" exige que la respuesta de este mismo `PUT` traiga la condición de vencida ya resuelta "en la misma respuesta de ese cambio". Ese `PUT` **ya devuelve `isOverdue`** (vía `TaskDetailTransformer`), y resolver `isOverdue` sin congelarlo al reloj del servidor no es posible sin que la petición traiga su propio día de referencia. La spec local nunca reflejó por escrito lo que el requirement transversal ya exigía.

El código no tiene este problema: `backend/app/validators/task.ts` (`setTaskDueDateValidator`) ya exige `today` y `dueDate`; `backend/app/controllers/task_due_dates_controller.ts` ya construye la respuesta contra ese `today`; los decoradores OpenAPI de ese controlador y `backend/app/openapi/task_schemas.ts` ya documentan `today` como obligatorio; `frontend/src/lib/api.ts` ya lo envía en cada llamada (`setTaskDueDate`). La divergencia es exclusivamente entre la spec y el resto de fuentes, no entre el código y su comportamiento real.

## What Changes

- Se corrige el requirement "Fijar, cambiar y retirar la fecha de vencimiento" para que su propio texto y sus scenarios reflejen que la petición exige `today` junto a `dueDate`, y que la respuesta `200` incluye la condición de vencida ya resuelta contra ese `today`.
- Se añade el scenario "Falta el día de referencia al fijar la fecha", que hasta ahora solo estaba implícito en el requirement transversal, para que el propio requirement de este endpoint sea autosuficiente.

**Este change no cambia ningún comportamiento de producción.** No se toca `backend/`, ni `frontend/`, ni el contrato OpenAPI, ni `docs/capabilities/tasks/README.md` (que no detalla el body de este endpoint). Es exclusivamente una corrección de la spec para que deje de describir algo que el sistema real nunca hizo.

Como verificación pendiente **dentro de este mismo change**, requerida antes de aplicarlo y archivarlo (ver `tasks.md`), queda escribir un test funcional de `PUT /api/v1/tasks/:id/due-date` que compruebe: (a) sin `today` responde `422` sobre ese campo sin alterar la fecha existente, y (b) con `dueDate` y `today` la respuesta trae `isOverdue` ya resuelto. Hoy ese endpoint no tiene ningún test, y este change no se archiva sin él.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `tasks`: el requirement "Fijar, cambiar y retirar la fecha de vencimiento" pasa a exigir `today` en `PUT /api/v1/tasks/:id/due-date`, alineando su texto con lo que el requirement "El día de referencia lo pone quien mira" ya exigía y con lo que el código ya implementa.

## Impact

**Código.** Ninguno. `backend/app/validators/task.ts`, `backend/app/controllers/task_due_dates_controller.ts`, `backend/app/openapi/task_schemas.ts` y `frontend/src/lib/api.ts` ya están alineados con el texto corregido; no se modifica ninguno.

**Documentación.** Solo `openspec/specs/tasks/spec.md`, vía la delta-spec de este change. `docs/capabilities/tasks/README.md` no detalla el body de este endpoint, así que no contiene ninguna afirmación que corregir.

**Tests.** No existe hoy ningún test funcional de este endpoint (las suites existentes cubren `assignee`, el filtro de estado y el vencimiento de tareas `done`). Este change no rompe ni exige actualizar ninguno existente, pero sí añade uno nuevo como parte de su propio trabajo (ver `tasks.md`): no se aplica ni se archiva sin él.

**Riesgos.** Ninguno de comportamiento: es un change de solo documentación. El único riesgo es de proceso — que alguien lea la spec corregida y asuma que ya existe cobertura de test para `PUT .../due-date`, cuando sigue sin haberla.
