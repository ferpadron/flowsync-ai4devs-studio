import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Cuándo una tarea está vencida. Cubre, del requisito «Cuándo una tarea está
 * vencida» de `openspec/specs/tasks/spec.md`, los scenarios «Darla por hecha
 * la deja de vencer» y «Una tarea hecha con la fecha pasada»: una tarea con
 * fecha pasada está vencida mientras no esté `done`, y deja de estarlo en
 * cuanto pasa a `done`, aunque su fecha siga siendo la misma.
 *
 * Usa fechas fijas, no el día real, para que el resultado no dependa de
 * cuándo se ejecute la suite.
 */

/**
 * El cliente tipado de Tuyau infiere `data` como una unión entre una tarea
 * suelta y una lista de tareas. Se estrecha con una comprobación real en
 * tiempo de ejecución, como ya hacen `assignee.spec.ts` y
 * `status_filter.spec.ts`, en vez de forzar el tipo.
 */
function assertIsTask<T>(data: T | T[]): T {
  if (Array.isArray(data)) {
    throw new Error('Se esperaba una tarea, no una lista de tareas')
  }
  return data
}

test.group('Tasks | vencimiento y estado done', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any) {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'secreto123' })

    return response.body().data.token as string
  }

  test('una tarea done con fecha pasada deja de estar vencida', async ({ client, assert }) => {
    const token = await sesion(client)
    const referenceDay = '2024-05-02'
    const pastDueDate = '2024-05-01'

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    const id = assertIsTask(creada.body().data).id

    const conFecha = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .header('Authorization', `Bearer ${token}`)
      .json({ dueDate: pastDueDate, today: referenceDay })

    // Antes de terminarla: fecha anterior al día de referencia y no está
    // `done`, así que el scenario «Fecha del día anterior» exige vencida.
    conFecha.assertStatus(200)
    assert.isTrue(assertIsTask(conFecha.body().data).isOverdue)

    await client
      .patch(`/api/v1/tasks/${id}/status`)
      .header('Authorization', `Bearer ${token}`)
      .json({ status: 'done' })

    const detalle = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: referenceDay })
      .header('Authorization', `Bearer ${token}`)

    // El scenario «Darla por hecha la deja de vencer»: mismo día de
    // referencia, misma fecha de vencimiento, ya no está vencida porque su
    // estado es `done`.
    detalle.assertStatus(200)
    const tarea = assertIsTask(detalle.body().data)
    assert.isFalse(tarea.isOverdue)
    assert.equal(tarea.dueDate, pastDueDate)
    assert.equal(tarea.status, 'done')
  })
})
