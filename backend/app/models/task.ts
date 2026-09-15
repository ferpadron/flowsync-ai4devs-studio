import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import { TaskSchema } from '#database/schema'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/** Estado en el que una tarea deja de poder vencer, por antigua que sea su fecha. */
const DONE_STATUS = 'done'

export default class Task extends TaskSchema {
  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>

  /**
   * Regla de vencimiento. Único punto del sistema que la decide: no se
   * reimplementa en el controlador, ni en los transformers, ni en el cliente.
   *
   * Una tarea está vencida si y solo si se cumplen las tres condiciones a la
   * vez: tiene fecha, esa fecha es **anterior** al día de referencia, y su
   * estado no es «hecho». Vencer hoy todavía no es estar vencida.
   *
   * El día de referencia llega como parámetro y no se lee del reloj: es lo que
   * permite que dos personas en husos distintos obtengan lecturas diferentes y
   * ambas sean correctas, y que una tarea pase a vencida por el mero avance del
   * día sin que nadie la modifique.
   *
   * La comparación se hace sobre fechas de calendario en formato `YYYY-MM-DD`,
   * cuyo orden lexicográfico coincide con el cronológico. Comparar instantes
   * reintroduciría el huso que la columna `date` deja deliberadamente fuera.
   *
   * @param referenceDay Día de referencia de quien mira, como `YYYY-MM-DD`.
   */
  isOverdueOn(referenceDay: string): boolean {
    const dueDate = this.dueDate?.toISODate()

    if (!dueDate) return false
    if (this.status === DONE_STATUS) return false

    return dueDate < referenceDay
  }
}
