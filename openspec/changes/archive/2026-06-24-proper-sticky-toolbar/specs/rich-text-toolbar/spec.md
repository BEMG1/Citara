## Capability: rich-text-toolbar

### Requirement: Comportamiento Sticky con Límite (Revisión)
El sistema DEBE mantener la barra de herramientas visible mientras el usuario navega por el contenido del documento, anclándose (sticky) debajo del Header de la aplicación (`top-16` o similar), con un `z-index` de 40 para no superponerse sobre el Header principal (100) ni sus popups (50). Su persistencia debe estar estrictamente limitada a la extensión vertical del área editable del documento; si esta área se desplaza fuera del viewport, la barra de herramientas debe desplazarse fuera también.
