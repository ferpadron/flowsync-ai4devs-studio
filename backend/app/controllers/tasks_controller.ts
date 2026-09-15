import Task from '#models/task'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import TaskDetailTransformer from '#transformers/task_detail_transformer'
import { createTaskValidator, referenceDayValidator, updateTaskValidator } from '#validators/task'

export default class TasksController {
  /**
   * Día de calendario contra el que se resuelve el vencimiento.
   *
   * Lo aporta quien mira, porque es el único que conoce su día local; si no
   * llega, manda el del servidor. Un valor mal formado se rechaza en lugar de
   * recurrir en silencio a otro día: una lectura plausible pero falsa es peor
   * que un error.
   */
  private async resolveReferenceDay(request: HttpContext['request']) {
    const { today } = await referenceDayValidator.validate(request.qs())

    return (today ?? DateTime.now()).toISODate()!
  }

  /**
   * La lista es una sola y es la misma para todo el mundo: no se filtra por
   * quien consulta. Tampoco se ordena — el criterio de orden es una decisión
   * de producto todavía sin tomar (PA-3).
   *
   * Usa el transformer del listado, que no conoce ni la fecha ni el
   * vencimiento: es lo que hace imposible que la lista los filtre.
   */
  async index({ serialize }: HttpContext) {
    const tasks = await Task.query().preload('assignee')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * Lectura individual: la superficie mínima que la fecha de vencimiento
   * necesita para existir, porque se consulta y se fija al abrir la tarea.
   *
   * No es la pantalla de detalle completa: qué más debe mostrar esa superficie
   * sigue siendo una decisión de producto abierta (PA-6).
   */
  async show({ params, request, serialize }: HttpContext) {
    const referenceDay = await this.resolveReferenceDay(request)
    const task = await Task.findOrFail(params.id)
    await task.load('assignee')

    return serialize(TaskDetailTransformer.transform(task, referenceDay))
  }

  /**
   * El título es lo único que se acepta: el estado inicial y la persona
   * responsable los fija el servidor, y la tarea nace sin fecha.
   *
   * Responde con la representación del listado, que es donde entra la tarea
   * recién creada.
   */
  async store({ auth, request, serialize }: HttpContext) {
    const { title } = await request.validateUsing(createTaskValidator)
    const user = auth.getUserOrFail()

    const task = await Task.create({ title, status: 'pending', assigneeId: user.id })
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }

  /**
   * Cualquiera puede cambiar el estado, el responsable y la fecha de cualquier
   * tarea: no hay comprobación de propiedad. El título no es actualizable.
   *
   * Para la fecha, ausente significa «no la toques» y explícitamente vacía
   * significa «retírala». El veredicto de vencimiento nunca llega del cliente:
   * lo calcula el transformer a partir de la regla del modelo.
   */
  async update({ params, request, serialize }: HttpContext) {
    const referenceDay = await this.resolveReferenceDay(request)
    const task = await Task.findOrFail(params.id)
    const { dueDate, ...payload } = await request.validateUsing(updateTaskValidator)

    task.merge(payload)

    if (dueDate !== undefined) {
      task.dueDate = dueDate
    }

    await task.save()
    await task.load('assignee')

    return serialize(TaskDetailTransformer.transform(task, referenceDay))
  }
}
