# Tasks

## Purpose

Esta capability cubre la lista compartida de tareas del equipo: crear una tarea escribiendo solo su título, consultar en una sola lista qué hay y quién lleva cada cosa, y cambiar el estado o el responsable de cualquier tarea.

## Requirements

### Requirement: Creación de una tarea con solo el título

El sistema SHALL permitir crear una tarea aportando únicamente su título, y SHALL no pedir ni sugerir ningún otro dato durante el flujo de creación.

#### Scenario: El título basta para que la tarea exista

- **WHEN** una persona con sesión iniciada envía un título válido
- **THEN** el sistema crea la tarea y responde con ella, sin haber requerido ningún otro dato

#### Scenario: El flujo de creación no ofrece nada más

- **WHEN** una persona recorre entero el flujo de creación en la pantalla
- **THEN** el título es el único dato que se le pide, y no se le ofrece ni se le sugiere indicar responsable, estado, fecha ni ningún otro campo

#### Scenario: La tarea recién creada se ve sin volver a pedirla

- **WHEN** una persona termina de crear una tarea desde la lista
- **THEN** la tarea aparece en la lista que está viendo, sin recargar la página ni navegar a otra pantalla

### Requirement: Responsable y estado iniciales de una tarea nueva

El sistema SHALL asignar a toda tarea recién creada el estado pendiente y, como responsable, la persona que la crea, sin que esta haya elegido ninguna de las dos cosas.

#### Scenario: Nace pendiente y a nombre de quien la crea

- **WHEN** una persona crea una tarea indicando solo el título
- **THEN** la tarea queda con estado pendiente y con esa misma persona como responsable

### Requirement: Título obligatorio

El sistema SHALL rechazar la creación de una tarea cuyo título falte o esté formado únicamente por espacios en blanco, y SHALL no dejar ninguna tarea creada en ese caso.

#### Scenario: Creación sin título

- **WHEN** una persona intenta crear una tarea sin haber escrito ningún título
- **THEN** el sistema rechaza la petición con un error asociado al campo del título, y no crea ninguna tarea

#### Scenario: Título formado solo por espacios

- **WHEN** una persona intenta crear una tarea cuyo título son únicamente espacios en blanco
- **THEN** el sistema lo rechaza igual que si el campo estuviera vacío, y la lista no gana ninguna fila sin texto

#### Scenario: El problema se explica junto al campo

- **WHEN** la pantalla de creación recibe el rechazo por título ausente o en blanco
- **THEN** muestra la explicación en lenguaje corriente junto al propio campo del título

### Requirement: El título se conserva sin acortar

El sistema SHALL guardar el título completo tal y como se escribió, sin acortarlo por razón de su longitud. La única normalización que SHALL aplicar es eliminar los espacios sobrantes al principio y al final.

#### Scenario: Un título largo se guarda entero

- **WHEN** una persona crea una tarea con un título notablemente largo
- **THEN** el sistema guarda ese título completo y las consultas posteriores lo devuelven sin acortar

#### Scenario: Solo se recortan los espacios de los extremos

- **WHEN** el título llega con espacios sobrantes al principio o al final
- **THEN** el sistema guarda el texto sin esos espacios y sin alterar nada más de lo escrito

### Requirement: Conjunto cerrado de tres estados

El sistema SHALL admitir exactamente tres estados de tarea, identificados como `pending`, `in_progress` y `done`, y SHALL rechazar cualquier otro valor.

#### Scenario: Los tres identificadores válidos

- **WHEN** se actualiza una tarea con el estado `pending`, `in_progress` o `done`
- **THEN** el sistema acepta el cambio y la tarea queda en exactamente ese estado

#### Scenario: Cualquier otro valor se rechaza

- **WHEN** se intenta fijar un estado que no es ninguno de esos tres identificadores
- **THEN** el sistema rechaza la petición con un error asociado al campo del estado y la tarea conserva el estado que tenía

#### Scenario: La capability no ofrece gestionar el catálogo de estados

- **WHEN** se examinan las operaciones que esta capability ofrece sobre tareas
- **THEN** ninguna permite añadir, renombrar ni eliminar estados: los valores que admite son exactamente esos tres

### Requirement: Presentación de los estados en pantalla

El sistema SHALL mostrar los estados en castellano como Pendiente, En curso y Hecho, y SHALL no exponer en pantalla los identificadores con los que viajan por la API.

#### Scenario: Etiquetas en castellano

- **WHEN** una persona mira una tarea en la pantalla
- **THEN** ve su estado escrito como Pendiente, En curso o Hecho, y nunca el identificador correspondiente

### Requirement: Una sola lista compartida

El sistema SHALL mantener una única lista de tareas, idéntica para todas las personas del espacio, sin tareas privadas ni vistas personales separadas.

#### Scenario: El contenido no depende de quién mira

- **WHEN** dos personas distintas consultan la lista sin que nadie modifique nada entre una consulta y otra
- **THEN** las dos obtienen exactamente el mismo conjunto de tareas

#### Scenario: No hay forma de crear una tarea privada

- **WHEN** una persona crea una tarea y se la queda como responsable
- **THEN** esa tarea aparece igualmente en la lista que ven las demás, y no existe ninguna opción que permita ocultarla

#### Scenario: La única vista de tareas es la lista compartida

- **WHEN** una persona usa la aplicación
- **THEN** la única vista de tareas que se le ofrece es la lista compartida del equipo, sin ninguna vista personal separada de ella

### Requirement: Cada fila responde quién está en qué

El sistema SHALL mostrar en cada entrada de la lista el título de la tarea, la persona responsable y su estado, de modo que no haga falta abrir ninguna tarea para conocer esos tres datos.

#### Scenario: Los tres datos están a la vista

- **WHEN** una persona mira la lista con tareas repartidas entre varios miembros
- **THEN** cada entrada muestra su título, su responsable y su estado, sin que haga falta abrir ninguna tarea para conocerlos

#### Scenario: El responsable se identifica por su nombre

- **WHEN** una entrada de la lista corresponde a una tarea cuyo responsable tiene nombre puesto
- **THEN** se muestra ese nombre, nunca su correo ni su identificador interno

#### Scenario: Responsable sin nombre

- **WHEN** el responsable de una tarea no tiene nombre puesto en su cuenta
- **THEN** la entrada muestra «Sin nombre», y tampoco en ese caso se recurre a su correo ni a su identificador

### Requirement: Datos del responsable expuestos por la capability

El sistema SHALL exponer de la persona responsable únicamente su identificador y su nombre, y SHALL no incluir su correo ni ningún otro dato de su cuenta en las respuestas de esta capability.

#### Scenario: La respuesta no arrastra datos de cuenta

- **WHEN** se consulta la lista o se crea o actualiza una tarea
- **THEN** los datos del responsable que viajan en la respuesta se limitan a su identificador y su nombre

### Requirement: La lista no muestra vencimientos

El sistema SHALL no mostrar en la lista fechas de vencimiento ni marcas de tarea vencida.

#### Scenario: Ninguna fecha en la lista

- **WHEN** una persona mira la lista
- **THEN** no ve fechas de vencimiento ni ninguna señal de tarea vencida en ninguna entrada

### Requirement: La lista vacía se explica

El sistema SHALL presentar, cuando no hay ninguna tarea creada, una explicación de qué es la lista junto con la invitación a crear la primera tarea, en lugar de un espacio vacío.

#### Scenario: Espacio sin ninguna tarea

- **WHEN** una persona abre la lista y no hay ninguna tarea creada en el espacio
- **THEN** ve una explicación de para qué sirve la lista y la forma de crear la primera tarea

### Requirement: Cambio de estado desde la propia lista

El sistema SHALL permitir cambiar el estado de cualquier tarea desde la propia lista con una sola acción, sin abrir la tarea, sin diálogos de confirmación y sin rellenar ningún campo.

#### Scenario: El cambio se hace sin salir de la lista

- **WHEN** una persona realiza una sola acción sobre la entrada de una tarea para cambiar su estado
- **THEN** no ha abierto la tarea, ni confirmado en ningún diálogo, ni rellenado ningún campo, y una vez confirmada la respuesta del servidor la entrada refleja el nuevo estado

#### Scenario: Solo se ofrecen los tres estados

- **WHEN** una persona va a cambiar el estado de una tarea desde la lista
- **THEN** los únicos destinos que se le ofrecen son Pendiente, En curso y Hecho, y al terminar la tarea está en exactamente uno de ellos

#### Scenario: Cualquier tarea, no solo la propia

- **WHEN** una persona cambia el estado de una tarea cuyo responsable es otra persona
- **THEN** el cambio se aplica igual que en una tarea propia, sin pedirle ningún permiso especial ni mostrarle ninguna advertencia

### Requirement: Cambio de responsable de cualquier tarea

El sistema SHALL permitir asignar cualquier tarea a cualquier persona registrada, con independencia de quién sea su responsable actual y de quién realice el cambio, y SHALL mantener siempre una persona responsable asignada.

#### Scenario: Reasignación a otra persona

- **WHEN** se actualiza una tarea indicando como responsable a otra persona registrada
- **THEN** el sistema aplica el cambio y las consultas posteriores devuelven a esa persona como responsable

#### Scenario: Responsable inexistente

- **WHEN** se intenta asignar una tarea a una persona que no existe
- **THEN** el sistema rechaza la petición con un error asociado al campo del responsable y la tarea conserva el responsable que tenía

#### Scenario: Una tarea nunca se queda sin responsable

- **WHEN** se intenta dejar una tarea sin persona responsable
- **THEN** el sistema rechaza la petición con un error asociado al campo del responsable y la tarea conserva el responsable que tenía

### Requirement: Consultar la lista no la modifica

El sistema SHALL no alterar ninguna tarea como consecuencia de consultar la lista.

#### Scenario: Mirar no cambia nada

- **WHEN** una persona abre la lista con tareas en varios estados y la recorre
- **THEN** ninguna tarea cambia de estado ni de responsable

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
