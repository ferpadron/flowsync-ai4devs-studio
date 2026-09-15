import type Task from '#models/task'
import { BaseTransformer } from '@adonisjs/core/transformers'
import TaskAssigneeTransformer from '#transformers/task_assignee_transformer'

/**
 * Representación **individual** de una tarea: la del listado más la fecha de
 * vencimiento y el veredicto de vencimiento.
 *
 * No se reutiliza `TaskTransformer` a propósito, y la diferencia no es
 * cosmética: mantener dos representaciones separadas es lo que hace
 * estructuralmente imposible que la lista filtre la fecha o la condición de
 * vencida. Un descuido futuro en la pantalla no puede enseñar un dato que la
 * respuesta del listado nunca ha contenido.
 *
 * El veredicto lo calcula siempre la regla del modelo, nunca esta capa, y no se
 * almacena en ningún sitio: se resuelve en cada lectura contra el día de
 * referencia de quien mira, que llega como argumento.
 */
export default class TaskDetailTransformer extends BaseTransformer<Task> {
  constructor(
    resource: Task,
    private referenceDay: string
  ) {
    super(resource)
  }

  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'status']),
      dueDate: this.resource.dueDate?.toISODate() ?? null,
      isOverdue: this.resource.isOverdueOn(this.referenceDay),
      assignee: TaskAssigneeTransformer.transform(this.whenLoaded(this.resource.assignee)),
    }
  }
}
