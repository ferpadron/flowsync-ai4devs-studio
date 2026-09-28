# Cómo se revisa este repositorio

Instrucciones para quien revisa un cambio, humano o agente. `CLAUDE.md` dice cómo se escribe el
código; esto es otra cosa: **qué decir, qué callar y con qué pruebas.**

## Qué es grave

Un hallazgo **grave** es uno de estos cuatro. Solo estos:

1. **Contradice la spec.** El código incumple un scenario de `openspec/specs/<capability>/spec.md`.
   La spec manda sobre el código. Cita el requirement y el scenario que se rompe.
2. **Publica o expone lo que no debe.** Un campo de más en una respuesta —email, hash, token—, o una
   ruta sin `middleware.auth()` que debería llevarlo.
3. **Se rompe con una entrada alcanzable.** Un id no numérico, un parámetro inventado, una fecha que
   no existe, un cuerpo vacío. «Romperse» incluye responder `200` a lo que debía ser un error.
4. **Deja el contrato desincronizado.** Toca rutas, controladores, validadores o transformers sin
   regenerar `docs/api/openapi.json` ni poner al día `docs/capabilities/<nombre>/README.md`.

Todo lo demás es **sugerencia**: nombres, estructura, duplicación, comentarios, un test que faltaría.
Decirlo está bien. Presentarlo como si fuera grave, no.

## Agrupar y acotar

**Una misma causa raíz es un solo hallazgo**, aunque se manifieste en varios sitios o con varios
valores de entrada (p. ej. un filtro que no valida `status=inventado` y tampoco valida `status=` es
un hallazgo, no dos). No infles el recuento repitiendo variantes.

**Cinco sugerencias por revisión como máximo**, las cinco que más valgan. El resto no se enumera: una
línea al final con cuántas son y de qué van (`Otras 8 sugerencias menores: 5 de nombres, 3 de
duplicación`). Los hallazgos graves no tienen tope.

## Dónde no se reporta

Nada de esto se comenta, ni aunque esté mal:

- **Lo que ya vigila otra comprobación del repo.** Formato (`prettier`), lint (`eslint` en backend,
  `oxlint` en frontend), tipos (`typecheck`, `build`), tests (`node ace test`) y la deriva del
  documento OpenAPI (`openapi:check`, en CI). Si un check determinista lo caza, el comentario sobra.
- **Código generado**: `backend/database/schema.ts`, `backend/.adonisjs/`, `docs/api/openapi.json` y
  `frontend/src/components/ui/` (shadcn). Se regeneran; no se editan a mano.
- **Ficheros que el cambio no toca**, salvo que el cambio los rompa.
- **`node_modules/`, lockfiles y `tmp/`.**
- **El estilo del proyecto y la versión del stack.** Son deliberados. AdonisJS 7, Lucid 22, VineJS 4,
  TypeScript 6 van por delante de la documentación que te sabes: comprueba los `.d.ts` antes de decir
  que algo "no existe" o "no funciona así".

## Cita o calla

Para afirmar que el código **se comporta** de una manera, cita `fichero.ts:línea` con lo que has
leído ahí. **Deducirlo del nombre no vale**: un `listTasksValidator` puede aceptar cualquier texto,
un `task_assignee_transformer` puede estar publicando el email, un comentario puede afirmar lo
contrario de lo que hace la línea de debajo.

Un hallazgo grave sin cita no es grave: es una sospecha. Va como sugerencia marcada como tal, o no va.
