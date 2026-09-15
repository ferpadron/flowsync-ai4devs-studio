import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Representación recortada de la persona responsable de una tarea.
 *
 * No se reutiliza UserTransformer a propósito: aquel expone correo e iniciales,
 * y la lista de tareas solo necesita un nombre. Devolver la cuenta entera
 * filtraría datos a una vista que no los usa.
 */
export default class TaskAssigneeTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, ['id', 'fullName'])
  }
}
