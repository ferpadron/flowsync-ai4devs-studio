import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /**
       * Fecha de calendario, sin hora: la regla de vencimiento compara días, no
       * instantes, y guardar un `datetime` arrastraría un huso implícito.
       *
       * Nullable porque «sin fecha» es un estado de primera clase de la tarea,
       * no una ausencia que haya que rellenar.
       */
      table.date('due_date').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('due_date')
    })
  }
}
