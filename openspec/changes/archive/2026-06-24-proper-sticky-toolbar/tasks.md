## 1. Ajuste de Layout en Editor Container

- [x] 1.1 Asegurar que el contenedor padre de la barra de herramientas y de `EditorContent` no dependa de un `overflow-y-auto` estricto interno si esto aisla a la barra del scroll global. Modificar `DocumentEditor.tsx` para que el scroll principal del editor comparta el layout adecuadamente, o ajustar el sticky para la nueva altura (`top-16` por ejemplo).
- [x] 1.2 Aplicar clases `sticky top-16 z-40 bg-[var(--surface)] shadow-md` a la barra de herramientas principal.
- [x] 1.3 Verificar que ni la barra ni el menú de opciones (BubbleMenu) superpongan el header principal, manteniendo la correcta estructura visual y semántica (z-index 40 para la barra y dejar los popups en su contexto por defecto, que Tiptap gestiona a través de tippy).
