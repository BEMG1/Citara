## Context

Existen bugs residuales de la implementación anterior: limpieza de código (`createTextRuns`), y verificación del comportamiento de la limpieza de formato (asegurar que sólo elimine negrita, cursiva y subrayado, no el `data-reference-id`) y alineación por defecto del párrafo (ya implementado, pero requiere formalización en las tareas).

## Goals / Non-Goals

**Goals:**
- Eliminar la constante `createTextRuns` no utilizada en `docxExport.ts`.
- Formalizar los requerimientos de limpieza de formato y alineación justificada.

**Non-Goals:**
- Nuevas características funcionales.

## Decisions

- **Limpieza de formato**: `unsetBold().unsetItalic().unsetUnderline()` en lugar de `unsetAllMarks()` (ya ejecutado en turno previo).
- **Alineación**: Configurar `TextAlign` con `defaultAlignment: 'justify'` (ya ejecutado).
- **Código muerto**: Borrar líneas 381-395 en `docxExport.ts`.
