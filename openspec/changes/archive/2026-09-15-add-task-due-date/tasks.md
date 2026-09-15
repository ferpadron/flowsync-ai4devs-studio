> **Sin tests.** Este change no monta base de pruebas ni escribe tests (R-7 sigue sin pagarse). Cada tarea se verifica con un comando, una respuesta de la API o una comprobación en pantalla.

## 1. Persistencia de la fecha

- [x] 1.1 Crear la migración que añade a `tasks` la columna de fecha de vencimiento como **fecha de calendario nullable** (D1), con su reverso dejando el esquema como estaba; verificar con `node ace migration:run` que corre limpia sobre la base que ya contiene tareas y que `database/schema.ts` se regenera con el campo nuevo
- [x] 1.2 Comprobar que las tareas creadas antes de la migración siguen siendo válidas y se listan sin error, y que la columna admite quedarse sin valor; verificar listando desde la API y consultando una tarea anterior a la migración
- [x] 1.3 Comprobar que el diff incluye `database/schema.ts` regenerado sin editarlo a mano y que `npm run typecheck` pasa en `backend/`

## 2. Regla de vencimiento en el dominio

- [x] 2.1 Implementar en `app/models/task.ts` la regla de vencimiento como método que **recibe el día de referencia** y devuelve el booleano, aplicando las tres condiciones (tiene fecha · la fecha es anterior al día de referencia · el estado no es `done`) (D2); verificar con `node ace repl` los cuatro bordes: día anterior, mismo día, día posterior y sin fecha
- [x] 2.2 Comprobar en `node ace repl` que una tarea en `done` con fecha pasada no está vencida, y que pasar una tarea vencida a `done` deja de vencerla **sin alterar la fecha**
- [x] 2.3 Comprobar en `node ace repl` que la misma tarea evaluada con dos días de referencia distintos devuelve veredictos distintos y ambos son correctos, y que una tarea pasa a vencida por el solo hecho de avanzar el día de referencia, sin modificar la tarea
- [x] 2.4 Comprobar que la regla no está reimplementada en ninguna otra capa; verificar que ni el controlador, ni los transformers, ni el frontend comparan fechas por su cuenta

## 3. API: fecha y veredicto

- [x] 3.1 Crear el transformer de la representación **individual** que añade la fecha de vencimiento y el veredicto de vencimiento, dejando `TaskTransformer` intacto para el listado (D4); verificar que la respuesta del listado no contiene ni la fecha ni el veredicto en ninguna entrada
- [x] 3.2 Añadir al validador de actualización el campo de la fecha como **omitible y anulable** (D5), manteniendo `rejectNull` en estado y responsable y extendiendo a los tres campos la condición de «al menos uno»; verificar que fijar, cambiar y retirar la fecha devuelven 200, que una petición sin ninguno de los tres campos devuelve 422, y que una fecha inválida devuelve 422 con el error en el campo de la fecha
- [x] 3.3 Hacer que el validador de creación **rechace** la fecha de vencimiento (D6); verificar que `POST /api/v1/tasks` con una fecha devuelve 422 con el error en ese campo y no crea ninguna tarea, y que con solo el título sigue devolviendo la tarea sin fecha
- [x] 3.4 Añadir el día de referencia como parámetro de consulta opcional y validado en la lectura individual y en la actualización (D3); verificar que sin él la respuesta usa el día del servidor, que con dos días distintos el mismo recurso devuelve veredictos distintos, y que un valor mal formado devuelve 422 en lugar de recurrir en silencio al día del servidor
- [x] 3.5 Comprobar que un veredicto de vencimiento enviado por el cliente en la actualización se ignora y que la respuesta trae el que calcula el servidor; verificar enviando el booleano invertido y comparando la respuesta
- [x] 3.6 Implementar la acción de lectura individual devolviendo la tarea con su responsable cargado, y registrar `GET /api/v1/tasks/:id` dentro del grupo ya protegido por sesión (D7); verificar con `node ace list:routes` que aparece la ruta nueva, que una tarea inexistente devuelve 404 y que sin sesión devuelve 401
- [x] 3.7 Comprobar que cambiar la fecha de una tarea ajena se aplica sin comprobación de propiedad, y que reasignar el responsable no altera la fecha ni el veredicto; verificar con dos cuentas distintas
- [x] 3.8 Comprobar que al bootear queda regenerado el código de `backend/.adonisjs/` (mapa de controladores y registro Tuyau) e incluirlo en el diff; pasar `npm run lint` y `npm run typecheck` en `backend/` sin errores

## 4. Cliente de API y tipos (frontend)

- [x] 4.1 Añadir a `lib/types.ts` el tipo de la tarea individual con su fecha de vencimiento anulable y su veredicto, separado del tipo que devuelve el listado; verificar que `npm run build` falla si se intenta leer la fecha desde un elemento del listado
- [x] 4.2 Añadir a `lib/api.ts` la lectura individual y el envío de la fecha —incluida su retirada explícita— adjuntando el día de referencia local de quien mira; verificar desde la pantalla que la tarea se carga con datos reales del backend
- [x] 4.3 Ampliar la traducción de errores de `lib/api.ts` con la etiqueta y las reglas del campo de la fecha; verificar que una fecha rechazada muestra un mensaje en castellano junto al campo y no el texto en inglés del servidor

## 5. Vista mínima de la tarea

- [x] 5.1 Crear la vista mínima de tarea en su propia ruta protegida, reutilizando **solo** los componentes ya presentes en `components/ui/` y el campo de fecha nativo (D8); verificar que no se ha añadido ningún fichero a `components/ui/` ni ninguna dependencia a `package.json`
- [x] 5.2 Añadir desde la lista la forma de abrir una tarea **sin cambiar lo que la lista muestra**; verificar que cada fila sigue mostrando título, responsable y estado, y que no aparece ninguna fecha ni marca de vencimiento en ninguna entrada
- [x] 5.3 Pintar en la vista la fecha de vencimiento y permitir ponerla, cambiarla y retirarla, guardando al cambiar el valor **sin botón de guardado** y sin diálogo de confirmación al retirarla; verificar recorriendo los tres casos y volviendo a abrir la tarea para comprobar que quedaron guardados
- [x] 5.4 Mostrar la condición de vencida con una **señal propia** que no obligue a comparar la fecha con hoy, sin depender solo del color y operable con teclado; verificar abriendo una tarea vencida y otra sin vencer
- [x] 5.5 Comprobar que una tarea sin fecha se ve como algo normal, sin aviso, recordatorio ni indicación de que le falte algo; verificar abriendo una tarea recién creada
- [x] 5.6 Comprobar que una fecha rechazada por el servidor deja intacta la que hubiera y muestra el mensaje junto al propio campo (D8); verificar forzando el rechazo y comprobando que el valor anterior sigue ahí
- [x] 5.7 Comprobar que la vista no ofrece editar el título, cambiar el responsable ni borrar la tarea: la superficie entregada es exactamente consultar y editar la fecha, más la señal de vencida (D7)
- [x] 5.8 Pasar `npm run lint` y `npm run build` en `frontend/` sin errores

## 6. Verificación de extremo a extremo

- [x] 6.1 Recorrer el camino completo: crear una tarea sin fecha, abrirla, ponerle una fecha pasada y comprobar que aparece vencida de inmediato; después aplazarla a futuro y comprobar que deja de estarlo
- [x] 6.2 Comprobar que una tarea vencida deja de estarlo al pasarla a «Hecho» desde la lista, y que al abrirla conserva su fecha sin cambios
- [x] 6.3 Comprobar con dos cuentas que ambas ven la misma fecha en la misma tarea, y que cambiar la fecha desde una se refleja al abrirla desde la otra
- [x] 6.4 Comprobar que la lista sigue sin mostrar fechas ni marcas de vencida con tareas vencidas en el espacio, y que el listado de la API tampoco las incluye en su carga útil
- [x] 6.5 Comprobar que el listado sigue sin criterio de ordenación declarado (PA-3 intacto) y que no existe forma de ordenar ni filtrar por fecha
- [x] 6.6 Comprobar que la superficie entregada es exactamente listar, consultar, crear y actualizar, contrastando con `node ace list:routes`: sin borrado y sin operaciones de equipo
