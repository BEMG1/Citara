## Context
Los fixes individuales que hemos hecho para manejar la contención vertical del editor y la toolbar sticky generaban conflictos visuales debido al árbol DOM. Un scroll container encapsulando al toolbar rompe el sticky global (top-16) porque se calcula respecto a los límites internos del overflow y no de la pantalla. Para tener ambas (toolbar respetando el Header global y scroll manejado correctamente sin desbordar el viewport), el DOM requiere separar a la Toolbar del content box con overflow.

## Goals / Non-Goals
**Goals:**
- Separar jerárquicamente la Toolbar y el contenido editable.
- Aplicar `overflow-y-auto` sólo a la parte del documento.
- Establecer el padre de ambos como `flex flex-col h-full min-h-0`.

**Non-Goals:**
- Modificar estilos de los botones dentro de la toolbar.

## Decisions
- Refactorización de JSX:
```tsx
<div className="flex flex-col h-full min-h-0 relative">
  <div className="sticky top-16 z-40 bg-[var(--surface)] shadow-md ...">
    {/* Format toolbar */}
  </div>
  <div className="flex-1 min-h-0 overflow-y-auto relative w-full ...">
    <EditorContent />
  </div>
</div>
```
Al separar la barra de herramientas del contenedor que tiene el scroll (`flex-1 min-h-0 overflow-y-auto`), la barra ya no requiere que su propio contenedor haga scroll y `sticky top-16` funcionará si el que hace scroll es toda la página, o simplemente actuará estáticamente arriba del contenido si la página no hace scroll.
