/*
|--------------------------------------------------------------------------
| JavaScript entrypoint for "npm run openapi:check"
|--------------------------------------------------------------------------
|
| Mirrors "ace.js": registers the TypeScript loader hook and then imports
| the real entrypoint in "bin/openapi_check.ts".
|
*/

import '@poppinss/ts-exec'

await import('./bin/openapi_check.js')
