# Matriz impacto vs complejidad — E2 «Gestión de tareas» + sync en tiempo real de E3

Incluye las historias de E2 dentro del MVP, las que quedaron fuera de alcance, y el sync en tiempo real de E3 «Actividad del equipo» (RF-15). Referencia: `docs/prd/flowsync-mvp.md` y `docs/prd/alcance-mvp.md`.

| Historia | Épica | ¿En MVP? | Impacto | Complejidad | Cuadrante | Por qué |
|---|---|---|---|---|---|---|
| Crear tarea con título (HU-1/RF-6) | E2 | Sí | **Alto** | **Baja** | 🟢 Quick win | Sin esto no hay producto; es la puerta de entrada a todo lo demás. |
| Ver responsable/estado/fecha en la lista (HU-6/RF-11) | E2 | Sí | **Alto** | **Baja** | 🟢 Quick win | Es literalmente la vista que sustituye la pregunta "¿en qué estás?" — el problema se resuelve aquí. Solo muestra columnas ya existentes, sin lógica nueva. |
| Asignar responsable (HU-2/RF-7) | E2 | Sí | **Alto** | Media | 🔵 Gran apuesta | Clave para "quién tiene qué" y evitar el solape que originó el problema. Sube de complejidad porque implica un directorio de miembros del espacio de trabajo que hoy no está resuelto en ninguna épica (PA-10). |
| Cambiar estado en ≤2 acciones (HU-4/RF-8) | E2 | Sí | **Alto** | Media | 🔵 Gran apuesta | Es el corazón del mecanismo de adopción (actualizar beneficia a quien lo hace). La restricción explícita de "máximo 2 acciones" impone cuidado de interacción, no es un simple campo. |
| Sync en tiempo real (RF-15) | E3 | Sí | **Alto** | **Alta** | 🔵 Gran apuesta | Convierte "puedo ver la lista" en "no tengo que preguntar porque está fresco" — el núcleo de la propuesta de valor. Complejidad alta porque el PRD deja sin definir el nivel de frescura esperado (PA-5): hay ambigüedad de producto sin cerrar, no solo trabajo técnico. |
| Filtrar por estado (FS-142/RF-12) | E2 | Sí | Medio | Baja–Media | 🟡 Intermedio | Ayuda a centrarse en lo pendiente, pero el valor principal ya lo da la lista completa; es usabilidad, no el mecanismo central. |
| Fecha de vencimiento + vencidas (FS-118, HU-5+HU-8) | E2 | Sí | Medio | Media | 🟡 Intermedio | Aporta señal de retraso, pero no resuelve bloqueos ni es la métrica principal. La regla de "vencida" tiene varias ramas que los criterios dejan explicitadas como propuesta, pero siguen pendientes de validación de producto (PA-8 en el PRD sigue abierto). |
| Editar título (HU-3/RF-10) | E2 | Sí | Bajo–Medio | Baja | ⚪ Relleno | Conveniencia (corregir errores), no ataca el problema central. Extensión trivial de un update ya existente. |
| Eliminar tarea | E2 | No | Bajo | Baja | ⚪ Relleno | No aparece en ningún job-to-be-done ni en el caso de origen del problema; CRUD trivial si algún día hace falta. |
| Alerta de retraso / detección de bloqueos | E2 | No | Medio | Alta | 🔴 Evitar | El PRD excluyó esto a propósito: el modelo de consumo es pull, no push, y los bloqueos se siguen hablando en la daily. Construirlo contradice una decisión de producto ya tomada. |
| Priorizar/ordenar manualmente | E2 | No | Bajo | Media | 🔴 Evitar | Es justo "el rollo de Jira" que el usuario objetivo rechazó; persistir un orden manual no es trivial y no ataca el problema. |
| Comentar en tarea | E2 | No | Bajo | Media | 🔴 Evitar | Excluido a propósito: el caso de origen no menciona discutir detalles dentro de la tarea. Implica una entidad nueva (hilo de comentarios). |
| Historial de cambios de estado | E2 | No | Bajo | Media | 🔴 Evitar | Ningún job-to-be-done lo pide; requiere modelar un log de eventos/auditoría, no es un campo más. |
| Subtareas / dependencias | E2 | No | Bajo | **Alta** | 🔴 Evitar | Mismo argumento del PRD (no observado en el caso de origen) + es la más cara técnicamente: modelar jerarquía o dependencias entre tareas. |

## Quick wins (alto impacto, baja complejidad)

- Crear tarea con título
- Ver responsable/estado/fecha en la lista

## Orden de backlog priorizado (historias dentro de MVP)

1. **Crear tarea con título** — quick win y dependencia dura de todo lo demás.
2. **Ver responsable/estado/fecha en la lista** — quick win; sin esto no hay forma de comprobar que el resto funciona.
3. **Asignar responsable** — gran apuesta, pero es la pieza que evita el solape (el dolor #1 del caso de origen); conviene resolverla pronto aunque cueste más, porque desbloquea que la lista (paso 2) tenga sentido real.
4. **Cambiar estado en ≤2 acciones** — gran apuesta; sin esto la lista es un tablero estático, no hay "actividad" que sincronizar.
5. **Sync en tiempo real (E3)** — gran apuesta y la más cara; tiene sentido dejarla para cuando ya existan tareas, responsables y estados que sincronizar.
6. **Filtrar por estado (FS-142)** — intermedio; mejora de uso una vez ya hay volumen de tareas variado que filtrar.
7. **Fecha de vencimiento + vencidas (FS-118)** — intermedio; añade una señal complementaria, no bloquea a nadie ni la bloquea nadie.
8. **Editar título** — relleno; se puede colar en cualquier hueco libre del sprint, no tiene urgencia.

## Nota sobre las historias fuera de MVP

No se ordenan para construcción: hacerlo entraría en conflicto con las exclusiones ya justificadas en `docs/prd/alcance-mvp.md`. Su sitio es el icebox/backlog descartado, a revisar solo si el piloto real (PA-2 de `docs/prd/flowsync-mvp.md`) demuestra que alguna de ellas sí es necesaria.
