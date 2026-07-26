/**
 * tocUtils.ts
 * Utilities for Table of Contents (TOC) extraction and rendering helpers.
 */

export interface TocEntry {
  level: 1 | 2 | 3;
  text: string;
  /** Estimated page number (only for PDF heuristic). Word uses native TOC fields. */
  page?: number;
}

export interface FigureEntry {
  type: 'figure' | 'table' | 'cuadro';
  number: string;
  title: string;
  page?: number;
}

/**
 * Parses the document HTML and returns all H1/H2/H3 elements as TocEntry[].
 */
export const extractHeadings = (html: string): TocEntry[] => {
  if (!html?.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const entries: TocEntry[] = [];
  doc.body.querySelectorAll('h1, h2, h3').forEach((el) => {
    const tag = el.tagName.toUpperCase();
    const text = el.textContent?.trim() || '';
    if (!text) return;

    const level = tag === 'H1' ? 1 : tag === 'H2' ? 2 : 3;
    entries.push({ level: level as 1 | 2 | 3, text });
  });

  return entries;
};

export const extractFigures = (html: string): FigureEntry[] => {
  if (!html?.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const entries: FigureEntry[] = [];
  doc.body.querySelectorAll('figure').forEach((el) => {
    const type = (el.getAttribute('figuretype') || 'figure') as 'figure' | 'table' | 'cuadro';
    const number = el.getAttribute('number') || '';
    const title = el.getAttribute('title') || '';
    if (number || title) {
      entries.push({ type, number, title });
    }
  });

  return entries;
};

/**
 * Estimates page numbers for TOC entries in the PDF.
 * Strategy: iterate all block-level elements in order; each heading gets
 * a page assignment based on a rough "blocks per page" heuristic.
 *
 * @param html          The full document HTML
 * @param hasCoverPage  Whether the document has a cover page (+1 page offset)
 * @param hasTocPage    Whether the TOC itself takes a page (+1 page offset)
 * @param blocksPerPage Approximate number of block elements that fit per page
 */
export const estimateHeadingPages = (
  html: string,
  hasCoverPage: boolean,
  hasTocPage: boolean,
  blocksPerPage = 14,
): TocEntry[] => {
  if (!html?.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const bodyNodes = Array.from(doc.body.children);

  // Page offset: 1 for body start, +1 if cover, +1 if TOC page
  let pageOffset = 1;
  if (hasCoverPage) pageOffset += 1;
  if (hasTocPage) pageOffset += 1;

  const entries: TocEntry[] = [];
  let blockCount = 0;

  bodyNodes.forEach((el) => {
    const tag = el.tagName.toUpperCase();
    const text = el.textContent?.trim() || '';

    if (tag === 'H1' || tag === 'H2' || tag === 'H3') {
      const level = tag === 'H1' ? 1 : tag === 'H2' ? 2 : 3;
      const estimatedPage = pageOffset + Math.floor(blockCount / blocksPerPage);
      entries.push({ level: level as 1 | 2 | 3, text, page: estimatedPage });
    }

    // Count every block element as contributing to "space"
    // Headings and paragraphs count as 1; figures count as ~5
    if (tag === 'FIGURE') {
      blockCount += 5;
    } else if (text) {
      blockCount += 1;
    }
  });

  return entries;
};

export const estimateFigurePages = (
  html: string,
  hasCoverPage: boolean,
  hasTocPage: boolean,
  blocksPerPage = 14,
): FigureEntry[] => {
  if (!html?.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const bodyNodes = Array.from(doc.body.children);

  let pageOffset = 1;
  if (hasCoverPage) pageOffset += 1;
  if (hasTocPage) pageOffset += 1; // Basic heuristic: if TOC is generated, add 1. If multiple TOCs, it might be off.

  const entries: FigureEntry[] = [];
  let blockCount = 0;

  bodyNodes.forEach((el) => {
    const tag = el.tagName.toUpperCase();
    const text = el.textContent?.trim() || '';

    if (tag === 'FIGURE') {
      const estimatedPage = pageOffset + Math.floor(blockCount / blocksPerPage);
      const type = (el.getAttribute('figuretype') || 'figure') as 'figure' | 'table' | 'cuadro';
      const number = el.getAttribute('number') || '';
      const title = el.getAttribute('title') || '';
      if (number || title) {
        entries.push({ type, number, title, page: estimatedPage });
      }
      blockCount += 5;
    } else if (text) {
      blockCount += 1;
    }
  });

  return entries;
};
