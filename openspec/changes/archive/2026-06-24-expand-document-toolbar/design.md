## Context

Actualmente el editor de documentos requiere funcionalidades adicionales de formato de texto (negrita, cursiva, subrayado), listas, enlaces y alineación. Además, es necesario mejorar la experiencia de usuario y la accesibilidad para que los botones de formato reflejen el estado activo del texto bajo el cursor.

## Goals / Non-Goals

**Goals:**
- Implementar soporte para atajos de teclado y botones en la UI para Negrita, Cursiva, Subrayado y Limpiar Formato.
- Implementar soporte para listas de viñetas y numeradas con hasta 1 nivel de anidamiento.
- Implementar interfaz y lógica para insertar y editar enlaces.
- Implementar opciones de alineación (Izquierda, Centro, Derecha).
- Implementar un salto de línea real al usar `Shift + Enter` para evitar uniones de texto en exportaciones a Word.
- Implementar auto-formato en listas de viñetas (primera letra mayúscula y punto final).
- Implementar flujo natural en listas: continuar la lista con `Enter` y salir al párrafo normal con `Enter` en un ítem vacío.
- Garantizar la fidelidad absoluta del formato (listas, fuentes, alineación, negrita, interlineado, etc.) en las exportaciones a Word y PDF.
- Posicionar la barra de herramientas de manera fija (sticky) en la parte superior del documento para un acceso continuo.
- Mantener sincronizado el estado visual de los botones de la barra de herramientas dependiendo del formato del texto en la posición del cursor.
- Asegurar soporte total de teclado para la barra de herramientas.

**Non-Goals:**
- No se implementarán fuentes personalizadas, colores o formatos avanzados (ej. tablas) en esta fase.
- No se creará un editor desde cero; se integrará sobre la base existente.

## Decisions

- **Manejo de Estado**: El estado "activo" de la barra de herramientas será calculado dinámicamente escuchando el evento de cambio de selección (`selectionchange` o equivalente) dentro del editor. 
- **Accesibilidad**: Se utilizarán los atributos `aria-pressed` o `aria-current` en los botones de la barra de herramientas para indicar su estado al lector de pantalla, junto con el uso de la tecla `Tab` y flechas para navegación de teclado.
- **Inserción de Listas**: Se interceptará la tecla `Tab` dentro del contenido de una lista para aplicar el anidamiento.
- **Salto de Línea (Shift + Enter)**: Se interceptará este atajo para insertar un elemento de salto estricto (`<br>`) que el exportador a Word reconozca adecuadamente y no los agrupe en la misma línea.
- **Barra Fija y Nuevos Estilos (Tailwind CSS)**: Se utilizarán clases de Tailwind CSS (ej. `sticky top-0 z-50`) para anclar el contenedor de la barra de herramientas y para todos los nuevos estilos requeridos. Los estilos CSS nativos ya existentes no se modificarán.
- **Auto-formato de Viñetas**: Se implementará un normalizador/hook que, al terminar de editar un ítem de lista (ej. on blur, on enter), ponga en mayúscula el primer carácter y asegure el punto al final.
- **Navegación en Listas (Enter)**: Se interceptará `Enter` en nodos de lista. Si hay texto, se inserta un nuevo `<li>`; si no hay texto, se convierte el nodo padre a un párrafo normal `<p>` o equivalente, saliendo de la lista.
- **Exportación Word/PDF**: Se ajustarán los parsers y rutinas de generación de documentos para mapear de manera estricta el HTML/estado del editor a los modelos nativos de Word y PDF, validando específicamente las propiedades de formato de texto, listas y alineación.

## Risks / Trade-offs

- **Risk**: Inconsistencia del comportamiento del cursor al anidar listas. → **Mitigation**: Manejo explícito de atajos de teclado y validación del árbol de nodos en las listas.
- **Risk**: Rendimiento afectado por calcular formato en cada movimiento de cursor. → **Mitigation**: Implementar debounce (si es necesario) en el listener de selección, optimizando la comprobación del formato actual.
