# validate-custom-format-sections

## Purpose
TBD: This spec defines the validation and guided navigation logic for the Custom Format Modal to ensure users complete required sections before saving.

## Requirements

### Requirement: Tab Validation State Tracking
The system SHALL track the validation state of each tab in the Custom Format Modal. The state SHALL be one of: Unvisited, Complete, or Incomplete.

#### Scenario: User visits a tab and completes all fields
- **WHEN** the user focuses on a tab and provides valid input for all required fields
- **THEN** the tab state updates to Complete and visually indicates success (e.g., checkmark).

#### Scenario: User visits a tab and leaves missing fields
- **WHEN** the user visits a tab and tries to navigate away with required fields empty or invalid
- **THEN** the tab state updates to Incomplete and visually indicates a warning (e.g., warning icon).

### Requirement: Restrict Navigation
The system SHALL restrict forward navigation ("Next" button) if the current tab is invalid, but SHALL NOT restrict backward navigation.

#### Scenario: Click Next with invalid fields
- **WHEN** the user clicks "Next" on a tab that has validation errors
- **THEN** the navigation is blocked, and the system focuses on the invalid fields and displays error messages.

#### Scenario: Click Back with invalid fields
- **WHEN** the user clicks "Back" on a tab that has validation errors
- **THEN** the navigation is permitted to the previous tab.

### Requirement: Save Action Restriction
The system SHALL only allow the user to save the custom format from the final "Review" tab, and only if all preceding tabs have a Complete state.

#### Scenario: Attempt to save from a non-Review tab
- **WHEN** the user is on any tab other than the Review tab
- **THEN** the "Save Format" button is not visible.

#### Scenario: Attempt to save with incomplete tabs
- **WHEN** the user reaches the Review tab but some previous tabs are Incomplete or Unvisited, and they try to bypass the UI to save
- **THEN** the save action is prevented and a system error message is shown.

### Requirement: Review Tab Summary
The system SHALL display a summary on the Review tab indicating which sections are complete and which require attention. 

#### Scenario: All sections complete
- **WHEN** the user reaches the Review tab and all sections are Complete
- **THEN** a success message "Your custom format is ready to be saved." is displayed.

#### Scenario: Some sections incomplete
- **WHEN** the user reaches the Review tab and some sections are Incomplete
- **THEN** a warning message "Some sections still require your attention" is shown along with a clickable list of those sections, which navigate back to the respective tabs upon click.
