import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      /**
       * Sin longitud fija a propósito: el umbral máximo del título es una
       * decisión de producto todavía sin tomar (PA-9).
       */
      table.text('title').notNullable()

      table.string('status').notNullable()

      table.integer('assignee_id').notNullable().unsigned().references('id').inTable('users')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
