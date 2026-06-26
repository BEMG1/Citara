## ADDED Requirements

### Requirement: Prioridad visual de las ventanas modales
El sistema DEBERÁ garantizar que toda ventana modal (incluyendo su overlay o fondo oscuro) se visualice por encima de cualquier otro componente de la interfaz, en particular de la barra de herramientas fija del editor.

#### Scenario: Apertura del modal de exportación
- **WHEN** el usuario selecciona la opción de exportar o abre cualquier ventana modal de la aplicación
- **THEN** el contenido del modal y su overlay deben mostrarse completamente sin que la barra de herramientas fija interrumpa o cubra parcial/totalmente su visualización.

### Requirement: Conservación del comportamiento Sticky de la barra
El sistema DEBERÁ preservar el posicionamiento fijo de la barra de herramientas del editor sin importar el ajuste realizado a la jerarquía de apilamiento en el eje Z.

#### Scenario: Barra fija durante el desplazamiento
- **WHEN** el usuario navega verticalmente a través del documento sin abrir ningún modal
- **THEN** la barra de herramientas debe permanecer fijada en la parte superior del contenedor, quedando siempre por encima del texto e imágenes del documento.

### Requirement: Restauración automática del apilamiento
El sistema DEBERÁ restituir el comportamiento visual habitual tan pronto se cierren los modales.

#### Scenario: Cierre del modal
- **WHEN** existe una ventana modal abierta por encima de la barra y el usuario procede a cerrarla
- **THEN** la barra de herramientas deberá continuar siendo el elemento con mayor precedencia sobre el documento, permaneciendo visible y funcional sin requerir acciones adicionales por parte del usuario.
