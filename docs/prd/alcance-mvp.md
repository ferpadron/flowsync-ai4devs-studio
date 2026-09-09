# FlowSync — Alcance del MVP

Documento de referencia consensuado. Congela el alcance discutido para que no dependa de una conversación puntual; sirve de base para el PRD, todavía no escrito.

## 1. Problema

En equipos remotos pequeños y de roles planos, la ronda de "¿en qué estás?" dentro de la daily existe porque nadie puede ver el estado del equipo sin interrumpir a alguien. Eso genera dos costes: tiempo de reunión desperdiciado repitiendo en voz alta lo que ya se sabe, y trabajo duplicado por gente que empieza algo sin saber que otra persona ya lo está tocando (caso real de referencia: dos personas tocaron el mismo módulo la misma semana y se perdieron dos días). El dolor es horizontal, entre pares — no es una necesidad de reporte hacia un manager.

## 2. Usuarios

Equipos remotos de 3–10 personas, con roles planos (sin jerarquía de permisos), que no necesitan sprints, backlog priorizado, estimaciones ni informes. Caso de estudio de referencia: equipo de producto SaaS de 6 personas distribuido en 3 husos horarios (hipotético, no cliente real todavía). No son managers pidiendo visibilidad hacia arriba — son pares que necesitan saber qué hace el resto para no pisarse ni interrumpirse.

## 3. Propuesta de valor

Un lugar donde actualizar tu propio estado te beneficia a ti primero (como cola de trabajo, para decidir qué coger después, para que no te interrumpan) y, como efecto secundario, el equipo entero ve en qué está cada uno sin tener que preguntar. "Tiempo real" significa frescura del estado de la tarea, no presencia de la persona: se consume en modo "entro y miro qué se movió", no por notificaciones. Sustituye a la ronda de status de la daily, no a la daily entera (los bloqueos se siguen hablando ahí).

## 4. Alcance (IN)

- Un único espacio de trabajo compartido, sin entidad "equipo": todos los usuarios que entran ven y editan lo mismo.
- Tareas con solo 4 campos: título, responsable, estado, fecha de vencimiento.
- Crear una tarea y cambiar su estado en segundos, sin campos obligatorios extra ni flujo de configuración.
- Vista de lista filtrable por estado, para centrarse en lo pendiente.
- Auth básica (ya existente en el repo: signup/login/logout) para saber quién es quién.

## 5. NO-alcance (OUT)

- **Entidad "equipo" / multi-equipo.** El caso de estudio es un único equipo. Aislar equipos es trabajo de permisos que nadie en el MVP necesita; queda como supuesto documentado, no como construcción.
- **Permisos jerárquicos / roles.** El dolor es entre pares, no vertical. Introducir roles resuelve un problema inexistente en este segmento y añade fricción a la actualización rápida, que es el núcleo del producto.
- **Sprints, estimaciones, épicas, backlog priorizado, informes.** Es exactamente "el rollo de Jira" que el usuario objetivo rechaza explícitamente; construirlo traiciona la propuesta de valor.
- **Notificaciones push, chat, videollamada, presencia/indicadores de actividad.** El producto se apoya en frescura de la tarea, no en presencia de la persona; esto último es vigilancia, rechazada deliberadamente, y además es infraestructura cara que no aporta a la métrica de éxito.
- **Integraciones con Git/PRs, CI, calendario u otros gestores de tareas.** Cada integración implica OAuth de terceros y mantenimiento continuo — es soporte de plataforma, no validación de la hipótesis de producto todavía sin probar.
- **Convivencia con el gestor de tareas actual (import/sincronización).** La doble entrada de datos mata la frescura, que es la única razón de ser del producto. Se sustituye, no se sincroniza, aunque eso eleve la barrera de adopción del piloto.
- **Comentarios, adjuntos, subtareas, dependencias entre tareas.** Ninguno aparece en el caso de origen (el solape se resuelve viendo que alguien ya tiene la tarea, no discutiendo detalles dentro de ella); añadirlos antes de validar el bucle básico es construir para una necesidad no observada.
- **Detección de bloqueos o alertas de retraso antes de la fecha límite.** Los bloqueos se siguen hablando en la daily por decisión consciente; meterlo en el MVP invadiría un alcance que se dejó fuera a propósito.
- **Bandeja de notificaciones o resumen por email.** El modo de consumo declarado es pull ("entro y miro"), no push ("me avisan"); construir notificaciones resolvería un problema de consumo distinto al definido.

## Métrica de éxito del piloto

A la semana de uso real con el equipo de estudio: cancelan la ronda de status de la daily y nadie pide recuperarla. Si la siguen haciendo igual, el MVP no cumplió su función, sin importar cuántas tareas se hayan creado.
