/**
 * Espejo de `UserTransformer` del backend (app/transformers/user_transformer.ts).
 */
export type User = {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string
}

/**
 * Respuesta de `POST /auth/signup` y `POST /auth/login`, ya sin el envoltorio `{ data }`.
 */
export type AuthResult = {
  user: User
  token: string
}

export type SignupPayload = {
  /** El backend lo declara `.nullable()`: la clave debe viajar siempre, aunque valga `null`. */
  fullName: string | null
  email: string
  password: string
  passwordConfirmation: string
}

export type LoginPayload = {
  email: string
  password: string
}

/**
 * Los tres estados que admite la API. Conjunto cerrado: cualquier otro valor
 * se rechaza con 422. Las etiquetas en castellano son cosa de la pantalla.
 */
export type TaskStatus = 'pending' | 'in_progress' | 'done'

/**
 * Espejo de `TaskAssigneeTransformer` del backend: la API expone de la persona
 * responsable solo su identificador y su nombre, nunca su correo.
 */
export type TaskAssignee = {
  id: number
  /** El backend declara `fullName` nullable; en pantalla se pinta «Sin nombre». */
  fullName: string | null
}

/**
 * Espejo de `TaskTransformer` del backend (app/transformers/task_transformer.ts).
 */
export type Task = {
  id: number
  title: string
  status: TaskStatus
  assignee: TaskAssignee
}

/**
 * Espejo de `TaskDetailTransformer` del backend: la representación individual
 * de una tarea, que es la única que trae la fecha de vencimiento y el veredicto
 * de vencimiento.
 *
 * Es un tipo aparte de `Task` a propósito, igual que en el backend son dos
 * transformers distintos: la lista no recibe estos dos campos y el tipo lo
 * refleja, de modo que intentar leerlos desde una entrada del listado no
 * compila.
 */
export type TaskDetail = Task & {
  /** Fecha de calendario `YYYY-MM-DD`, o `null` si la tarea no tiene fecha. */
  dueDate: string | null
  /** Veredicto calculado por el servidor. El cliente nunca lo deduce. */
  isOverdue: boolean
}

/** Al crear, el título es lo único que viaja: el resto lo fija el servidor. */
export type CreateTaskPayload = {
  title: string
}

/**
 * Al actualizar se puede enviar el estado, la persona responsable, la fecha de
 * vencimiento o una combinación, pero no una petición sin ninguno de los tres:
 * el backend la rechaza con 422.
 *
 * Para la fecha, omitirla significa «no la toques» y enviarla como `null`
 * significa «retírala».
 */
export type UpdateTaskPayload =
  | { status: TaskStatus; assigneeId?: number; dueDate?: string | null }
  | { status?: TaskStatus; assigneeId: number; dueDate?: string | null }
  | { status?: TaskStatus; assigneeId?: number; dueDate: string | null }
