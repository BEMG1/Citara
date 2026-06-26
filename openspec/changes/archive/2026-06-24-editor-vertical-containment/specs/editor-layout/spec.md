## Capability: editor-layout

### Requirement: Contención Vertical y Manejo de Desbordamiento
El sistema DEBE asegurar que el `DocumentEditor` esté completamente contenido en el layout padre sin forzar el crecimiento del mismo y provocando un scroll global inesperado. Para ello, se deberá calcular la altura dinámicamente usando Flexbox (`flex-1 min-h-0`), y el scroll DEBE estar encapsulado de forma exclusiva y localizada en el área interna del editor (`overflow-y-auto`). La barra de herramientas DEBE integrarse de forma sticky sin chocar y sin bloquear el overflow dinámico, manteniendo los `z-index` y `top-*` correspondientes para no romperse visualmente.
