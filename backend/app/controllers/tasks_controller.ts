import Task, { DEFAULT_LIST_STATUSES, TASK_STATUSES } from '#models/task'
import {
  createTaskValidator,
  listTasksValidator,
  taskReferenceDayValidator,
  toCalendarDay,
} from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import TaskDetailTransformer from '#transformers/task_detail_transformer'
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@foadonis/openapi/decorators'
import { taskDetailSchema, taskSchema, validationErrorSchema } from '#openapi/task_schemas'

export default class TasksController {
  /**
   * La lista del espacio: una sola, la misma para todo el mundo, sin filtrar
   * por quién la pide. El responsable va precargado en la misma consulta —
   * es el 100 % de los accesos y resolverlo tarea a tarea sería el error caro
   * y evidente aquí.
   *
   * Admite acotarse por estado, y aquí hay tres caminos que no se cruzan:
   * un estado válido devuelve solo el suyo (aunque no haya ninguna, y eso es
   * una lista vacía legítima, no un error); no pedir nada devuelve lo que
   * sigue abierto; y un estado que no existe ni siquiera llega, porque el
   * validador lo corta antes con un 422. Devolverlo vacío sería el fallo
   * silencioso que esta lista no se puede permitir.
   *
   * Acotar es solo lectura: ninguna tarea cambia por consultarla.
   */
  @ApiBearerAuth()
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Acota la lista a un solo estado del dominio. Sin indicarlo, se devuelven las pendientes y las en curso; las hechas quedan fuera.',
    schema: { type: 'string', enum: [...TASK_STATUSES] },
  })
  @ApiResponse({
    status: 200,
    description:
      'La lista del espacio, de la más reciente a la más antigua. No incluye fecha de vencimiento ni condición de vencida: eso solo lo da la tarea suelta.',
    schema: { type: 'array', items: taskSchema },
  })
  @ApiResponse({ status: 401, description: 'Falta el token o no es válido.' })
  @ApiResponse({
    status: 422,
    description: 'El estado pedido no es pending, in_progress ni done.',
    schema: validationErrorSchema,
  })
  async index({ request, serialize }: HttpContext) {
    const { status } = await request.validateUsing(listTasksValidator)

    const query = Task.query().preload('assignee')

    if (status) {
      query.where('status', status)
    } else {
      // Sin filtro no es «todas»: lo hecho se queda fuera.
      query.whereIn('status', [...DEFAULT_LIST_STATUSES])
    }

    const tasks = await query
      .orderBy('createdAt', 'desc')
      // Desempate estable: dos tareas creadas en el mismo milisegundo tienen
      // la misma marca de tiempo, y sin esto su orden relativo sería el que
      // quisiera la base de datos.
      .orderBy('id', 'desc')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * Una tarea suelta, con todo lo que tiene: es la única lectura que informa
   * del vencimiento, y por eso es la única que exige el día de quien mira.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Identificador de la tarea.',
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'today',
    required: true,
    description:
      'Día de referencia AAAA-MM-DD contra el que se resuelve si la tarea está vencida. Obligatorio: sin él, o si no es una fecha válida, la respuesta es 422.',
    schema: { type: 'string', format: 'date' },
  })
  @ApiResponse({
    status: 200,
    description: 'La tarea, con su fecha de vencimiento y su condición de vencida ya resueltas.',
    schema: taskDetailSchema,
  })
  @ApiResponse({ status: 401, description: 'Falta el token o no es válido.' })
  @ApiResponse({ status: 404, description: 'No existe ninguna tarea con ese id.' })
  @ApiResponse({
    status: 422,
    description: 'Falta `today` o no es una fecha válida.',
    schema: validationErrorSchema,
  })
  async show({ params, request, serialize }: HttpContext) {
    const { today } = await request.validateUsing(taskReferenceDayValidator)
    const task = await Task.findOrFail(params.id)
    await task.load('assignee')

    return serialize(TaskDetailTransformer.transform(task, toCalendarDay(today)))
  }

  /**
   * Crear cuesta un título. El responsable y el estado no se leen de la
   * petición ni aunque vengan: los pone el sistema.
   */
  @ApiBearerAuth()
  @ApiBody({
    description:
      'El título es el único dato que se acepta. Si el cuerpo incluye además responsable, estado o fecha, esos valores se ignoran.',
    schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', minLength: 1, maxLength: 200 },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'La tarea ya creada: pendiente y a nombre de quien la ha creado.',
    schema: taskSchema,
  })
  @ApiResponse({ status: 401, description: 'Falta el token o no es válido.' })
  @ApiResponse({
    status: 422,
    description:
      'El título falta, está vacío, es solo espacios o supera los 200 caracteres. No se crea ninguna tarea.',
    schema: validationErrorSchema,
  })
  async store({ request, response, auth, serialize }: HttpContext) {
    const { title } = await request.validateUsing(createTaskValidator)
    const user = auth.getUserOrFail()

    // El estado va explícito y no se deja al valor por defecto de la columna:
    // el modelo recién creado no vuelve a leerse de la base de datos, así que
    // ese defecto no llegaría a la respuesta.
    const task = await Task.create({ title, status: 'pending', assigneeId: user.id })
    await task.load('assignee')

    // El estado se marca aparte y el cuerpo se devuelve: `serialize()` entrega
    // una promesa que resuelve el pipeline al devolverla, y pasársela a
    // `response.created()` deja la respuesta con el cuerpo vacío.
    response.status(201)
    return serialize(TaskTransformer.transform(task))
  }
}
