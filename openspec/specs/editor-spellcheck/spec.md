## ADDED Requirements

### Requirement: RF-01. Habilitación de la corrección ortográfica
El editor deberá tener habilitada la funcionalidad de corrección ortográfica de forma nativa durante toda la edición del documento. La validación deberá ejecutarse automáticamente mientras el usuario escribe.

#### Scenario: Edición de documento
- **WHEN** el usuario interactúa y escribe contenido en el editor de texto
- **THEN** la validación ortográfica nativa del navegador se encuentra activa para el componente editable.

### Requirement: RF-02 y RF-03. Detección y Sugerencias
Las palabras que no pertenezcan al diccionario del idioma activo deberán identificarse visualmente (por el navegador) como posibles errores ortográficos, permitiendo al usuario ver las sugerencias nativas mediante el menú contextual.

#### Scenario: Palabra incorrecta detectada
- **WHEN** el usuario escribe una palabra con errores ortográficos
- **THEN** la palabra se subraya visualmente (comportamiento nativo) y al hacer clic derecho se despliegan sugerencias para su corrección.

### Requirement: RF-04 y RF-05. Sincronización dinámica de Idioma
El idioma utilizado por la corrección ortográfica (atributo `lang`) deberá corresponder automáticamente al idioma configurado globalmente para el sitio web. El cambio deberá ser inmediato sin recargar la página.

#### Scenario: Cambio dinámico de idioma
- **WHEN** el usuario cambia el idioma global de la aplicación de español a inglés
- **THEN** el diccionario ortográfico del editor se actualiza en tiempo real, invalidando las palabras en español y comenzando a aplicar validaciones para idioma inglés.

### Requirement: RF-06. Conservación del contenido
La corrección ortográfica es estrictamente consultiva y nativa, por lo cual no deberá modificar automáticamente el contenido escrito por el usuario.

#### Scenario: Resaltado sin auto-corrección
- **WHEN** se detecta una palabra incorrecta
- **THEN** la palabra se marca visualmente pero su texto permanece inalterado hasta que el usuario decida corregirlo.
