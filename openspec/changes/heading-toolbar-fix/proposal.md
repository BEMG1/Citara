## Why

La barra de herramientas del editor permite modificar la alineación de texto mientras el cursor está sobre un encabezado (H1, H2, H3), algo que viola las restricciones de estilo definidas por las normas APA. Además, al presionar Enter al final de un encabezado, el editor no crea un párrafo nuevo correctamente: mantiene el estilo del encabezado o no activa la sangría por defecto, obligando al usuario a ajustar manualmente el formato.

## What Changes

- Los botones de alineación (izquierda, centro, derecha) se deshabilitan visualmente y funcionalmente cuando el cursor está sobre cualquier encabezado H1/H2/H3.
- Al presionar Enter al final de un encabezado, se crea automáticamente un nuevo párrafo normal con sangría activada, sin heredar el estilo del encabezado.
- La barra de herramientas recalcula su estado en cada cambio de selección o posición del cursor para reflejar correctamente el contexto activo.

## Capabilities

### New Capabilities
- `heading-toolbar-context`: Comportamiento contextual de la barra de herramientas según el tipo de bloque activo (encabezado vs. párrafo), incluyendo deshabilitación de controles de alineación para encabezados y creación automática de párrafo normal al presionar Enter desde un encabezado.

### Modified Capabilities
<!-- Sin cambios a specs existentes -->

## Impact

- `src/components/DocumentEditor/DocumentEditor.tsx`: Lógica de la barra de herramientas (botones de alineación) y el comportamiento del `Enter` en encabezados mediante extensión de Tiptap o keyboard shortcut.
- Sin cambios en dependencias externas.
- Sin cambios en la API ni en el contrato de datos del editor.
