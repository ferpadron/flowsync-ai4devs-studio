# Auth

## Purpose

Esta capability cubre el registro de cuentas, el inicio y el cierre de sesión, la permanencia de la sesión en el navegador y la consulta del perfil propio, junto con la protección de las pantallas y los datos que requieren estar autenticado.

## Requirements

### Requirement: Registro de cuenta

El sistema SHALL permitir crear una cuenta nueva a partir de un email único, una contraseña y su confirmación, y SHALL dejar iniciada la sesión de esa cuenta sin un paso de acceso adicional.

#### Scenario: Registro válido

- **WHEN** una persona envía nombre completo (opcional), un email no registrado previamente, una contraseña de entre 8 y 32 caracteres y una confirmación idéntica a la contraseña
- **THEN** el sistema crea la cuenta y responde con los datos del usuario, sin incluir la contraseña, y con una credencial de sesión válida para acceder a los recursos protegidos

#### Scenario: Sesión iniciada tras el registro

- **WHEN** una persona completa el registro con éxito desde la aplicación
- **THEN** queda autenticada de inmediato y accede a su perfil sin pasar por la pantalla de inicio de sesión

#### Scenario: Email ya registrado

- **WHEN** una persona intenta registrarse con un email que ya pertenece a otra cuenta
- **THEN** el sistema rechaza la petición sin crear la cuenta y devuelve un error asociado al campo email que identifica el email como ya utilizado

#### Scenario: Contraseña y confirmación no coinciden

- **WHEN** una persona envía una confirmación de contraseña distinta de la contraseña
- **THEN** el sistema rechaza la petición y devuelve un error asociado al campo de confirmación de contraseña, sin crear la cuenta

#### Scenario: Contraseña fuera del rango permitido

- **WHEN** una persona envía una contraseña con menos de 8 caracteres o con más de 32
- **THEN** el sistema rechaza la petición sin crear la cuenta y devuelve un error por cada campo de contraseña que incumpla el rango, de modo que la contraseña y su confirmación pueden venir señaladas a la vez

#### Scenario: Email con formato inválido

- **WHEN** una persona envía un valor que no tiene formato de email válido
- **THEN** el sistema rechaza la petición y devuelve un error asociado al campo email, sin crear la cuenta

### Requirement: Inicio de sesión

El sistema SHALL permitir autenticarse con el email y la contraseña de una cuenta existente, y SHALL entregar en ese caso una credencial de sesión con la que acceder a los recursos protegidos.

#### Scenario: Credenciales correctas

- **WHEN** una persona envía el email y la contraseña correctos de una cuenta existente
- **THEN** el sistema responde con los datos del usuario y con una credencial de sesión válida para acceder a los recursos protegidos

#### Scenario: Credenciales incorrectas

- **WHEN** una persona envía un email bien formado que no corresponde a ninguna cuenta, o el email de una cuenta existente con una contraseña incorrecta
- **THEN** el sistema rechaza la petición con el mismo error genérico de credenciales inválidas en ambos casos, sin señalar cuál de los dos datos ha fallado, y no entrega ninguna credencial de sesión

#### Scenario: Datos de acceso mal formados o vacíos

- **WHEN** una persona intenta iniciar sesión con un email que no tiene formato válido, o dejando vacío el email o la contraseña
- **THEN** el sistema rechaza la petición con errores asociados a cada campo afectado, que son distintos del error genérico de credenciales inválidas

### Requirement: Consulta del perfil propio

El sistema SHALL permitir a una persona autenticada consultar los datos de su propia cuenta, y SHALL rechazar esa consulta si no presenta una credencial de sesión válida.

#### Scenario: Perfil con sesión válida

- **WHEN** una persona autenticada con una credencial de sesión válida solicita su perfil
- **THEN** el sistema responde con su identificador, nombre completo, email, iniciales y fechas de alta y última actualización, sin incluir la contraseña

#### Scenario: Perfil sin autenticación

- **WHEN** alguien solicita el perfil sin credencial de sesión, o con una credencial inválida, revocada o desconocida
- **THEN** el sistema rechaza la petición indicando que el acceso no está autorizado

### Requirement: Revocación de la sesión en el servidor

El sistema SHALL permitir a una persona autenticada revocar la credencial de sesión con la que realiza la petición, de forma que deje de ser válida para peticiones posteriores.

#### Scenario: Cierre de sesión con credencial vigente

- **WHEN** una persona autenticada solicita cerrar sesión y la petición llega al servidor y se procesa correctamente
- **THEN** el sistema revoca la credencial usada en esa petición y confirma que la sesión se ha cerrado

#### Scenario: Reutilización de una credencial ya revocada

- **WHEN** se usa para acceder a un recurso protegido una credencial revocada por un cierre de sesión previo
- **THEN** el sistema rechaza la petición indicando que el acceso no está autorizado

### Requirement: Permanencia de la sesión en el navegador

El sistema SHALL mantener abierta la sesión de una persona entre recargas y entre visitas, incluso tras cerrar y volver a abrir el navegador, y SHALL revalidarla contra el servidor cada vez que se abre la aplicación.

#### Scenario: Reapertura de la aplicación con una sesión que el servidor acepta

- **WHEN** una persona vuelve a abrir o recarga la aplicación con una sesión guardada de una visita anterior que el servidor sigue aceptando
- **THEN** la aplicación muestra brevemente un estado de carga y a continuación restaura la sesión con los datos de perfil de esa persona, sin pedirle que vuelva a iniciar sesión

#### Scenario: Reapertura de la aplicación con una sesión que el servidor ya no acepta

- **WHEN** una persona vuelve a abrir la aplicación con una sesión guardada que el servidor rechaza por estar revocada, ser inválida o resultar desconocida
- **THEN** la aplicación descarta la sesión guardada, trata a la persona como no autenticada y le muestra el aviso «Tu sesión ha caducado. Vuelve a iniciar sesión.», que es el texto que la aplicación usa ante cualquier rechazo del servidor y no implica que la credencial haya expirado por tiempo

#### Scenario: Reapertura de la aplicación cuando el servidor no responde

- **WHEN** una persona vuelve a abrir la aplicación con una sesión guardada y la validación no llega a completarse porque el servidor está inaccesible o falla por su cuenta, en lugar de rechazar la sesión
- **THEN** la aplicación conserva la sesión guardada, deja de tratar a la persona como autenticada durante esa carga y le muestra un aviso sobre el problema de conexión o de servidor distinto del de sesión rechazada; una carga posterior vuelve a intentar la validación y, si el servidor ya responde, la sesión se restaura sin pedir credenciales

#### Scenario: Cierre de sesión desde la aplicación

- **WHEN** una persona autenticada pulsa la opción de cerrar sesión
- **THEN** la aplicación olvida la sesión guardada y deja de tratarla como autenticada de inmediato, antes de conocer el resultado de la petición al servidor y con independencia de él; si esa petición no llega a procesarse, la credencial queda sin revocar en el servidor aunque la sesión ya esté cerrada en la aplicación

### Requirement: Protección de rutas según el estado de sesión

El sistema SHALL restringir el acceso a las pantallas de la aplicación según si la persona está autenticada o no, redirigiéndola a la pantalla adecuada en cada caso.

#### Scenario: Acceso a una pantalla protegida sin sesión

- **WHEN** una persona sin sesión activa intenta abrir una pantalla que requiere autenticación (por ejemplo, el perfil)
- **THEN** la aplicación la redirige a la pantalla de inicio de sesión

#### Scenario: Acceso a las pantallas de acceso ya autenticado

- **WHEN** una persona con sesión activa intenta abrir la pantalla de inicio de sesión o la de registro
- **THEN** la aplicación la redirige a su pantalla de perfil

#### Scenario: Ruta desconocida

- **WHEN** una persona navega a una dirección de la aplicación que no corresponde a ninguna pantalla conocida
- **THEN** la aplicación la redirige a la pantalla de perfil, que a su vez la enviará a inicio de sesión si no tiene sesión activa

### Requirement: Presentación de los fallos de validación en los formularios de acceso

El sistema SHALL presentar en las pantallas de inicio de sesión y registro los fallos de validación en español, con un texto propio de la aplicación construido a partir del tipo de fallo y del campo afectado, y con un texto genérico de respaldo cuando el tipo de fallo no esté entre los reconocidos.

#### Scenario: Fallo en un campo visible del formulario

- **WHEN** el servidor rechaza un envío de inicio de sesión o de registro con fallos que corresponden a campos presentes en ese formulario
- **THEN** la aplicación muestra cada fallo, en español, debajo del campo al que corresponde

#### Scenario: Fallo no asociable a un campo del formulario

- **WHEN** el servidor rechaza el envío con un fallo general (como credenciales incorrectas) o con un fallo de un campo que no se muestra en ese formulario
- **THEN** la aplicación muestra un mensaje general de error, en español, en la parte superior del formulario

#### Scenario: Confirmación de contraseña distinta en el registro

- **WHEN** una persona rellena el formulario de registro con una confirmación de contraseña distinta de la contraseña y lo envía
- **THEN** la aplicación muestra el fallo en español debajo del campo de confirmación de contraseña
