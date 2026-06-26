## Why

La interfaz de la aplicación maneja dos niveles de desplazamiento (layout general y contenedor del editor). Al hacer scroll, la barra de herramientas se superpone de forma descontrolada sobre el Header principal (rompiendo jerarquía) y desaparece del área visible si se usa el scroll global en documentos extensos, forzando al usuario a volver arriba para editar.

## What Changes

- Implementar un contenedor adecuado que asegure el comportamiento sticky de la barra de herramientas bajo un contexto de scroll global y/o interno.
- Ajustar el valor de anclaje superior (`top-16` u otro) de la barra de herramientas en `DocumentEditor.tsx` para evitar superposición con el Header principal de Citara.
- Aplicar manejo correcto de capas (`z-index: 40`) para mantener la barra debajo de modales o menús del Header, pero sobre el texto.

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `rich-text-toolbar`: Se modifica el requisito de anclaje de la barra para especificar su persistencia compatible con scroll global, su límite de desplazamiento y el respeto a la jerarquía visual frente al Header principal.

## Impact

- `src/components/DocumentEditor/DocumentEditor.tsx`: Actualización del layout y clases CSS (Tailwind) del contenedor y de la barra para soportar adecuadamente `sticky`, `top-X` y `z-40`.
