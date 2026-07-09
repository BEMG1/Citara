# User Profile and Plans

## Purpose
TBD - Defines the user profile persistence in the users table and mapping of plans (Free/Premium).

## Requirements

### Requirement: Creación inicial del perfil en tabla users
Inmediatamente después de que un usuario se registra exitosamente en Supabase Auth, el sistema SHALL insertar un registro en la tabla `users` asociando el `id` (UUID de Auth), `email` y `user_type` numérico proporcionado por el formulario de registro (0 = Gratuito, 1 = Premium).

#### Scenario: Creación de perfil gratuito
- **WHEN** un usuario completa su registro eligiendo el plan "Gratuito"
- **THEN** se inserta un registro en `users` con el UUID generado, el email y `user_type: 0`

#### Scenario: Creación de perfil premium
- **WHEN** un usuario completa su registro eligiendo el plan "Premium"
- **THEN** se inserta un registro en `users` con el UUID generado, el email y `user_type: 1`

### Requirement: Consulta de perfil en el inicio o recuperación de sesión
Siempre que se detecte una sesión activa (ya sea por inicio de sesión o por recuperación automática), el sistema SHALL consultar la tabla `users` mediante el cliente de Supabase para cargar la información del perfil del usuario en el `AuthContext`.

#### Scenario: Perfil cargado exitosamente
- **WHEN** el usuario inicia sesión
- **THEN** el sistema obtiene el registro correspondiente de la tabla `users` y expone `userType` y `lastGeneration` en el contexto global

#### Scenario: Fallo al obtener el perfil
- **WHEN** hay una sesión activa pero la consulta a la tabla `users` falla (ej. error de red)
- **THEN** el usuario permanece autenticado pero se registra un error, indicando que no fue posible cargar la información del perfil

### Requirement: Exposición y traducción visual del plan
El sistema SHALL exponer globalmente el perfil (incluyendo `userType`) mediante el `AuthContext`. En las vistas de perfil, la aplicación SHALL traducir los valores numéricos `0` y `1` a las cadenas amigables "Gratuito" y "Premium".

#### Scenario: Traducción de usuario gratuito
- **WHEN** la interfaz dibuja el perfil de un usuario con `userType` 0
- **THEN** la pantalla muestra explícitamente "Gratuito" sin mostrar "0"

#### Scenario: Traducción de usuario premium
- **WHEN** la interfaz dibuja el perfil de un usuario con `userType` 1
- **THEN** la pantalla muestra explícitamente "Premium" sin mostrar "1"
