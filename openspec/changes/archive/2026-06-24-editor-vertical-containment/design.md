## Context
El editor está desbordando el layout verticalmente debido a que no está restringido a encogerse (en un entorno flex) y no está manejando correctamente su scroll interno, forzando un scroll en el layout principal.

## Goals / Non-Goals
**Goals:**
- Ajustar el contenedor del `DocumentEditor` en `src/components/DocumentEditor/DocumentEditor.tsx` para que utilice el espacio restante (`flex-1`) pero pueda encogerse (`min-h-0`).
- Reintegrar `overflow-y-auto` en el contenedor del editor de manera que el scroll ocurra internamente y no rompa el comportamiento sticky de la barra de herramientas.

**Non-Goals:**
- Cambiar el layout principal de la aplicación fuera del `DocumentEditor`.

## Decisions
- Se agregará `min-h-0` al contenedor externo en `DocumentEditor.tsx`.
- Se aplicará `overflow-y-auto` al contenedor del área de edición (`Editor area`) de manera que restrinja su crecimiento y permita scroll interno, manteniendo el toolbar sticky.
- Nos aseguraremos de que la estructura de clases sea coherente:
```html
<div class="flex flex-col h-full bg-[var(--surface)] relative min-h-0">
  <div class="relative flex-1 w-full overflow-y-auto min-h-0 ...">
    <div class="sticky top-0 z-40 bg-[var(--surface)] shadow-md ...">Toolbar</div>
    <EditorContent />
  </div>
</div>
```
Al mover el scroll a este sub-contenedor, el `sticky` debe usar `top-0` (relativo a este contenedor) para mantenerse anclado en la parte superior sin chocar con el header (que está por fuera del contenedor).
