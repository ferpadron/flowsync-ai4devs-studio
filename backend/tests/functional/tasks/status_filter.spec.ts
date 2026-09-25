import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Acotar la lista por estado. Cubre el requisito «Un estado que no existe se
 * rechaza, no se responde vacío» de `openspec/specs/tasks/spec.md`: un valor
 * que no es ninguno de los tres estados del dominio tiene que responder `422`
 * señalando el campo `status`, nunca una lista vacía en silencio. Añade
 * también el camino feliz —un estado válido sigue filtrando— para no dejar
 * ese comportamiento sin ninguna prueba.
 */
/**
 * El cliente tipado de Tuyau infiere `data` como la unión entre una tarea
 * suelta y una lista de tareas, porque `/api/v1/tasks` sirve ambas formas
 * según el método. Se estrecha con una comprobación real en tiempo de
 * ejecución (`Array.isArray`), como ya hace `assignee.spec.ts`, en vez de
 * forzar el tipo.
 */
function assertIsTask<T>(data: T | T[]): T {
  if (Array.isArray(data)) {
    throw new Error('Se esperaba una tarea, no una lista de tareas')
  }
  return data
}

function assertIsTaskList<T>(data: T | T[]): T[] {
  if (!Array.isArray(data)) {
    throw new Error('Se esperaba una lista de tareas, no una tarea suelta')
  }
  return data
}

test.group('Tasks | filtro de estado', (group) => {
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

  test('un estado que no existe se rechaza con 422 sobre el campo status', async ({ client }) => {
    const token = await sesion(client)

    const response = await client
      .get('/api/v1/tasks')
      .qs({ status: 'archivado' })
      .header('Authorization', `Bearer ${token}`)

    // El scenario «Estado inventado» exige un 422 sobre el campo, no una
    // lista de tareas: si esto vuelve a ser un 200, el bug ha reaparecido.
    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'status' }] })
  })

  test('un estado válido sigue devolviendo 200 y solo trae tareas de ese estado', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    const id = assertIsTask(creada.body().data).id

    await client
      .patch(`/api/v1/tasks/${id}/status`)
      .header('Authorization', `Bearer ${token}`)
      .json({ status: 'done' })

    const response = await client
      .get('/api/v1/tasks')
      .qs({ status: 'done' })
      .header('Authorization', `Bearer ${token}`)

    // No se asume que el espacio esté vacío: solo que la tarea recién puesta
    // en `done` aparece, y que todo lo que trae el filtro es `done`.
    response.assertStatus(200)
    const tareas = assertIsTaskList(response.body().data)
    assert.include(
      tareas.map((tarea) => tarea.id),
      id
    )
    for (const tarea of tareas) {
      assert.equal(tarea.status, 'done')
    }
  })
})
