## Why

Actualmente, el `DocumentEditor` incluye funcionalidad para gestionar hipervínculos, que no es estrictamente necesaria para el enfoque del formateador APA en este momento. A su vez, se necesita control explícito sobre la sangría automática de los párrafos (identación por defecto en APA), ya que algunos elementos especiales (títulos, citas en bloque) no llevan sangría de la misma manera que los párrafos regulares. Reemplazar la funcionalidad de hipervínculos por un toggle de "Sangría automática" simplifica el editor y añade una herramienta muy requerida para cumplir normas de estilo de forma flexible.

## What Changes

- Eliminar de `DocumentEditor.tsx` el botón de insertar hipervínculo y toda la lógica asociada (estados modales de link, comandos Tiptap para links).
- Reemplazarlo por un nuevo control "Sangría automática" en la barra de herramientas.
- Este control debe tener un estado activo/inactivo (por defecto activo al cargar).
- Al crear nuevos párrafos (presionar Enter), Tiptap deberá aplicar sangría si el estado está activo.
- El botón utilizará el icono de sangría (`Indent` y `Outdent` o `Pilcrow`) reflejando visualmente si está encendido (fondo resaltado) o apagado (estilo inactivo normal).

## Capabilities

### New Capabilities
- `auto-indent`: Define la capacidad de activar/desactivar la sangría automática en los párrafos de forma dinámica durante la redacción.

### Modified Capabilities
- `rich-text-toolbar`: Se remueve el soporte de hipervínculos y se agrega el soporte visual para el toggle de indentación.

## Impact

- `src/components/DocumentEditor/DocumentEditor.tsx`: Modificación extensa para eliminar la extensión y UI de links, y agregar el estado y handler para auto-indentación de párrafos.
