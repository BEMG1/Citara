## Capability: editor-layout

### Requirement: Layout Unificado para Editor y Toolbar
El sistema DEBE unificar la estructura visual del componente de edición en un contenedor padre (`flex flex-col h-full min-h-0`). Este contenedor incluirá primero a la barra de herramientas (`sticky top-16 z-40 bg-[color] shadow-md`) para que respete el Header (z: 100), y luego, como hermano separado y en la misma jerarquía flex, al contenedor del área de edición (`flex-1 min-h-0 overflow-y-auto`). Esto DEBE garantizar que la altura se asigne dinámicamente, que los scrolls no generen conflicto y que la barra siempre repose encima sin desbordar su propio espacio ni el de la página general.
