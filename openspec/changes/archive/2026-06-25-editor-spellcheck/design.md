## Context

El editor de texto (`DocumentEditor.tsx`) está construido sobre Tiptap/ProseMirror. Actualmente no aprovecha las capacidades nativas del navegador para la corrección ortográfica, limitando la experiencia del usuario y no brindando retroalimentación de escritura, lo cual es esencial para herramientas de edición de documentos.

## Goals / Non-Goals

**Goals:**
- Habilitar el atributo nativo de `spellcheck` en la instancia del editor Tiptap.
- Sincronizar el atributo `lang` del editor con el idioma actual de la aplicación (e.g. `es` o `en`) para que el navegador utilice el diccionario correcto.
- Asegurar que al cambiar de idioma desde el `Header`, el editor actualice el idioma ortográfico dinámicamente.

**Non-Goals:**
- No se implementará un motor de corrección ortográfica personalizado ni se integrarán APIs externas (como Grammarly o LanguageTool); se utilizará la funcionalidad nativa provista por el navegador del usuario.
- No se corregirá gramática o semántica, solo ortografía.

## Decisions

- **Decisión 1: Atributos HTML del Editor Tiptap**
  En lugar de buscar extensiones complejas, se aprovecharán los `editorProps.attributes` de la configuración de `useEditor` de Tiptap.
  Se inyectará:
  ```json
  {
    "spellcheck": "true",
    "lang": currentLanguage
  }
  ```
  *Rationale:* Tiptap renderiza el `contenteditable` y le traslada los `editorProps.attributes`. El atributo nativo `lang` es el estándar de HTML5 para indicar a los navegadores qué diccionario ortográfico aplicar.

- **Decisión 2: Enlace con el Contexto de Idioma (`AppContext`)**
  La propiedad `language` proveniente de `useLanguage()` (que devuelve 'es' o 'en') se utilizará para alimentar el atributo `lang` del editor. Dado que `useEditor` de Tiptap no reacciona siempre dinámicamente a cambios en `editorProps`, si fuese necesario se utilizará un `useEffect` para actualizar los atributos mediante `editor.setOptions` o modificando directamente el elemento del DOM (`editor.view.dom.setAttribute('lang', language)`).

## Risks / Trade-offs

- **Risk: Soporte del Navegador**
  La efectividad del `spellcheck` y los diccionarios disponibles varían según el sistema operativo y el navegador del usuario.
  *Mitigation:* Es un comportamiento estándar y esperado en web. Se documentará que la herramienta usa los diccionarios nativos.

- **Risk: Tiptap no actualiza atributos dinámicamente**
  Si el usuario cambia el idioma sobre la marcha y Tiptap no recompone los atributos.
  *Mitigation:* Usar un `useEffect` que monitoree el estado `language`. Cuando cambie, se aplicará explícitamente `editor?.setOptions({ editorProps: { ... } })` o manipularemos el DOM del editor para asegurar la reactividad instantánea.
