## 1. Eliminar Funcionalidad de Hipervínculos en `DocumentEditor.tsx`
- [x] 1.1 Remover la importación de `TiptapLink` de `@tiptap/extension-link`.
- [x] 1.2 Quitar `TiptapLink` del arreglo de extensiones en el hook `useEditor`.
- [x] 1.3 Eliminar los manejadores de eventos relacionados a hipervínculos (`handleSetLink`, etc.).
- [x] 1.4 Eliminar el botón de hipervínculo de la barra de herramientas.
- [x] 1.5 Eliminar cualquier modal, popup o componente de UI asociado a la inserción y edición de links.
- [x] 1.6 Remover el estado de React (ej: `isLinkModalOpen`, `linkUrl`) relacionado.

## 2. Implementar Estado y Botón de Sangría Automática
- [x] 2.1 Crear un nuevo estado `const [isAutoIndentEnabled, setIsAutoIndentEnabled] = useState(true)`.
- [x] 2.2 Importar los iconos necesarios de `lucide-react` (ej. `Indent`, `Outdent` o `Pilcrow`).
- [x] 2.3 Insertar el botón en la misma posición de la Toolbar que el de hipervínculo, el cual alternará `isAutoIndentEnabled`. Añadirle los estilos activos correspondientes si está activado (`isAutoIndentEnabled ? btnActive : btnIdle`).

## 3. Lógica de Tiptap para Párrafos con Sangría
- [x] 3.1 Crear una extensión personalizada en Tiptap (basada en Paragraph o como un KeyboardShortcut) que intercepte el presionado de la tecla `Enter`.
- [x] 3.2 Si `isAutoIndentEnabled` es verdadero y estamos en un contexto de párrafo, forzar a que el nuevo párrafo generado incluya un estilo en línea de sangría (`text-indent: 1.27cm`) o usar una clase, o aprovechar el CSS general, pero controlando que si se desactiva, el nuevo párrafo NO lleve sangría. 
- [x] *Sugerencia*: Para lograr esto, una forma robusta en Tiptap es extender la extensión `Paragraph` para que admita un atributo `indent: boolean`. El KeyboardShortcut sobreescribe `Enter` insertando un párrafo con `{ indent: isAutoIndentEnabled }`. RenderHTML del párrafo generaría `style="text-indent: 1.27cm;"`.
