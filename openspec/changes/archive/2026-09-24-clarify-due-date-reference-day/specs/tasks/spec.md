## MODIFIED Requirements

### Requirement: Fijar, cambiar y retirar la fecha de vencimiento

El sistema SHALL permitir establecer la fecha de vencimiento de una tarea existente, cambiarla por otra y retirarla, mediante `PUT /api/v1/tasks/:id/due-date` con `{"dueDate": "AAAA-MM-DD", "today": "AAAA-MM-DD"}` o `{"dueDate": null, "today": "AAAA-MM-DD"}`, respondiendo `200` con la tarea ya actualizada, incluida su condición de vencida ya resuelta contra ese `today`. El día de referencia SHALL ser obligatorio en esta petición, por la misma razón y con el mismo `422` que exige el requirement "El día de referencia lo pone quien mira": esta respuesta informa del vencimiento, y ninguna petición que lo haga puede sustituir ese día por el reloj del servidor. Retirar la fecha SHALL ser una operación admitida y NO SHALL tratarse como un error.

#### Scenario: Poner una fecha a una tarea que no tenía

- **WHEN** se envía `PUT /api/v1/tasks/:id/due-date` con `{"dueDate": "2026-09-30", "today": "2026-09-24"}` sobre una tarea sin fecha
- **THEN** la respuesta es `200` con la tarea ya con esa fecha, y las siguientes consultas la devuelven con ella

#### Scenario: Cambiar la fecha por otra

- **WHEN** se envía una fecha distinta sobre una tarea que ya tenía una, junto con el `today` de esa misma petición
- **THEN** la nueva sustituye a la anterior, sin conservar rastro de la vieja

#### Scenario: Quitar la fecha

- **WHEN** se envía `{"dueDate": null, "today": "2026-09-24"}` sobre una tarea con fecha
- **THEN** la respuesta es `200`, la tarea queda sin fecha y deja de estar vencida si lo estaba

#### Scenario: Una fecha ya pasada se acepta

- **WHEN** se fija, junto con el `today` de esa petición, una fecha anterior a ese día de referencia
- **THEN** el sistema la acepta sin rechazarla ni advertir nada, y la tarea pasa a estar vencida

#### Scenario: Una fecha que no existe se rechaza

- **WHEN** se envía `PUT /api/v1/tasks/:id/due-date` con `{"dueDate": "2026-02-31", "today": "2026-09-24"}` —o cualquier otra fecha imposible o mal formada, como `"30/09/2026"`—, con un `today` válido
- **THEN** la respuesta es `422` con un error sobre el campo `dueDate`, y la tarea conserva intacta la fecha que tuviera antes

#### Scenario: Falta el día de referencia al fijar la fecha

- **WHEN** se envía `PUT /api/v1/tasks/:id/due-date` con `{"dueDate": "2026-09-30"}`, sin `today`
- **THEN** la respuesta es `422` con un error sobre el campo `today`, y la tarea conserva intacta la fecha que tuviera antes

#### Scenario: Fijar la fecha de una tarea ajena

- **WHEN** una cuenta pone o quita la fecha de una tarea cuyo responsable es otra, indicando su propio `today`
- **THEN** el cambio se aplica igual que en una tarea propia, sin exigir permiso adicional ni devolver advertencia alguna

#### Scenario: Tocar la fecha no toca nada más

- **WHEN** se cambia o se retira la fecha de una tarea, indicando el `today` que esa petición exige
- **THEN** su título, su responsable y su estado siguen siendo exactamente los mismos

#### Scenario: Tarea inexistente

- **WHEN** se envía `PUT /api/v1/tasks/:id/due-date` con `{"dueDate": "2026-09-30", "today": "2026-09-24"}` sobre un `id` que no corresponde a ninguna tarea
- **THEN** la respuesta es `404`
