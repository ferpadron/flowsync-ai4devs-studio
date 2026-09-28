/*
|--------------------------------------------------------------------------
| OpenAPI check entrypoint
|--------------------------------------------------------------------------
|
| Regenera el documento OpenAPI en una ubicación temporal y lo compara con el
| versionado en `docs/api/openapi.json`. Solo compara: si difieren, termina
| con código de salida distinto de cero y muestra el diff, sin tocar el
| fichero versionado.
|
| Mismo motivo que `bin/openapi_generate.ts` para no vivir en `commands/`: el
| loader de Ace revienta ahí con cualquier fichero, por un defecto de
| jsonschema 1.5.0 sobre Node 24, no por el contenido del comando.
|
*/

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'

await import('reflect-metadata')
const { Ignitor, prettyPrintError } = await import('@adonisjs/core')

const APP_ROOT = new URL('../', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER }).tap((app) => {
  app.booting(async () => {
    await import('#start/env')
  })
})

async function main() {
  const app = ignitor.createApp('console')
  await app.init()
  await app.boot()

  let mismatch = false

  await app.start(async () => {
    const server = await app.container.make('server')
    await server.boot()

    const openapi = await app.container.make('openapi')
    const document = await openapi.buildDocument()
    const freshJson = `${JSON.stringify(document, null, 2)}\n`

    const repoRoot = dirname(fileURLToPath(APP_ROOT))
    const versionedPath = join(repoRoot, 'docs/api/openapi.json')

    const tempDir = await mkdtemp(join(tmpdir(), 'openapi-check-'))
    try {
      const tempPath = join(tempDir, 'openapi.json')
      await writeFile(tempPath, freshJson)

      let versionedJson: string
      try {
        versionedJson = await readFile(versionedPath, 'utf-8')
      } catch {
        console.error(
          `No existe ${versionedPath}. Ejecuta "npm run openapi:generate" para crearlo.`
        )
        mismatch = true
        return
      }

      if (versionedJson === freshJson) {
        console.log('openapi:check: el documento versionado está al día.')
        return
      }

      const diff = spawnSync('diff', ['-u', versionedPath, tempPath], { encoding: 'utf-8' })

      console.error(
        `${versionedPath} no coincide con el documento que sirve el servidor.\n` +
          'Regenera el fichero versionado con "npm run openapi:generate" y commitea el diff.\n'
      )
      console.error(diff.stdout || diff.stderr || '(no se pudo calcular el diff)')
      mismatch = true
    } finally {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  await app.terminate()

  if (mismatch) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  process.exitCode = 1
  prettyPrintError(error)
})
