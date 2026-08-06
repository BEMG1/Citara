# Dynamic Style Updates

## Purpose
Establece el mecanismo reactivo para que el Document Designer actualice automáticamente la vista basado en los cambios del estilo resuelto (ResolvedDocumentStyle) de forma optimizada y con una transición visual adecuada.

## Requirements

### Requirement: Document Designer Reactivo
El Document Designer SHALL suscribirse a los cambios del `ResolvedDocumentStyle` emitido por el Style Engine y actualizar su representación visual de forma automática e inmediata.

#### Scenario: Cambio de formato
- **WHEN** el usuario selecciona un formato de citación diferente
- **THEN** el Document Designer recibe el nuevo `ResolvedDocumentStyle` y re-renderiza el documento aplicando los nuevos estilos de tipografía, márgenes, párrafos y encabezados.

### Requirement: Transición Visual de Estilos
El Document Designer SHALL presentar una transición visual no intrusiva (ej. loader o overlay) durante el proceso de actualización de estilos.

#### Scenario: Actualización de estilos en progreso
- **WHEN** el `ResolvedDocumentStyle` está siendo recalculado tras un cambio de formato
- **THEN** se muestra un mecanismo visual sobre el editor de documento sin bloquear otras acciones, que desaparece en cuanto el nuevo render del documento está listo, previniendo parpadeos.

### Requirement: Optimización de Renderizados del Documento
La actualización visual del documento SHALL dispararse únicamente cuando la referencia del objeto `ResolvedDocumentStyle` cambie efectivamente.

#### Scenario: Cambios de estado no relacionados
- **WHEN** partes del estado de la aplicación cambian pero el `ResolvedDocumentStyle` permanece igual
- **THEN** el Document Designer no re-aplica estilos ni repinta innecesariamente el contenido del editor, manteniendo el rendimiento.
