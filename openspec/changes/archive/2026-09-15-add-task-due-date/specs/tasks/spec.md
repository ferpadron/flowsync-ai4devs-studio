## ADDED Requirements

### Requirement: Fecha de vencimiento opcional de una tarea

El sistema SHALL permitir que una tarea tenga una fecha de vencimiento opcional, expresada como fecha de calendario sin hora. Toda tarea SHALL nacer sin fecha, y el sistema SHALL rechazar la fecha si llega durante la creación: la fecha solo se establece, se cambia y se retira sobre una tarea que ya existe.

#### Scenario: Una tarea nueva nace sin fecha de vencimiento

- **WHEN** una persona crea una tarea indicando solo el título
- **THEN** la tarea queda sin fecha de vencimiento, y esa ausencia es un estado normal que no genera aviso ni marca de ningún tipo

#### Scenario: La creación no admite fecha de vencimiento

- **WHEN** se intenta crear una tarea incluyendo una fecha de vencimiento
- **THEN** el sistema rechaza la petición con un error asociado al campo de la fecha y no crea ninguna tarea

#### Scenario: Poner una fecha a una tarea que no la tenía

- **WHEN** una persona con sesión iniciada actualiza una tarea sin fecha indicando una fecha de calendario válida
- **THEN** el sistema la guarda y las consultas posteriores devuelven esa fecha

#### Scenario: Cambiar la fecha que ya tenía

- **WHEN** una persona actualiza una tarea con fecha indicando otra fecha de calendario válida
- **THEN** el sistema sustituye la anterior y las consultas posteriores devuelven únicamente la nueva

#### Scenario: Retirar la fecha enviándola vacía

- **WHEN** una persona actualiza una tarea con fecha enviando la fecha explícitamente vacía
- **THEN** el sistema la retira y la tarea vuelve a no tener fecha; es una operación admitida y no un caso de error

#### Scenario: Una fecha anterior al día actual se acepta

- **WHEN** una persona fija en una tarea una fecha de vencimiento anterior al día actual
- **THEN** el sistema la acepta sin impedirlo, del mismo modo que cualquier otra fecha

#### Scenario: Una fecha con formato inválido se rechaza

- **WHEN** se intenta fijar como fecha de vencimiento un valor que no es una fecha de calendario válida
- **THEN** el sistema rechaza la petición con un error asociado al campo de la fecha, y la tarea conserva sin cambios la fecha que tuviera antes

### Requirement: Regla de tarea vencida

El sistema SHALL considerar una tarea vencida si y solo si se cumplen a la vez las tres condiciones siguientes: tiene fecha de vencimiento, esa fecha es **anterior** al día de referencia, y su estado no es `done`. Si alguna de las tres falla, la tarea SHALL no estar vencida.

#### Scenario: Fecha anterior al día de referencia y estado distinto de hecho

- **WHEN** se evalúa una tarea cuya fecha de vencimiento es anterior al día de referencia y cuyo estado es `pending` o `in_progress`
- **THEN** el sistema la considera vencida

#### Scenario: La fecha es el mismo día de referencia

- **WHEN** se evalúa una tarea sin hacer cuya fecha de vencimiento coincide exactamente con el día de referencia
- **THEN** el sistema no la considera vencida, porque la regla exige que la fecha sea anterior a ese día

#### Scenario: La fecha es posterior al día de referencia

- **WHEN** se evalúa una tarea sin hacer cuya fecha de vencimiento es posterior al día de referencia
- **THEN** el sistema no la considera vencida

#### Scenario: Sin fecha no hay vencimiento posible

- **WHEN** se evalúa una tarea sin fecha de vencimiento, por antigua que sea y sea cual sea su estado
- **THEN** el sistema no la considera vencida

#### Scenario: Una tarea hecha con la fecha pasada no está vencida

- **WHEN** se evalúa una tarea en estado `done` cuya fecha de vencimiento ya pasó
- **THEN** el sistema no la considera vencida

#### Scenario: Pasar a hecho deja de vencer sin tocar la fecha

- **WHEN** una tarea vencida pasa a estado `done`
- **THEN** deja de considerarse vencida y conserva su fecha de vencimiento sin ningún cambio

#### Scenario: Aplazar la fecha resuelve el vencimiento

- **WHEN** a una tarea vencida se le fija una fecha posterior al día de referencia
- **THEN** deja de considerarse vencida

### Requirement: El veredicto de vencimiento lo emite el servidor y no se almacena

El sistema SHALL exponer la condición de vencimiento como un valor booleano dentro de la representación **individual** de una tarea, calculado por el servidor en cada lectura a partir de la regla de tarea vencida. El sistema SHALL no persistir ese valor en ningún almacenamiento, SHALL no depender de procesos programados para mantenerlo al día, y SHALL ignorar cualquier valor de vencimiento que envíe el cliente.

#### Scenario: La representación individual expone el veredicto

- **WHEN** se consulta o se actualiza una tarea concreta
- **THEN** la respuesta incluye, además de su fecha de vencimiento, un booleano que indica si esa tarea está vencida

#### Scenario: La representación de la lista no expone el veredicto

- **WHEN** se consulta la lista de tareas
- **THEN** ninguna entrada incluye la fecha de vencimiento ni el booleano de vencimiento

#### Scenario: El veredicto se recalcula en cada lectura

- **WHEN** se consulta dos veces la misma tarea sin que nadie la haya modificado, y entre una consulta y otra cambia el día de referencia de modo que la regla pasa a cumplirse
- **THEN** la segunda respuesta la da por vencida aunque ningún dato almacenado de la tarea haya cambiado

#### Scenario: Un veredicto enviado por el cliente se ignora

- **WHEN** se actualiza una tarea incluyendo en la petición un valor de vencimiento
- **THEN** el sistema lo descarta y responde con el veredicto que él mismo calcula

### Requirement: El día de referencia del vencimiento es el de quien mira

El sistema SHALL resolver el vencimiento contra el día de calendario de quien realiza la consulta cuando este lo aporta, y SHALL usar su propio día cuando no se aporta. Dos personas que miran la misma tarea desde días de calendario distintos SHALL obtener veredictos distintos, y ambos SHALL ser correctos.

#### Scenario: Dos días de referencia distintos dan lecturas distintas

- **WHEN** dos personas consultan a la vez la misma tarea sin hacer, cuya fecha de vencimiento ya pasó para el día de calendario de la primera pero es todavía el día en curso para la segunda
- **THEN** la primera la recibe como vencida y la segunda no, y ninguna de las dos respuestas es un error

#### Scenario: Sin día de referencia el servidor usa el suyo

- **WHEN** se consulta una tarea sin aportar ningún día de referencia
- **THEN** el sistema resuelve el vencimiento contra su propio día de calendario y responde con normalidad

#### Scenario: Una tarea vence sola por el avance del día

- **WHEN** una tarea sin hacer cuya fecha es el día en curso se vuelve a consultar una vez que el día de referencia ha avanzado al siguiente
- **THEN** aparece como vencida sin que nadie haya modificado la tarea

#### Scenario: Un día de referencia mal formado se rechaza

- **WHEN** se consulta una tarea aportando como día de referencia un valor que no es una fecha de calendario válida
- **THEN** el sistema rechaza la petición con un error asociado a ese dato, en lugar de recurrir en silencio a otro día

### Requirement: Consulta individual de una tarea

El sistema SHALL permitir consultar una tarea concreta por su identificador, devolviendo su título, su estado, su responsable, su fecha de vencimiento y su condición de vencimiento.

#### Scenario: Consultar una tarea existente

- **WHEN** una persona con sesión iniciada consulta una tarea que existe
- **THEN** el sistema responde con esa tarea, incluidos su fecha de vencimiento y su veredicto de vencimiento

#### Scenario: Consultar una tarea que no existe

- **WHEN** una persona con sesión iniciada consulta una tarea cuyo identificador no corresponde a ninguna
- **THEN** el sistema responde indicando que no existe, y no devuelve una tarea vacía

#### Scenario: Cualquier persona registrada consulta cualquier tarea

- **WHEN** una persona consulta una tarea cuyo responsable es otra persona
- **THEN** el sistema responde igual que si fuera propia, sin pedir ningún permiso especial

### Requirement: La fecha y el vencimiento solo aparecen al abrir la tarea

El sistema SHALL mostrar la fecha de vencimiento y la condición de vencida únicamente en la vista de una tarea concreta, y SHALL comunicar esa condición con una señal propia que no obligue a quien mira a comparar la fecha con el día de hoy. La lista SHALL seguir mostrando en cada entrada únicamente el título, el responsable y el estado.

#### Scenario: Al abrir una tarea vencida su condición es explícita

- **WHEN** una persona abre una tarea vencida
- **THEN** ve indicada su condición de vencida mediante una señal propia, sin tener que deducirla comparando la fecha con el día en curso

#### Scenario: Al abrir una tarea sin fecha no se señala ninguna carencia

- **WHEN** una persona abre una tarea que no tiene fecha de vencimiento
- **THEN** no recibe ningún aviso, recordatorio ni indicación de que le falte algo

#### Scenario: La lista sigue mostrando lo mismo que antes

- **WHEN** una persona mira la lista, habiendo tareas con fecha y algunas de ellas vencidas
- **THEN** cada entrada muestra su título, su responsable y su estado, y ninguna muestra fecha, condición de vencida ni marca visual alguna de vencimiento

### Requirement: La edición de la fecha se guarda sin paso adicional

El sistema SHALL aplicar los cambios de la fecha de vencimiento en el momento en que se realizan, sin exigir una acción de guardado posterior y sin pedir confirmación para retirarla.

#### Scenario: El cambio queda guardado sin confirmarlo

- **WHEN** una persona pone o cambia la fecha de vencimiento de una tarea abierta y después la cierra
- **THEN** el cambio ya está guardado, sin que haya tenido que pulsar ningún botón de guardado

#### Scenario: Retirar la fecha no pide confirmación

- **WHEN** una persona retira la fecha de vencimiento de una tarea
- **THEN** el cambio se aplica directamente, sin ningún diálogo de confirmación

#### Scenario: Una fecha inválida se explica junto al campo

- **WHEN** la vista de una tarea recibe el rechazo de una fecha de vencimiento no válida
- **THEN** muestra la explicación en lenguaje corriente junto al propio campo de la fecha, y el valor que la tarea tuviera antes queda intacto

### Requirement: Cambiar la fecha no exige propiedad ni altera el resto de la tarea

El sistema SHALL permitir a cualquier persona registrada cambiar la fecha de vencimiento de cualquier tarea, con independencia de quién sea su responsable, y SHALL no modificar la fecha ni la condición de vencimiento como efecto de cambiar el responsable de una tarea.

#### Scenario: Cualquiera cambia la fecha de cualquier tarea

- **WHEN** una persona cambia la fecha de vencimiento de una tarea cuyo responsable es otra persona
- **THEN** el cambio se aplica igual que en una tarea propia, sin advertencia ni permiso especial

#### Scenario: Reasignar el responsable no toca la fecha

- **WHEN** se cambia el responsable de una tarea que tiene fecha de vencimiento
- **THEN** la tarea conserva la misma fecha y su condición de vencimiento no varía por ese cambio

## MODIFIED Requirements

### Requirement: Toda operación sobre tareas exige sesión iniciada

El sistema SHALL exigir una sesión válida para listar, consultar, crear y actualizar tareas, y SHALL dar acceso a la lista completa y a cualquier tarea concreta a cualquier persona registrada, sin contenido reservado a ningún rol.

#### Scenario: Sin sesión no hay tareas

- **WHEN** alguien sin sesión válida intenta listar, consultar, crear o actualizar tareas, o intenta llegar a la pantalla de la lista o a la de una tarea concreta
- **THEN** no obtiene ninguna tarea ni llega a modificar ninguna

#### Scenario: Cualquier persona registrada ve la lista entera

- **WHEN** una persona registrada cualquiera consulta la lista
- **THEN** obtiene todas las tareas del espacio, sin ninguna parte reservada a un rol concreto

#### Scenario: Cualquier persona registrada abre cualquier tarea

- **WHEN** una persona registrada cualquiera consulta una tarea concreta del espacio
- **THEN** obtiene esa tarea completa, sin ninguna parte reservada a un rol concreto
