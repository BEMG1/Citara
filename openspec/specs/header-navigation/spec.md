# Header Navigation

## Purpose
TBD - Defines the behavior of the main application header, including navigation and authentication controls.

## Requirements

### Requirement: Opciones de autenticación en la barra de navegación
El sistema SHALL mostrar los controles de usuario o inicio de sesión en el componente `Header`, ubicados a la derecha y visualmente separados del resto de las herramientas de la barra.

#### Scenario: Usuario no autenticado
- **WHEN** un visitante visualiza la aplicación y no existe sesión activa
- **THEN** el `Header` muestra los botones "Iniciar Sesión" y "Crear Cuenta" a la derecha, con un separador visual a la izquierda de estos

#### Scenario: Usuario autenticado
- **WHEN** un usuario con sesión activa visualiza la aplicación
- **THEN** el `Header` muestra un acceso rápido a su perfil (ej. avatar o su nombre/plan), ocultando los botones de inicio de sesión y registro
