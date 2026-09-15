## Context

Ver `proposal.md` — *Why*. Los requisitos están en `specs/tasks/spec.md`; aquí solo se decide **cómo**.

Lo que condiciona el diseño, tal y como está el repositorio hoy:

- **La tarea existe y la lista funciona.** `tasks` tiene tres operaciones —listar, crear, actualizar— todas bajo `middleware.auth()`. **No hay lectura individual**: `GET /api/v1/tasks/:id` no existe, ni ruta de detalle en el frontend.
- **El esquema se genera.** `database/schema.ts` se regenera desde las migraciones y no se edita a mano; el modelo solo declara relaciones y lógica.
- **Toda respuesta pasa por un transformer**, y el de la lista recorta al responsable a `id` + `fullName` a propósito.
- **Convención de `null` recién fijada.** El validador de actualización aplica una regla `rejectNull` a `status` y `assigneeId` para distinguir «no lo envío» de «lo envío vacío», y ambos campos usan `requiredIfMissing` para que una petición sin ninguno de los dos se rechace.
- **Un requisito ya vigente**, *La lista no muestra vencimientos*, prohíbe de antemano enseñar fechas o marcas de vencida en la lista. Este change lo hereda y lo refuerza; no lo modifica.
- **No hay componente de fecha.** `frontend/src/components/ui/` contiene `alert`, `button`, `card`, `input` y `label`, y nada más.
- **No hay base de pruebas.** `backend/tests/` solo contiene `bootstrap.ts` (R-7 del PRD, sin pagar).

## Goals / Non-Goals

**Goals:**

- Que la regla de vencimiento viva en **un solo sitio** y sea evaluable sin pasar por HTTP.
- Que sea **estructuralmente imposible** que la lista filtre la fecha o el veredicto, en vez de confiar en que la pantalla no los pinte.
- Que el veredicto se resuelva **en el momento de mirar**, nunca congelado al guardar.
- Añadir la superficie mínima de lectura individual sin prejuzgar el diseño de la pantalla de detalle.

**Non-Goals:**

- Diseñar la pantalla de detalle completa — ver D7.
- Pagar R-7. Este change no monta base de pruebas ni escribe tests.
- Resolver PA-3, PA-7, PA-8 ni PA-9 — ver D9.

## Decisions

### D1 — La fecha se almacena como fecha de calendario, nullable, sin hora

Columna `due_date` de tipo `date` y nullable, en una migración nueva; `database/schema.ts` se regenera con el comando del proyecto.

*Por qué:* la regla compara **días**, no instantes. Guardar un `datetime` obligaría a decidir en qué huso se interpreta el instante guardado, que es exactamente la ambigüedad que la historia quiere evitar. Nullable porque «sin fecha» es un estado de primera clase, no una ausencia que haya que rellenar.

*Alternativa descartada:* `datetime` con la hora a medianoche. Arrastra un huso implícito y reintroduce el error del día de más que la historia señala como la trampa clásica.

### D2 — La regla de vencimiento es una función pura del modelo que recibe el día de referencia

Vive en `app/models/task.ts` como método que toma el día de referencia y devuelve el booleano. No se reimplementa en el controlador, ni en el transformer, ni en el frontend.

*Por qué:* la spec exige que dos personas con días distintos obtengan veredictos distintos y ambos sean correctos. Eso solo es posible si el día es un **parámetro**, no algo que la regla lea del reloj por su cuenta. Como efecto secundario queda evaluable sin petición HTTP, que es lo que pedirá la cobertura cuando R-7 se pague.

*Alternativa descartada:* que la regla consulte el reloj del servidor internamente. Hace imposible el criterio de los dos husos y convierte el comportamiento en no determinista.

### D3 — El día de referencia viaja como parámetro de consulta opcional, y el servidor tiene la última palabra

Las lecturas individuales y la actualización aceptan un día de referencia opcional en la query (`?today=YYYY-MM-DD`). Si llega, se valida como fecha de calendario y se usa; si no llega, el servidor usa su propio día; si llega mal formado, se rechaza con error asociado a ese dato.

*Por qué:* el cliente es el único que conoce el día local de quien mira, pero el enunciado exige que **el veredicto lo emita el backend**. Pasar el día y no el booleano mantiene esa frontera. Rechazar el valor mal formado en vez de recurrir en silencio al día del servidor evita que un cliente roto produzca lecturas plausibles pero falsas.

*Alternativa descartada:* enviar el huso (`Europe/Madrid`) en vez del día. Obligaría al backend a resolver zonas horarias y a arrastrar una base de datos de husos para calcular algo que el cliente ya sabe.

*Consecuencia aceptada:* un cliente puede enviar cualquier día y alterar **su propia** lectura. No es un problema de seguridad: el veredicto no se almacena, no afecta a lo que ven los demás y no autoriza nada.

### D4 — Dos transformers: la lista no puede filtrar lo que no sabe construir

`TaskTransformer` se queda **exactamente como está** (`id`, `title`, `status`, `assignee`) y sigue sirviendo el listado. Se añade un transformer distinto para la representación individual, que añade la fecha y el veredicto, y que usan la lectura individual y la actualización.

*Por qué:* la restricción de que la lista no muestre fecha ni vencimiento se cumple por construcción, no por disciplina de la pantalla. Un descuido futuro en el frontend no puede filtrar un dato que la respuesta del listado nunca ha contenido. Es el mismo razonamiento por el que el responsable ya se recorta en su propio transformer en vez de reutilizar el del usuario.

*Alternativa descartada:* un único transformer con los campos añadidos y la pantalla encargada de no pintarlos. Deja la garantía en manos de cada componente que consuma la lista.

### D5 — Retirar la fecha es la excepción deliberada a `rejectNull`

`dueDate` se declara omitible **y** anulable: ausente significa «no lo toques», y explícitamente vacío significa «retírala». `status` y `assigneeId` conservan `rejectNull` sin cambios. La condición de «al menos un campo» de la actualización pasa a cubrir los tres campos.

*Por qué:* para el estado y el responsable, vacío no tiene significado y por eso se rechaza. Para la fecha, vacío **es** la operación de retirarla, que la historia declara admitida y no un error. La asimetría es intencionada y se documenta aquí para que no se lea como una incoherencia con la convención existente.

### D6 — La creación rechaza la fecha en vez de ignorarla

`POST /api/v1/tasks` sigue aceptando únicamente el título. Una fecha enviada en la creación se rechaza con error asociado al campo.

*Por qué:* es la decisión que tomó producto al abrir este change. Mantiene intacto el requisito vigente *Creación de una tarea con solo el título* —que este change no modifica— y respeta la condición **(b)** del alcance: la fecha se consulta y se fija **al abrir la tarea**. Rechazar en vez de descartar en silencio evita que un cliente crea haber fijado una fecha que nunca se guardó.

*Alternativa descartada:* aceptarla en la API y ocultarla en la interfaz. Divergencia entre lo que la API permite y lo que el producto promete, y contradice el «únicamente al abrir la tarea» de RF-13.

### D7 — Se añade la lectura individual como superficie mínima; la pantalla de detalle completa NO entra

Este change añade:

- `GET /api/v1/tasks/:id` dentro del grupo ya protegido por sesión.
- Una vista mínima de tarea en el frontend, en su propia ruta protegida, alcanzable desde la lista.

Esa vista entrega **solo** lo que RF-13 y RF-15 exigen: consultar la fecha, editarla o retirarla, y ver la señal de vencida. Nada más.

**`E2-5` no queda cerrada por este change, y `PA-6` sigue abierto.** Qué más debe mostrar la superficie de detalle —y si esta vista mínima es su forma definitiva o un escalón— es la decisión de producto que `PA-6` tiene pendiente. Este diseño no la toma: se limita al mínimo que la historia de la fecha necesita para existir, que es exactamente el alcance que `us-abrir-tarea.md` deriva de RF-13 y RF-15.

*Por qué no esperar a PA-6:* sin superficie donde abrir la tarea, RF-13 y RF-15 son inaplicables, y la única alternativa —enseñar la fecha en la lista— rompería la condición (b) del alcance, que el PRD declara contención de riesgo y no detalle de diseño.

*Consecuencia aceptada:* al construir el mínimo se fija de hecho una parte de esa superficie. Se asume a conciencia y se deja escrito aquí para que quien resuelva `PA-6` sepa qué hay construido y por qué, en vez de encontrárselo.

### D8 — Campo de fecha nativo, sin dependencias ni componentes nuevos

La edición se resuelve con el campo de fecha nativo del navegador sobre el `input` que ya existe en `components/ui/`. No se añade ninguna dependencia ni ningún componente generado nuevo.

*Por qué:* la historia obliga a decidir esto **antes** de empezar. El campo nativo da calendario, validación de formato y operación con teclado sin coste, y encaja con que la entrega anterior no añadiera nada a `components/ui/`.

*Cómo se concilian guardar-sin-botón y conservar-el-valor-ante-una-fecha-inválida*, que la historia señala como criterios que rozan entre sí: el campo nativo solo emite fechas completas, así que el guardado se dispara al cambiar el valor; si el servidor rechaza la fecha, la vista restaura la que hubiera y muestra el mensaje junto al campo reutilizando el mecanismo de errores por campo ya existente.

*Alternativa descartada:* traer un componente de calendario. Añade dependencia y superficie visual, y empuja a diseñar la pantalla de detalle, que es justo lo que `PA-6` tiene abierto.

### D9 — Los puntos abiertos se conservan abiertos

- **PA-3 (orden):** el listado sigue sin cláusula de ordenación. No se ordena por fecha ni por nada.
- **PA-9 (umbral del título):** intacto.
- **PA-7 (volver de «Hecho»):** no se restringe ninguna transición. La regla evalúa el estado **actual**: si una tarea vuelve de `done` con la fecha pasada, vuelve a estar vencida. Es consecuencia mecánica de la regla, no una decisión de producto tomada aquí.
- **PA-8 (edición concurrente):** no se añade detección de conflictos. La última escritura gana, como en el resto de la capability.

## Risks / Trade-offs

- **El error del día de más (la trampa de la historia)** → La comparación es estrictamente `fecha < díaDeReferencia` sobre fechas de calendario, nunca sobre instantes. D1 elimina la hora del dato y D2 hace del día un parámetro explícito, que son las dos vías por las que este fallo entra.
- **El fallo de husos no se manifiesta hasta que alguien cruza la medianoche** → Sin base de pruebas (R-7) no hay red que lo detecte. Se mitiga concentrando la regla en un único punto evaluable sin HTTP (D2), de modo que cuando R-7 se pague quede cubierta con pruebas de nodo, no de extremo a extremo.
- **La migración toca la base con la que se está desarrollando** → `config/database.ts` apunta a un único fichero SQLite en `tmp/`, compartido por el servidor de desarrollo. La migración es aditiva y nullable, así que las tareas existentes siguen siendo válidas; su reverso deja el esquema como estaba.
- **Al construir la vista mínima se fija parte de la superficie que PA-6 debe decidir** → Se acota a lo que RF-13 y RF-15 exigen y se documenta en D7, para que la decisión pendiente se tome sabiendo qué hay construido.
- **Un cliente puede enviar un día de referencia arbitrario** → Solo altera su propia lectura; el veredicto no se persiste, no cambia lo que ven los demás y no concede ningún acceso.
- **Sin tests, la única verificación es manual** → Consecuencia asumida y declarada en el proposal. Las tareas de este change se verifican con comandos, respuestas de la API y comprobaciones en pantalla.
