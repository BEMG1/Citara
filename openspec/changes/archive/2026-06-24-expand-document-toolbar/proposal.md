## Why

Se requiere ampliar la barra de herramientas para la edición del documento para mejorar la experiencia de usuario, permitiendo opciones más ricas de formateo, estructuración de texto con listas y adición de enlaces directamente desde la interfaz.

## What Changes

- Se añadirán botones de formatos de texto: Negrita (Ctrl+B), Cursiva/Itálica (Ctrl+I), Subrayado (Ctrl+U) y Limpiar Formato.
- Se implementarán listas: viñetas (puntos/guiones) y listas numeradas con un nivel de anidamiento usando `Tab`.
  - **Auto-formato de viñetas**: Las viñetas iniciarán automáticamente con mayúscula y finalizarán con punto.
- Se añadirán botones para insertar/editar enlaces y opciones de alineación (Izquierda, Centro, Derecha).
- **Salto de línea**: Se corregirá el comportamiento de `Shift + Enter` para que genere un salto de línea real, conservando su estructura al exportar a Word.
- **Barra fija**: La barra de formato estará anclada/fija en la parte superior del área de edición, permitiendo su acceso sin importar el desplazamiento (scroll) del documento.
- **Continuidad y salida de listas**: Al presionar `Enter` en un ítem con texto se creará otro ítem; al presionarlo en un ítem vacío se regresará a un párrafo normal.
- **Fidelidad de exportación**: (Criterio de Aceptación Crítico) Todos los formatos (negrita, cursiva, subrayado, viñetas, alineación, saltos, interlineado, títulos) DEBEN mantenerse intactos al exportar el documento a Word y PDF.
- Se modificará la UI para que los botones cambien a estado "activo" automáticamente según la posición del cursor en el texto.
- Todos los componentes se harán accesibles mediante teclado.

## Capabilities

### New Capabilities
- `rich-text-toolbar`: Funcionalidad que abarca las nuevas herramientas de edición de formato, listas, enlaces, alineación y estado activo.

### Modified Capabilities

## Impact

- Cambios en el componente de UI principal de la barra de edición.
- Actualizaciones en la lógica de manejo del editor para detectar la posición del cursor y actualizar estados activos.
- Implementación de captura de eventos de teclado para accesibilidad y atajos.
