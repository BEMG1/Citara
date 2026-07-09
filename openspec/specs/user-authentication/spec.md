# User Authentication

## Purpose
TBD - Defines the authentication flows and session management using Supabase Auth.

## Requirements

### Requirement: Inicialización y disponibilidad del cliente de autenticación
El sistema SHALL inicializar un cliente único de Supabase Auth utilizando `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` inyectadas en tiempo de compilación por el entorno. El cliente SHALL rechazar su inicialización si dichas variables no están definidas.

#### Scenario: Cliente inicializado correctamente
- **WHEN** la aplicación arranca y las variables de entorno de Supabase están configuradas correctamente
- **THEN** la instancia de cliente de Supabase se crea y está disponible globalmente

#### Scenario: Variables faltantes
- **WHEN** la aplicación arranca y faltan las variables de entorno de Supabase
- **THEN** la aplicación registrará un error en consola y no inicializará el cliente

### Requirement: Registro de nuevos usuarios
El sistema SHALL permitir el registro de usuarios proporcionando correo electrónico y contraseña, integrándose con el servicio de Supabase Auth.

#### Scenario: Registro exitoso en Supabase Auth
- **WHEN** un visitante envía el formulario de registro con correo y contraseña válidos
- **THEN** el sistema registra el usuario exitosamente en Supabase Auth y procede al segundo paso de creación de perfil

#### Scenario: Registro fallido por correo duplicado
- **WHEN** un visitante intenta registrarse con un correo ya existente
- **THEN** el sistema muestra el error correspondiente devuelto por Supabase

### Requirement: Inicio de sesión (Login)
El sistema SHALL permitir a los usuarios registrados iniciar sesión proporcionando correo y contraseña.

#### Scenario: Inicio de sesión válido
- **WHEN** un usuario introduce credenciales válidas
- **THEN** el sistema inicia sesión con Supabase Auth y establece la sesión activa en el contexto global

#### Scenario: Inicio de sesión inválido
- **WHEN** un usuario introduce credenciales incorrectas
- **THEN** el sistema muestra un mensaje indicando que no fue posible iniciar sesión

### Requirement: Cierre de sesión (Logout)
El sistema SHALL permitir a un usuario autenticado cerrar su sesión activa de forma segura.

#### Scenario: Usuario cierra sesión
- **WHEN** un usuario autenticado selecciona la opción de cerrar sesión
- **THEN** se elimina la sesión en Supabase Auth y se limpia completamente la información de usuario y perfil del contexto global

### Requirement: Recuperación de sesión automática y eventos
El sistema SHALL consultar la sesión activa al arrancar y SHALL suscribirse a los eventos de estado de autenticación de Supabase para mantener hidratado el contexto en tiempo real.

#### Scenario: Arranque con sesión previa
- **WHEN** la aplicación carga y el navegador mantiene el token de sesión de Supabase
- **THEN** el sistema restaura la sesión del usuario automáticamente sin pedir credenciales

#### Scenario: Expiración de sesión
- **WHEN** el evento de Supabase indica que la sesión ha expirado
- **THEN** el contexto limpia la información del usuario de inmediato
