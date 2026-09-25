# 2. Usar los tests de integración como única fuente de verdad ejecutable

> **Escenario hipotético.** Este ADR no registra una decisión ya tomada en el repositorio actual: describe qué habría que decidir y qué costaría si, dentro de un año, el equipo dejase de mantener las specs de OpenSpec descritas en el [ADR 0001](0001-openspec-como-fuente-de-verdad.md) y pasase a que los tests funcionales/de integración fuesen la única fuente de verdad ejecutable sobre lo que hace el sistema. Los datos que este documento cita sobre `openspec/`, el código y la suite de tests son reales y describen el estado presente del repositorio; lo que todavía no se ha decidido, y este ADR trata como futuro, es reemplazar OpenSpec por esos tests como única fuente de verdad.

## Contexto

El [ADR 0001](0001-openspec-como-fuente-de-verdad.md) adoptó `openspec/specs/*/spec.md`, evolucionadas mediante delta-specs archivadas en `openspec/changes/`, como la fuente de verdad viva del proyecto. Ese mismo ADR deja constancia de tres costes que no desaparecen con el tiempo por sí solos:

- La disciplina de escribir la delta-spec de cada change no es automática. El propio historial registra un episodio real de deriva: el filtro por estado se implementó en el código sin actualizar `specs/tasks/spec.md`, que quedó afirmando que la lista devuelve «todas las tareas del espacio» cuando eso ya no era cierto, hasta que el change `add-task-status-filter` corrigió la spec expresamente para ponerla al día.
- Mantener la spec viva exige varios artefactos en paralelo por cada cambio (`proposal.md`, `design.md`, `tasks.md`, la delta-spec) además del código.
- La correspondencia entre lo que la spec dice y lo que el sistema hace se verifica, en su mayor parte, a mano. La cobertura ejecutable existente hoy es desigual entre capabilities: `backend/tests/functional/tasks/` tiene tres tests de integración, correspondientes a los tres scenarios del requisito «Lo que cada tarea muestra de su responsable» — 3 de los 124 scenarios que tiene `specs/tasks/spec.md` —, mientras que `backend/tests/functional/auth/` tiene 20 tests funcionales repartidos entre registro, login, sesión e iniciales. Esos 20 tests son una base real, pero no constituyen por sí solos una matriz de trazabilidad que demuestre que los 19 requisitos de `auth` y todos sus scenarios están cubiertos — nadie ha hecho ese recuento scenario por scenario para `auth`, a diferencia de lo que sí se hizo para `tasks`. Y en ambas capabilities, los requisitos de interfaz no tienen ninguna prueba automática que los respalde: el frontend no tiene ningún runner de tests instalado.

En el escenario que aquí se supone, un año después, mantener la prosa de `openspec/` en paralelo con el código deja de compensar: las delta-specs se han ido quedando atrás de nuevo, como ya pasó una vez, y el equipo decide que quiere un solo artefacto que no pueda mentir en silencio — un test o pasa contra el sistema real o falla, mientras que una frase en prosa puede seguir describiendo algo que dejó de ser cierto sin que nada lo señale.

## Decisión

En ese escenario, dejamos de mantener `openspec/specs/*/spec.md` y el flujo de delta-specs de `openspec/changes/` como fuente de verdad. `openspec/` pasa a ser un archivo histórico que no se actualiza más: no se abren changes nuevos, y ningún requisito o scenario que se le añada después de este punto describe una decisión de producto vigente.

En su lugar, el conjunto de tests funcionales/de integración del producto pasa a ser la única fuente de verdad ejecutable sobre qué hace el sistema: la suite del backend que hoy vive bajo `backend/tests/functional/` (ejecutada con `npm test`) y la suite de integración del frontend que, en este escenario, habría que instalar y escribir para los requisitos de interfaz. `npm test` del backend es hoy parte real de esa fuente, pero no basta por sí solo para cubrir toda la aplicación: sin la suite de frontend, los requisitos de interfaz —pantalla de la lista, filtro por estado en la URL, señal de tarea vencida, etc.— quedarían fuera de cualquier verificación ejecutable. Esto significa que:

- Un comportamiento solo cuenta como especificado si existe un test de integración que lo verifica contra el sistema real corriendo. Si no hay test, el comportamiento no está garantizado, aunque el código lo haga hoy.
- Cambiar lo que el sistema hace pasa por cambiar o añadir el test correspondiente junto con el código, no por escribir ni fusionar ninguna delta-spec.
- Un test en rojo es la única señal de desacuerdo entre lo documentado y lo real que este proyecto reconoce; ya no existe un documento en prosa que pueda quedarse atrás sin que nada lo note.

## Estado

Hipotético. Este ADR no está en vigor: documenta la decisión que habría que tomar y sus condiciones, no una que se haya tomado.

Para que los tests pudieran asumir de verdad ese papel, tendrían que cumplirse al menos estas condiciones, ninguna de las cuales se da hoy:

- **Cobertura completa y verificada, no parcial ni presumida.** Hoy la cobertura confirmada scenario por scenario es 3 de los 124 de `specs/tasks/spec.md`. `auth` tiene 20 tests funcionales, pero nadie ha comprobado todavía que cubran los 19 requisitos y todos sus scenarios; antes de sustituir la spec por los tests haría falta hacer ese recuento para `auth` igual que se hizo para `tasks`, y cerrar lo que falte. Sustituir la spec por los tests exige que cada scenario que hoy describe un comportamiento tenga su test antes de dejar de mantener la spec — de otro modo, dejar de mantenerla no traslada esa garantía a ningún sitio, simplemente la borra.
- **Un runner de tests en el frontend.** Los requisitos de interfaz (pantalla de la lista, filtro por estado en la URL, señal de tarea vencida, ausencia de vistas rivales, etc.) no tienen hoy ninguna forma de verificarse automáticamente: el frontend no tiene ningún runner de tests instalado. Eso no significa que hoy carezcan de fuente de verdad: mientras OpenSpec siga vigente, conservan su fuente documental, aunque no tengan ninguna ejecutable. Si se abandonara OpenSpec antes de instalar y escribir la suite de integración frontend, esos requisitos perderían la fuente documental sin haber adquirido nunca una ejecutable que la sustituyera. Por eso esa suite tiene que existir antes de adoptar el reemplazo, no después.
- **Enforcement en CI.** Que un cambio de comportamiento no pueda fusionarse sin que su test correspondiente —backend o frontend— exista y pase, para que la suite no se quede atrás del código de la misma forma en que la spec se quedó atrás una vez.

Lo que se perdería al dejar de mantener OpenSpec, incluso si esas condiciones se cumplieran:

- **El porqué.** Un test verifica *qué* hace el sistema, no *por qué* se decidió que hiciera eso ni qué se dejó fuera a propósito. Los `proposal.md` archivados documentan decisiones explícitas de alcance — por ejemplo, que la reasignación de responsable no existe y por tanto cierto criterio de aceptación no se puede verificar, o que el límite de 200 caracteres del título fue una cifra que el PRD dejaba abierta y que se cerró junto con producto. Nada de eso vive en un test que pasa.
- **El historial de deriva y corrección.** El episodio en que `add-task-status-filter` corrigió la spec para que dejara de describir «todas las tareas» quedó como un change legible, revisable y fechado. Un test que empieza a fallar y se corrige no deja ese mismo rastro narrativo de qué se creía antes y por qué cambió.
- **La trazabilidad requisito → decisión.** La spec viva fusionada no incluye procedencia: `specs/tasks/spec.md` no enlaza cada requisito a la delta-spec que lo introdujo. Ese origen puede reconstruirse hoy comparando el requisito con las delta-specs del historial archivado en `openspec/changes/archive/`, pero exige consultar ese historial a mano, requisito por requisito. Un test remite, como mucho, a un commit; no a una explicación de por qué existe ese comportamiento y no otro, ni siquiera a ese ejercicio de reconstrucción manual.

## Consecuencias

**A favor:**

- Un solo artefacto ejecutable en vez de dos artefactos paralelos (prosa y código) que pueden desincronizarse sin que nada lo detecte automáticamente; el episodio de `add-task-status-filter` no podría repetirse de la misma forma silenciosa, porque un test no puede describir un comportamiento que el sistema ya no tiene sin fallar.
- Menos artefactos que mantener por cada cambio: no hacen falta `proposal.md`, `design.md`, `tasks.md` ni delta-spec, solo el código y su test.
- La cobertura deja de ser una promesa en prosa («esto debería estar probado») y pasa a ser una comprobación real cada vez que se ejecuta la suite.

**En contra / lo que cuesta:**

- Se pierde el registro explícito de decisiones de alcance y de riesgos aceptados a sabiendas (lo que los tres `proposal.md` archivados documentan como «fuera de alcance, y a propósito»); esa información no tiene dónde vivir en una suite de tests.
- Se pierde la trazabilidad requisito-por-requisito hacia el change que lo introdujo: `openspec/changes/archive/` deja de crecer, así que cualquier comportamiento nuevo a partir de este punto solo se explica leyendo el código y su test, no un documento pensado para explicarlo en lenguaje de producto.
- Hoy los requisitos de interfaz sí tienen una fuente de verdad: la documental, en OpenSpec. Lo que no tienen es una fuente ejecutable en frontend, porque no hay ningún runner de tests instalado. Abandonar OpenSpec antes de instalar y escribir esa suite de integración frontend los dejaría completamente huérfanos —sin fuente documental ni ejecutable—, así que esa suite es una condición previa al reemplazo, no una tarea que se pueda dejar para después.
- La migración en sí tiene un coste no trivial: pasar de 3 a 124 scenarios cubiertos en `tasks`, construir y cerrar la matriz de trazabilidad de `auth` contra sus 19 requisitos (los 20 tests existentes son un punto de partida, no la prueba de que ya está cubierta) e instalar y escribir la suite de integración del frontend es trabajo real, no un cambio de política que se aplique solo; hasta que no esté hecho, el conjunto de tests funcionales/de integración no puede sostener solo el papel que hoy reparte con `openspec/`.
- `openspec/` pasa de ser un documento vivo a ser un archivo histórico más: sigue explicando por qué el sistema llegó a ser como es hasta la fecha de este ADR, pero deja de explicar nada de lo que venga después.
