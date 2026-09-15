import vine from '@vinejs/vine'

/**
 * Los tres estados que admite la capability. Conjunto cerrado: cualquier otro
 * valor se rechaza en validación.
 */
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const

/**
 * Rechaza un `null` explícito en un campo por lo demás omitible.
 *
 * VineJS trata `null` igual que un campo ausente dentro de `optional()`, así que
 * sin esta regla un `assigneeId: null` se descartaría en silencio en lugar de
 * rechazarse. Se declara `implicit` para que se ejecute también cuando el valor
 * falta: es la única forma de distinguir "no lo envío" de "lo envío vacío".
 */
const rejectNull = vine.createRule(
  (value, _options: undefined, field) => {
    if (value === null) {
      field.report('The {{ field }} field cannot be null', 'notNull', field)
    }
  },
  { name: 'notNull', implicit: true }
)

/**
 * Shared rules for the task fields.
 *
 * `title` no lleva longitud máxima a propósito: el umbral es una decisión de
 * producto todavía sin tomar (PA-9). `minLength(1)` sobre el valor ya recortado
 * es lo que hace que un título de solo espacios se rechace igual que uno vacío.
 */
const title = () => vine.string().trim().minLength(1)
const status = () => vine.enum(TASK_STATUSES)
const assigneeId = () => vine.number().exists({ table: 'users', column: 'id' }).use(rejectNull())

/**
 * Validator to use when creating a task.
 *
 * El título es lo único que se acepta: el estado y la persona responsable los
 * fija el servidor.
 */
export const createTaskValidator = vine.create({
  title: title(),
})

/**
 * Validator to use when updating a task.
 *
 * El estado y la persona responsable se pueden enviar por separado o juntos,
 * pero no se admite una petición sin ninguno de los dos. El título no es
 * actualizable.
 */
export const updateTaskValidator = vine.create({
  status: status().optional().requiredIfMissing('assigneeId'),
  assigneeId: assigneeId().optional().requiredIfMissing('status'),
})
