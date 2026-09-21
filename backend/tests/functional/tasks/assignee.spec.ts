import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: que el responsable se identifique con
 * nombre e iniciales, que la tarea no filtre otros datos de la cuenta —en
 * particular el email—, y que una cuenta sin nombre siga dando iniciales.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any, atributos: { fullName: string | null; email: string }) {
    await User.create({ ...atributos, password: 'secreto123' })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: atributos.email, password: 'secreto123' })

    return response.body().data.token as string
  }

  test('el responsable llega identificable por su nombre y sus iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, { fullName: 'Ada Lovelace', email: 'ada@example.com' })

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    creada.assertStatus(201)

    const { assignee } = creada.body().data
    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('la tarea no filtra el email ni ningún otro dato de acceso de la cuenta', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, { fullName: 'Ada Lovelace', email: 'ada@example.com' })

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    const id = creada.body().data.id

    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    const suelta = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: '2026-09-20' })
      .header('Authorization', `Bearer ${token}`)

    // El scenario habla de «cualquier tarea, suelta o dentro de la lista»: se
    // comprueban las tres formas en las que puede llegar un assignee.
    const assigneeAlCrear = creada.body().data.assignee
    const assigneeEnLista = lista.body().data[0].assignee
    const assigneeSuelta = suelta.body().data.assignee

    for (const assignee of [assigneeAlCrear, assigneeEnLista, assigneeSuelta]) {
      assert.notProperty(assignee, 'email')
      assert.notInclude(JSON.stringify(assignee), 'ada@example.com')
    }
  })

  test('una cuenta sin nombre sigue dando iniciales para su tarea', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, { fullName: null, email: 'sin-nombre@example.com' })

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    const { assignee } = creada.body().data
    assert.isNull(assignee.fullName)
    assert.isString(assignee.initials)
    assert.isNotEmpty(assignee.initials)
  })
})
