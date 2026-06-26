## 1. Z-Index Scale Definition

- [x] 1.1 Review existing `z-index` values across the application (Toolbar, ExportModal, Dialogs, generic overlays).
- [x] 1.2 Define a unified Z-Index scale mapping in CSS or Tailwind classes (`z-40` for sticky components, `z-50` for overlays/modals).

## 2. Refactoring Toolbar Z-Index

- [x] 2.1 Identify the main Toolbar component (`src/components/Toolbar` or similar).
- [x] 2.2 Adjust its `z-index` to the newly defined sticky level (`z-40` or equivalent) ensuring it stays above regular content but below modales.
- [x] 2.3 Verify that scrolling still keeps the toolbar fixed without visual glitches on the main document canvas.

## 3. Refactoring Modal Z-Index

- [x] 3.1 Update the `ExportModal` component to use a `z-index` superior to the Toolbar (e.g. `z-50`).
- [x] 3.2 Ensure the modal's background overlay (if any) also shares the appropriate elevated `z-index`.
- [x] 3.3 Identify and apply the same `z-index` fix to any other existing Modals (Confirmation dialogs, selects, etc.) in the application.

## 4. End-to-end Verification

- [x] 4.1 Perform manual testing of the Export Modal over the Toolbar.
- [x] 4.2 Perform manual testing of other modales over the Toolbar to ensure consistent hierarchy.
