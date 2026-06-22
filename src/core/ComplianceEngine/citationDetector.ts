/**
 * citationDetector.ts
 *
 * Utilities to detect in-text citations from plain-text documents
 * (e.g., .docx files imported via Mammoth that don't carry Citara's
 * <mark data-reference-id> markup).
 *
 * Supports:
 *  - APA 7 / APA 6: (Author, Year), (Author et al., Year),
 *                    (Author & Author, Year), Author (Year)
 *  - IEEE: [1], [1, 2], [1–3]
 */

import type { IReference } from '@/core/referenceUtils';

/** Escape special regex chars in a string. */
const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Extracts the last name (or surname) from an author string.
 *
 * Handles common formats:
 *  - "Pérez, J."          → "Pérez"   (last name before comma)
 *  - "J. Pérez"           → "Pérez"   (last word)
 *  - "Pérez García, J."   → "Pérez García" (compound surnames before comma)
 *  - "García"             → "García"
 */
const extractLastName = (author: string): string => {
  // Take only the first author when multiple are separated by ; or &&
  const firstAuthor = author.split(/[;]|(?:\s*&&?\s*)/)[0].trim();

  if (firstAuthor.includes(',')) {
    // "Pérez, J." or "Pérez García, Juan"
    return firstAuthor.split(',')[0].trim();
  }

  // "J. Pérez" or "Juan Pérez" — take last word
  const parts = firstAuthor.trim().split(/\s+/);
  return parts[parts.length - 1];
};

/**
 * Detects which references appear to be cited in plain text using
 * APA-style parenthetical patterns.
 *
 * @param text       The plain text content of the document
 * @param references The list of known references
 * @returns A Set of reference IDs that were detected as cited
 */
export const detectApaPlainTextCitations = (
  text: string,
  references: IReference[],
): Set<string> => {
  const cited = new Set<string>();

  for (const ref of references) {
    // Resolve author and year — try ref fields first, then parse from title as fallback
    let authorStr = ref.author?.trim() || '';
    let yearStr = ref.year?.trim() || '';

    // Fallback: if author/year are empty, try to parse from the full reference string in title
    // APA format: "Author(s). (Year). Title..." or "Author(s) (Year). Title..."
    if (!authorStr || !yearStr) {
      const rawTitle = ref.title || '';
      const m = rawTitle.match(/^(.+?)\.\s*\((\d{4}[a-z]?)\)/) ||
                rawTitle.match(/^(.+?)\s+\((\d{4}[a-z]?)\)/);
      if (m) {
        if (!authorStr) authorStr = m[1].trim();
        if (!yearStr) yearStr = m[2].trim();
      }
    }

    if (!authorStr || !yearStr) continue;

    const lastName = extractLastName(authorStr);
    if (!lastName || lastName.length < 2) continue;

    // Normalize year to just 4 digits (handles "2023a", "2023b")
    const year = yearStr.replace(/\D*(\d{4})\D*.*/, '$1');
    if (!year || year.length !== 4) continue;

    const esc = escapeRegex(lastName);

    // Patterns to detect:
    //  (Pérez, 2023)
    //  (Pérez García, 2023)
    //  (Pérez et al., 2023)
    //  (Pérez & García, 2023)
    //  (García, Pérez, & López, 2023)
    //  Pérez (2023)            — narrative citation
    //  Pérez et al. (2023)     — narrative, multiple authors
    const patterns: RegExp[] = [
      // Parenthetical: (LastName..., YYYY)
      new RegExp(`\\(${esc}[^)]{0,80},\\s*${year}[a-z]?\\)`, 'i'),
      // Narrative: LastName (YYYY)
      new RegExp(`\\b${esc}\\s+\\(${year}[a-z]?\\)`, 'i'),
      // et al. parenthetical: (LastName et al., YYYY)
      new RegExp(`\\(${esc}\\s+et\\s+al\\.?,?[^)]*${year}[a-z]?\\)`, 'i'),
      // et al. narrative: LastName et al. (YYYY)
      new RegExp(`\\b${esc}\\s+et\\s+al\\.?\\s+\\(${year}[a-z]?\\)`, 'i'),
    ];

    if (patterns.some((p) => p.test(text))) {
      cited.add(ref.id);
    }
  }

  return cited;
};

/**
 * Detects whether the document uses IEEE bracket citations: [1], [2, 3], [1–3].
 * Returns true if any numeric bracket citation is found.
 */
export const hasIeeeCitations = (text: string): boolean =>
  /\[\d[\d,\s–-]*\]/.test(text);

/**
 * Combined detector for APA documents.
 *
 * Returns a Set of reference IDs that were found either via:
 *  1. Citara's <mark data-reference-id> markup (always checked)
 *  2. Plain-text APA parenthetical patterns (for imported .docx files)
 */
export const detectAllCitedIds = (
  html: string,
  text: string,
  references: IReference[],
): Set<string> => {
  // 1. Markup-based (Citara editor)
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const marks = Array.from(doc.querySelectorAll('mark[data-reference-id]'));
  const citedIds = new Set<string>(
    marks.map((m) => m.getAttribute('data-reference-id')).filter(Boolean) as string[],
  );

  // 2. Figure references via Bubble Menu
  Array.from(doc.querySelectorAll('figure[referenceid]')).forEach((fig) => {
    const refId = fig.getAttribute('referenceid');
    if (refId) citedIds.add(refId);
  });

  // 3. Plain-text APA detection (for uploaded documents)
  if (references.length > 0) {
    const plainCited = detectApaPlainTextCitations(text, references);
    plainCited.forEach((id) => citedIds.add(id));
  }

  return citedIds;
};
