## Why

Actualmente, el editor de texto no tiene habilitada la funcionalidad de corrección ortográfica, lo que resulta en que ninguna palabra es validada, no se resaltan errores ni existen sugerencias. La experiencia de edición es inferior a la esperada. Habilitar el corrector ortográfico y sincronizarlo con el idioma configurado para la aplicación mejorará radicalmente la calidad de la redacción.

## What Changes

- Habilitar la corrección ortográfica (spellcheck) en el editor de texto.
- Implementar sincronización automática del idioma del diccionario ortográfico (español o inglés) con la configuración de internacionalización actual de la aplicación.
- Garantizar que el cambio de idioma actualice de forma dinámica el diccionario utilizado por el editor sin necesidad de recargar la vista.

## Capabilities

### New Capabilities
- `editor-spellcheck`: Detección automática de errores ortográficos, resaltado visual, sugerencias de corrección y sincronización con el idioma de la aplicación.

### Modified Capabilities
- Ninguna.

## Impact

- **UI Components:** Afecta directamente al componente del editor de texto principal.
- **Context/Estado Global:** Requerirá escuchar cambios en el idioma (i18n) configurado globalmente para actualizar el atributo correspondiente en el editor.
