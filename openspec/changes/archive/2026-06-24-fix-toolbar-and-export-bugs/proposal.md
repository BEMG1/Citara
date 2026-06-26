## Why

Corregir bugs identificados durante la implementación de la barra de herramientas y la exportación. Estos bugs incluyen errores de TypeScript en la exportación a Word, comportamiento inadecuado de la limpieza de formato afectando referencias, y alineación predeterminada faltante.

## What Changes

- Limpieza de código no utilizado en `docxExport.ts` (eliminación de `createTextRuns` no usado).
- Ajuste del comportamiento de "Limpiar Formato" para preservar las referencias (`data-reference-id`).
- Aplicación de alineación justificada por defecto para los párrafos en el editor.
- Ajuste visual de la barra de herramientas (anclada abajo) implementado en el turno anterior.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `rich-text-toolbar`: Ajustes en los requerimientos de limpieza de formato y comportamiento de alineación predeterminada.

## Impact

- `src/utils/docxExport.ts`: Limpieza de código muerto.
- `src/components/DocumentEditor/DocumentEditor.tsx`: Ajustes de configuración del editor y limpieza de marcas.
