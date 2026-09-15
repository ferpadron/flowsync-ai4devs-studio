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

/** Al crear, el título es lo único que viaja: el resto lo fija el servidor. */
export type CreateTaskPayload = {
  title: string
}

/**
 * Al actualizar se puede enviar el estado, la persona responsable o ambos,
 * pero no una petición sin ninguno de los dos: el backend la rechaza con 422.
 */
export type UpdateTaskPayload =
  | { status: TaskStatus; assigneeId?: number }
  | { status?: TaskStatus; assigneeId: number }
