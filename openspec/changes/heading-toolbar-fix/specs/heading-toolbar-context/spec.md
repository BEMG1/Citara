## ADDED Requirements

### Requirement: Deshabilitación de controles de alineación en encabezados
Cuando el cursor o la selección activa se encuentre sobre un bloque de tipo encabezado (H1, H2 o H3), los botones de alineación (izquierda, centrar, derecha) de la barra de herramientas SHALL permanecer deshabilitados y con apariencia visual de inactivos. Al mover el cursor a un párrafo normal, los controles SHALL volver a habilitarse automáticamente.

#### Scenario: Cursor sobre H1
- **WHEN** el cursor está posicionado dentro de un bloque Título Nivel 1
- **THEN** los botones de alinear izquierda, centrar y alinear derecha están deshabilitados

#### Scenario: Cursor sobre H2
- **WHEN** el cursor está posicionado dentro de un bloque Título Nivel 2
- **THEN** los botones de alinear izquierda, centrar y alinear derecha están deshabilitados

#### Scenario: Cursor sobre H3
- **WHEN** el cursor está posicionado dentro de un bloque Título Nivel 3
- **THEN** los botones de alinear izquierda, centrar y alinear derecha están deshabilitados

#### Scenario: Cursor en párrafo normal
- **WHEN** el cursor se mueve a un bloque de párrafo normal
- **THEN** los botones de alineación están habilitados y permiten interacción

### Requirement: Creación automática de párrafo normal al presionar Enter en encabezado
Cuando el usuario presione `Enter` estando dentro de un bloque de encabezado (H1, H2 o H3), el editor SHALL finalizar el encabezado actual y crear un nuevo bloque de tipo párrafo normal con la sangría predeterminada activada (`indent: true`). El nuevo bloque NO SHALL heredar el estilo del encabezado.

#### Scenario: Enter al final de H1
- **WHEN** el cursor está al final de un Título Nivel 1 y el usuario presiona Enter
- **THEN** se crea un nuevo párrafo normal con sangría activa debajo del H1

#### Scenario: Enter al final de H2
- **WHEN** el cursor está al final de un Título Nivel 2 y el usuario presiona Enter
- **THEN** se crea un nuevo párrafo normal con sangría activa debajo del H2

#### Scenario: Enter al final de H3
- **WHEN** el cursor está al final de un Título Nivel 3 y el usuario presiona Enter
- **THEN** se crea un nuevo párrafo normal con sangría activa debajo del H3

#### Scenario: El nuevo párrafo no conserva estilo de heading
- **WHEN** se crea el nuevo bloque tras presionar Enter en un encabezado
- **THEN** el bloque creado tiene tipo párrafo y no tiene propiedades de encabezado activas
