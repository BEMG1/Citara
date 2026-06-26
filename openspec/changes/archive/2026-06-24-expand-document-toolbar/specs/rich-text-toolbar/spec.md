## ADDED Requirements

### Requirement: Formato de Texto Básico
El sistema DEBE proveer la funcionalidad para aplicar y remover formato de negrita, cursiva y subrayado.

#### Scenario: Aplicación de Negrita mediante botón
- **WHEN** el usuario selecciona un texto y presiona el botón "Negrita"
- **THEN** el texto seleccionado adquiere formato de negrita

#### Scenario: Aplicación de Cursiva mediante atajo
- **WHEN** el usuario selecciona un texto y presiona `Ctrl+I`
- **THEN** el texto seleccionado adquiere formato de cursiva

### Requirement: Listas
El sistema DEBE permitir la creación de listas de viñetas y numeradas, y su anidamiento con `Tab`. Además, las listas de viñetas DEBEN tener auto-formato.

#### Scenario: Anidamiento de lista
- **WHEN** el usuario se encuentra en un elemento de lista y presiona `Tab`
- **THEN** el elemento actual se anida un nivel dentro de la lista padre

#### Scenario: Auto-formato de lista de viñetas
- **WHEN** el usuario finaliza la edición de un elemento en una lista de viñetas (ej. presionando Enter)
- **THEN** el sistema automáticamente capitaliza la primera letra y añade un punto al final si no existe

#### Scenario: Continuidad de lista
- **WHEN** el usuario presiona `Enter` en un elemento de lista que contiene texto
- **THEN** se crea un nuevo elemento de lista inmediatamente después

#### Scenario: Salida de lista
- **WHEN** el usuario presiona `Enter` en un elemento de lista que se encuentra vacío
- **THEN** el elemento vacío se elimina y el cursor regresa a un bloque de formato base (párrafo normal)

### Requirement: Enlaces
El sistema DEBE permitir la inserción y edición de enlaces en el documento.

#### Scenario: Inserción de enlace
- **WHEN** el usuario hace clic en "Insertar Enlace" y provee una URL
- **THEN** el texto seleccionado se convierte en un enlace interactivo

### Requirement: Alineación
El sistema DEBE proveer opciones de alineación de texto: Izquierda, Centro y Derecha.

#### Scenario: Alineación al centro
- **WHEN** el usuario posiciona el cursor en un párrafo y selecciona "Centrar"
- **THEN** el párrafo se alinea al centro del documento

### Requirement: Estado Activo y Accesibilidad
El sistema DEBE sincronizar el estado visual de los botones con el formato del cursor y permitir navegación por teclado.

#### Scenario: Sincronización de estado
- **WHEN** el usuario mueve el cursor a una palabra en Negrita
- **THEN** el botón "Negrita" de la barra de herramientas se marca visualmente como activo

### Requirement: Salto de Línea Exportable
El sistema DEBE soportar un salto de línea estricto con `Shift + Enter` que persista al exportar a formatos externos como Word.

#### Scenario: Salto de línea con Shift + Enter
- **WHEN** el usuario presiona `Shift + Enter`
- **THEN** se inserta un salto de línea real (ej. `<br>`) que evita la agrupación de texto al exportar

### Requirement: Barra de Herramientas Fija
El sistema DEBE mantener la barra de herramientas visible de forma anclada.

#### Scenario: Scroll en el editor
- **WHEN** el usuario hace scroll hacia abajo en un documento largo
- **THEN** la barra de formato permanece visible en la parte superior del área de edición

### Requirement: Fidelidad de Exportación (Word y PDF)
El sistema DEBE garantizar que todo formato aplicado en el editor (negrita, cursiva, subrayado, listas, interlineado, alineación, títulos) se conserve intacto al exportar el documento.

#### Scenario: Exportación exacta a Word y PDF
- **WHEN** el usuario exporta el documento a formato Word o PDF
- **THEN** el archivo resultante muestra exactamente el mismo formato visual, tipos de alineación y estructuración de listas que se aplicó en el editor web
