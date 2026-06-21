# 📜 Development Rules & Standards

Este documento es la fuente de verdad para la escritura de código en el proyecto. Antes de abrir un Pull Request, asegúrate de cumplir estas normas.

---

## 1. Code Organization

### File Structure

```text
src/
├── assets/         # Static assets (images, fonts, icons)
├── components/     # Pure and reusable visual components (Buttons, Inputs)
├── context/        # React Context providers (shared state, logic, and general component context)
├── core/           # BUSINESS LOGIC (Parsers APA, RegEx, formatters)
├── hooks/          # Custom React hooks
├── i18n/           # Internationalization (translation dictionaries and types)
├── interfaces/     # Strict data contracts (.d.ts or .ts)
├── pages/          # Routable views
├── utils/          # Generic support functions (date formatters, etc.)
└── styles/         # Global CSS and Tailwind configurations
```

> [!NOTE]
> The folders `services/` and `routes/` are suspended until **Phase 2**.

### Naming Conventions

- **Components:** PascalCase (ej. `CitationBuilder.tsx`)
- **Logic/Hooks files:** camelCase (ej. `apaProcessor.ts`, `useCitation.ts`)
- **Interfaces:** PascalCase obligatorily starting with the letter `I` (ej. `IAuthor`, `IReference`)
- **Types (Unions):** PascalCase without prefix (ej. `NormStyle`)
- **Global Constants:** UPPER_SNAKE_CASE (ej. `MAX_AUTHORS_APA_7`)

---

## 2. TypeScript (Strict Mode)

### Explicit Typing Required

Forbidden to let TypeScript "guess" the return of business functions.

```typescript
// ❌ Bad
const formatAuthors = (authors) => { ... }

// ✅ Good
const formatAuthors = (authors: IAuthor[]): string => { ... }
```

### Interfaces vs Types

Use `interface` for data structures (Models).

Use `type` for combinations, primitives or closed lists of options.

```typescript
// ✅ Good
interface ICitation {
  id: string;
  rawText: string;
  normalizedText: string;
  year: number;
}

// ✅ Good
type NormStyle = 'APA_7' | 'APA_6' | 'CUSTOM';
```

### ZERO TOLERANCE to `any`

If the text entered by the user or the structure of an uploaded file is a mystery, it must be typed as `unknown` and validated before use.

```typescript
// ❌ Forbidden in all code
const incomingData: any = getPastedText();

// ✅ Correcto
const incomingData: unknown = getPastedText();
if (typeof incomingData === 'string') {
  // procesar
}
```

---

## 3. React & Performance (High Priority)

Since processing text strings using complex Regular Expressions is costly for the browser's CPU:

### 1. Mandatory Memoization of Heavy Calculations

All normalized text that depends on a real-time input must pass through `useMemo`.

```typescript
// ✅ Good
const previewText = useMemo(() => {
  return normalizeApaStyle(rawInput, selectedRules);
}, [rawInput, selectedRules]);
```

### 2. Lazy Loading for Normalization Engines

Do not load IEEE or Custom standards code if the user only entered to use APA.

```typescript
const ApaNormalizerView = React.lazy(() => import('./pages/ApaNormalizerView'));

// En el router:
<Suspense fallback={<ProcessorSkeleton />}>
  <ApaNormalizerView />
</Suspense>
```

---

## 4. Git Workflow

### Commit Convention

Follow the Angular convention. Forbidden to make commits with the message "wip" or "fix".

- **`feat`:** New functionality (ej. `feat: add APA 7th journal normalizer`)
- **`fix`:** Bug fix (ej. `fix: catastrophic backtracking on URL regex`)
- **`refactor`:** Code improvements without altering functionality (ej. `refactor: extract author parser logic`)
- **`style`:** Tailwind visual changes (ej. `style: update card hover borders`)

### Branch Naming

```text
feat/apa-book-processor
fix/missing-italic-on-title
docs/update-rules
```

---

## 5. 📦 PHASE 2: Backend, Auth & DB (Frozen Rules)

> [!WARNING]
> Do not apply these rules today. They serve as architectural warnings for when the server is activated.

```typescript
// [FROZEN STANDARD] - Llamadas a API
import { useApi } from '@core/api';

const api = useApi();
const response = await api.post<ICitation>('/normalize/apa', { text });
```

```typescript
// [FROZEN STANDARD] - Protección de rutas
<AuthorizationGuard requiredFeature="CUSTOM_NORMS">
  <CustomRulesEditor />
</AuthorizationGuard>
```