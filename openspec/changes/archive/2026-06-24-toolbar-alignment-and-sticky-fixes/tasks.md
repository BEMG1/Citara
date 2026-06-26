## 1. Comportamiento de Barra Fija

- [x] 1.1 Mover el componente de la barra de herramientas a la parte superior (antes del área del editor) en `DocumentEditor.tsx`.
- [x] 1.2 Aplicar clases `sticky top-0 z-50` a la barra y asegurar que el scroll principal ocurra en un contenedor envolvente adecuado para que el sticky funcione sin traslaparse con el header principal de la app.

## 2. Alineación Automática en Botones / Menú

- [x] 2.1 Modificar el manejador del botón `H1` (tanto en la barra como en `BubbleMenu`) para que ejecute `toggleHeading({ level: 1 })` seguido de `setTextAlign('center')`.
- [x] 2.2 Modificar el manejador del botón de `Párrafo` (en `BubbleMenu`) para que ejecute `setParagraph()` seguido de `setTextAlign('justify')`.
