## 1. Corregir la spec

- [x] 1.1 Escribir la delta-spec (`specs/tasks/spec.md` de este change) que reescribe completo el requirement "Fijar, cambiar y retirar la fecha de vencimiento" bajo `## MODIFIED Requirements`, con `today` en el texto y en los scenarios, y el scenario nuevo "Falta el día de referencia al fijar la fecha"
- [x] 1.2 Validar el change: `mise exec node@22.22.3 -- openspec validate clarify-due-date-reference-day --strict --no-interactive`
- [x] 1.3 Validar que la spec de `tasks` sigue siendo válida en conjunto: `mise exec node@22.22.3 -- openspec validate --specs --strict --no-interactive`

## 2. Verificación (antes de aplicar y archivar)

- [ ] 2.1 Escribir un test funcional nuevo de `PUT /api/v1/tasks/:id/due-date` (no existe hoy ninguno) que compruebe que, sin `today` en el body, la respuesta es `422` señalando el campo `today`, y que la tarea conserva la fecha que tuviera antes de la petición
- [ ] 2.2 En el mismo test o en otro del mismo fichero, comprobar que una petición con `dueDate` y `today` responde `200` con `isOverdue` ya resuelto contra ese `today` en la misma respuesta
- [ ] 2.3 Ejecutar ese fichero de test y confirmar que pasa contra el código actual (no debería hacer falta ningún cambio de producción: esta corrección es solo de la spec)
- [ ] 2.4 Ejecutar la suite completa del backend, typecheck y lint

## 3. Aplicar y archivar

- [ ] 3.1 Fusionar la delta-spec de este change en `openspec/specs/tasks/spec.md` (`openspec archive`)
- [ ] 3.2 Archivar el change, solo después de completar el punto 2 — aplicar y archivar sin ese test repetiría el patrón de `add-task-status-filter`, que documentó comportamiento sin ninguna prueba que lo sostuviera
