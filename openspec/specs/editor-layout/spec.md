## Capability: editor-layout

### Requirement: Contención Vertical y Manejo de Desbordamiento
El sistema DEBE asegurar que el `DocumentEditor` esté completamente contenido en el layout padre sin forzar el crecimiento del mismo y provocando un scroll global inesperado. Para ello, se deberá calcular la altura dinámicamente usando Flexbox (`flex-1 min-h-0`), y el scroll DEBE estar encapsulado de forma exclusiva y localizada en el área interna del editor (`overflow-y-auto`). La barra de herramientas DEBE integrarse de forma sticky sin chocar y sin bloquear el overflow dinámico, manteniendo los `z-index` y `top-*` correspondientes para no romperse visualmente.


### Requirement: Layout Unificado para Editor y Toolbar
El sistema DEBE unificar la estructura visual del componente de edición en un contenedor padre (`flex flex-col h-full min-h-0`). Este contenedor incluirá primero a la barra de herramientas (`sticky top-16 z-40 bg-[color] shadow-md`) para que respete el Header (z: 100), y luego, como hermano separado y en la misma jerarquía flex, al contenedor del área de edición (`flex-1 min-h-0 overflow-y-auto`). Esto DEBE garantizar que la altura se asigne dinámicamente, que los scrolls no generen conflicto y que la barra siempre repose encima sin desbordar su propio espacio ni el de la página general.

