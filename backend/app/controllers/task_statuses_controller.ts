import Task, { TASK_STATUSES } from '#models/task'
import { updateTaskStatusValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@foadonis/openapi/decorators'
import { taskSchema, validationErrorSchema } from '#openapi/task_schemas'

export default class TaskStatusesController {
  /**
   * El estado es lo único mutable de una tarea en este momento, y por eso
   * tiene endpoint propio en vez de colgar de un update genérico: por ese
   * update acabarían colándose el título y el responsable, que son historias
   * que todavía no se han especificado.
   *
   * Cualquier persona con sesión puede cambiar el estado de cualquier tarea,
   * en cualquier dirección. No hay permisos por responsable ni transiciones
   * prohibidas: volver de «hecho» a «pendiente» es justamente lo que arregla
   * un clic dado por error.
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
      'El estado destino. Cualquier transición entre los tres estados está permitida, incluida la vuelta desde done, y no se exige ser el responsable.',
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: [...TASK_STATUSES] },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'La tarea ya con el nuevo estado. El título y el responsable no cambian.',
    schema: taskSchema,
  })
  @ApiResponse({ status: 401, description: 'Falta el token o no es válido.' })
  @ApiResponse({ status: 404, description: 'No existe ninguna tarea con ese id.' })
  @ApiResponse({
    status: 422,
    description: 'El estado enviado no es pending, in_progress ni done.',
    schema: validationErrorSchema,
  })
  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const { status } = await request.validateUsing(updateTaskStatusValidator)

    task.status = status
    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }
}
