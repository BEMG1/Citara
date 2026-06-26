## Capability: rich-text-toolbar

This is a delta spec that modifies the `rich-text-toolbar` capability.

### Requirement: Alineación justificada por defecto
El editor de párrafos debe aplicar la alineación justificada por defecto si no se especifica ninguna otra.

### Requirement: Limpieza de formato sin afectar referencias
El botón de limpiar formato debe remover estilos (negrita, cursiva, subrayado) pero conservar la marca `data-reference-id` de las referencias asociadas intacta.
