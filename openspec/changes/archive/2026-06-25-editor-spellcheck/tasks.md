## 1. Context and Implementation of Editor Options

- [x] 1.1 In `DocumentEditor.tsx`, extract the current language setting from `useLanguage()` (which provides 'es' or 'en' from the `AppContext`).
- [x] 1.2 Update the `useEditor` configuration to inject `editorProps.attributes` including `spellcheck: 'true'` and `lang: language`.

## 2. Dynamic Update Mechanism

- [x] 2.1 Add a `useEffect` hook in `DocumentEditor.tsx` that triggers whenever the `language` state changes.
- [x] 2.2 Inside the effect, check if the `editor` instance exists. If so, update the editor's options dynamically (`editor.setOptions({ editorProps: { attributes: { spellcheck: 'true', lang: language } } })`).
- [x] 2.3 Verify if the dynamic update correctly changes the `lang` attribute on the editable DOM element.

## 3. Manual Testing

- [x] 3.1 Write a misspelled word in Spanish with the editor configured in Spanish to check if it gets highlighted natively.
- [x] 3.2 Change the language to English via the Header selector, and verify if the Spanish word is now marked incorrect, and check English misspelled words.
- [x] 3.3 Ensure that changing the language updates the dictionaries without requiring a page reload.
