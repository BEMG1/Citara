## Context
Al hacer scroll en el contenedor principal de la aplicación, la barra de herramientas del editor se oculta cuando se desplaza fuera de vista o se superpone al Header de la app porque su `sticky top-0` no tiene un offset adecuado y/o su contenedor la aísla del scroll de la página completa.

## Goals / Non-Goals
**Goals:**
- Ajustar la jerarquía de los contenedores para que el sticky funcione respecto al scroll global o interno.
- Darle un valor `top-16` (o el necesario) para que respete el Header.
- Ajustar el `z-index` a `40`.

**Non-Goals:**
- Modificar el comportamiento de la barra que no tenga que ver con su posición en pantalla.

## Decisions
- Usar un contenedor tipo:
```html
<div class="relative w-full">
  <div class="sticky top-16 z-40 bg-[var(--surface)] shadow-md ...">...</div>
  <div><EditorContent /></div>
</div>
```
- Modificaremos el `DocumentEditor.tsx` actual para separar el sticky si el layout lo requiere o dejar que herede el scroll correcto asegurando que sus padres no tengan `overflow: hidden` innecesario.
- Se establecerá el z-index 40 explícito.
