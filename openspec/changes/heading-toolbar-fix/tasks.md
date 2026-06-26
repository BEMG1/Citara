## 1. Deshabilitar botones de alineación en encabezados

- [x] 1.1 En `DocumentEditor.tsx`, calcular `const isHeading = editor.isActive('heading')` en el render de la barra de herramientas.
- [x] 1.2 Agregar `disabled={isHeading}` al botón "Alinear a la izquierda".
- [x] 1.3 Agregar `disabled={isHeading}` al botón "Centrar".
- [x] 1.4 Agregar `disabled={isHeading}` al botón "Alinear a la derecha".
- [x] 1.5 Actualizar el `className` de cada botón de alineación para incluir `${isHeading ? 'opacity-50 cursor-not-allowed' : ''}` cuando está deshabilitado.

## 2. Crear párrafo normal con sangría al presionar Enter en encabezado

- [x] 2.1 En la extensión `AutoTitleCaseHeading` (dentro de `DocumentEditor.tsx`), modificar el handler de `Enter` para que, después de aplicar TitleCase, ejecute `editor.chain().splitBlock().setNode('paragraph').updateAttributes('paragraph', { indent: true }).run()` y retorne `true` en lugar de `false`.
- [x] 2.2 Verificar que el nuevo bloque creado tiene tipo `paragraph` y no conserva estilos de encabezado.
- [x] 2.3 Verificar que el cursor queda dentro del nuevo párrafo listo para escribir.
