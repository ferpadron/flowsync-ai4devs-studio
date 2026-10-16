# M08 — Eval de la regla documental de capabilities

**Participante:** fernandopadron
**Proyecto:** FlowSync — AI4Devs/LIDR
**Máquina:** Mac Studio
**Rama base:** `s8/start`
**Commit base:** `83651b6`
**Herramienta:** Claude Code 2.1.287
**Modelo:** Sonnet 5.5
**Ensayos:** 5

## Parte A — La medición

### Regla evaluada

La regla de proceso de `CLAUDE.md` establece:

> Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día.

### Encargo utilizado

> Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.

El encargo se envió sin recordar al agente la regla documental.

### Apuesta previa

**3 de 5 intentos (60 %)** actualizarían correctamente el README de la capability.

La predicción se registró antes de ejecutar el primer ensayo y no se modificó después.

### Procedimiento

1. Partir de `s8/start`, commit `83651b6`.
2. Abrir una sesión nueva de Claude Code con Sonnet 5.5.
3. Enviar el mismo encargo literal, sin recordatorios sobre el README.
4. Comprobar primero que la ruta DELETE estuviera declarada.
5. Comprobar después que el README de `tasks` documentara el endpoint.
6. Preservar el commit producido en una rama histórica local.
7. Regresar a `s8/start` y verificar rama, HEAD y working tree limpio.

Se utilizó un único encargo de implementación por ensayo. No se solicitaron correcciones posteriores para obtener un PASS.

### Resultados

| Intento | Commit | Ruta DELETE | README actualizado | Válido | Resultado |
|---|---|---|---|---|---|
| 1 | `cca9818` | Sí | Sí | Sí | PASS |
| 2 | `a7971cc` | Sí | Sí | Sí | PASS |
| 3 | `b14a7bd` | Sí | Sí | Sí | PASS |
| 4 | `ed5e9c3` | Sí | Sí | Sí | PASS |
| 5 | `4f0fe8c` | Sí | Sí | Sí | PASS |

**Resultado observado: 5/5 (100 %).**

La predicción inicial fue 3/5 (60 %). El resultado observado la superó en dos éxitos, equivalentes a 40 puntos porcentuales.

### Evidencia conservada

Cada implementación se preservó en una rama local:

- `evals/trial-1-delete-task` — `cca9818`
- `evals/trial-2-delete-task` — `a7971cc`
- `evals/trial-3-delete-task` — `b14a7bd`
- `evals/trial-4-delete-task` — `ed5e9c3`
- `evals/trial-5-delete-task` — `4f0fe8c`

En los cinco ensayos se verificaron los cambios versionados mediante `git diff` contra la rama base. Las ramas históricas son evidencia local; no forman parte automáticamente del PR de entrega.

## Parte B — Las tres líneas

1. **Apuesta y resultado:** pronostiqué 3/5 (60 %) y observé 5/5 (100 %) de cumplimiento del README en cinco ensayos válidos.
2. **Qué haría con ese número:** conservaría la regla, pero convertiría la sincronización documental en una comprobación automática de CI; el README se actualizó cinco veces, mientras que el OpenAPI JSON versionado no se actualizó en ninguna.
3. **Qué no mide:** el eval binario no verifica la coherencia completa del contrato OpenAPI, la calidad de las pruebas ni la seguridad de autorización del endpoint.

## Observaciones complementarias

| Dimensión | Resultado |
|---|---|
| Ruta DELETE declarada | 5/5 |
| README actualizado | 5/5 |
| Decoradores OpenAPI añadidos | 5/5 |
| `docs/api/openapi.json` actualizado | 0/5 |
| Ensayos con tests DELETE nuevos | 4/5 |
| OpenSpec actualizado | 0/5 |

El endpoint permite borrar definitivamente una tarea a cualquier usuario autenticado, sin comprobar si es su responsable. Este comportamiento fue identificado durante las ejecuciones, pero no formaba parte de los dos criterios del eval.

La cobertura funcional varió entre ensayos. Los tests añadidos también difirieron en cantidad y alcance. No se utilizó esa variación para recalificar los resultados del ejercicio.

### Limitaciones metodológicas

- Cinco ejecuciones constituyen una muestra pequeña: 5/5 no garantiza una probabilidad real de éxito del 100 %.
- Se restauraron y verificaron la rama, el commit y los archivos versionados antes de los siguientes ensayos.
- No se verificó una restauración exacta de SQLite ni de todos los estados ignorados por Git.
- Algunas verificaciones de runtime, lint y typecheck fueron reportadas por Claude Code; la comprobación independiente del eval se basó en los cambios versionados de la ruta y el README.
- Se mantuvieron el modelo, la versión de Claude Code, el encargo y el commit inicial, pero la ejecución de un agente no es determinista.

### Conclusión

El harness mostró un cumplimiento consistente de la actualización del README durante los cinco ensayos. Sin embargo, la falta de actualización del OpenAPI versionado en todos ellos evidencia que superar un eval específico no equivale a satisfacer toda la Definition of Done.

La mejora recomendada consiste en combinar instrucciones persistentes con verificaciones deterministas, especialmente para contratos versionados, pruebas y controles de integración continua.
