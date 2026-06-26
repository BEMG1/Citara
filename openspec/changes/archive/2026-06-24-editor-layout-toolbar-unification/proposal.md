## Why

La gestión de layout actual no logra una contención perfecta y el comportamiento de la toolbar se ve afectado por la estructura HTML. Para solucionar esto de manera holística, se unificará el control estableciendo un contenedor raíz estricto (`flex flex-col h-full min-h-0`) que asigne un bloque separado para la Toolbar (que mantiene su sticky top-16) y otro bloque aislado para el contenido editable (`flex-1 min-h-0 overflow-y-auto`). Esto asegura que el editor no empuje el layout, que el scroll no genere artefactos en el comportamiento sticky y que nunca se superponga al Header principal.

## What Changes

- Reorganizar el DOM en `DocumentEditor.tsx`:
  - Envolver todo en un contenedor raíz con `relative flex flex-col h-full min-h-0`.
  - Colocar la Toolbar directamente dentro de este contenedor raíz con `sticky top-16 z-40`.
  - Colocar el área de texto (Tiptap EditorContent) dentro de un div hermano a la Toolbar con clases `flex-1 min-h-0 overflow-y-auto`.
- Eliminar restricciones de alturas absolutas o combinaciones previas que provocaban bugs visuales.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `editor-layout`: Se reescribe la especificación para incluir explícitamente la división de contenedores (uno para la toolbar y otro exclusivo para scroll del editor), garantizando un comportamiento fluido con flexbox en cualquier resolución.

## Impact

- `src/components/DocumentEditor/DocumentEditor.tsx`: Refactorización de la estructura HTML principal del componente.
