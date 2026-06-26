## Why

Actualmente, la barra de herramientas del editor (implementada con comportamiento fijo o *sticky*) tiene un valor de `z-index` superior a las ventanas modales de la aplicación (como el diálogo de exportación). Esto causa que la barra se superponga al contenido del modal, ocultando información y rompiendo la jerarquía visual de la interfaz. Se requiere corregir este comportamiento para que cualquier modal tenga el nivel de renderizado más alto, sin afectar la naturaleza fija de la barra de herramientas.

## What Changes

- Modificación del orden de apilamiento (*stacking order*) de la barra de herramientas y las ventanas modales (ej. modal de exportación).
- Se centralizarán y ajustarán los valores de `z-index` para asegurar que los modales (y sus *overlays*) siempre queden por encima de elementos fijos como el *toolbar*.
- Preservación íntegra del comportamiento *sticky* de la barra durante el desplazamiento vertical del documento.

## Capabilities

### New Capabilities
- `modal-zindex-hierarchy`: Define la jerarquía visual de la aplicación asegurando la prioridad de los modales sobre elementos fijos.

### Modified Capabilities
- Ninguna.

## Impact

- **UI Components:** Afecta a todos los modales (incluyendo los de exportación, alertas o confirmación) y al contenedor de la barra de herramientas del editor principal.
- **Estilos CSS/Tailwind:** Requerirá ajustes en las clases o estilos en línea que gestionan el `z-index` de estos componentes para garantizar consistencia.
