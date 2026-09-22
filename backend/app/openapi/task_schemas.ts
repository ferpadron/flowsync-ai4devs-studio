/**
 * Esquemas OpenAPI compartidos por los controladores de tasks. No son
 * validadores ni tocan ninguna petición: solo describen, para el documento
 * que sirve `@foadonis/openapi`, la forma exacta que ya devuelven
 * `TaskTransformer`, `TaskDetailTransformer` y `TaskAssigneeTransformer`.
 *
 * Deliberadamente fuera de `app/controllers` y `app/transformers`: esos
 * directorios los indexa `indexEntities()` (`adonisrc.ts`) y un fichero aquí
 * dentro se registraría como un controlador o un transformer más en el
 * código generado y commiteado en `.adonisjs/`.
 */
import { TASK_STATUSES } from '#models/task'
import type { OpenAPIV3 } from 'openapi-types'

export const assigneeSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description:
    'Lo justo para identificar al responsable: nombre e iniciales. Nunca su email ni ningún otro dato de la cuenta.',
  properties: {
    id: { type: 'integer' },
    fullName: {
      type: 'string',
      nullable: true,
      description: 'Nulo cuando la cuenta se registró sin nombre; las iniciales siguen llegando.',
    },
    initials: { type: 'string' },
  },
  required: ['id', 'fullName', 'initials'],
}

/** La forma que devuelven la lista, la creación y el cambio de estado. */
export const taskSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string', minLength: 1, maxLength: 200 },
    status: { type: 'string', enum: [...TASK_STATUSES] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    assignee: assigneeSchema,
  },
  required: ['id', 'title', 'status', 'createdAt', 'updatedAt', 'assignee'],
}

/**
 * La tarea suelta: todo lo de `taskSchema` más la fecha de vencimiento y la
 * condición de vencida. Deliberadamente no la devuelve la lista.
 */
export const taskDetailSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string', minLength: 1, maxLength: 200 },
    status: { type: 'string', enum: [...TASK_STATUSES] },
    dueDate: {
      type: 'string',
      format: 'date',
      nullable: true,
      description:
        'Un día del calendario AAAA-MM-DD, sin hora. Nulo cuando la tarea no tiene fecha.',
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    isOverdue: {
      type: 'boolean',
      description:
        'Vencida solo si hay fecha, esa fecha es anterior al `today` de la petición, y el estado no es done.',
    },
    assignee: assigneeSchema,
  },
  required: ['id', 'title', 'status', 'dueDate', 'createdAt', 'updatedAt', 'isOverdue', 'assignee'],
}

/** La forma `{ errors: [...] }` con la que responde toda validación fallida. */
export const validationErrorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          rule: { type: 'string' },
          field: { type: 'string' },
          meta: { type: 'object' },
        },
        required: ['message'],
      },
    },
  },
  required: ['errors'],
}
