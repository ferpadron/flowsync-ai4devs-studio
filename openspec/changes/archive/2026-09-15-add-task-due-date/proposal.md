## Why

FlowSync ya tiene la lista compartida, pero una tarea todavía no puede decir **cuándo** debería estar hecha. `FS-118` cubre los requisitos RF-13, RF-14 y RF-15 del PRD y aporta **la única regla de negocio no trivial del MVP**: una tarea está vencida si y solo si tiene fecha, esa fecha ya pasó y no está hecha.

La fecha entró en el alcance bajo dos condiciones que el propio alcance declara *contención de riesgo, no detalle de diseño*: **(a)** crear sin fecha es el camino por defecto y **(b)** la fecha vive fuera de la vista principal. Este change respeta las dos.

## What Changes

- La tarea gana una **fecha de vencimiento opcional**, de calendario y sin hora. Nace siempre sin fecha.
- La fecha se **pone, cambia y retira al abrir la tarea**, nunca al crearla. Crear sigue aceptando únicamente el título; una fecha enviada en la creación se rechaza.
- Se acepta **fijar una fecha ya pasada**: anotar algo que llega tarde es legítimo.
- Retirar la fecha se expresa **enviándola explícitamente vacía**, y es una operación admitida, no un error.
- La API gana la **lectura individual de una tarea** (`GET /api/v1/tasks/:id`), que hoy no existe. Es la superficie mínima que la historia necesita; **no** es la pantalla de detalle completa.
- La representación **individual** de una tarea expone un booleano **`isOverdue`** calculado por el servidor. **No se persiste**, se recalcula en cada lectura, y un `isOverdue` enviado por el cliente se ignora.
- El **día de referencia es el de quien mira**: el cliente puede enviarlo y el servidor resuelve el veredicto con él; si no llega, el servidor usa su propio día.
- La interfaz gana una **vista mínima de tarea** en su propia ruta protegida, donde se consulta la fecha, se edita sin paso extra de guardado, y la condición de vencida se comunica con una señal propia.
- **La lista no cambia lo que muestra**: sigue siendo título, responsable y estado. Ni fechas, ni `isOverdue`, ni marca de vencida.

## Capabilities

### New Capabilities

Ninguna. La fecha de vencimiento es comportamiento de la capability `tasks` que ya existe, no una capability nueva.

### Modified Capabilities

- `tasks`: gana la fecha de vencimiento opcional, la regla de vencimiento, el veredicto `isOverdue` emitido por el servidor, el día de referencia de quien mira y la consulta individual de una tarea. Se modifica además el requisito de sesión, que hasta ahora enumeraba solo listar, crear y actualizar.

## Impact

**Backend (`backend/`)**

- Nueva migración que añade la fecha a `tasks`, nullable, y regeneración de `database/schema.ts`.
- La regla de vencimiento vive en el modelo y recibe el día de referencia como parámetro; no se reimplementa en ninguna otra capa.
- Nuevo transformer para la representación individual, separado del de la lista: es lo que garantiza estructuralmente que la lista no pueda filtrar la fecha ni el vencimiento.
- El validador de actualización admite la fecha y su retirada explícita; el de creación la rechaza.
- Nueva ruta de lectura individual dentro del grupo ya protegido por sesión.

**Frontend (`frontend/`)**

- Nueva ruta protegida y pantalla mínima de tarea; la lista gana la forma de abrirla, sin cambiar lo que muestra.
- `lib/api.ts` gana la lectura individual y el envío de la fecha; `lib/types.ts`, los tipos correspondientes.
- Se resuelve con el campo de fecha nativo: **no se añade ninguna dependencia ni ningún componente nuevo a `components/ui/`**.

**Fuera de alcance, deliberadamente**

Fronteras de este change, no promesas permanentes sobre la capability:

- **Tests de cualquier tipo.** Este change no monta base de pruebas ni escribe ninguna; **R-7 sigue sin pagarse**.
- **La pantalla de detalle completa.** Se entrega el mínimo que RF-13 y RF-15 exigen. Qué más muestra esa superficie es **PA-6**, que sigue abierto, y por eso `E2-5` no queda cerrada por este change.
- Notificaciones, recordatorios y recurrencia.
- Ordenar o filtrar por fecha.
- Editar el título y borrar la tarea desde la vista individual.

**Decisiones de producto que este change no resuelve**

- **PA-3 — orden de la lista.** No se inventa ningún criterio de ordenación, ni por fecha ni por nada.
- **PA-9 — umbral del título.** Intacto.
- **PA-7 — volver de «Hecho» a un estado anterior.** No se restringe ninguna transición ni se inventa qué pasa con el vencimiento al volver: hoy la regla se limita a evaluar el estado actual.
- **PA-8 — dos personas editando a la vez.** No se añade detección de conflictos ni resolución de escrituras concurrentes.
