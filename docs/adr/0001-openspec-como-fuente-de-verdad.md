# 1. Usar las delta-specs de OpenSpec como fuente de verdad viva del proyecto

## Contexto

El repositorio tiene un directorio `openspec/` con `config.yaml` declarando `schema: spec-driven`. Dentro conviven dos cosas distintas:

- **`openspec/specs/`**: la spec *viva* de cada capability del producto — hoy `auth` (`specs/auth/spec.md`) y `tasks` (`specs/tasks/spec.md`). Cada una tiene un `## Purpose` y una lista de `### Requirement:` en lenguaje SHALL/SHALL NOT, cada uno con sus `#### Scenario:` en formato WHEN/THEN. Es el documento que describe, en un momento dado, qué hace el sistema.
- **`openspec/changes/archive/`**: el historial de cambios ya cerrados. Hoy hay tres — `2026-08-13-add-task-list`, `2026-08-13-add-task-due-date` y `2026-08-13-add-task-status-filter` — y cada uno trae la misma estructura: `proposal.md` (Why / What Changes / Capabilities / Impact), `design.md`, `tasks.md` con su checklist, y un `specs/<capability>/spec.md` propio que **no repite la spec entera**, sino que la modifica mediante encabezados `## ADDED Requirements` y `## MODIFIED Requirements` (por ejemplo, `add-task-status-filter/specs/tasks/spec.md` contiene siete `ADDED Requirements` propios del filtro y cuatro `MODIFIED Requirements` sobre comportamientos existentes; `add-task-list/specs/auth/spec.md` solo marca qué requisitos de `auth` cambian y cuáles se añaden). Estas son las *delta-specs*: el efecto de cada change sobre la spec viva, no la spec completa.

La relación entre ambos niveles ya está en uso, no es hipotética: los requisitos que hoy aparecen en `specs/tasks/spec.md` — por ejemplo «Acotar la lista por estado» — son literalmente los que llegaron como `ADDED Requirements` en la delta-spec de `add-task-status-filter` una vez archivado ese change.

Esa trazabilidad, sin embargo, no es igual de completa en las dos capabilities. `specs/tasks/spec.md` tiene hoy 32 requisitos, y los tres changes archivados cubren esos 32: `tasks` nació como capability con `add-task-list` y se ha ido ampliando con `add-task-due-date` y `add-task-status-filter`, así que su historial archivado es completo. `specs/auth/spec.md` tiene 19 requisitos, pero el único delta de `auth` conservado —el de `add-task-list`— solo añade o modifica cuatro (las pantallas de registro e inicio de sesión, el acceso según el estado de la sesión, y el acceso al perfil desde el resto de la aplicación). Los quince requisitos restantes de `auth` no tienen delta-spec archivada: son parte de una línea base anterior al historial de changes que se conserva en este repositorio, y de ellos no se puede decir por qué dicen lo que dicen ni qué change los introdujo.

Este mismo historial documenta también que el mecanismo puede fallar si no se sigue con disciplina. El `proposal.md` de `add-task-status-filter` dice explícitamente:

> «Este change documenta comportamiento que ya está implementado y funcionando en el repositorio. [...] La vista por defecto ya no es «todas» [...]. Esto contradice directamente el requisito vivo *Una sola lista compartida del espacio*, que afirma que la lista devuelve todas las tareas del espacio.»

Es decir: el filtro por estado se implementó en el código sin actualizar `openspec/specs/tasks/spec.md` en el mismo momento, la spec viva quedó describiendo un comportamiento que ya no era cierto, y hizo falta un change dedicado — sin tocar código — solo para poner la spec al día. El `proposal.md` de `add-task-due-date`, escrito el mismo día, señala esa misma deriva como conocida y sin corregir en ese punto: «`openspec/specs/tasks/spec.md` describe `GET /api/v1/tasks` como «todas las tareas del espacio», que dejó de ser cierto cuando se implementó el filtro por estado (FS-142) sin actualizar `openspec/`».

Los tres `proposal.md` archivados coinciden también en otro punto: los tres declaran explícitamente **«Sin tests»** como decisión consciente, no como omisión, y enumeran los riesgos que eso deja sin red (los bordes de la regla de vencimiento, la duplicación de `DEFAULT_LIST_STATUSES` entre backend y frontend, la distinción entre filtro inválido y filtro sin resultados). En los tres changes, en su momento, la verificación de que el código cumplía la spec fue manual.

## Decisión

Adoptamos `openspec/specs/*/spec.md` como la fuente de verdad viva sobre qué hace FlowSync, y el flujo de delta-specs de OpenSpec (`openspec/changes/<fecha>-<slug>/` con `proposal.md`, `design.md`, `tasks.md` y `specs/<capability>/spec.md` en formato `ADDED`/`MODIFIED Requirements`, archivado en `openspec/changes/archive/` una vez fusionado) como el único mecanismo por el que esa spec cambia.

Esto significa que:

- Un requisito o scenario que no está en `openspec/specs/` no es una decisión de producto vigente, aunque el código lo implemente.
- Cambiar lo que el sistema hace pasa por escribir la delta-spec del change correspondiente y fusionarla en la spec viva, no por editar `openspec/specs/` a mano ni por dejar que el código y la spec se desincronicen (como pasó con el filtro por estado, hasta que `add-task-status-filter` lo corrigió).
- El historial en `openspec/changes/archive/` queda como el registro de *por qué* la spec viva dice lo que dice hoy — incluidas las decisiones explícitas de alcance (qué se dejó fuera y qué riesgos se aceptaron), no solo el *qué*.

Esta es una decisión hacia delante, no una descripción de todo lo ya ocurrido: obliga a que **todo cambio funcional a partir de esta adopción** pase por su delta-spec y quede archivado, pero no reescribe el historial incompleto que ya existe. Los quince requisitos de `auth` sin delta conservada siguen siendo válidos como spec viva —no se cuestionan aquí—, simplemente su origen no es trazable con lo que hay archivado, y esta decisión no lo soluciona retroactivamente.

## Estado

Vigente. El [ADR 0002](0002-tests-como-fuente-de-verdad-ejecutable.md) documenta un escenario futuro e hipotético que reemplazaría a este ADR únicamente si llegara a adoptarse; mientras no se adopte, esta decisión sigue en pie.

Lo que sigue es el estado tal como se creía cuando se tomó esta decisión, y se conserva sin reescribir:

Aceptado. Ya en uso: los tres changes archivados siguen exactamente esta estructura. `specs/tasks/spec.md` es hoy el resultado acumulado de fusionar sus tres delta-specs; `specs/auth/spec.md` solo lo es en parte, porque la mayoría de sus requisitos preceden al historial de changes que se conserva.

## Consecuencias

**A favor:**

- Para `tasks`, cada uno de sus 32 requisitos es trazable a un change concreto con su `proposal.md` (por qué se hizo, qué se dejó fuera a propósito, qué riesgos se aceptaron) en vez de perderse en el código o en conversaciones no escritas. Para `auth` esto es solo parcialmente cierto hoy —4 de sus 19 requisitos tienen delta archivada—, pero a partir de esta decisión todo requisito nuevo o modificado, en cualquier capability, queda con esa misma trazabilidad.
- Los `#### Scenario:` en WHEN/THEN sirven a la vez de especificación y de criterio de aceptación, reutilizable para escribir tests más adelante.
- El propio mecanismo detectó y corrigió su primera deriva conocida (`add-task-status-filter` sobre el requisito «Una sola lista compartida del espacio»): la desincronización entre código y spec viva no quedó escondida, sino documentada y resuelta con un change dedicado.
- Las delta-specs son pequeñas y revisables por sí solas (un `ADDED`/`MODIFIED Requirements` por change), en vez de exigir revisar el documento entero de la capability en cada cambio.

**En contra / lo que cuesta:**

- La disciplina no es automática: como demuestra el propio historial, un cambio de comportamiento puede llegar al código sin su delta-spec correspondiente, y la spec viva queda describiendo algo falso hasta que alguien lo nota y abre un change solo para corregirla. Nada en el repositorio impide hoy que eso vuelva a pasar.
- Los tres changes archivados dejan constancia de que, en su momento, la spec viva no se verificó automáticamente contra el sistema real: los tres declaran «sin tests». Eso ha empezado a cambiar —hoy existen tres tests de integración en `backend/tests/functional/tasks/` que cubren exactamente los tres scenarios del requisito «Lo que cada tarea muestra de su responsable»—, pero la cobertura sigue siendo mínima: 3 de los 124 scenarios de `specs/tasks/spec.md`. Todavía no existe una verificación automática integral entre la spec viva y el sistema; la mayor parte de esa correspondencia sigue dependiendo de revisión manual.
- Cada cambio de comportamiento exige mantener varios artefactos a la vez (`proposal.md`, `design.md`, `tasks.md` y la delta-spec), además del código y —cuando existan— sus tests; es más aparato que documentar el cambio solo en el commit o en el código.
- Entender por qué la spec viva dice lo que dice hoy sobre una capability requiere leer su historial de changes archivados, porque `specs/*/spec.md` no lleva procedencia: el documento fusionado no dice por sí mismo qué change introdujo cada requisito.
