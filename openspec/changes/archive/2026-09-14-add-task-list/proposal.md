## Why

FlowSync ya sabe quién eres, pero todavía no hay nada que gestionar: el producto tiene cuentas y sesión y ninguna tarea. Esta es la base de las épicas E2 y E3 — sin una lista compartida no hay dónde crear, ni dónde cambiar un estado, ni nada que el equipo pueda mirar para saber en qué anda cada uno.

## What Changes

- Se da de alta la noción de **tarea**: un título, una persona responsable y un estado de un conjunto cerrado de tres valores.
- La API gana **exactamente tres operaciones**: listar todas las tareas, crear una y actualizarla. Las tres exigen sesión iniciada.
- **Crear pide solo el título.** La tarea nace en estado pendiente y con quien la crea como responsable; el flujo de creación no ofrece ni sugiere responsable, estado ni ningún otro dato.
- **Sin título no hay tarea**: se rechaza tanto el título ausente como el que es solo espacios en blanco.
- **Una sola lista compartida**, idéntica para todo el mundo: no hay tareas privadas, no hay vista de «mis tareas» y cualquiera puede cambiar el estado y el responsable de cualquier tarea.
- La interfaz gana una **pantalla de lista** en su propia ruta protegida, donde cada fila muestra título, responsable y estado, y desde la que **se cambia el estado en un gesto**, sin abrir la tarea ni confirmar en ningún diálogo.
- Los tres estados viajan por la API como `pending`, `in_progress` y `done`, y se pintan como Pendiente, En curso y Hecho. Cualquier otro valor se rechaza.
- El responsable se identifica en la lista **por su nombre**; si no tiene nombre puesto se pinta «Sin nombre». Nunca su correo ni su identificador.
- La lista vacía **explica qué es esto y ofrece crear la primera tarea**, en lugar de mostrar un hueco.

## Capabilities

### New Capabilities

- `tasks`: la lista compartida de tareas del equipo — creación con solo el título, responsable y estado por defecto, consulta de la lista completa y cambio de estado y de responsable.

### Modified Capabilities

Ninguna. La lista vive en una ruta nueva y el destino tras iniciar sesión sigue siendo el perfil, así que ningún requisito de `auth` cambia.

## Impact

**Backend (`backend/`)**

- Nueva migración y modelo de tarea, con la relación al usuario responsable.
- Nuevo controlador con las tres acciones, nuevos validadores y nuevo transformer.
- Nuevas rutas bajo el grupo ya protegido por sesión.

**Frontend (`frontend/`)**

- Nueva página de lista y nueva ruta protegida, siguiendo el patrón que ya usan las pantallas de acceso.
- `lib/api.ts` gana las tres llamadas nuevas; `lib/types.ts`, los tipos de tarea y estado.
- Se reutilizan los componentes que ya existen en `components/ui/`. **No se añaden dependencias ni se monta ningún sistema de diseño nuevo.**

**Fuera de alcance, deliberadamente**

Estas son **fronteras de este change**, no promesas permanentes sobre lo que la capability podrá llegar a ofrecer. Por eso viven aquí y en `design.md`, y no como requisitos del delta.

- Fecha de vencimiento: en este change la tarea no la tiene, no se prepara infraestructura para ella y la lista no muestra fechas ni marcas de vencida. Lo único que el delta fija como comportamiento es que **la lista no las muestra**, que es lo que `E3-1/CA-7` promete incluso cuando el vencimiento exista.
- Lectura individual de una tarea, borrado y cualquier endpoint de equipo: la superficie de este change es exactamente listar, crear y actualizar.
- Interfaz para reasignar responsable: la API lo permite, la pantalla de esta entrega no lo ofrece.
- Refresco automático cuando otra persona cambia algo (es `E3-2`), señales de presencia y roles o permisos especiales.
- Tests: este change no monta base de pruebas ni escribe ninguna.

## Decisiones de producto pendientes

Ninguna de las dos se inventa aquí. Ambas siguen abiertas, y **ninguna bloquea completar ni archivar este change**: cada una se resolverá en un change posterior, cuando producto tome la decisión.

- **Umbral máximo del título (PA-9).** `E2-2/CA-3` pide dos cosas: que un título demasiado largo se avise, y que **en ningún caso** se guarde una versión recortada sin haberlo advertido. Este change entrega **la segunda**: el título se guarda completo, sin acortarse por longitud, y eso queda como requisito del delta. **La primera necesita un umbral numérico que producto todavía no ha fijado**, y ese número no se sustituye por el tamaño técnico de una columna ni por ninguna cifra elegida por conveniencia. La validación de longitud y su aviso pertenecen a un change futuro, cuando la decisión exista; por eso no aparecen en el delta ni como tarea bloqueada aquí.
- **Orden de la lista (PA-3).** No hay criterio de ordenación decidido. Este change **no inventa ninguno y no ordena explícitamente**: la lista se devuelve y se pinta sin criterio declarado. Eso es una decisión de implementación de este change, y por eso vive aquí y en `design.md` — el delta **no** convierte la ausencia de decisión en la promesa de que nunca habrá orden. `E3-1/CA-5` (poder enumerar el trabajo de cada persona recorriendo la lista) queda condicionado a que PA-3 se resuelva, y por eso el delta no lo promete todavía.
