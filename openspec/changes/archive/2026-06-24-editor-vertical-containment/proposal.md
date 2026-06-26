## Why

Actualmente el `DocumentEditor` excede los límites verticales del contenedor que lo alberga dentro del layout principal. Esto provoca que el editor se extienda más allá del espacio visual asignado, generando scrolls adicionales/inesperados, rompiendo la alineación visual con otros paneles y dejando parte del contenido fuera del viewport. Este problema surge porque el contenedor usa `overflow` libre o su entorno flex no le permite encogerse (`min-height: auto`), lo que hace que empuje los límites del layout y fuerce un scroll global en lugar de uno local en el editor.

## What Changes

- Aplicar `min-h-0` y `flex-1` a los contenedores padre del `DocumentEditor` para garantizar que el editor se restrinja al espacio sobrante disponible en el layout, sin empujar los límites.
- Asegurar que el contenedor del editor tenga `overflow-y-auto` explícito para manejar el scroll del contenido de forma local, en lugar de delegarlo a la ventana principal.
- Eliminar cualquier altura fija (`h-[Xpx]`, `min-h-[Xpx]`) que impida la adaptabilidad vertical del componente.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `editor-layout`: Se establece que la contención vertical del editor debe ser estricta, limitando el scroll al propio contenedor de texto, respetando la estructura flexbox del layout principal.

## Impact

- `src/components/DocumentEditor/DocumentEditor.tsx`: Modificación de las clases del contenedor principal (añadiendo `min-h-0`, `flex-1` y `overflow-y-auto`) para delegar el control de scroll al contenedor interno sin romper el comportamiento de la barra de herramientas.
