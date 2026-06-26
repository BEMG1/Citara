## 1. Ajustar Estructura Flexbox y Scroll en `DocumentEditor`

- [x] 1.1 Modificar el contenedor principal en `DocumentEditor.tsx` para agregar `min-h-0` (ej: `<div className="flex flex-col h-full bg-[var(--surface)] relative min-h-0" ...>`), permitiendo que se encoja correctamente en el layout principal.
- [x] 1.2 Añadir `overflow-y-auto` y `min-h-0` al contenedor interno del área del editor (el que envuelve a `EditorContent` y al toolbar) para forzar el scroll localizado. Asegurar que conserve `flex-1` y `relative`.
- [x] 1.3 Cambiar las clases del toolbar a `sticky top-0 z-40 bg-[var(--surface)] shadow-md ...` dado que ahora su contexto de scroll más cercano será su padre inmediato, por lo que `top-0` mantendrá la barra pegada al borde de dicho padre (sin solaparse con el Header de Citara, que queda completamente fuera del contenedor).
- [x] 1.4 Eliminar cualquier uso de alturas fijas si existen.
