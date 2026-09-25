import Task from '#models/task'
import { setTaskDueDateValidator, toCalendarDay } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskDetailTransformer from '#transformers/task_detail_transformer'
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@foadonis/openapi/decorators'
import { taskDetailSchema, validationErrorSchema } from '#openapi/task_schemas'

export default class TaskDueDatesController {
  /**
   * Fijar, cambiar y retirar la fecha de vencimiento son la misma operación, y
   * por eso comparten endpoint: quitar la fecha no es borrar un recurso, es
   * poner el valor «sin fecha», que es un valor legítimo del campo.
   *
   * Endpoint propio en vez de un update genérico de la tarea, por el mismo
   * motivo que el estado: por ahí se colarían el título y el responsable, que
   * este change no permite tocar.
   *
   * Cualquiera con sesión puede cambiar la fecha de cualquier tarea, igual que
   * el estado. No se comprueba quién es el responsable.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Identificador de la tarea.',
    schema: { type: 'integer' },
  })
  @ApiBody({
    description:
      '`dueDate` fija, cambia o retira (con `null`) la fecha de vencimiento; una fecha imposible o mal formada responde 422. `today` es el día de referencia con el que la respuesta ya devuelve resuelta la condición de vencida.',
    schema: {
      type: 'object',
      required: ['today', 'dueDate'],
      properties: {
        today: { type: 'string', format: 'date' },
        dueDate: { type: 'string', format: 'date', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'La tarea con la fecha ya puesta, cambiada o retirada. El título, el responsable y el estado no cambian.',
    schema: taskDetailSchema,
  })
  @ApiResponse({ status: 401, description: 'Falta el token o no es válido.' })
  @ApiResponse({ status: 404, description: 'No existe ninguna tarea con ese id.' })
  @ApiResponse({
    status: 422,
    description:
      '`dueDate` no existe o está mal formada, o falta `today` / no es una fecha válida. La tarea conserva la fecha que tuviera antes.',
    schema: validationErrorSchema,
  })
  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const { today, dueDate } = await request.validateUsing(setTaskDueDateValidator)

    // El `DateTime` del validador se queda aquí: hacia dentro, una fecha de
    // vencimiento es un día en texto y nunca un instante.
    task.dueDate = dueDate === null ? null : toCalendarDay(dueDate)
    await task.save()
    await task.load('assignee')

    // Se devuelve ya resuelta contra el día de quien pide, para que aplazar una
    // tarea vencida deje de mostrarla vencida en esta misma respuesta.
    return serialize(TaskDetailTransformer.transform(task, toCalendarDay(today)))
  }
}
