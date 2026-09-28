/*
|--------------------------------------------------------------------------
| JavaScript entrypoint for "npm run openapi:generate"
|--------------------------------------------------------------------------
|
| Mirrors "ace.js": registers the TypeScript loader hook and then imports
| the real entrypoint in "bin/openapi_generate.ts".
|
*/

import '@poppinss/ts-exec'

await import('./bin/openapi_generate.js')
