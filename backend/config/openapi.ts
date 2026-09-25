import { defineConfig } from '@foadonis/openapi'

export default defineConfig({
  ui: 'scalar',
  document: {
    info: {
      title: 'FlowSync',
      version: '0.0.0',
    },
    // Los controladores marcan cada operación con `@ApiBearerAuth()`, que
    // referencia este esquema por su nombre («bearer»). Sin definirlo aquí
    // esa referencia queda colgando y el documento deja de ser válido.
    components: {
      securitySchemes: {
        bearer: {
          type: 'http',
          scheme: 'bearer',
          description: 'Access token opaco emitido por `POST /api/v1/auth/login`.',
        },
      },
    },
  },
})
