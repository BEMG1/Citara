# DocumentEditor Specification

## 1. Overview
`DocumentEditor` is the central component for text editing and document processing within the application. It provides a rich text editor (powered by TipTap) with integrated features for importing Word documents (`.docx`), automatically extracting metadata (cover pages and references), and running compliance checks against citation formats (APA 7, APA 6, IEEE).

## 2. Dependencies & Integrations

### External Libraries
- **TipTap (`@tiptap/react`, `@tiptap/core`, `@tiptap/starter-kit`)**: Headless rich text editor framework.
- **Mammoth (`mammoth`)**: Converts `.docx` files to HTML and raw text for import.
- **Lucide React (`lucide-react`)**: UI icons (`Upload`, `Trash2`, `Link`, `Unlink`, `ChevronDown`, `BookOpen`).

### Context & State (App Contexts)
- **`useDocument`**: Manages `documentText`, `documentTitle`, `haveText`, `complianceScore`, and `isComplianceModalOpen`.
- **`useReferences`**: Manages the list of global `references` and `setReferences`.
- **`useCoverPage`**: Manages `coverPage` data.
- **`useCitationFormat`**: Supplies the currently active `citationFormat` (e.g., `apa7`).
- **`useLanguage`**: Provides localization (`t`) and the current `language`.

### Core Modules
- **`DocumentExtractor`**: Heuristically extracts cover page data and references from raw HTML.
- **`ComplianceEngine`**: Analyzes the document HTML and raw text to produce a `ComplianceReport` based on the active formatting rules.
- **`referenceUtils`**: Utilities for fetching reference display text and year formatting.

## 3. Core Features

### 3.1. Rich Text Editor Setup
- Initializes TipTap with `StarterKit` (restricted to headings H1, H2, H3).
- **`ReferenceMark` Extension**: A custom mark extension that adds `data-reference-id` attributes to text, allowing users to visually link text segments to specific bibliographic references.
- **`AutoTitleCaseHeading` Extension**: A custom keyboard shortcut extension that listens to the `Enter` key inside headings. It automatically formats the heading text into Title Case (capitalizing major words) before creating a new paragraph.

### 3.2. Word Document Import & Extraction
- Users can upload `.docx` files via an input button or Drag & Drop.
- **Mammoth Processing**: The file is parsed into both HTML (for the editor) and raw text (for the compliance engine).
- **Intelligent Extraction**: Passes the HTML to `DocumentExtractor.extract()`, which attempts to detect and extract:
  - Cover page metadata (title, author, institution, etc.).
  - Bibliographic references at the end of the document.
- Updates the respective global contexts (`setCoverPage`, `setReferences`) with the extracted data.
- Updates the editor content and triggers an initial Compliance Engine analysis, opening the `ComplianceModal` with the results.

### 3.3. Compliance Analysis & Normalization
- **Debounced Analysis**: Listens to editor text changes and runs `ComplianceEngine.analyzeDocument` after a 500ms debounce.
- Provides a `ComplianceReport` with a score and rule evaluations.
- **Normalization**: If the user clicks "Normalizar" in the modal, the state `isNormalized` is set to `true`, which applies specific CSS classes (`apa-normalized-doc`) to preview the document as it would look when exported.

### 3.4. Reference Management (Bubble Menu & Tooltips)
- **Bubble Menu**: Appears when text is selected.
  - If the text is already linked to a reference, shows a "Remove Link" option.
  - If not linked, provides a dropdown menu to select from available `references` and associate them.
- **Hover Tooltips**: Listens to mouse movements over the editor container. If the user hovers over text with a `data-reference-id`, a floating tooltip displays the formatted citation of the linked reference.
- **Orphan Cleanup**: An effect watches the `references` list. If a reference is deleted globally, it scans the editor document and removes any `ReferenceMark` that points to the deleted ID.

### 3.5. Figure Management (APA Figures)
### Objective

Allow the insertion and management of figures according to APA 7, ensuring that each figure:

Conserve its visual content.
Contain all the information required by APA.
Can be associated with a copyright attribution.
Be referenced within the text of the document.
Be validated by the Compliance Engine.
### Figure Model

The Figure entity is incorporated as follows:
```
interface Figure {
    id: string;

    number: number;

    imageUrl: string;

    title: string;

    caption?: string;

    note?: string;

    copyrightAttribution?: {
        sourceType: "website" | "book" | "journal" | "custom";

        imageTitle: string;

        author: string;

        year: string;

        source: string;

        url?: string;

        license?: string;

        page?: string;

        volume?: string;

        issue?: string;
    };
}
```
### APA Figure Structure

Each figure inserted in the editor must be represented using the following structure:

```
Figura 1

Título de la figura

[Imagen]

Leyenda (opcional)

Nota. Adaptado de ...
```

### Formatting Rules

#### Figure Number

- Mandatory.
- Generated automatically.
- Bold.
- Sequential numbering according to appearance.

Example:
```
Figura 1
```

#### Title
- Mandatory.
- Must appear below the number.
- Italic.

Example:
```
Comportamiento histórico del dólar
```

#### Image
- Mandatory.
- Can come from:
- Local upload.
- Imported DOCX document.
- Clipboard paste.

#### Caption
- Optional.
- Shown inside the visual block of the figure.

Example:
```
Los puntos cuadrados representan ganancias.
```

#### Note
- Optional.
- Used to:
- Define abbreviations.
- Explain content.
- Show copyright attributions.

Example:
```
Nota. Adaptado de ...
```

### Reference Synchronization

When a figure is created and the user provides copyright attribution information during the creation process, the system shall automatically generate and register the corresponding bibliographic reference in the References section.

The generated reference must be synchronized with the figure attribution data, ensuring consistency between the figure note and the bibliography entry.

The automatic reference creation process shall:

Create a new reference using the information provided in the figure attribution form.
Add the reference to the global references collection (setReferences).
Associate the generated reference with the corresponding figure.
Prevent duplicate references when the same source has already been registered.
Update the bibliographic reference if the figure attribution information is modified.

This behavior ensures compliance with APA 7 requirements, which establish that any adapted or reproduced figure must include both:

A copyright attribution statement in the figure note.
A corresponding entry in the References section.

### 3.6. Figure Insertion Workflow

Adds a new button:
```
Insert Figure
```
When selected, it opens a modal:
```
FigureModal
```

#### Fields:
```
Basic information
Title
Caption
Note
Image
```
#### APA Attribution
```
Image Title
Author
Year
Source
URL
Licencia
```

#### Saving

- The Figure object is created.
- A FigureNode is inserted into TipTap.
- The figure is added to the FigureContext.

#### 3.7. FigureNode Extension

Implements a custom extension:
```
FigureNode
```
Responsibilities:

- Renderizar la figura.
- Mantener atributos.
- Preservar información durante exportación.
- Facilitar importación DOCX.

#### 3.8. DOCX Import & Figure Extraction

During document upload:
```
DocumentExtractor.extract()
```
should detect:

- Embedded images.
- Figure titles.
- Figure notes.
- APA attributions.

and generate:
```
setFigures(figures);
```


### 3.9. Compliance Rules

Adds new rules to the Compliance Engine.

#### RULE_001

Figure without title

Validates:

Every figure must have a title.

Error:

The Figure 3 does not have a defined title.

#### RULE_002

Figure without APA note

Validates:

Adapted or reproduced figures must contain an attribution note.

Error:

The Figure 2 does not contain copyright attribution.

#### RULE_003

Figure without associated bibliographic reference

Validates:

All APA attributions must have a corresponding bibliographic reference.

Error:

The Figure 1 has an attribution but no bibliographic reference exists.

#### RULE_004

Figure not cited in the text

Validates:

That at least one textual reference to the figure exists within the document.

Valid example:

As seen in Figure 1...

or

Figure 1 shows...

Error:

Figure 1 exists in the document but is never mentioned in the text.

#### RULE_005

Reference to non-existent figure

Validates cases such as:

As seen in Figure 8...

when only:

Figure 1
Figure 2
Figure 3

exist.

Error:

A reference to Figure 8 was found but this figure does not exist in the document.


### 3.10. ComplianceModal Integration

Adds a new section:
```
APA Figures
```

Example:
```
⚠ Figure 1 does not have APA attribution.

⚠ Figure 2 has not been cited in the text.

⚠ Figure 3 does not have a title.

⚠ There is a reference to Figure 5 that does not exist.
```

### 3.11. Normalization

When "Normalize" is pressed:

- Recalculates figure numbering.
- Fixes line breaks.
- Applies APA visual formatting.

Example:
```
Figure 1            -> Bold

Title               -> Italic

Image

Caption

Note.
```

### 3.12. Figure Properties Panel

A new tab shall be added to the Right Panel with Tabs located in App.tsx, dedicated to the management of figures contained within the document.

#### Visibility

The Figures tab shall only be displayed when the current document contains at least one figure. If no figures are present, the tab shall remain hidden.

#### Figure Selection

The panel shall operate based on the currently selected figure within the editor.

When no figure is selected:

- All figure property fields shall be displayed in a disabled state.
- The user shall not be able to modify figure information.

When a figure is selected:

- The panel shall load the information associated with the selected figure.
- All editable fields shall become enabled.

##### Editable Properties

The panel shall allow the user to manage the following figure properties:

###### Title

Represents the APA figure title displayed below the figure number.

Characteristics:

- Mandatory field.
- Editable by the user.
- Automatically synchronized with the figure displayed in the editor.

##### Caption

Represents the figure legend used to describe symbols, markers, or visual elements contained within the image.

Characteristics:

- Optional field.
- Editable by the user.
- Automatically synchronized with the figure displayed in the editor.

##### Note

Represents the APA figure note displayed below the figure.

Characteristics:

- Optional field.
- Editable by the user.
- Used for explanatory content, abbreviations, copyright attributions, or additional context.
- Automatically synchronized with the figure displayed in the editor.

###### Figure Number

The figure number shall not be editable from the panel.

Characteristics:

- Generated automatically by the system.
- Calculated according to the order of appearance within the document.
- Updated automatically whenever figures are inserted, removed, or reordered.

##### Synchronization

Any modification performed from the Figures panel shall immediately update the selected figure within the editor and the corresponding figure data stored in the application state.

Changes made from the editor shall likewise be reflected in the Figures panel, ensuring bidirectional synchronization between the editor content and the figure management interface.

### 3.13. Internationalization

- The figure component must be internationalized.
- All figure-related strings must be translated to Spanish and English.
- The figure component must be able to switch between Spanish and English.

### 3.14. Reference Association for Figures

#### Objective

Allow figures to be associated with bibliographic references through the existing Bubble Menu mechanism, enabling traceability between figures and references without modifying the visual content of the document.

#### Current Behavior

The Bubble Menu is currently used to associate textual content with bibliographic references through the `ReferenceMark` mechanism.

However, figures also require a relationship with bibliographic references, particularly when the figure is adapted or reproduced from an external source.

#### Expected Behavior

When a figure is selected, the Bubble Menu shall be available and allow the user to associate an existing bibliographic reference with the selected figure.

Unlike textual references, this association shall be stored internally and shall not modify the visual representation of the figure within the editor.

#### Figure Reference Association

When a figure is selected:

* The Bubble Menu shall display the list of available references.
* The user may select an existing reference.
* The selected reference shall be associated with the figure.
* The association shall be persisted in the document state.

The association shall be stored using the figure identifier and the reference identifier.

Example:

```typescript
{
    figureId: "figure-1",
    referenceId: "reference-123"
}
```

#### Visual Behavior

Associating a reference with a figure shall not:

* Insert visible citation text.
* Modify the figure title.
* Modify the figure caption.
* Modify the figure note.
* Add marks or annotations to the image.
* Alter the document content displayed to the user.

The association shall exist exclusively at the data layer.

#### Reference Updates

When a reference associated with a figure is modified:

* The association shall remain intact.
* The figure shall continue pointing to the updated reference.

When a reference is deleted:

* The figure-reference association shall be removed automatically.
* The Compliance Engine shall be updated accordingly.

#### Compliance Integration

The Compliance Engine shall use the figure-reference association to validate:

* Whether a figure has a corresponding bibliographic reference.
* Whether the reference still exists.
* Whether the generated attribution information remains valid.

#### Acceptance Criteria

**AC-01**

Given a selected figure,

When the user opens the Bubble Menu,

Then the available references shall be displayed.

**AC-02**

Given a selected figure,

When the user associates a reference,

Then the association shall be stored internally without modifying the visible document content.

**AC-03**

Given a figure associated with a reference,

When the document is saved and reopened,

Then the association shall remain available.

**AC-04**

Given a figure associated with a reference,

When the reference is deleted,

Then the figure-reference association shall be removed automatically.

**AC-05**

Given a figure associated with a reference,

When the Compliance Engine executes,

Then the association shall be considered during figure validation rules.

### 3.15. Automatic Reference Cleanup for Deleted Figures

#### Objective

Ensure that when a figure is removed from the document, any bibliographic reference that was automatically created and exclusively associated with that figure is also removed, maintaining consistency between figures and references.

#### Expected Behavior

When a figure is deleted from the document, the system shall verify whether the figure has an associated bibliographic reference.

If an associated reference exists, the system shall determine whether the reference is still being used by any other figure or document element.

#### Reference Removal Rules

##### Exclusive Reference

If the reference was created specifically for the deleted figure and is not associated with any other figure or citation within the document:

* The reference shall be automatically removed from the References collection.
* The corresponding entry shall be removed from the References section.
* Any internal association records shall be deleted.

##### Shared Reference

If the reference is associated with multiple figures or other document elements:

* The association between the deleted figure and the reference shall be removed.
* The reference itself shall remain in the document.

#### Synchronization

The deletion process shall update:

* The editor content.
* The Figures collection.
* The References collection.
* Any internal mappings between figures and references.
* The Compliance Engine state.

#### Compliance Integration

After a figure is deleted, the Compliance Engine shall be executed again to ensure that:

* No orphaned references remain.
* No invalid figure-reference associations exist.
* The document score and validation results are updated accordingly.

### 3.X. Figure Export Support (PDF and Word)

#### Objective

Ensure that all figures and their associated APA metadata are preserved and exported correctly when generating PDF or Word documents.

#### Current Issue

Figures inserted into the editor are currently not being exported completely. During the export process, the image and its associated information may be omitted, resulting in incomplete documents and loss of APA figure content.

#### Expected Behavior

When a document is exported to PDF or Word, all figures present in the editor shall be included in the generated document along with their associated metadata.

The exported result shall preserve both the visual content and the APA structure of each figure.

#### Exported Figure Structure

Each figure shall be exported using the following structure:

```text
Figura 1

Título de la figura

[Imagen]

Leyenda (opcional)

Nota. Adaptado de ...
```

#### Exported Elements

##### Figure Number

* Must be included in the exported document.
* Must be displayed in bold.
* Must preserve the numbering assigned within the editor.

##### Title

* Must be included immediately below the figure number.
* Must preserve the title defined by the user.
* Must be exported using italic formatting.

##### Image

* Must be embedded within the exported document.
* Must preserve its dimensions whenever possible.
* Must preserve its position relative to the surrounding content.
* Must be visible in both PDF and Word exports.

##### Caption

* Must be exported when defined.
* Must appear associated with the corresponding figure.

##### Note

* Must be exported when defined.
* Must preserve any explanatory content entered by the user.
* Must include copyright attribution information when available.

#### Copyright Attribution Export

When a figure contains copyright attribution information, the generated note shall be exported as part of the figure.

Example:

```text
Nota. Adaptado de Virus VIH [Fotografía], por Consejo Superior de Investigaciones Científicas, 2011, Flickr (https://flic.kr/p/aronSf). CC BY 2.0.
```

The attribution text shall remain synchronized with the figure metadata and the corresponding bibliographic reference.

#### PDF Export

The PDF generation process shall:

* Render all figures.
* Preserve figure order.
* Preserve titles, captions, and notes.
* Maintain the relationship between figures and surrounding content.

#### Word Export

The Word generation process shall:

* Embed all images within the generated DOCX file.
* Preserve figure numbering.
* Preserve titles, captions, and notes.
* Generate a document that can be opened in Microsoft Word without losing figure content.

#### Validation

Before export, the system shall verify that:

* The referenced image resource exists.
* The figure contains valid data.
* Exportable figure content can be generated successfully.

If a figure cannot be exported, the system shall notify the user and indicate which figure contains the issue.

#### Acceptance Criteria

**AC-01**

Given a document containing figures,

When the document is exported to PDF,

Then all figures and their associated information shall appear in the generated file.

**AC-02**

Given a document containing figures,

When the document is exported to Word,

Then all figures and their associated information shall appear in the generated DOCX file.

**AC-03**

Given a figure with a title, caption, and note,

When the document is exported,

Then all figure metadata shall be preserved.

**AC-04**

Given a figure with copyright attribution,

When the document is exported,

Then the attribution shall appear within the figure note.

**AC-05**

Given multiple figures in a document,

When the document is exported,

Then the numbering, order, and content of all figures shall match the editor representation.



### 4. State & Lifecycle Management

- **Local State**:
  - `isLoading`, `isDragging`: UI states for file uploads.
  - `hoverInfo`: Coordinates and reference data for the hover tooltip.
  - `isDropdownOpen`: Controls the state of the reference association menu.
  - `complianceReport`: Holds the result of the latest Compliance Engine run.
  - `isNormalized`: Flag indicating if the editor should preview normalized styling.

- **Effects**:
  - Updates TipTap content if external `documentText` changes (e.g., loaded from `localStorage` on mount).
  - Syncs TipTap content changes back to `setDocumentText`.
  - Clears the active dropdown menu if the editor selection changes or the user clicks outside.

## 5. UI Layout

1. **Toolbar Area**:
   - Upload / Drag & Drop button for `.docx` files.
   - Clear document button (Trash icon).
   - Formatting buttons: H1, H2, H3, and Paragraph toggle.
2. **Editor Area**:
   - An `EditorContent` wrapper that supports Drag & Drop overlays.
   - Applies the `apa-normalized-doc` class conditionally based on compliance status.
3. **Modals & Overlays**:
   - TipTap `BubbleMenu` for reference actions.
   - Custom floating tooltip (`hoverInfo`) for referencing context.
   - `ComplianceModal` component to display rule validation errors and the "Normalizar" action.

## Bug Fixes

### Bug Fix: Figure Reference Detection in Compliance Engine

#### Objective

Correct the figure citation validation logic to properly detect references to figures within the document text and prevent false compliance warnings.

#### Current Issue

During validation, the Compliance Engine reports that a figure has not been referenced in the document, even when the corresponding text contains references such as:

```text
Figura 1
```

or

```text
Como se observa en la Figura 1...
```

This results in false validation errors being displayed in the ComplianceModal.

#### Expected Behavior

The Compliance Engine shall correctly identify references to figures throughout the document and mark them as used when a valid reference is found.

The following examples shall be considered valid figure references:

```text
Figura 1
```

```text
La Figura 1 muestra...
```

```text
Como se observa en la Figura 1...
```

```text
Tal como se presenta en la Figura 1.
```

#### Validation Improvements

The figure reference detection mechanism shall:

* Search the complete document text.
* Ignore capitalization differences.
* Ignore formatting differences introduced by the editor.
* Support figure references embedded within paragraphs.
* Support references separated by punctuation marks.
* Prevent false negatives caused by HTML tags, marks, or custom editor nodes.

#### Compliance Integration

When a valid textual reference to a figure is detected:

* The figure shall be marked as referenced.
* No "Figure not referenced" warning shall be generated.
* The ComplianceModal shall reflect the updated validation result.

#### Acceptance Criteria

**AC-01**

Given a document containing a figure numbered "Figura 1",

When the text contains the phrase "Figura 1",

Then the figure shall be considered referenced.

**AC-02**

Given a document containing a figure numbered "Figura 1",

When the text contains the phrase "Como se observa en la Figura 1...",

Then the figure shall be considered referenced.

**AC-03**

Given a document containing a valid figure reference,

When the Compliance Engine executes,

Then no "Figure not referenced" warning shall be displayed.

**AC-04**

Given multiple figures in a document,

When each figure is referenced at least once within the text,

Then the Compliance Engine shall not generate missing figure reference warnings.


### Bug Fix: Clear Figure Selection After Deletion

#### Objective

Ensure that the figure selection state is properly cleared when a selected figure is removed from the document.

#### Current Issue

When a figure is selected and subsequently deleted, the Figures panel continues displaying the properties of the deleted figure. This creates an inconsistent state where the UI references an element that no longer exists.

#### Expected Behavior

When a selected figure is deleted:

* The active figure selection shall be cleared.
* The Figures panel shall immediately update its state.
* All figure property fields shall become disabled.
* No data from the deleted figure shall remain visible in the panel.

#### Synchronization

The deletion process shall update:

* Editor state.
* Figure collection.
* Selected figure state.
* Figures panel UI.

#### Acceptance Criteria

**AC-01**

Given a selected figure,

When the figure is deleted,

Then the active figure selection shall be cleared.

**AC-02**

Given a selected figure,

When the figure is deleted,

Then the Figures panel shall display no figure information.

**AC-03**

Given a selected figure,

When the figure is deleted,

Then all figure property fields shall be disabled until another figure is selected.


### Bug Fix: Figure Number Recalculation After Deletion

#### Objective

Ensure that figure numbering is recalculated whenever figures are removed from the document, maintaining sequential APA numbering without gaps.

#### Current Issue

When a figure is deleted and a new figure is inserted afterward, the system continues incrementing the previous figure counter.

Example:

```text
Figura 1
```

The figure is deleted.

A new figure is inserted.

Current result:

```text
Figura 2
```

Expected result:

```text
Figura 1
```

#### Expected Behavior

Figure numbering shall be determined by the current order of figures present in the document rather than by a persistent incremental counter.

Whenever a figure is:

* Added.
* Removed.
* Moved.
* Imported.

The system shall recalculate the numbering of all figures based on their position within the document.

#### Numbering Rules

The numbering sequence shall:

* Start at Figure 1.
* Contain no gaps.
* Be recalculated automatically after structural changes.
* Reflect the actual order of appearance in the document.

Example:

Before deletion:

```text
Figura 1
Figura 2
Figura 3
```

After deleting Figure 2:

```text
Figura 1
Figura 2
```

After inserting a new figure at the end:

```text
Figura 1
Figura 2
Figura 3
```

#### Compliance Integration

Any renumbering operation shall automatically update:

* Figure nodes.
* Figure references.
* Figure panel information.
* Compliance Engine validations.

#### Acceptance Criteria

**AC-01**

Given a document with a single figure,

When the figure is deleted and a new one is created,

Then the new figure shall be numbered as Figure 1.

**AC-02**

Given multiple figures,

When a figure is removed,

Then all remaining figures shall be renumbered sequentially.

**AC-03**

Given a renumbering operation,

When the process completes,

Then no numbering gaps shall exist within the document.

**AC-04**

Given figure references within the text,

When figures are renumbered,

Then the corresponding figure references shall remain synchronized.
