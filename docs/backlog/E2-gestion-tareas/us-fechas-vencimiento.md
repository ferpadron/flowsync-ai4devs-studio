# FS-118 — Fecha de vencimiento y tareas vencidas

**Como** miembro del equipo, **quiero** asignar y modificar la fecha de vencimiento de una tarea, y ver de un vistazo en la lista cuáles están vencidas sin completar, **para** saber qué se ha retrasado sin tener que abrir cada tarea.

## Criterios de aceptación

**Asignar y modificar la fecha**

1. DADO que estoy creando o editando una tarea sin fecha de vencimiento, CUANDO le asigno una fecha, ENTONCES la tarea queda con esa fecha y se muestra en la lista.
2. DADO que una tarea ya tiene una fecha de vencimiento, CUANDO la modifico por otra fecha, ENTONCES la lista muestra la nueva fecha y deja de mostrar la anterior.
3. DADO que estoy creando una tarea, CUANDO no indico ninguna fecha de vencimiento, ENTONCES la tarea se crea igualmente, sin fecha, y nunca se marca como vencida mientras no se le asigne una.
4. DADO que estoy asignando o modificando la fecha de vencimiento de una tarea, CUANDO elijo una fecha anterior a hoy, ENTONCES el sistema me deja guardarla y la tarea pasa a mostrarse como vencida de inmediato (no se bloquea la posibilidad de fechar en el pasado).

**Señalar tareas vencidas**

5. DADO que una tarea no está completada y su fecha de vencimiento ya pasó, CUANDO consulto la lista de tareas, ENTONCES esa tarea se distingue visualmente del resto como vencida.
6. DADO que una tarea no está completada y su fecha de vencimiento es hoy o futura, CUANDO consulto la lista de tareas, ENTONCES esa tarea se muestra sin ninguna marca de vencida.
7. DADO que la fecha de vencimiento de una tarea sin completar es exactamente hoy, CUANDO consulto la lista de tareas, ENTONCES esa tarea todavía NO se marca como vencida (se considera vencida a partir del día siguiente a la fecha, no el mismo día).

**Dejar de estar vencida**

8. DADO que una tarea está marcada como vencida, CUANDO su responsable la marca como completada, ENTONCES deja de mostrarse como vencida, aunque la fecha siga en el pasado.
9. DADO que una tarea está marcada como vencida y sigue sin completar, CUANDO su responsable le asigna una nueva fecha de vencimiento futura, ENTONCES la tarea deja de mostrarse como vencida.
