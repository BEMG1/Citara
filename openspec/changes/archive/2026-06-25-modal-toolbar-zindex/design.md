## Context

La aplicación incluye un editor de documentos que cuenta con una barra de herramientas configurada como *sticky*, permitiendo al usuario tener acceso a las herramientas de edición en todo momento durante el desplazamiento del documento. Para lograr este efecto, la barra se configuró con un `z-index` elevado.
Sin embargo, esto provocó un problema de apilamiento con las ventanas modales de la aplicación (como el diálogo de exportación). Actualmente, la barra de herramientas se superpone visualmente a los modales cuando el usuario se desplaza, ocultando el contenido del modal o afectando su interactividad.

## Goals / Non-Goals

**Goals:**
- Establecer una jerarquía visual global (`z-index`) clara donde las ventanas modales y sus respectivos fondos (overlays) siempre tengan precedencia sobre la barra de herramientas del editor.
- Garantizar que la barra de herramientas siga conservando su comportamiento *sticky* sin interrupciones ni problemas funcionales.

**Non-Goals:**
- No se pretende cambiar la implementación técnica o el comportamiento de fijación de la barra de herramientas.
- No se rediseñará el layout general de la aplicación, solo se ajustarán los niveles de apilamiento en el eje Z.

## Decisions

- **Decisión 1: Escala Estandarizada de Z-Index**
  En lugar de usar valores arbitrarios distribuidos a lo largo de los componentes, se establecerá un nivel de prioridad de capas. 
  - La barra de herramientas tendrá un `z-index` intermedio (por ejemplo, `z-index: 40`).
  - El overlay y contenido de los modales tendrán un `z-index` superior (por ejemplo, `z-index: 50` o mayor).
  *Rationale:* El uso de la escala provista por Tailwind CSS (z-10, z-20, z-30, z-40, z-50) es semántico, estándar, y evita la inflación infinita de valores (como `z-index: 9999`).

- **Decisión 2: Actualización de los Componentes Afectados**
  Se inspeccionará el código fuente para el modal de exportación (y cualquier contenedor modal genérico que exista) para asignarles el nuevo nivel de apilamiento. A su vez, se reducirá el `z-index` de la barra de herramientas si este fuera excesivamente alto.

## Risks / Trade-offs

- **Risk: Conflictos con librerías externas o portales**
  Si los modales actuales son renderizados a través de portales (e.g. Radix UI u otros primitives de React) en la raíz del documento, su contexto de apilamiento podría ser distinto.
  *Mitigation:* Verificar que las clases de Tailwind de z-index sean inyectadas correctamente en los contenedores Portal o en los contenedores absolutos de los modales en cuestión.

- **Risk: Otros componentes fijos ocultos**
  Si se reduce el `z-index` de la barra de herramientas a un valor muy bajo, podría quedar por debajo del texto o imágenes del documento.
  *Mitigation:* Se asegurará de utilizar un valor mínimo como `z-40` que quede por encima del contenido regular (cuyo z-index suele ser `auto` o `0`).
