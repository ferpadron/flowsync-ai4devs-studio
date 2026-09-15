> **Sin tests.** Este change no monta base de pruebas ni escribe tests. Cada tarea se verifica con un comando, una respuesta de la API o una comprobación en pantalla.

## 1. Modelo de datos

- [x] 1.1 Crear la migración de la tabla de tareas con título (columna de texto **sin longitud fija**, ver D2), estado, referencia al usuario responsable y marcas de tiempo; verificar con `node ace migration:run` que corre sin error y que `database/schema.ts` se regenera con la clase de la tarea
- [x] 1.2 Crear el modelo de tarea extendiendo la clase generada y declarando **solo** la relación al usuario responsable; verificar con `node ace repl` que se puede crear y recuperar una tarea con su responsable cargado
- [x] 1.3 Comprobar que el diff incluye `database/schema.ts` regenerado con la clase `TaskSchema`, y que `npm run typecheck` pasa en `backend/`

## 2. API de tareas

- [x] 2.1 Crear el transformer de tarea que expone identificador, título, estado y un responsable recortado a **identificador y nombre** (D4); verificar inspeccionando la respuesta de listado, que no debe contener el correo del responsable
- [x] 2.2 Crear el validador de creación: título obligatorio, recortado de espacios de los extremos (D3) y **sin regla de longitud máxima** (D2); verificar que una petición sin título y otra con solo espacios se rechazan ambas con 422 y error en el campo del título, y que un título muy largo se guarda y se devuelve completo, sin acortar
- [x] 2.3 Crear el validador de actualización según la tabla de D6: estado y responsable omitibles por separado pero no los dos a la vez, estado limitado a `pending` / `in_progress` / `done`, responsable no nulo y que deba existir; verificar que una petición sin ninguno de los dos campos, un estado inventado, un responsable nulo y un responsable inexistente devuelven 422 con el error en el campo que corresponda
- [x] 2.4 Implementar la acción de listado devolviendo todas las tareas del espacio **sin cláusula de ordenación** (D5); verificar que la respuesta trae las tareas de todas las personas, no solo las de quien consulta
- [x] 2.5 Implementar la acción de creación de modo que el servidor fije el estado `pending` y como responsable la persona autenticada que crea la tarea; verificar creando una tarea con solo un título válido y comprobando ambos valores en la respuesta
- [x] 2.6 Implementar la acción de actualización aplicando estado y responsable cuando vengan, y devolviendo 404 si la tarea no existe (D6); verificar cambiando el estado de una tarea ajena y comprobando que se aplica sin ninguna comprobación de propiedad, y que actualizar un identificador inexistente devuelve 404
- [x] 2.7 Registrar las tres rutas dentro del grupo protegido por sesión; verificar con `node ace list:routes` que aparecen exactamente tres rutas de tareas y que una petición sin sesión a cualquiera de ellas devuelve 401, y comprobar que al bootear la aplicación queda regenerado el código de `backend/.adonisjs/` (mapa de controladores y registro Tuyau), incluyéndolo en el diff
- [x] 2.8 Pasar `npm run lint` y `npm run typecheck` en `backend/` sin errores

## 3. Cliente de API y tipos (frontend)

- [x] 3.1 Añadir a `lib/types.ts` los tipos de tarea, de estado y de responsable, con el estado como unión cerrada de los tres identificadores; verificar que `npm run build` falla si se asigna un estado fuera del conjunto
- [x] 3.2 Añadir a `lib/api.ts` las tres llamadas (listar, crear, actualizar), desenvolviendo el `{ data }` y adjuntando la sesión como hacen las llamadas existentes; verificar desde la pantalla que el listado se pinta con datos reales del backend
- [x] 3.3 Ampliar la traducción de errores de `lib/api.ts` con las reglas y etiquetas nuevas (título, estado, responsable); verificar que crear sin título muestra un mensaje en castellano junto al campo y no el texto en inglés del servidor

## 4. Pantalla de la lista

- [x] 4.1 Crear la página de la lista reutilizando **solo** los componentes ya presentes en `components/ui/` (`card`, `button`, `input`, `label`, `alert`); verificar que no se ha añadido ningún fichero nuevo a `components/ui/` ni ninguna dependencia a `package.json`
- [x] 4.2 Pintar cada entrada con título, nombre del responsable y estado en castellano, mostrando «Sin nombre» cuando el responsable no tenga nombre; verificar creando una cuenta sin nombre, creando una tarea con ella y comprobando el literal en la lista
- [x] 4.3 Comprobar que ninguna entrada muestra fechas ni marcas de vencida, y que el correo del responsable no aparece en ningún punto de la pantalla
- [x] 4.4 Añadir el formulario de creación con el título como **único** campo; verificar recorriendo el flujo entero que no se ofrece ni se sugiere responsable, estado ni fecha
- [x] 4.5 Hacer que la tarea recién creada aparezca en la lista sin recargar ni navegar; verificar creando una tarea y viéndola aparecer en la misma pantalla
- [x] 4.6 Añadir el cambio de estado con los tres botones por entrada (D7), con el estado actual marcado y la fila sustituida por la tarea que devuelve el servidor (D8); verificar que cambiar un estado cuesta una sola acción, sin abrir la tarea, sin diálogo y sin rellenar campos, que los únicos destinos ofrecidos son los tres, y que la fila refleja el nuevo estado al confirmarse la respuesta
- [x] 4.7 Verificar que se puede cambiar el estado de una tarea cuyo responsable es otra persona, sin advertencia ni permiso especial
- [x] 4.8 Añadir el estado vacío con la explicación de qué es la lista y la invitación a crear la primera tarea; verificar con la base recién migrada que no aparece una lista vacía sin más
- [x] 4.9 Registrar la ruta de la lista bajo el guard de rutas protegidas y añadir el enlace desde el perfil, **sin tocar el destino tras iniciar sesión ni la redirección de rutas desconocidas** (D9); verificar que sin sesión la ruta redirige a inicio de sesión y que tras entrar se sigue aterrizando en el perfil
- [x] 4.10 Pasar `npm run lint` y `npm run build` en `frontend/` sin errores

## 5. Verificación de extremo a extremo

- [x] 5.1 Con dos cuentas distintas, comprobar que ambas ven exactamente el mismo conjunto de tareas y que una tarea creada por una aparece en la lista de la otra al recargar
- [x] 5.2 Recorrer la aplicación comprobando que no existe ninguna vista de «mis tareas» separada de la lista del equipo, ni forma alguna de crear una tarea privada
- [x] 5.3 Abrir la lista y recorrerla sin pulsar nada, comprobando después que ninguna tarea ha cambiado de estado ni de responsable
- [x] 5.4 Comprobar que la superficie entregada es exactamente listar, crear y actualizar —sin lectura individual, sin borrado y sin operaciones de equipo— contrastando con `node ace list:routes`. Es la frontera de alcance de este change, no una promesa permanente de la capability
