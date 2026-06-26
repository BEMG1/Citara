## 1. Botones de Formato Básico

- [x] 1.1 Añadir botones en la UI para Negrita (B), Cursiva (I) y Subrayado (U), además del botón de "Limpiar Formato"
- [x] 1.2 Implementar lógica para aplicar formatos en el texto seleccionado desde los botones
- [x] 1.3 Asignar y capturar eventos de atajo de teclado: Ctrl+B, Ctrl+I, Ctrl+U

## 2. Implementación de Listas

- [x] 2.1 Añadir botones en la UI para listas de viñetas y listas numeradas
- [x] 2.2 Implementar la creación de listas a partir de texto seleccionado y desde texto vacío
- [x] 2.3 Implementar soporte para presionar la tecla `Tab` anidando el elemento de lista actual
- [x] 2.4 Interceptar `Enter` en listas: crear nuevo ítem (continuidad) si hay texto, y salir a párrafo normal si el ítem está vacío
- [x] 2.5 Implementar script de auto-formato para viñetas (forzar mayúscula inicial y asegurar punto final)

## 3. Enlaces y Alineación

- [x] 3.1 Añadir botones de alineación (Izquierda, Centro, Derecha) y botón de "Insertar Enlace"
- [x] 3.2 Implementar la acción de alineación para el texto
- [x] 3.3 Crear interfaz sencilla (ej. un prompt o modal inline) para capturar URL y crear enlaces interactivos en el texto

## 4. Estado Activo, Accesibilidad y UX

- [x] 4.1 Añadir un listener de selección (o equivalente) para detectar el nodo del cursor y el formato actual
- [x] 4.2 Actualizar visualmente (marcando estado "activo") los botones según el formato del cursor
- [x] 4.3 Añadir navegación por teclado (Tab index, eventos KeyDown de enter/space) en toda la barra de herramientas y etiquetas ARIA para accesibilidad
- [x] 4.4 Implementar barra de herramientas fija en la parte superior usando clases de Tailwind CSS (ej. `sticky top-0 z-50`). No modificar estilos de CSS existentes.
- [x] 4.5 Interceptar el evento `Shift + Enter` para insertar explícitamente un salto de línea estricto que se conserve al exportar a Word

## 5. Fidelidad de Exportación (Word y PDF)

- [x] 5.1 Revisar y ajustar el generador/parser de exportación a Word para que procese e interprete todas las etiquetas de formato HTML del editor.
- [x] 5.2 Revisar y ajustar el generador de exportación a PDF garantizando mapeo exacto de listas, alineación, interlineado y demás formatos visuales.
- [x] 5.3 Validar que el salto de línea generado mediante `Shift + Enter` actúe de manera correcta y consistente en ambos exportadores.

## 6. Pruebas y Ajustes Finales

- [x] 6.1 Verificar el funcionamiento combinado de todas las nuevas funcionalidades en el editor
- [x] 6.2 Realizar pruebas de uso sólo con teclado y asegurar estándares de accesibilidad
- [x] 6.3 Validar los criterios de aceptación generando exportaciones de prueba en ambos formatos (PDF y Word)
