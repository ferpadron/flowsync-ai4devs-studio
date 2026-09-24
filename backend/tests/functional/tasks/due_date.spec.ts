import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * `today` en `PUT /api/v1/tasks/:id/due-date`. Cubre, del requirement
 * "Fijar, cambiar y retirar la fecha de vencimiento" corregido en
 * `openspec/changes/clarify-due-date-reference-day/specs/tasks/spec.md`,
 * los scenarios "Falta el día de referencia al fijar la fecha" y "Poner una
 * fecha a una tarea que no tenía": `today` es obligatorio en esta petición,
 * y la respuesta trae la condición de vencida ya resuelta contra él.
 *
 * Usa fechas ISO fijas, no el día real, para que el resultado no dependa de
 * cuándo se ejecute la suite.
 */

/**
 * El cliente tipado de Tuyau infiere `data` como una unión entre una tarea
 * suelta y una lista de tareas. Se estrecha con una comprobación real en
 * tiempo de ejecución, como ya hacen `assignee.spec.ts`, `status_filter.spec.ts`
 * y `overdue.spec.ts`, en vez de forzar el tipo.
 */
function assertIsTask<T>(data: T | T[]): T {
  if (Array.isArray(data)) {
    throw new Error('Se esperaba una tarea, no una lista de tareas')
  }
  return data
}

test.group('Tasks | today en due-date', (group) => {
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

  test('sin today se rechaza y no cambia la fecha', async ({ client, assert }) => {
    const token = await sesion(client)
    const referenceDay = '2026-09-24'
    const fechaOriginal = '2026-10-01'
    const fechaDelIntentoRechazado = '2026-11-15'

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    const id = assertIsTask(creada.body().data).id

    // Primero se fija una fecha conocida con un PUT válido, con today.
    const primerPut = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .header('Authorization', `Bearer ${token}`)
      .json({ dueDate: fechaOriginal, today: referenceDay })

    primerPut.assertStatus(200)

    // Después se intenta cambiarla, sin today: el scenario "Falta el día de
    // referencia al fijar la fecha" exige 422 sobre ese campo.
    const segundoPut = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .header('Authorization', `Bearer ${token}`)
      .json({ dueDate: fechaDelIntentoRechazado })

    segundoPut.assertStatus(422)
    segundoPut.assertBodyContains({ errors: [{ field: 'today' }] })

    // La fecha sigue siendo la que se fijó primero, no la del intento
    // rechazado.
    const detalle = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: referenceDay })
      .header('Authorization', `Bearer ${token}`)

    detalle.assertStatus(200)
    assert.equal(assertIsTask(detalle.body().data).dueDate, fechaOriginal)
  })

  test('con dueDate y today devuelve vencimiento resuelto', async ({ client, assert }) => {
    const token = await sesion(client)
    const referenceDay = '2026-09-24'
    const pastDueDate = '2026-09-01'

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    const id = assertIsTask(creada.body().data).id

    const respuesta = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .header('Authorization', `Bearer ${token}`)
      .json({ dueDate: pastDueDate, today: referenceDay })

    respuesta.assertStatus(200)
    const tarea = assertIsTask(respuesta.body().data)
    assert.equal(tarea.dueDate, pastDueDate)
    assert.isTrue(tarea.isOverdue)
  })
})
