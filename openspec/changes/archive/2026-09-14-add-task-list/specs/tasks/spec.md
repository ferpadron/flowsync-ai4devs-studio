## Purpose

Esta capability cubre la lista compartida de tareas del equipo: crear una tarea escribiendo solo su título, consultar en una sola lista qué hay y quién lleva cada cosa, y cambiar el estado o el responsable de cualquier tarea.

## ADDED Requirements

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

El sistema SHALL exigir una sesión válida para listar, crear y actualizar tareas, y SHALL dar acceso a la lista completa a cualquier persona registrada, sin contenido reservado a ningún rol.

#### Scenario: Sin sesión no hay tareas

- **WHEN** alguien sin sesión válida intenta listar, crear o actualizar tareas, o intenta llegar a la pantalla de la lista
- **THEN** no obtiene ninguna tarea ni llega a modificar ninguna

#### Scenario: Cualquier persona registrada ve la lista entera

- **WHEN** una persona registrada cualquiera consulta la lista
- **THEN** obtiene todas las tareas del espacio, sin ninguna parte reservada a un rol concreto
