# FS-142 — Filtrar tareas por estado

**Como** miembro del equipo, **quiero** filtrar la lista de tareas por estado, **para** centrarme solo en lo que sigue pendiente.

## Criterios de aceptación

**Filtrar y quitar el filtro**

1. DADO que la lista de tareas tiene tareas en distintos estados, CUANDO elijo filtrar por un estado concreto, ENTONCES la lista muestra solo las tareas en ese estado y oculta el resto.
2. DADO que tengo un filtro de estado aplicado, CUANDO lo quito, ENTONCES la lista vuelve a mostrar todas las tareas, sin importar su estado.
3. DADO que filtro por un estado válido en el que ninguna tarea se encuentra actualmente, CUANDO aplico ese filtro, ENTONCES la lista se muestra vacía junto con una indicación de que no hay tareas en ese estado — distinto de un error, es simplemente "no hay resultados".

**Estado inexistente**

4. DADO que solicito filtrar la lista por un estado que no forma parte de los estados válidos del sistema, CUANDO aplico ese filtro, ENTONCES el sistema me avisa de que ese estado no es válido, en vez de mostrarme una lista vacía como si simplemente no hubiera coincidencias.
5. **[PROPUESTA]** DADO que el sistema me ha avisado de que el estado solicitado no es válido, CUANDO descarto ese aviso, ENTONCES la lista vuelve a mostrar el último filtro válido que tenía aplicado (o todas las tareas si no tenía ninguno), sin quedarse en blanco.

**Consistencia con el resto del tablero**

6. DADO que tengo un filtro de estado activo, CUANDO se crea una tarea nueva o el estado de una tarea existente cambia de forma que ahora coincide con el filtro, ENTONCES esa tarea aparece en la lista filtrada sin que tenga que quitar y volver a aplicar el filtro.

> El criterio 4 (avisar de un estado inválido en vez de una lista vacía silenciosa) fue una instrucción explícita de la sesión y se mantiene como criterio aprobado. El criterio 5, marcado **[PROPUESTA]**, describe una forma concreta de recuperación tras ese aviso que no fue pedida explícitamente; se documenta para no perder el escenario, pero queda pendiente de validación.
