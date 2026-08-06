# Style Engine

## Purpose
The Style Engine is responsible for centralizing document style resolution. It transforms any citation format (APA, IEEE, UPEL, Custom) into a unified `ResolvedDocumentStyle` model.

## Requirements

### Requirement: Centralized Style Engine
The system SHALL provide a centralized Style Engine that acts as the single source of truth for resolving document styles, consuming the format configuration provided by the active context.

#### Scenario: Requesting styles for a standard format
- **WHEN** a consumer requests the document style for a standard format (e.g., 'apa7')
- **THEN** the Style Engine delegates to the corresponding standard format resolver (e.g., APA Resolver) and returns a `ResolvedDocumentStyle` object.

#### Scenario: Requesting styles for a custom format
- **WHEN** a consumer requests the document style for a custom format
- **THEN** the Style Engine obtains the complete custom format configuration from the `CitationFormatContext` and delegates to the Custom Resolver to return a `ResolvedDocumentStyle` object.

### Requirement: CitationFormatContext Caching and State
The system SHALL extend `CitationFormatContext` to manage the complete state of the active format, including its origin (`custom` vs standard), and maintain a `sessionStorage` cache exclusively for custom formats to avoid redundant database queries.

#### Scenario: Caching a custom format
- **WHEN** a user selects or edits a custom format
- **THEN** the `CitationFormatContext` MUST store the complete `customFormatConfig` in memory and persist it to `sessionStorage`.

#### Scenario: Resolving a custom format from cache
- **WHEN** the `CitationFormatContext` initializes or changes to a custom format
- **THEN** it MUST attempt to load the configuration first from memory, then from `sessionStorage`, and only query Supabase if it is not found in either.

#### Scenario: Invalidating the custom format cache
- **WHEN** a user selects a different custom format, deletes the active custom format, or logs out
- **THEN** the `CitationFormatContext` MUST automatically clear or update the `sessionStorage` cache to reflect the change.

### Requirement: Unified Style Model
The system SHALL define a `ResolvedDocumentStyle` interface that encompasses all stylistic properties (page size, margins, typography, paragraphs, headers) currently supported by standard formats and `CustomCitationFormat`.

#### Scenario: Consistency across formats
- **WHEN** any resolver (APA, IEEE, UPEL, Custom) processes its specific format configuration
- **THEN** the output MUST be perfectly mapped to the properties defined in `ResolvedDocumentStyle`, without losing information or creating format-specific parallel structures.

### Requirement: Format-Agnostic Consumption
Consumers of styles (e.g., Document Designer, Exporters) SHALL NOT implement format-specific logic (e.g., `if (format === 'apa7')`) for applying stylistic properties.

#### Scenario: Document Designer Integration
- **WHEN** the `DocumentDesigner` renders the document
- **THEN** it MUST solely rely on the `ResolvedDocumentStyle` object (via `CitationFormatContext`) to apply typography, margins, paragraphs, and heading styles, without any conditional logic based on the format name.

### Requirement: Visual Transition During Format Change
The system SHALL provide visual feedback when the document style changes to prevent jarring UI jumps during the recalculation of styles.

#### Scenario: Changing formats
- **WHEN** the user selects a different format from the selector
- **THEN** the `DocumentDesigner` MUST display a brief visual transition (e.g., loader or overlay) while the new styles are applied in real-time, without requiring a page reload.

### Requirement: Backwards Compatibility for Standard Formats
The introduction of the Style Engine SHALL NOT alter the existing stylistic behavior of APA 7, IEEE, or UPEL formats.

#### Scenario: Verifying standard styles
- **WHEN** the `ResolvedDocumentStyle` for 'apa7' is inspected
- **THEN** its properties MUST exactly match the hardcoded values currently used in the application for APA 7.
