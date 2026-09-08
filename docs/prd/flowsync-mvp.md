# FlowSync — PRD del MVP

Basado en `docs/prd/alcance-mvp.md`. Documento de producto: no incluye diseño técnico (modelo de datos, arquitectura, endpoints).

## 1. Problema y contexto

En equipos remotos pequeños y de roles planos, la ronda de "¿en qué estás?" dentro de la daily existe porque nadie puede ver el estado del equipo sin interrumpir a alguien. Esto genera dos costes concretos: tiempo de reunión desperdiciado repitiendo en voz alta lo que ya se sabe, y trabajo duplicado por gente que empieza algo sin saber que otra persona ya lo está tocando. Caso de referencia: dos personas del equipo tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera, y se perdieron dos días de trabajo.

El dolor es horizontal, entre pares — no es una necesidad de reporte hacia un manager. Un manager, si existiera en este contexto, no gana nada especial con esta herramienta que no gane también cualquier otro miembro del equipo.

Contexto de producto: FlowSync ya resuelve hoy el registro y el acceso a una cuenta (crear cuenta, iniciar sesión, cerrar sesión, consultar el propio perfil); la gestión de tareas y la visibilidad del equipo todavía no existen. El MVP se construye sobre esa capacidad de cuentas ya disponible, no la reemplaza.

## 2. Usuarios y jobs-to-be-done

**Perfil:** equipos remotos de 3–10 personas, con roles planos (sin jerarquía de permisos), que no necesitan sprints, backlog priorizado, estimaciones ni informes.

**Caso de estudio de referencia:** equipo de producto SaaS de 6 personas distribuido en 3 husos horarios. Es un escenario definido para este ejercicio; no representa un cliente real ni evidencia de mercado.

**Jobs-to-be-done:**
- Cuando quiero empezar a trabajar en algo, necesito saber si alguien ya lo está tocando, para no duplicar esfuerzo.
- Cuando termino o cambio de tarea, necesito dejar constancia de mi estado actual sin que me cueste más de unos segundos, para que actualizar no se sienta como una obligación administrativa.
- Cuando llego por la mañana o vuelvo de una reunión, necesito ver de un vistazo qué se ha movido en el equipo, sin tener que preguntarle a nadie.
- Cuando decido qué hacer a continuación, necesito ver qué está libre y qué ya tiene dueño, para elegir sin pisar a otra persona.

## 3. Propuesta de valor

Un espacio de trabajo donde actualizar tu propio estado te beneficia a ti primero (como cola de trabajo personal, para decidir qué coger después, para que no te interrumpan a preguntarte) y, como efecto secundario, el equipo entero ve en qué está cada uno sin tener que preguntar.

"Tiempo real" en FlowSync significa frescura del estado de la tarea, no presencia de la persona: se consume en modo "entro y miro qué se movió", no mediante notificaciones ni indicadores de actividad. FlowSync sustituye a la ronda de status de la daily, no a la daily entera — los bloqueos se siguen hablando ahí.

## 4. Alcance / Fuera de alcance

### Alcance (dentro del MVP)
- Un único espacio de trabajo compartido, sin entidad "equipo": todas las personas que acceden ven y editan las mismas tareas.
- Tareas con cuatro atributos de producto: título, responsable, estado, fecha de vencimiento.
- Crear una tarea y cambiar su estado en segundos, sin campos obligatorios adicionales ni flujo de configuración previo.
- Vista de lista de tareas, filtrable por estado, para centrarse en lo pendiente.
- Cuentas y acceso ya existentes (signup, login, logout, perfil) como base para saber quién es cada usuario.

### Fuera de alcance (con justificación)
- **Entidad "equipo" / multi-equipo.** El caso de estudio es un único equipo; aislar equipos es trabajo de permisos que nadie en el MVP necesita. Queda documentado como supuesto, no se construye.
- **Permisos jerárquicos / roles.** El dolor es entre pares, no vertical. Introducir roles resolvería un problema inexistente en este segmento y añadiría fricción a la actualización rápida, que es el núcleo del producto.
- **Sprints, estimaciones, épicas, backlog priorizado, informes.** Es exactamente el tipo de sobrecarga de proceso que el usuario objetivo rechaza explícitamente; construirlo traicionaría la propuesta de valor.
- **Notificaciones push, chat, videollamada, presencia/indicadores de actividad.** El producto se apoya en la frescura de la tarea, no en la presencia de la persona; mostrar presencia sería vigilancia, rechazada deliberadamente, y además es infraestructura cara que no aporta a la métrica de éxito.
- **Integraciones con Git/PRs, CI, calendario u otros gestores de tareas.** Cada integración implica autenticación de terceros y mantenimiento continuo; es soporte de plataforma, no validación de la hipótesis de producto, que todavía no se ha probado.
- **Convivencia con el gestor de tareas actual (importación o sincronización).** La doble entrada de datos mata la frescura, que es la única razón de ser del producto. Se sustituye, no se sincroniza, aunque eso eleve la barrera de adopción del piloto.
- **Comentarios, adjuntos, subtareas, dependencias entre tareas.** Ninguno aparece en el caso de origen del problema; añadirlos antes de validar el bucle básico sería construir para una necesidad todavía no observada.
- **Detección de bloqueos o alertas de retraso antes de la fecha límite.** Los bloqueos se siguen hablando en la daily por decisión consciente; incluir esto invadiría un alcance dejado fuera a propósito.
- **Bandeja de notificaciones o resumen por email.** El modo de consumo declarado es pull ("entro y miro"), no push ("me avisan"); construir notificaciones resolvería un problema de consumo distinto al definido.

## 5. Épicas del MVP

- **E1 — Cuentas y acceso:** agrupa todo lo relacionado con que una persona pueda registrarse, iniciar sesión, cerrar sesión y ser identificada de forma persistente dentro del espacio de trabajo.
- **E2 — Gestión de tareas:** agrupa la creación, edición, cambio de estado y consulta filtrada de las tareas del espacio de trabajo compartido.
- **E3 — Actividad del equipo:** agrupa la visibilidad del estado agregado del equipo — quién tiene qué tarea y en qué estado — sin necesidad de preguntar o interrumpir.

## 6. Requisitos funcionales

**E1 — Cuentas y acceso**
- RF-1: El sistema debe permitir que una persona nueva se registre con nombre, email y contraseña para obtener acceso al espacio de trabajo.
- RF-2: El sistema debe permitir que una persona registrada inicie sesión con email y contraseña.
- RF-3: El sistema debe permitir que una persona autenticada cierre sesión, dejando de tener acceso al espacio de trabajo hasta volver a iniciar sesión.
- RF-4: El sistema debe mantener la sesión de una persona autenticada activa entre visitas, sin pedirle credenciales en cada carga, hasta que cierre sesión explícitamente.
- RF-5: El sistema debe impedir el acceso a cualquier tarea o vista de actividad del equipo a quien no haya iniciado sesión.

**E2 — Gestión de tareas**
- RF-6: El sistema debe permitir a cualquier persona autenticada crear una tarea indicando al menos un título.
- RF-7: El sistema debe permitir asignar una tarea a un responsable, que puede ser cualquier persona con acceso al espacio de trabajo (incluida ella misma).
- RF-8: El sistema debe permitir cambiar el estado de una tarea en un máximo de dos acciones (p. ej. dos clics), sin pasos de confirmación adicionales.
- RF-9: El sistema debe permitir asignar y modificar una fecha de vencimiento a una tarea.
- RF-10: El sistema debe permitir editar el título de una tarea existente.
- RF-11: El sistema debe mostrar, para cada tarea, su responsable, su estado y su fecha de vencimiento de forma visible sin necesidad de abrir la tarea.
- RF-12: El sistema debe permitir filtrar la lista de tareas por estado.
- RF-13: El sistema debe señalar visualmente las tareas cuya fecha de vencimiento ya ha pasado y siguen sin completarse.

**E3 — Actividad del equipo**
- RF-14: El sistema debe mostrar, en una única vista, el conjunto de tareas de todas las personas del espacio de trabajo, no solo las propias.
- RF-15: El sistema debe reflejar un cambio de estado hecho por cualquier persona de forma que sea visible para el resto la próxima vez que consulten la vista, sin que tengan que pedirlo a nadie.
- RF-16: El sistema no debe requerir ninguna acción de una persona para que su actividad sea visible al resto, más allá de mantener actualizado el estado de sus propias tareas.
- RF-17: El sistema no debe mostrar indicadores de presencia o conexión de las personas (quién está activo ahora mismo); la visibilidad se limita al estado de las tareas.

## 7. Requisitos no funcionales

- RNF-1: Crear una tarea o cambiar su estado debe percibirse como inmediato para quien lo hace (sin esperas ni pantallas de carga perceptibles en el flujo principal).
- RNF-2: La aplicación debe ser utilizable desde un navegador de escritorio estándar sin instalación adicional.
- RNF-3: Los datos de una tarea (título, responsable, estado, fecha) deben conservarse de forma persistente entre sesiones: cerrar sesión o recargar la página no debe perder información.
- RNF-4: El acceso a las tareas y a la actividad del equipo debe requerir autenticación; no debe existir una vista pública sin iniciar sesión.
- RNF-5: La interfaz debe permitir crear una tarea y cambiar su estado sin necesidad de leer documentación ni recibir formación previa — el propio flujo debe ser autoexplicativo.
- RNF-6: El sistema debe soportar de forma fluida el uso simultáneo de un equipo de hasta 10 personas trabajando sobre el mismo espacio de trabajo compartido.

## 8. Restricciones

- Stack actual y ya decidido: backend AdonisJS 7 y frontend React 19. El MVP se construye sobre ese stack; no se evalúan alternativas en esta fase.
- La capability de cuentas y acceso ya existe en el repositorio y debe reutilizarse. E1 documenta esa capacidad de producto; no implica reconstruirla.
- E2 «Gestión de tareas» y E3 «Actividad del equipo» representan capacidades nuevas respecto del estado actual de FlowSync.

## 9. Métricas de éxito

- **Métrica principal (piloto):** a la semana de uso real con el equipo de estudio, el equipo cancela la ronda de status de la daily y nadie pide recuperarla. Si la siguen haciendo igual, el MVP no cumplió su función, independientemente de cuántas tareas se hayan creado.
- **Métrica de adopción del hábito:** al menos el 80% [SUPUESTO] de las personas del equipo piloto actualiza el estado de al menos una tarea propia cada día laborable durante la semana de prueba.
- **Métrica de consulta:** al menos el 80% [SUPUESTO] de las personas del equipo piloto consulta la vista de actividad del equipo al menos una vez al día laborable, sin que se les pida explícitamente.
- **Métrica de fricción:** el tiempo medio para crear una tarea o cambiar su estado, medido de forma informal durante el piloto (observación directa, no instrumentación), no debe superar los 10 segundos [SUPUESTO].
- **Métrica negativa a vigilar:** número de tareas cuyo estado no se actualiza durante más de 3 días laborables consecutivos. Esta métrica no puede distinguir si la falta de actualización se debe a que el responsable no ha necesitado tocar la tarea o a que no ha vuelto a entrar al sistema: medir esa diferencia exigiría un indicador de presencia/actividad, y la sección 4 excluye explícitamente ese tipo de indicador. Se declara la limitación tal cual, en vez de inventar una forma de medirla que contradiga el alcance.

## 10. Puntos abiertos

Decisiones de producto que este PRD no resuelve todavía, junto con el argumento que las motiva y lo que haría falta para cerrarlas. Ninguna de ellas mueve nada del alcance ya fijado en la sección 4.

- **PA-1 — Mecanismo de adopción no forzado por ningún RF.** La propuesta de valor asume que actualizar el estado beneficia primero a quien lo hace, pero ningún requisito construye ese beneficio propio (p. ej. una cola de trabajo priorizada para el propio usuario); tal como está, "poder" actualizar en dos clics no garantiza que se use. Hace falta decidir si el MVP necesita algún elemento de producto que refuerce ese beneficio propio, o si se deja así y se valida directamente con el piloto.
- **PA-2 — No hay un equipo piloto real comprometido.** El caso de estudio de la sección 2 es hipotético. Todas las métricas de la sección 9 dependen de que exista un equipo real usando el producto una semana. Hace falta conseguir y comprometer ese equipo antes de que las métricas se puedan evaluar.
- **PA-3 — Las métricas de adopción y de consulta (sección 9) no tienen forma de medirse con la instrumentación que hoy está en alcance.** Saber si el 80% actualiza o consulta a diario requiere trackear acciones por persona, y ninguna épica incluye esa capability. Hace falta decidir si se construye una instrumentación mínima (y entonces definir su alcance) o si estas métricas se miden de forma aproximada/manual y se acepta esa imprecisión.
- **PA-4 — La métrica principal ("nadie pide recuperar la ronda") es un juicio autoreportado sobre un único equipo.** No define quién lo determina ni cuándo se da por cerrado. Hace falta acordar con el equipo piloto un mecanismo concreto (p. ej. una pregunta directa al cierre de la semana) para no dejarlo a interpretación.
- **PA-5 — Nivel de frescura esperado en RF-15 sin definir.** No se especifica si "visible la próxima vez que consulten la vista" admite que haga falta recargar manualmente la página, o si se espera que el cambio aparezca sin ninguna acción del usuario. Es una decisión de producto sobre cuánto "tiempo real" hay que dar, no un detalle técnico. Hace falta decidir explícitamente ese nivel.
- **PA-6 — Umbrales sin número en RNF-1 y RNF-6.** "Inmediato, sin esperas perceptibles" y "de forma fluida hasta 10 personas" no tienen una cifra que los haga verificables. Hace falta fijar un umbral concreto (o aceptar que se define durante la construcción) para poder decir si se cumplen o no.
- **PA-7 — RNF-5 sin protocolo de verificación.** "Autoexplicativo, sin documentación ni formación" no dice cómo se comprobaría (cuántas personas, qué tarea, qué tasa de éxito cuenta como aprobado). Hace falta definir ese protocolo, probablemente al preparar el piloto.
- **PA-8 — Obligatoriedad de la fecha de vencimiento sin resolver.** La fecha de vencimiento y el filtrado por estado siguen dentro del alcance, bajo E2, sin discusión. Lo que queda abierto es solo si la fecha es obligatoria u opcional al crear una tarea, porque de eso depende cómo se comporta RF-13 con tareas sin fecha. Hace falta una decisión de producto sobre ese comportamiento, no sobre si la fecha se queda o se va.
- **PA-9 — Estado inicial y obligatoriedad del responsable al crear una tarea (RF-6) sin definir.** Hace falta decidir el valor por defecto al crear una tarea, para que no quede a criterio de quien la construya.
- **PA-10 — RF-7 implica un directorio de personas del espacio de trabajo que no está declarado como capability.** Para asignar una tarea a "cualquier persona con acceso" hace falta poder verla y elegirla; eso roza E1 y no está explícito en ninguna épica. Hace falta decidir en qué épica vive esa visibilidad de miembros.
- **PA-11 — El encuadre "el dolor es horizontal, un manager no gana nada especial" es una apuesta de producto sin validar.** Si el equipo piloto real tiene a alguien que sí busca visibilidad agregada por razones propias, la adopción podría depender de él. Hace falta contrastar este encuadre con el equipo piloto real antes de darlo por cerrado.
