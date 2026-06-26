## 1. Refactorización Estructural en `DocumentEditor.tsx`

- [x] 1.1 Asegurarse que el contenedor raíz sea `<div className="flex flex-col h-full flex-1 min-h-0 relative" ref={editorContainerRef}>`.
- [x] 1.2 Mover la barra de herramientas (`{/* Format toolbar */}`) para que sea el primer hijo visible dentro de este contenedor raíz (justo después del bubble menu y los tooltips), y antes de la sección `{/* Editor area */}`.
- [x] 1.3 Asignar a la barra de herramientas las clases: `sticky top-16 z-40 bg-[var(--surface)] shadow-md border-b border-[var(--border)] p-1.5 flex flex-wrap items-center gap-1 mb-2 rounded-t-md` o equivalente.
- [x] 1.4 Asignar al `{/* Editor area */}` que contiene al `EditorContent` las clases: `flex-1 min-h-0 overflow-y-auto relative w-full border ...`.
- [x] 1.5 Verificar que Tiptap renderice el editor correctamente y que la barra de herramientas se mantenga sticky top-16 si la página global hace scroll, y que el editor interno se encoja a su layout con scroll interno.
