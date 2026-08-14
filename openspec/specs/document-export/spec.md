# Document Export Specification

## Purpose
TBD ... Update Purpose after archive

## Requirements

### Requirement: Fidelity of Formatting
Todo formato aplicado dentro del editor, proveniente de la fábrica de estilos (style-engine / ResolvedDocumentStyle), deberá consumirse e inyectarse durante la exportación para garantizar que el documento final conserve dichas propiedades (Fuente, Tamaño, Negrita, Cursiva, Alineación, Sangría, Espaciado, Títulos, Listas, Márgenes de página, etc.). El exportador no deberá tener lógica condicional basada en el nombre del formato, sino depender exclusivamente de los estilos resueltos.

#### Scenario: Word export preserves all styles
- **WHEN** un documento con distintos formatos de texto definidos por el motor de estilos se exporta a Word
- **THEN** el exportador deberá consumir el ResolvedDocumentStyle e inyectar todos los estilos para que se mantengan en el documento generado.

### Requirement: Visual Consistency
El documento exportado deberá mantener una apariencia visual equivalente a la mostrada en el editor. Diferencias mínimas por el motor de renderizado están permitidas siempre que no alteren estructura, jerarquía o intención.

#### Scenario: PDF export maintains visual representation
- **WHEN** un documento con los mismos contenidos se exporta a PDF
- **THEN** la representación visual deberá ser equivalente a la mostrada en el editor.

### Requirement: Consistent Export Pipeline & Independence
Todos los mecanismos de exportación deberán utilizar una representación común del documento, y deberán validar los límites de tasa de generación (Rate Limiting) de la cuenta del usuario antes de proceder. El resultado visual no deberá depender del método utilizado (Local, API, servicio interno).

#### Scenario: Export is validated before processing
- **WHEN** un documento con títulos, listas y tablas se intenta exportar mediante cualquier mecanismo soportado
- **THEN** el sistema debe verificar que el usuario cumple con su cuota de generación antes de procesar y entregar la estructura intacta.

### Requirement: Future Compatibility
Toda nueva funcionalidad de formato incorporada al editor deberá incluir el soporte correspondiente dentro de los procesos de exportación.

#### Scenario: New format export preservation
- **WHEN** dicho formato se exporta
- **THEN** deberá conservarse correctamente en todos los formatos de salida soportados.

### Requirement: Export Style Consumption
El proceso de exportación (Word y PDF) SHALL consumir directamente la configuración de estilos de la fábrica de estilos actual (ResolvedDocumentStyle) para la generación de la salida.

#### Scenario: PDF and Word Export use Style Engine
- **WHEN** un documento se exporta a PDF o Word
- **THEN** el exportador utiliza las propiedades del ResolvedDocumentStyle activo para formatear márgenes, tipografía, párrafos y encabezados del documento.

### Requirement: Citation Rendering Behavior
Al exportar un documento, el sistema SHALL preservar el texto original contenido en cualquier nodo de cita (e.g. elementos marcados con `data-reference-id`). La cita formateada resultante de la referencia activa SHALL ser anexada inmediatamente después del texto original, sin reemplazarlo ni eliminarlo.

#### Scenario: Appending citation to marked text
- **WHEN** el documento exportado contiene un texto enlazado a una referencia
- **THEN** el sistema preserva el texto original y agrega la cita correspondiente justo a continuación (ej: "texto referenciado (Autor, Año)").
