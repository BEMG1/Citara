## Context

El `DocumentEditor` utiliza Tiptap v2 con una barra de herramientas React personalizada. Los botones de la barra consultan el estado del editor (`editor.isActive(...)`) para determinar su estilo activo/inactivo, pero actualmente no bloquean interacción cuando el cursor está en un encabezado. La extensión `AutoTitleCaseHeading` ya intercepta `Enter` en headings para aplicar TitleCase, pero al retornar `false` delega la acción a Tiptap, que no crea un párrafo normal de forma automática.

## Goals / Non-Goals

**Goals:**
- Deshabilitar los botones de alineación (izquierda, centro, derecha) cuando el bloque activo es un encabezado H1/H2/H3.
- Al presionar `Enter` al final de un encabezado, crear automáticamente un párrafo normal con `indent: true`.
- Que el estado de la barra se recalcule reactivamente en cada cambio de selección.

**Non-Goals:**
- No se modifican las reglas de formato aplicadas a los encabezados en sí mismos.
- No se cambia la lógica de TitleCase ni otras extensiones.
- No se afectan listas, tablas ni otros tipos de bloque.

## Decisions

### D1: Deshabilitar botones vía `disabled` prop en React

Calcular `const isHeading = editor.isActive('heading')` en el render de la barra. Pasar `disabled={isHeading}` a cada botón de alineación y agregar `opacity-50 cursor-not-allowed` a su `className`. Alternativa descartada: esconder los botones completamente — esto haría saltar el layout de la toolbar.

### D2: Interceptar `Enter` en heading con `addKeyboardShortcuts` en `AutoTitleCaseHeading`

Dentro de la extensión existente `AutoTitleCaseHeading`, cambiar el retorno del handler de `Enter` de `false` (delegar) a ejecutar explícitamente:
```
editor.chain().splitBlock().setNode('paragraph').updateAttributes('paragraph', { indent: true }).run()
```
Esto garantiza que tras el TitleCase, el nuevo bloque sea siempre un párrafo con sangría. Alternativa descartada: usar una extensión separada — más complejidad sin beneficio.

## Risks / Trade-offs

- **[Risk] Compatibilidad con selección multi-bloque**: Si el usuario selecciona tanto un heading como un párrafo, los botones se deshabilitan. → Mitigación: Es el comportamiento más conservador y seguro.
- **[Risk] `splitBlock` en headings**: Tiptap puede crear un nuevo heading en lugar de párrafo si `splitBlock` hereda el tipo del nodo padre. → Mitigación: Encadenar `.setNode('paragraph')` inmediatamente después de `splitBlock`.
