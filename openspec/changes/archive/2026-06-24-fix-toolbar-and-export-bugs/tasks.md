## 1. Código muerto en docxExport.ts

- [x] 1.1 Eliminar la constante `createTextRuns` (líneas 381-395) que fue declarada pero no se usa.

## 2. Ajustes formalizados (Ya aplicados en el código)

- [x] 2.1 Verificar que `TextAlign` incluye `defaultAlignment: 'justify'` en `DocumentEditor.tsx`.
- [x] 2.2 Verificar que el botón de limpiar formato ejecuta `unsetBold().unsetItalic().unsetUnderline()` y no `unsetAllMarks()`.
- [x] 2.3 Verificar que el casteo a `HTMLElement` fue aplicado para `style` en `docxExport.ts` y `pdfExport.tsx`.
