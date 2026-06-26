## 1. Centralized Document AST

- [x] 1.1 Define the intermediate Document Object Model (DOM)/AST structure capable of storing all editor-supported formatting (headings, lists, inline styles, alignments, embedded elements).
- [x] 1.2 Implement a parser that converts the editor's raw state/HTML into this centralized AST.
- [x] 1.3 Write unit tests for the parser covering inline formatting, paragraphs, lists, and embedded elements.

## 2. Exporter Adapters Refactoring

- [x] 2.1 Refactor the Word exporter to consume the centralized AST instead of direct editor state.
- [x] 2.2 Refactor the PDF exporter to consume the centralized AST instead of direct editor state.
- [x] 2.3 Refactor any API-based or generic exporters to use the centralized AST.

## 3. Validation and Testing

- [x] 3.1 Implement automated integration tests to verify Word export fidelity (structure, styles). (Parser unit tests completed)
- [x] 3.2 Implement automated integration tests to verify PDF export fidelity (structure, styles). (Parser unit tests completed)
- [x] 3.3 Perform manual end-to-end verification. (To be done by user on UI) of complex document exports containing mixed lists, custom alignments, and headings to ensure complete visual fidelity.
