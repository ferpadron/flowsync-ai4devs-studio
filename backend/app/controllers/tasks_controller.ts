import Task from '#models/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import { createTaskValidator, updateTaskValidator } from '#validators/task'

export default class TasksController {
  /**
   * La lista es una sola y es la misma para todo el mundo: no se filtra por
   * quien consulta. Tampoco se ordena — el criterio de orden es una decisión
   * de producto todavía sin tomar (PA-3).
   */
  async index({ serialize }: HttpContext) {
    const tasks = await Task.query().preload('assignee')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * El título es lo único que se acepta: el estado inicial y la persona
   * responsable los fija el servidor.
   */
  async store({ auth, request, serialize }: HttpContext) {
    const { title } = await request.validateUsing(createTaskValidator)
    const user = auth.getUserOrFail()

    const task = await Task.create({ title, status: 'pending', assigneeId: user.id })
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }

  /**
   * Cualquiera puede cambiar el estado y el responsable de cualquier tarea:
   * no hay comprobación de propiedad. El título no es actualizable.
   */
  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const payload = await request.validateUsing(updateTaskValidator)

    task.merge(payload)
    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }
}
