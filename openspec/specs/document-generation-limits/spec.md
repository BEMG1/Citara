## ADDED Requirements

### Requirement: Límite de tasa de generación para usuarios anónimos (no logueados)
El sistema SHALL restringir la frecuencia de exportación de documentos para los visitantes anónimos aplicando un factor multiplicador (ej. el doble de tiempo) sobre el límite base.

#### Scenario: Usuario anónimo intenta generar antes de tiempo
- **WHEN** un visitante sin sesión activa hace clic en exportar y no ha pasado el tiempo límite multiplicado (ej. 10 minutos)
- **THEN** la exportación es bloqueada y se muestra un Toast informando: "Actualmente no estas logueado, y deberas esperar [N] minutos, si quieres disminuir el tiempo incia sesión o crea una cuenta"

### Requirement: Límite de tasa de generación para usuarios gratuitos
El sistema SHALL restringir la frecuencia con la que un usuario de plan gratuito (Tipo 0) puede exportar/generar documentos usando el límite base.

#### Scenario: Usuario gratuito intenta generar antes de tiempo
- **WHEN** un usuario gratuito hace clic en exportar y no ha pasado el tiempo configurado (ej. 5 minutos) desde su última generación
- **THEN** la exportación es bloqueada y se muestra un Toast informando: "Actualmente no puede generar debido al límite de la capa gratuita"

#### Scenario: Usuario gratuito o anónimo intenta generar después del tiempo permitido
- **WHEN** un usuario (anónimo o plan 0) hace clic en exportar y ya ha pasado el tiempo límite respectivo desde su última generación
- **THEN** la exportación se procesa correctamente y se actualiza el tiempo de la última generación (en LocalStorage y, si aplica, en la base de datos).

### Requirement: Generación ilimitada para usuarios premium
El sistema SHALL permitir la exportación ilimitada para usuarios premium (Tipo 1), omitiendo cualquier restricción de frecuencia.

#### Scenario: Usuario premium exporta consecutivamente
- **WHEN** un usuario de tipo 1 intenta exportar múltiples documentos sin tiempo de espera
- **THEN** el sistema procesa todas las exportaciones inmediatamente sin mostrar advertencias ni bloqueos.

### Requirement: Sincronización del historial de generación
El sistema SHALL mantener sincronizada la fecha de la última generación en la caché local (LocalStorage) para todos los usuarios, y persistirla de forma segura en la base de datos (tabla `GenerateDocument`) únicamente para los usuarios logueados.

#### Scenario: Fallback a base de datos (Usuario Autenticado)
- **WHEN** un usuario logueado intenta exportar pero no posee su caché local (LocalStorage vacío)
- **THEN** el sistema consulta la tabla `GenerateDocument` en Supabase para obtener el `lastGenerate` real antes de permitir o denegar la acción.
