# custom-formats-management

## Purpose
TBD: Allow users to create, manage, and use custom citation formats.

## Requirements

### Requirement: Display Custom Formats in Selector
The system SHALL display the user's custom formats alongside the built-in formats in the format selector UI.

#### Scenario: User has custom formats
- **WHEN** the user opens the format selector dropdown
- **THEN** the system displays a "Built-in Formats" section with APA and IEEE
- **THEN** the system displays a "Custom Formats" section below it with the user's formats
- **THEN** an option "+ Create Custom Format" is available at the end of the list

#### Scenario: User has no custom formats
- **WHEN** the user opens the format selector dropdown
- **THEN** the "Custom Formats" section only displays the "+ Create Custom Format" option

#### Scenario: User is not authenticated
- **WHEN** the user opens the format selector dropdown without an active session
- **THEN** the custom formats section and the "+ Create Custom Format" option are displayed in a visually disabled state
- **THEN** hovering over the disabled options displays a tooltip indicating "Debes iniciar sesión o crear cuenta para usar esta función"
- **THEN** clicking the disabled options has no effect

### Requirement: Create Custom Format Modal
The system SHALL provide a modal to configure the parameters for a new or existing custom format.

#### Scenario: Validation of Name
- **WHEN** the user tries to save a format with an empty name
- **THEN** the system displays a validation error and prevents saving
- **WHEN** the user tries to save a format with a name that already exists for that user
- **THEN** the system displays a uniqueness error and prevents saving

#### Scenario: Validation of Numeric Values
- **WHEN** the user enters negative values for margins, font size, or indentation
- **THEN** the system displays a validation error and prevents saving

#### Scenario: Consistent Tab Styling
- **WHEN** the modal is displayed
- **THEN** the tabs must be styled consistently with the application's primary tabs (using transparent borders, accent color indicators, and consistent hover states)

### Requirement: Persist Custom Formats
The system SHALL save the configured custom format to the database linked to the authenticated user.

#### Scenario: Save new format
- **WHEN** the user clicks "Save Format" in the modal with valid data
- **THEN** the configuration is persisted in the `custom_citation_formats` table for that user
- **THEN** the format becomes available in the format selector

### Requirement: Edit and Delete Custom Formats
The system SHALL allow users to modify or remove their existing custom formats.

#### Scenario: Edit format
- **WHEN** the user selects the "Edit" action for a custom format
- **THEN** the modal opens populated with the saved values
- **WHEN** the user saves the changes
- **THEN** the database record is updated

#### Scenario: Delete format
- **WHEN** the user selects the "Delete" action for a custom format
- **THEN** the system requests confirmation
- **WHEN** the user confirms
- **THEN** the format is removed from the database and UI
