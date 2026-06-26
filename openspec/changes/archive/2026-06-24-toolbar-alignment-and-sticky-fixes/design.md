## Context

El usuario requiere que los H1 se alineen automáticamente al centro, y los párrafos justificados. Adicionalmente, la barra de herramientas que había sido movida a la parte inferior (`sticky bottom-0`) debe regresar a la parte superior (`sticky top-0`) dentro del contenedor del editor, para que permanezca visible al hacer scroll.

## Goals / Non-Goals

**Goals:**
- Configurar Tiptap para que aplique alineación al cambiar un nodo a H1.
- Configurar Tiptap para que aplique alineación justificada al cambiar a párrafo.
- Modificar el layout de `DocumentEditor.tsx` para que la barra de herramientas esté arriba y sea `sticky`.

## Decisions

- **Alineación H1 y Párrafos**: Usar interceptores o atar el comando de toggle. En Tiptap, cuando se hace `toggleHeading({ level: 1 })`, podemos encadenar `setTextAlign('center')`. Para Párrafos `setParagraph()`, podemos encadenar `setTextAlign('justify')`. Otra opción es extender los nodos `Heading` y `Paragraph` para tener una alineación por defecto, pero encadenar los comandos en los botones de la barra de formato y el menú burbuja es más seguro y explícito.
- **Barra fija**: Mover la barra de herramientas justo antes del `EditorArea`, y que el contenedor del editor tenga `overflow-y-auto`, mientras la barra tiene `sticky top-0 z-50`. Para evitar superposición con el App Header, el `sticky` opera sobre el contenedor con overflow, no sobre el body.

## Risks / Trade-offs

- Si se aplican alineaciones automáticas por botones, el usuario que cambie de formato mediante markdown (ej. `# ` para H1) podría no obtener el alineado. Para cubrir eso, es mejor un plugin o capturar la transacción si es estricto. Por simplicidad, ajustaremos los botones de formato.
