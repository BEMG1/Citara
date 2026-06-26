## Capability: auto-indent

### Requirement: Botón de Auto-Sangría y Eliminación de Hipervínculos
El sistema DEBE reemplazar toda la funcionalidad de hipervínculos por un botón de "Sangría automática". Este botón mantendrá un estado global (`true` por defecto) en el editor. Cuando esté activo, los nuevos párrafos creados (al presionar Enter) deberán inicializarse con una sangría según norma (text-indent: 1.27cm). Los párrafos existentes no se modificarán. El icono del botón cambiará de estado visualmente (Indent / Outdent) reflejando si está activado o desactivado, reutilizando el espacio que antes ocupaba el botón de link.
