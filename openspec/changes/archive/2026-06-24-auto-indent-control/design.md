## Context
Se requiere eliminar la funcionalidad de hipervínculos (botón y popups) en favor de un nuevo toggle que indique si los nuevos párrafos llevarán sangría o no.

## Goals / Non-Goals
**Goals:**
- Eliminar toda referencia y funcionalidad relacionada a hipervínculos en `DocumentEditor.tsx`.
- Introducir un estado en `DocumentEditor` (`isAutoIndentEnabled`) que empiece en `true`.
- Crear un botón en la barra de herramientas que intercepte este estado.
- Inyectar lógica en Tiptap para que al crear un párrafo (Enter), se aplique un text-indent si está habilitado.

**Non-Goals:**
- Modificar párrafos ya creados cuando se cambia el estado del toggle.

## Decisions
- Se removerá `TiptapLink` de las extensiones de Tiptap, así como sus modales y handlers.
- Se implementará el icono `Indent` (y opcionalmente `Outdent` o un estilo activo en el botón con `Indent`) de `lucide-react`.
- La lógica de sangría automática puede implementarse mediante una extensión personalizada de teclado de Tiptap que sobreescriba `Enter` para aplicar una clase específica o estilo en línea si el estado `isAutoIndentEnabled` es `true`.
O alternativamente, la sangría automática en el `DocumentEditor` actualmente se gestiona de forma global. Necesitamos que los párrafos nuevos reciban una marca o clase específica para la sangría, o que el editor asigne a un atributo del nodo `paragraph` si debe llevar sangría. Tiptap no tiene indentación en párrafos por defecto. Necesitaríamos extender el nodo `Paragraph` para aceptar un atributo `indent`.
```javascript
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      indent: {
        default: false,
        parseHTML: element => element.hasAttribute('data-indent'),
        renderHTML: attributes => {
          if (!attributes.indent) {
            return {}
          }
          return { 'data-indent': 'true', style: 'text-indent: 1.27cm;' }
        },
      },
    }
  }
});
```
Luego en el editor, el manejador de Enter tendría que leer el estado de React `isAutoIndentEnabled` y crear un párrafo con `indent: true`.
Dada la limitación de leer estado reactivo desde Tiptap, será más fácil interceptar el `Enter` a través de un KeyboardShortcut en Tiptap que dispare una función pasada al hook de Tiptap, o mantener un ref con el estado de `autoIndent` para leerlo en el KeyboardShortcut.
