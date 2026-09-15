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
/**
 * Rechaza un campo que no se admite en esta operación.
 *
 * Se declara `implicit` para que se ejecute también cuando el valor falta, que
 * es el caso normal: solo informa cuando el campo viene presente.
 */
const rejectPresence = vine.createRule(
  (value, _options: undefined, field) => {
    if (value !== undefined) {
      field.report('The {{ field }} field is not allowed here', 'notAllowed', field)
    }
  },
  { name: 'notAllowed', implicit: true }
)

/**
 * Exige que al menos uno de los campos indicados venga en la petición.
 *
 * No se usa `requiredIfMissing` porque VineJS trata un `null` explícito igual
 * que un campo ausente, y para la fecha de vencimiento un `null` explícito es
 * precisamente la operación de retirarla. Esta regla mira la presencia de la
 * clave en la petición, de modo que enviar la fecha vacía cuenta como enviarla.
 *
 * Se declara `implicit` para que se ejecute también cuando el campo falta, que
 * es justo el caso que tiene que detectar.
 */
const requireAnyOf = vine.createRule(
  (_value, options: { fields: string[] }, field) => {
    const payload = (field.data ?? {}) as Record<string, unknown>

    if (options.fields.some((name) => name in payload)) return

    field.report('The {{ field }} field must be defined', 'required', field)
  },
  { name: 'requireAnyOf', implicit: true }
)

/** Los tres campos que admite una actualización; hay que enviar al menos uno. */
const UPDATABLE_FIELDS = ['status', 'assigneeId', 'dueDate']

const title = () => vine.string().trim().minLength(1)
const status = () => vine.enum(TASK_STATUSES).use(rejectNull())
const assigneeId = () => vine.number().exists({ table: 'users', column: 'id' }).use(rejectNull())

/**
 * Fecha de vencimiento, como fecha de calendario sin hora.
 *
 * `nullable()` es una excepción deliberada a `rejectNull`: para el estado y la
 * persona responsable un valor vacío no significa nada y por eso se rechaza,
 * mientras que para la fecha vacío **es** la operación de retirarla, que es una
 * operación admitida y no un caso de error.
 *
 * No lleva ninguna cota inferior: fijar una fecha ya pasada está permitido, y
 * anotar algo que llega tarde es un caso legítimo.
 */
const dueDate = () => vine.date({ formats: ['YYYY-MM-DD'] }).nullable()

/**
 * Validator to use when creating a task.
 *
 * El título es lo único que se acepta: el estado y la persona responsable los
 * fija el servidor, y la fecha de vencimiento no se admite aquí — se pone al
 * abrir la tarea. Se rechaza en vez de descartarse en silencio para que nadie
 * crea haber fijado una fecha que nunca se guardó.
 */
export const createTaskValidator = vine.create({
  title: title(),
  dueDate: vine.any().optional().use(rejectPresence()),
})

/**
 * Validator to use when updating a task.
 *
 * El estado, la persona responsable y la fecha se pueden enviar por separado o
 * combinados, pero no se admite una petición sin ninguno de los tres. El título
 * no es actualizable.
 *
 * Para la fecha, ausente significa «no la toques» y explícitamente vacía
 * significa «retírala».
 */
export const updateTaskValidator = vine.create({
  status: status()
    .optional()
    .use(requireAnyOf({ fields: UPDATABLE_FIELDS })),
  assigneeId: assigneeId()
    .optional()
    .use(requireAnyOf({ fields: UPDATABLE_FIELDS })),
  dueDate: dueDate()
    .optional()
    .use(requireAnyOf({ fields: UPDATABLE_FIELDS })),
})

/**
 * Validator to use for the reference day that resolves the overdue verdict.
 *
 * El día de referencia es el de quien mira. Si no llega, el servidor usa el
 * suyo; si llega mal formado se rechaza, en lugar de recurrir en silencio a
 * otro día y devolver una lectura plausible pero falsa.
 */
export const referenceDayValidator = vine.create({
  today: vine.date({ formats: ['YYYY-MM-DD'] }).optional(),
})
