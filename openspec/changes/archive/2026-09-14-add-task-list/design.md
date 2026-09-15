## Context

Ver `proposal.md` — Why. Los requisitos están en `specs/tasks/spec.md`; aquí solo se decide cómo se implementan.

El punto de partida condiciona buena parte del diseño:

- El backend genera `database/schema.ts` desde las migraciones y los modelos no declaran columnas: extienden la clase generada. Cambiar el modelo de datos es **migración → `node ace migration:run` → añadir solo relaciones y lógica al modelo**.
- Toda respuesta pasa por `serialize()` y por un transformer; los controladores no devuelven modelos crudos.
- El grupo de rutas `account` ya está protegido por sesión; las rutas de tareas se cuelgan del mismo esquema de protección.
- En el frontend, `lib/api.ts` es el único punto de contacto con el backend y ya traduce los errores de VineJS a castellano por regla y campo.
- `frontend/src/components/ui/` contiene **solo** `alert`, `button`, `card`, `input` y `label`. No hay `select`, ni `badge`, ni `table`, ni `dropdown-menu`.

## Goals / Non-Goals

**Goals:**

- Un modelo de datos mínimo que sostenga las cinco historias sin dejar preparada ninguna de las exclusiones.
- Una superficie de API de exactamente tres operaciones, con el conjunto de estados cerrado y validado en el servidor.
- Una pantalla construida con los componentes que ya existen, siguiendo el patrón de páginas, rutas y cliente de API del vertical de acceso.

**Non-Goals:**

- Cualquier decisión que sustituya a una decisión de producto pendiente (umbral de título, criterio de orden).
- Introducir un componente de interfaz nuevo o una dependencia para resolver el cambio de estado.
- Preparar el terreno para vencimientos, borrado, tiempo real o permisos.

**Fronteras de este change, no promesas permanentes.** La superficie de exactamente tres operaciones (listar, crear, actualizar) y la ausencia de fecha de vencimiento delimitan **este** trabajo. No se escriben como requisitos del delta: nadie ha prometido que una tarea jamás podrá borrarse ni tener vencimiento, y como SHALL permanentes obligarían a retirarlos el día que el producto crezca. Del vencimiento, lo único que el delta fija es lo que `E3-1/CA-7` sí promete: que **la lista no lo muestra**.

## Decisions

### D1 — El estado es una columna de texto con conjunto cerrado validado en el servidor

Los tres estados viajan como `pending`, `in_progress` y `done`. El conjunto se cierra en el validador, que rechaza cualquier otro valor con el error de validación habitual.

*Alternativa descartada:* una tabla de catálogo de estados. `E2-3/CA-3` exige justamente que no exista forma de añadir, renombrar ni eliminar estados; una tabla invita a lo contrario y no aporta nada a las cinco historias.

Las etiquetas Pendiente / En curso / Hecho viven **solo en el frontend**. El servidor nunca devuelve texto de presentación.

### D2 — El título se almacena sin longitud fija, y el validador no lleva límite máximo

**Esta es una decisión deliberada, no un olvido.** El umbral de `E2-2/CA-3` es una decisión de producto sin tomar (PA-9).

- La columna del título se declara **sin longitud fija**, no como un `varchar(n)`. Fijar `255` o cualquier otro número convertiría un detalle de almacenamiento en el límite de producto por la puerta de atrás.
- El validador aplica obligatoriedad y recorte de espacios, y **no** aplica `maxLength`.
- Esas dos decisiones juntas entregan de forma verificable la mitad durable de `E2-2/CA-3`: **el título nunca se acorta en silencio**, porque no hay nada que lo acorte. Eso sí es requisito del delta.
- La otra mitad —avisar cuando el título supera el umbral— **no está en este change ni como requisito ni como tarea**, porque el umbral no existe. Pertenece a un change futuro, cuando producto lo fije; entonces el trabajo será añadir una regla de longitud al validador y su traducción en el cliente.

Lo que sí se implementa ahora de esa historia: rechazo de título ausente y de título compuesto solo por espacios, con el aviso junto al campo, y conservación íntegra del título que sí se acepta.

### D3 — El título se recorta de espacios antes de validar y de guardar

Un título de solo espacios debe fallar igual que uno vacío (`E2-2/CA-2`). Se normaliza recortando extremos antes de la comprobación de obligatoriedad, de modo que la comprobación y lo que se guarda coinciden.

### D4 — El responsable es una relación a usuario, y se expone recortado

La tarea guarda una referencia al usuario responsable. El transformer de tarea expone del responsable **únicamente su identificador y su nombre**, nunca el registro de usuario completo.

*Por qué:* la nota de implementación de `E3-1` avisa de esto. Devolver el usuario entero filtra correo y fechas de cuenta a una vista que solo necesita un nombre, y una vez que el cliente los consume ya no se recortan sin romperlo. El transformer de usuario que ya existe expone correo e iniciales, así que **no se reutiliza aquí**: la representación del responsable es propia de esta capability.

El literal «Sin nombre» se decide en el frontend, no en el servidor: el servidor devuelve el nombre tal cual, nulo incluido.

### D5 — El listado no ordena

El controlador de listado **no añade ninguna cláusula de ordenación**. No es un descuido: PA-3 sigue abierto y añadir un orden «provisional» por fecha o por identificador crearía una expectativa que después habría que romper.

Lo que **no** se hace es llevar eso al delta. Que hoy no ordenemos es una decisión de este change; prometer en la spec viva que la API nunca garantizará orden sería congelar una decisión de producto que PA-3 todavía puede resolver en cualquier dirección. La ausencia de decisión se representa no escribiendo requisito, no escribiendo un requisito que prohíba decidir.

### D6 — La actualización acepta estado y responsable, cada uno por separado o los dos a la vez

Una sola operación de actualización cubre las dos cosas que la restricción de lista compartida permite cambiar: el estado y el responsable. El título **no** es actualizable, porque ninguna de las cinco historias lo pide.

Cada campo puede omitirse, pero no los dos: estas son las reglas de la operación, cerradas aquí para que la implementación no tenga que decidirlas sobre la marcha.

| Caso | Respuesta |
|---|---|
| Llega `status`, o el responsable, o ambos, con valores válidos | Se aplica el cambio y se devuelve la tarea actualizada |
| No llega ninguno de los dos campos | **422**, con el error indicando que hay que aportar al menos uno |
| El responsable llega nulo (intento de dejar la tarea sin responsable) | **422** asociado al campo del responsable |
| El responsable no corresponde a ninguna persona registrada | **422** asociado al campo del responsable |
| La tarea indicada no existe | **404** |
| Llega un `status` fuera de los tres identificadores | **422** asociado al campo del estado |

Una tarea **siempre** tiene responsable: nace con quien la crea y solo puede pasar a otra persona registrada. No hay tareas sin asignar en este change.

El 422 ante una actualización sin campos es deliberado: aceptar la petición vacía como éxito silencioso oculta errores del cliente, y ninguna historia pide que una actualización sin cambios sea válida.

### D6b — Los campos desconocidos en la creación no son contrato de producto

El validador de creación declara únicamente el título, y VineJS descarta lo que no está declarado. Eso significa que una petición de creación que incluyera `status` o un responsable no los tendría en cuenta: la tarea nacería igualmente pendiente y a nombre de quien la crea.

**Esto se documenta aquí como comportamiento técnico y no aparece en el delta.** Ninguna de las cinco historias fija una política sobre campos desconocidos —`E2-1/CA-2` habla del flujo en pantalla, no del cuerpo de la petición—, y rechazarlos con 422 sería una política igual de legítima. Elevar el descarte silencioso a requisito sería convertir el comportamiento por defecto de una librería en contrato.

### D7 — El cambio de estado en pantalla se resuelve con tres botones, no con un desplegable

Cada entrada de la lista muestra los tres estados como un grupo de botones construido con el `Button` que ya existe, con el estado actual marcado como seleccionado.

*Por qué, y alternativa descartada:* un desplegable exigiría traer `select` o `dropdown-menu` de shadcn, es decir, un componente nuevo en el sistema de diseño. Además `E2-4/CA-1` pide que el cambio cueste **un gesto**, sin diálogos ni campos: un desplegable cuesta dos (abrir y elegir), tres botones cuesta uno. La restricción de no ampliar el sistema de diseño y el criterio de aceptación apuntan a la misma solución.

`E2-4/CA-3` —que los únicos destinos ofrecidos sean los tres— queda satisfecho de forma literal: los tres botones son toda la oferta.

### D8 — La fila se actualiza con la tarea que devuelve el servidor, sin optimismo

Al pulsar un estado, el botón queda inhabilitado mientras vuela la petición y la fila se sustituye por la tarea devuelta. Si falla, se muestra el error y la fila conserva el estado anterior.

*Alternativa descartada:* actualización optimista con reversión. Es lo que más se acerca al «de inmediato» de `E2-4/CA-1`, pero introduce estados intermedios que hay que razonar a mano — y este change no lleva tests. Con el backend en local la diferencia no es perceptible; si la latencia llegara a notarse, el cambio a optimista es local a la página.

### D9 — La lista vive en su propia ruta protegida y el aterrizaje no cambia

La pantalla se cuelga del mismo guard de rutas protegidas que el perfil. Tras iniciar sesión se sigue aterrizando en el perfil, con un enlace a las tareas. Así **ningún requisito de la capability `auth` cambia** y este change no arrastra un delta sobre ella.

### D10 — Las llamadas nuevas entran en el cliente de API existente

Las tres operaciones se añaden a `lib/api.ts`, que ya desenvuelve el `{ data }`, adjunta la sesión y traduce los errores por regla y campo. Se amplía esa traducción con las reglas y etiquetas nuevas (título, estado, responsable). Ningún componente llama a la red por su cuenta.

## Risks / Trade-offs

- **El umbral de título sigue sin decidir** → `E2-2/CA-3` se entrega a medias: se garantiza que nada se acorta en silencio, y el aviso por longitud espera a PA-9, en un change posterior. Se prefiere una laguna declarada a un número inventado que después nadie pueda cuestionar.
- **La lista sale sin orden declarado** → con pocas tareas es inocuo; en cuanto crezca, la promesa de `E3-1/CA-5` (enumerar el trabajo de cada persona recorriendo la lista) deja de sostenerse. Es exactamente lo que PA-3 tiene que resolver, y por eso el delta se limita a decir que cada fila muestra sus tres datos, sin prometer todavía CA-5.
- **Reasignar existe en la API y no en la pantalla** → una capacidad sin superficie es una capacidad que nadie prueba. Queda anotada como hueco conocido de la entrega.
- **Sin tests** → el change se entrega sin red. El alcance es pequeño y la verificación es manual; cualquier historia posterior sobre tareas hereda ese hueco.
- **Tres botones por fila** → con muchas tareas la lista se vuelve densa, y es una solución menos convencional que un desplegable. Se acepta a cambio de no ampliar el sistema de diseño y de cumplir literalmente el gesto único.
- **Sin refresco automático** → dos personas cambiando la misma tarea a la vez no se ven entre sí hasta recargar. Es `E3-2` y está fuera de este change; la lista solo promete ser correcta en el momento en que se pide.

## Open Questions

Ninguna bloquea este change. Las dos abiertas son decisiones de producto, ya recogidas en `proposal.md`, y ninguna impide completarlo ni archivarlo:

- **¿Cuál es el límite máximo de un título?** (PA-9) — su respuesta habilita un change posterior que añada la validación de longitud y su aviso. Aquí no falta nada por hacer a la espera de ese número.
- **¿En qué orden salen las tareas, y se agrupan por persona?** (PA-3) — su respuesta añadirá un requisito de orden y hará entregable `E3-1/CA-5`. Mientras tanto, este change ni ordena ni promete nada sobre el orden.
