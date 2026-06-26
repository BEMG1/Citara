## Why

Se requiere ajustar y corregir comportamientos específicos en la edición de texto relacionados con la alineación automática de encabezados y párrafos, así como devolver la barra de herramientas a la parte superior del editor para que permanezca visible mediante scroll (sticky top) pero sin los problemas anteriores.

## What Changes

- **Alineación de H1**: Forzar que los encabezados nivel 1 (H1) adquieran alineación centrada de forma automática al ser aplicados.
- **Justificación de Párrafos**: Asegurar que la opción de párrafo aplique alineación justificada automáticamente de forma consistente.
- **Barra de Herramientas**: Reubicar la barra de herramientas principal en la parte superior del contenedor del editor, ajustando el CSS para que se mantenga anclada (`sticky top-0`) sin generar problemas de superposición.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `rich-text-toolbar`: Se modifican los requerimientos de alineación automática para H1 y Párrafos, y la ubicación fija de la barra en la parte superior.

## Impact

- `src/components/DocumentEditor/DocumentEditor.tsx`: Actualización de la posición del componente de la barra, y configuración de los nodos H1/Paragraph en Tiptap para forzar estilos por defecto o interceptar el cambio de nodo.
