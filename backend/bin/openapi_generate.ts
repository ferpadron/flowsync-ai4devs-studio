/*
|--------------------------------------------------------------------------
| OpenAPI generate entrypoint
|--------------------------------------------------------------------------
|
| El documento OpenAPI hoy solo existe en memoria: se reconstruye en cada
| petición a `/api.json`. Este entrypoint lo materializa en
| `docs/api/openapi.json` para que el contrato quede versionado, no solo
| servido.
|
| No se implementa como comando de `commands/` porque ese loader (jsonschema
| 1.5.0 sobre Node 24) revienta con `TypeError: Invalid URL` en cuanto existe
| un solo fichero ahí, sea cual sea su contenido — comprobado con el scaffold
| vacío de `node ace make:command`. Es un defecto de las dependencias
| instaladas, no de este comando; arrancar la app a mano con Ignitor, como
| hacen `bin/server.ts` y `bin/test.ts`, lo evita porque nunca pasa por el
| loader de comandos de Ace.
|
*/

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'

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
  await app.start(async () => {
    const server = await app.container.make('server')
    await server.boot()

    const openapi = await app.container.make('openapi')
    const document = await openapi.buildDocument()
    const json = `${JSON.stringify(document, null, 2)}\n`

    const repoRoot = dirname(fileURLToPath(APP_ROOT))
    const outputPath = join(repoRoot, 'docs/api/openapi.json')
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, json)

    console.log(`OpenAPI: escrito ${outputPath}`)
  })
  await app.terminate()
}

main().catch((error) => {
  process.exitCode = 1
  prettyPrintError(error)
})
