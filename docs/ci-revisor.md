# El revisor de CI

`.github/workflows/revisor.yml` lanza a Claude sobre cada pull request y publica cada hallazgo
únicamente como comentario en línea sobre el fichero y la línea que lo provoca. Es solo lectura — no
edita ficheros ni propone commits — y usa como calibración [`review.md`](../review.md), contrastando
el cambio contra los scenarios de `openspec/specs/`.

**Es informativo, no un gate.** No está marcado como comprobación obligatoria y no se ha tocado la
protección de rama para exigirlo: un hallazgo del revisor no bloquea el merge por sí solo. Si algún
día se quiere convertir en gate, eso es un cambio aparte, deliberado, en la protección de la rama.

**Este workflow no funciona en cuanto se añade al repositorio.** Antes de que el revisor arranque
hacen falta dos pasos manuales, instalar la GitHub App de Claude y dar de alta el secreto de la
credencial, que solo puede dar alguien con permisos de administración sobre el repositorio.

## Lo que queda pendiente

### 1. Instalar la GitHub App de Claude

En <https://github.com/apps/claude>, instalada sobre este repositorio. El workflow no le pasa
`github_token` a la acción, así que `anthropics/claude-code-action@v1` recurre a su autenticación por
defecto: cambia el token OIDC del job (de ahí `id-token: write` en `permissions`) por un token efímero
de esta GitHub App, y es esa App —no el `GITHUB_TOKEN` del job, que aquí es de solo lectura— quien
publica los comentarios y las llamadas a la API de GitHub que la acción necesita.

### 2. Guardar la credencial como secreto del repositorio

En **Settings → Secrets and variables → Actions → New repository secret**. Hay dos caminos y **no son
intercambiables**: cada uno tiene su propia entrada en la acción y su propio nombre de secreto.

#### Camino 1 — suscripción (el que usa el workflow hoy)

Si ya pagas un plan Pro o Max, el consumo del revisor va contra los límites de ese plan y no genera
una factura aparte.

```bash
claude setup-token   # en local, con la sesión de Claude Code ya iniciada
```

Copia el token que imprime y guárdalo en el secreto **`CLAUDE_CODE_OAUTH_TOKEN`**. La entrada de la
acción que lo lee es **`claude_code_oauth_token`**, que es la que el workflow ya tiene puesta. Con
esto no hay que tocar el YAML.

#### Camino 2 — clave de API

Si prefieres pagar por uso, crea una clave en <https://console.anthropic.com> y guárdala en el
secreto **`ANTHROPIC_API_KEY`**. La entrada de la acción es **`anthropic_api_key`**, así que además de
crear el secreto hay que **editar el workflow** y sustituir la línea de la credencial:

```yaml
# en lugar de:
claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
# poner:
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

#### Si cruzas los dos caminos

Guardar un token de `claude setup-token` en `ANTHROPIC_API_KEY`, o una clave de API en
`claude_code_oauth_token`, **falla en la primera llamada a la API** con un error de autenticación que
no menciona el cruce: parece una credencial caducada o mal copiada. Si el job muere nada más empezar
y la credencial es reciente, lo primero que hay que mirar es si la entrada de la acción y el nombre
del secreto son los del mismo camino.

Un secreto vacío da el mismo síntoma: si el nombre del secreto no coincide exactamente con el del
workflow, GitHub no avisa, sustituye por cadena vacía y la llamada falla igual.

### 3. Comprobar que funciona

Abre un PR de prueba **desde una rama de este mismo repositorio** (no desde un fork, ver más abajo) y
mira que aparezcan los comentarios del revisor al terminar el job.

## En qué se va el dinero

El revisor gasta tokens de entrada (el contexto del PR y los ficheros que abre) y de salida (lo que
escribe). Los parámetros que fijan ese gasto están en `claude_args` y en el propio job:

| Parámetro | Valor | Qué controla |
|---|---|---|
| `--model sonnet` | Claude Sonnet | Qué modelo revisa, y por tanto el precio por millón de tokens |
| `--effort medium` | medio | Cuánto razona antes de responder: más esfuerzo, más tokens de salida |
| `--max-turns 40` | 40 turnos | Tope duro de interacciones con herramientas por ejecución |
| `timeout-minutes: 10` | 10 minutos | Tope duro de reloj: pase lo que pase, el job muere ahí |

**Por qué Sonnet.** Es el punto medio de la familia: bastante más barato que Opus y con capacidad de
sobra para leer un diff, contrastarlo contra una spec y explicar un hallazgo. Revisar un PR de este
repositorio es una tarea acotada y con el contexto delante, no un problema de razonamiento profundo.

**Cómo cambiarlo.** Edita `--model` en el bloque `claude_args` del workflow:

- `--model haiku` — el más barato y rápido. Menos fino detectando desviaciones sutiles de la spec.
- `--model opus` — el más caro y el más capaz. Tiene sentido si el revisor se queda corto de forma
  sistemática, no por defecto.

También puedes fijar un identificador exacto de modelo en vez del alias si te importa que la versión
no se mueva sola.

**Precios.** No los copio aquí: cambian, y una cifra escrita en un fichero envejece sin que nadie se
entere. Están en su fuente oficial: <https://www.anthropic.com/pricing>.

Ten en cuenta que el revisor se dispara en `opened`, `synchronize`, `reopened` y `ready_for_review`:
**cada push a la rama de un PR abierto es una revisión nueva**. En una rama con muchos commits
pequeños eso se nota. Si molesta, quita `synchronize` de la lista de `types` y el revisor pasará solo
al abrir el PR.

## Los PR que vienen de un fork

Este es un repositorio público. Los PR abiertos desde un fork **no se van a revisar**, y hay motivos
independientes, cada uno suficiente por sí solo:

1. **GitHub no pasa los secretos** a un workflow disparado por `pull_request` desde un fork. El
   secreto de la credencial llega vacío y el paso falla en la primera llamada.
2. **La acción exige acceso de escritura al repositorio por parte de quien abre el PR** para arrancar
   sobre eventos `pull_request`. Quien abre un PR desde su fork normalmente no lo tiene, así que la
   acción se detiene antes de lanzar a Claude, con o sin credencial válida.

Lo anterior es el comportamiento **seguro y deseado**: un PR de un fork trae código y texto que no
controlamos, y darle acceso a los secretos del repositorio es la vía clásica de exfiltrarlos. Mientras
tanto, el flujo que funciona es el de este repositorio: ramas de trabajo dentro del propio
repositorio, que es lo que dice la regla de proceso de [`CLAUDE.md`](../CLAUDE.md).
