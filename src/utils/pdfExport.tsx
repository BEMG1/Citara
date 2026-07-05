import { pdf, Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import type { IReference } from './referenceUtils';
import { getYear } from './referenceUtils';
import { HtmlParser } from '../core/export/HtmlParser';
import type { InlineNode, ParagraphNode, HeadingNode, ListNode, ImageNode, TextRunNode, HyperlinkNode, CitationNode } from '../core/export/DocumentAST';
import type { ICitationFormatter } from './citationFormats/types';
import type { ICoverPageData } from '../interfaces/ICoverPage';
import type { PageNumberPosition } from '../context/DocumentContext';
import { es, en } from '../i18n';
import { estimateHeadingPages } from './tocUtils';
import React from 'react';


const tText = (key: keyof typeof es, lang?: string): string =>
  ((lang === 'en' ? en[key] : es[key]) ?? es[key]) as string;

// APA 7 uses 12pt Times New Roman, 1-inch margins, double-spaced
// In @react-pdf/renderer, units are in points (pt). 1in = 72pt.
const MARGIN = 72;    // 1 inch
const FONT_SIZE = 12;
const LINE_HEIGHT = 2;

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingLeft: MARGIN,
    paddingRight: MARGIN,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  // Base Page number style
  pageNumberBase: {
    position: 'absolute',
    fontSize: FONT_SIZE,
    fontFamily: 'Times-Roman',
    color: '#000000',
  },
  // Cover page styles
  coverPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverTitle: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 12,
    color: '#000000',
  },
  coverText: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 8,
    color: '#000000',
  },
  // Document body
  docTitle: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  h1: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  h2: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'left',
    marginBottom: 12,
    marginTop: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  h3: {
    fontFamily: 'Times-BoldItalic',
    fontSize: FONT_SIZE,
    textAlign: 'left',
    marginBottom: 12,
    marginTop: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  paragraph: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    textAlign: 'justify',
    marginBottom: 0,
    lineHeight: LINE_HEIGHT,
    textIndent: 36, // 0.5 inch first-line indent
    color: '#000000',
  },
  // IReference page
  referencesHeading: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  referenceItem: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    textAlign: 'left',
    marginBottom: 12,
    lineHeight: LINE_HEIGHT,
    // Hanging indent: paddingLeft + negative textIndent to simulate
    paddingLeft: 36,
    textIndent: -36,
    color: '#000000',
  },
  referenceItemIEEE: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    textAlign: 'left',
    marginBottom: 12,
    lineHeight: LINE_HEIGHT,
    paddingLeft: 36,
    textIndent: -36,
    color: '#000000',
  },
  figureImage: {
    marginVertical: 12,
    maxWidth: '100%',
  },
  // TOC styles
  tocTitle: {
    fontFamily: 'Times-Bold',
    fontSize: FONT_SIZE,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: LINE_HEIGHT,
    color: '#000000',
  },
  tocEntry1: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    marginBottom: 6,
    lineHeight: 1.5,
    color: '#000000',
  },
  tocEntry2: {
    fontFamily: 'Times-Roman',
    fontSize: FONT_SIZE,
    marginBottom: 6,
    marginLeft: 24,
    lineHeight: 1.5,
    color: '#000000',
  },
  tocEntry3: {
    fontFamily: 'Times-Italic',
    fontSize: FONT_SIZE,
    marginBottom: 6,
    marginLeft: 48,
    lineHeight: 1.5,
    color: '#000000',
  },
});

// ─── Render AST nodes to React PDF ──────────────────────────────────────────

const renderInlineNodes = (nodes: InlineNode[], references: IReference[], formatter: ICitationFormatter, refIndexMap: Map<string, number>, lang?: string): React.ReactNode => {
  return nodes.map((node, i) => {
    if (node.type === 'citation') {
      const citationNode = node as CitationNode;
      const ref = references.find(r => r.id === citationNode.refId);
      if (ref) {
        const idx = refIndexMap.get(ref.id);
        const citationText = formatter.formatInTextCitation(ref, idx, lang);
        if (citationText) {
          // Keep this as a string if we want it to flow cleanly, but it has no formatting,
          // so we can just return the string directly.
          return citationText;
        }
      }
      return null;
    }

    if (node.type === 'hyperlink') {
      const linkNode = node as HyperlinkNode;
      return (
        <Link key={`link-${i}`} src={linkNode.url} style={{ textDecoration: 'underline', color: '#0563C1', fontFamily: 'Times-Roman' }}>
          {renderInlineNodes(linkNode.children, references, formatter, refIndexMap, lang)}
        </Link>
      );
    }

    if (node.type === 'text') {
      const textNode = node as TextRunNode;
      let family = 'Times-Roman';
      if (textNode.format?.bold && textNode.format?.italic) family = 'Times-BoldItalic';
      else if (textNode.format?.bold) family = 'Times-Bold';
      else if (textNode.format?.italic) family = 'Times-Italic';
      
      let textStyle: any = { fontFamily: family, color: textNode.format?.highlight ? '#000000' : '#000000' };
      if (textNode.format?.underline) {
        textStyle.textDecoration = 'underline';
      }

      // If it's just plain text (no bold, italic, underline, highlight),
      // we return a raw string. This is CRUCIAL because @react-pdf/renderer
      // ignores textIndent if the first child is a nested <Text> element.
      if (family === 'Times-Roman' && !textNode.format?.underline && !textNode.format?.highlight) {
        return textNode.text;
      }

      return (
        <Text key={`txt-${i}`} style={textStyle}>
          {textNode.text}
        </Text>
      );
    }
    return null;
  });
};

// ─── Build APA reference text with italic spans ───────────────────────────────

const buildReferenceRuns = (
  ref: IReference,
  formatter: ICitationFormatter,
  index: number,
  lang?: string,
): TextRunNode[] => {
  const author = ref.author || tText('unknownAuthor', lang);
  const year = getYear(ref.year, lang);
  const title = ref.title || tText('unknownTitle', lang);

  if (formatter.sortMode === 'appearance') {
    return [{ type: 'text', text: `[${index}] ${formatter.formatReference(ref, lang)}` }];
  }

  switch (ref.type) {
    case 'book':
      return [
        { type: 'text', text: `${author} (${year}). ` },
        { type: 'text', text: `${title}. `, format: { italic: true } },
        { type: 'text', text: `${ref.publisher || `[${tText('publisher', lang)}]`}.` },
      ];

    case 'article': {
      const journal = ref.journal || `[${tText('journalName', lang)}]`;
      const volume = ref.volume || `[${tText('volume', lang)}]`;
      const issue = ref.issue ? `(${ref.issue})` : '';
      const pages = ref.pages ? `, ${ref.pages}` : '';
      let doi = '';
      if (ref.doi) {
        const plain = formatter.formatReference(ref, lang);
        const doiIdx = plain.lastIndexOf(' doi:');
        const urlIdx = plain.lastIndexOf(' https://doi.org/');
        if (doiIdx !== -1) doi = plain.slice(doiIdx);
        else if (urlIdx !== -1) doi = plain.slice(urlIdx);
      }
      return [
        { type: 'text', text: `${author} (${year}). ${title}. ` },
        { type: 'text', text: `${journal}, `, format: { italic: true } },
        { type: 'text', text: `${volume}`, format: { italic: true } },
        { type: 'text', text: `${issue}${pages}.${doi}` },
      ];
    }

    case 'website': {
      const plain = formatter.formatReference(ref, lang);
      const afterTitle = plain.slice(plain.indexOf(title) + title.length + 2);
      return [
        { type: 'text', text: `${author} (${year}). ` },
        { type: 'text', text: `${title}. `, format: { italic: true } },
        { type: 'text', text: afterTitle },
      ];
    }

    case 'video': {
      const plain = formatter.formatReference(ref, lang);
      const afterTitle = plain.slice(plain.indexOf(title) + title.length + 1);
      return [
        { type: 'text', text: `${author} (${year}). ` },
        { type: 'text', text: `${title} `, format: { italic: true } },
        { type: 'text', text: afterTitle },
      ];
    }

    default:
      return [{ type: 'text', text: formatter.formatReference(ref, lang) }];
  }
};

// ─── Build the React PDF Document ─────────────────────────────────────────────

const buildPdfDocument = (
  text: string,
  references: IReference[],
  formatter: ICitationFormatter,
  lang?: string,
  coverPage?: ICoverPageData,
  pageNumberPosition: PageNumberPosition = null,
  startNumberingOnCover: boolean = true,
  generateTOC: boolean = false,
): React.ReactElement<any> => {
  const isIEEE = formatter.sortMode === 'appearance';
  
  const defaultPosition = isIEEE ? 'bottom-center' : 'top-right';
  const position = pageNumberPosition || defaultPosition;

  let topBottomStyle: any = { top: 36 }; // 0.5 inch from top
  if (position.startsWith('bottom')) {
    topBottomStyle = { bottom: 36 }; // 0.5 inch from bottom
  }

  let leftRightStyle: any = { right: MARGIN };
  if (position.includes('center')) {
    leftRightStyle = { left: 0, right: 0, textAlign: 'center' };
  } else if (position.includes('left')) {
    leftRightStyle = { left: MARGIN };
  }

  const dynamicPageNumberStyle = [styles.pageNumberBase, topBottomStyle, leftRightStyle];

  // Helper to conditionally render page number
  const renderPageNumber = ({ pageNumber }: { pageNumber: number }) => {
    if (!startNumberingOnCover && pageNumber === 1) return "";
    return String(pageNumber);
  };

  // Sort references
  const htmlDoc = new DOMParser().parseFromString(text, 'text/html');
  const orderedIds: string[] = [];
  const seen = new Set<string>();
  htmlDoc.querySelectorAll('[data-reference-id]').forEach((el) => {
    const id = el.getAttribute('data-reference-id');
    if (id && !seen.has(id)) { seen.add(id); orderedIds.push(id); }
  });
  const uncited = references.filter((r) => !seen.has(r.id));
  const sortedRefs = isIEEE
    ? [...orderedIds.map((id) => references.find((r) => r.id === id)!).filter(Boolean), ...uncited]
    : [...references].sort((a, b) => a.author.localeCompare(b.author, 'es'));

  const refIndexMap = new Map<string, number>(sortedRefs.map((r, i) => [r.id, i + 1]));

  // Parse body blocks
  const ast = HtmlParser.parse(text);
  const bodyBlocks: React.ReactElement[] = [];

  const getAlign = (align?: string) => {
    switch(align) {
      case 'center': return 'center';
      case 'right': return 'right';
      case 'left': return 'left';
      case 'justify': return 'justify';
      default: return undefined;
    }
  };

  ast.children.forEach((node, idx) => {
    if (node.type === 'list') {
      const listNode = node as ListNode;
      listNode.children.forEach((item, itemIdx) => {
        const bulletText = listNode.ordered ? `${itemIdx + 1}.  ` : '•   ';
        bodyBlocks.push(
          <Text key={`li-${idx}-${itemIdx}`} style={{ ...styles.paragraph, textIndent: 0, paddingLeft: 36, textAlign: 'left' }}>
            <Text style={{ fontFamily: 'Times-Roman' }}>{bulletText}</Text>
            {item.children.map(block => {
              if (block.type === 'paragraph') {
                return renderInlineNodes((block as ParagraphNode).children, references, formatter, refIndexMap, lang);
              }
              return null;
            })}
          </Text>
        );
      });
      return;
    }

    if (node.type === 'heading') {
      const hNode = node as HeadingNode;
      if (hNode.level === 1) {
        bodyBlocks.push(<Text key={`h1-${idx}`} style={{ ...styles.h1, textAlign: getAlign(hNode.format?.alignment) || 'center' }}>{renderInlineNodes(hNode.children, references, formatter, refIndexMap, lang)}</Text>);
      } else if (hNode.level === 2) {
        bodyBlocks.push(<Text key={`h2-${idx}`} style={{ ...styles.h2, textAlign: getAlign(hNode.format?.alignment) || 'left' }}>{renderInlineNodes(hNode.children, references, formatter, refIndexMap, lang)}</Text>);
      } else if (hNode.level === 3) {
        bodyBlocks.push(<Text key={`h3-${idx}`} style={{ ...styles.h3, textAlign: getAlign(hNode.format?.alignment) || 'left' }}>{renderInlineNodes(hNode.children, references, formatter, refIndexMap, lang)}</Text>);
      }
      return;
    }

    if (node.type === 'image') {
      const imgNode = node as ImageNode;
      if (imgNode.src && imgNode.src.startsWith('data:image')) {
        bodyBlocks.push(<Image key={`img-${idx}`} src={imgNode.src} style={styles.figureImage} />);
      }
      if (imgNode.caption) {
        bodyBlocks.push(<Text key={`imgcap-${idx}`} style={{...styles.paragraph, textAlign: getAlign(imgNode.alignment) || 'left'}}>{imgNode.caption}</Text>);
      }
      return;
    }

    if (node.type === 'paragraph') {
      const pNode = node as ParagraphNode;
      if (pNode.children.length === 0) return;
      bodyBlocks.push(
        <Text key={`p-${idx}`} style={{ ...styles.paragraph, textAlign: getAlign(pNode.format?.alignment) || 'justify' }}>
          {"\u200B"}{renderInlineNodes(pNode.children, references, formatter, refIndexMap, lang)}
        </Text>
      );
    }
  });

  // References page
  const refsElements: React.ReactElement[] = sortedRefs.map((ref, i) => {
    const runs = buildReferenceRuns(ref, formatter, i + 1, lang);
    return (
      <Text key={ref.id} style={isIEEE ? styles.referenceItemIEEE : styles.referenceItem}>
        {"\u200B"}{renderInlineNodes(runs, references, formatter, refIndexMap, lang)}
      </Text>
    );
  });

  // ── TOC Page ──────────────────────────────────────────────────────────────
  let tocPage: React.ReactElement | null = null;
  if (generateTOC) {
    const tocLabel = tText('tableOfContents', lang);
    const tocPageLabel = tText('tocPage', lang);
    const noHeadingsMsg = tText('tocNoHeadings', lang);
    const hasCover = !!(coverPage?.enabled);
    const tocEntries = estimateHeadingPages(text, hasCover, true);

    tocPage = (
      <Page size="LETTER" style={styles.page}>
        <Text style={dynamicPageNumberStyle as any} render={renderPageNumber} fixed />
        <Text style={styles.tocTitle}>{tocLabel}</Text>
        {tocEntries.length === 0 ? (
          <Text style={styles.paragraph}>{noHeadingsMsg}</Text>
        ) : (
          tocEntries.map((entry, i) => {
            const entryStyle =
              entry.level === 1 ? styles.tocEntry1
              : entry.level === 2 ? styles.tocEntry2
              : styles.tocEntry3;
            return (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', ...entryStyle }}>
                <Text style={{ flex: 1 }}>{entry.text}</Text>
                <Text style={{ marginLeft: 8 }}>{tocPageLabel} {entry.page}</Text>
              </View>
            );
          })
        )}
      </Page>
    );
  }

  return (
    <Document>
      {/* ── Cover Page ── */}
      {coverPage?.enabled && (
        <Page size="LETTER" style={[styles.page, styles.coverPage]}>
          <Text
            style={dynamicPageNumberStyle as any}
            render={renderPageNumber}
            fixed
          />
          <View style={{ marginTop: 150, alignItems: 'center' }}>
            <Text style={styles.coverTitle}>{coverPage.title}</Text>
            {coverPage.subtitle && <Text style={styles.coverText}>{coverPage.subtitle}</Text>}
            <Text style={{ ...styles.coverText, marginTop: 24 }}>{coverPage.authors}</Text>
            {coverPage.institution && <Text style={styles.coverText}>{coverPage.institution}</Text>}
            {coverPage.faculty && <Text style={styles.coverText}>{coverPage.faculty}</Text>}
            {coverPage.course && <Text style={{ ...styles.coverText, marginTop: 12 }}>{coverPage.course}</Text>}
            {coverPage.teacher && <Text style={styles.coverText}>{coverPage.teacher}</Text>}
            {(coverPage.city || coverPage.date) && (
              <Text style={{ ...styles.coverText, marginTop: 12 }}>
                {coverPage.city && coverPage.date
                  ? `${coverPage.city}, ${coverPage.date}`
                  : coverPage.city || coverPage.date}
              </Text>
            )}
          </View>
        </Page>
      )}

      {/* ── TOC Page ── */}
      {tocPage}

      {/* ── Body Page(s) ── */}
      <Page size="LETTER" style={styles.page}>
        <Text
          style={dynamicPageNumberStyle as any}
          render={renderPageNumber}
          fixed
        />

        {bodyBlocks}
      </Page>

      {/* ── References Page ── */}
      <Page size="LETTER" style={styles.page} break>
        <Text
          style={dynamicPageNumberStyle as any}
          render={renderPageNumber}
          fixed
        />
        <Text style={styles.referencesHeading}>{formatter.sectionHeading(lang)}</Text>
        {refsElements.length > 0
          ? refsElements
          : <Text style={styles.referenceItem}>{tText('noReferences', lang)}</Text>
        }
      </Page>
    </Document>
  );
};

// ─── Main export function ──────────────────────────────────────────────────────

export const exportToPdf = async (
  text: string,
  references: IReference[],
  suggestedName = 'Document_Citara',
  formatter: ICitationFormatter,
  lang?: string,
  coverPage?: ICoverPageData,
  pageNumberPosition: PageNumberPosition = null,
  startNumberingOnCover: boolean = true,
  generateTOC: boolean = false,
) => {
  try {
    const docElement = buildPdfDocument(text, references, formatter, lang, coverPage, pageNumberPosition, startNumberingOnCover, generateTOC);
    const pdfInstance = pdf(docElement);
    const blob = await pdfInstance.toBlob();

    const filename = suggestedName.endsWith('.pdf') ? suggestedName : `${suggestedName}.pdf`;

    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'Documento PDF (.pdf)',
              accept: { 'application/pdf': ['.pdf'] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn('showSaveFilePicker falló, usando fallback:', err);
      }
    }

    // Fallback: trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Error al generar el PDF. Por favor intenta nuevamente.');
  }
};
