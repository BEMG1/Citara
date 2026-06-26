## Context

The APA formatter currently supports multiple export mechanisms (Word, PDF, APIs), but formatting applied in the editor (bold, italics, headings, alignment) is sometimes lost or represented inconsistently during export. This causes a mismatch between what the user sees in the editor and the final document.

## Goals / Non-Goals

**Goals:**
- Centralize the parsing and mapping of editor content format to a common internal Document Object Model (DOM) or abstract syntax tree (AST).
- Create generic export adapters that translate from this central AST to the target format (docx, pdf, etc.), ensuring preservation of inline and block formatting.

**Non-Goals:**
- Creating new formatting tools in the editor UI.
- Support for complex file formats outside of the current Word/PDF and generic API structures.

## Decisions

- **Centralized AST for Document Representation**: We will introduce a standard intermediate representation (e.g., JSON-based AST) that captures all structural and semantic formatting elements without tying them to a specific output. 
  - *Rationale*: A central AST guarantees that all export engines parse exactly the same model, eliminating inconsistencies where Word export might handle a list one way while PDF handles it another.
  - *Alternatives considered*: Direct HTML-to-Word/PDF conversion (rejected due to fragility and HTML layout variations across libraries).

- **Standardized Export Pipeline**: Update existing exporters to consume the new centralized AST instead of directly reading the editor's raw HTML or state.

## Risks / Trade-offs

- **Risk**: Refactoring existing exporters might break current functionality or edge cases currently working.
  - *Mitigation*: Extensive unit and integration tests verifying structural parity before and after the refactor. Use existing files as baselines.
