import { pdf, Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import type { IReference } from './referenceUtils';
import { getYear } from './referenceUtils';
import { HtmlParser } from '../core/export/HtmlParser';
import type { InlineNode, ParagraphNode, HeadingNode, ListNode, ImageNode, TextRunNode, HyperlinkNode, CitationNode } from '../core/export/DocumentAST';
import type { ICitationFormatter } from './citationFormats/types';
import type { ResolvedDocumentStyle } from '../core/StyleEngine/types';
import type { ICoverPageData } from '../interfaces/ICoverPage';
import type { PageNumberPosition } from '../context/DocumentContext';

import { es, en } from '../i18n';
import { estimateHeadingPages, estimateFigurePages } from './tocUtils';
import React from 'react';


const tText = (key: keyof typeof es, lang?: string): string =>
  ((lang === 'en' ? en[key] : es[key]) ?? es[key]) as string;

const cmToPt = (cm: number) => (cm / 2.54) * 72;

const createPdfStyles = (style?: ResolvedDocumentStyle) => {
  const marginTop = style ? cmToPt(style.page.marginTop) : 72;
  const marginBottom = style ? cmToPt(style.page.marginBottom) : 72;
  const marginLeft = style ? cmToPt(style.page.marginLeft) : 72;
  const marginRight = style ? cmToPt(style.page.marginRight) : 72;
  
  // const fontFamily = style ? style.typography.fontFamily.replace(/\s/g, '') : 'Times-Roman';
  // const fontBold = `${fontFamily}-Bold`;
  // const fontItalic = `${fontFamily}-Italic`;
  // const fontBoldItalic = `${fontFamily}-BoldItalic`;
  
  const fontSize = style ? style.typography.fontSize : 12;
  const h1Size = style ? style.heading1.size : 12;
  const h2Size = style ? style.heading2.size : 12;
  const h3Size = style ? style.heading3.size : 12;
  const fontColor = style ? style.typography.fontColor : '#000000';
  
  const lineSpacing = style ? style.paragraph.lineSpacing : 2;
  const indentPt = style ? cmToPt(style.paragraph.firstLineIndent) : 36;
  const textAlignment = style ? style.paragraph.textAlignment : 'justify';

  // React PDF uses standard font families. If they provide a custom font, 
  // it needs to be registered. For now, we map basic families.
  // Note: we assume standard 14 fonts or previously registered fonts in React-PDF.
  
  return StyleSheet.create({
    page: {
      fontFamily: 'Times-Roman',
      fontSize: fontSize,
      paddingTop: marginTop,
      paddingBottom: marginBottom,
      paddingLeft: marginLeft,
      paddingRight: marginRight,
      backgroundColor: '#ffffff',
      color: fontColor,
    },
    pageNumberBase: {
      position: 'absolute',
      fontSize: fontSize,
      fontFamily: 'Times-Roman',
      color: fontColor,
    },
    coverPage: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    coverTitle: {
      fontFamily: 'Times-Bold',
      fontSize: fontSize,
      textAlign: 'center',
      marginBottom: 12,
      color: fontColor,
    },
    coverText: {
      fontFamily: 'Times-Roman',
      fontSize: fontSize,
      textAlign: 'center',
      marginBottom: 8,
      color: fontColor,
    },
    docTitle: {
      fontFamily: 'Times-Bold',
      fontSize: fontSize,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: lineSpacing,
      color: fontColor,
    },
    h1: {
      fontFamily: 'Times-Bold',
      fontSize: h1Size,
      textAlign: (style?.heading1.alignment as any) || 'center',
      marginBottom: 12,
      marginTop: 12,
      lineHeight: lineSpacing,
      color: fontColor,
    },
    h2: {
      fontFamily: 'Times-Bold',
      fontSize: h2Size,
      textAlign: (style?.heading2.alignment as any) || 'left',
      marginBottom: 12,
      marginTop: 12,
      lineHeight: lineSpacing,
      color: fontColor,
    },
    h3: {
      fontFamily: 'Times-BoldItalic',
      fontSize: h3Size,
      textAlign: (style?.heading3.alignment as any) || 'left',
      marginBottom: 12,
      marginTop: 12,
      lineHeight: lineSpacing,
      color: fontColor,
    },
    paragraph: {
      fontFamily: 'Times-Roman',
      fontSize: fontSize,
      textAlign: textAlignment as any,
      marginBottom: 0,
      lineHeight: lineSpacing,
      textIndent: indentPt,
      color: fontColor,
    },
    referencesHeading: {
      fontFamily: 'Times-Bold',
      fontSize: fontSize,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: lineSpacing,
      color: fontColor,
    },
    referenceItem: {
      fontFamily: 'Times-Roman',
      fontSize: fontSize,
      textAlign: 'left',
      marginBottom: 12,
      lineHeight: lineSpacing,
      paddingLeft: 36,
      textIndent: -36,
      color: fontColor,
    },
    referenceItemIEEE: {
      fontFamily: 'Times-Roman',
      fontSize: fontSize,
      textAlign: 'left',
      marginBottom: 12,
      lineHeight: lineSpacing,
      paddingLeft: 36,
      textIndent: -36,
      color: fontColor,
    },
    figureImage: {
      marginVertical: 12,
      maxWidth: '100%',
    },
    tocTitle: {
      fontFamily: 'Times-Bold',
      fontSize: fontSize,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: lineSpacing,
      color: fontColor,
    },
    tocEntry1: {
      fontFamily: 'Times-Roman',
      fontSize: fontSize,
      marginBottom: 6,
      lineHeight: 1.5,
      color: fontColor,
    },
    tocEntry2: {
      fontFamily: 'Times-Roman',
      fontSize: fontSize,
      marginBottom: 6,
      marginLeft: 24,
      lineHeight: 1.5,
      color: fontColor,
    },
    tocEntry3: {
      fontFamily: 'Times-Italic',
      fontSize: fontSize,
      marginBottom: 6,
      marginLeft: 48,
      lineHeight: 1.5,
      color: fontColor,
    },
  });
};


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
          return `${citationNode.text || ""} ${citationText}`;
        }
      }
      return citationNode.text || "";
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
  formatId?: string,
  documentStyle?: ResolvedDocumentStyle,
): React.ReactElement<any> => {
  const styles = createPdfStyles(documentStyle);
  const marginLeft = documentStyle ? cmToPt(documentStyle.page.marginLeft) : 72;
  const marginRight = documentStyle ? cmToPt(documentStyle.page.marginRight) : 72;

  const isIEEE = formatter.sortMode === 'appearance';
  const isUpel = formatId === 'upel';
  
  const defaultPosition = isIEEE ? 'bottom-center' : (isUpel ? 'bottom-center' : 'top-right');
  const position = pageNumberPosition || defaultPosition;

  let topBottomStyle: any = { top: 36 }; // 0.5 inch from top
  if (position.startsWith('bottom')) {
    topBottomStyle = { bottom: 36 }; // 0.5 inch from bottom
  }

  let leftRightStyle: any = { right: marginRight };
  if (position.includes('center')) {
    leftRightStyle = { left: 0, right: 0, textAlign: 'center' };
  } else if (position.includes('left')) {
    leftRightStyle = { left: marginLeft };
  }

  const dynamicPageNumberStyle = [styles.pageNumberBase, topBottomStyle, leftRightStyle];

  const toRoman = (num: number) => {
    const lookup = [
      ['m', 1000], ['cm', 900], ['d', 500], ['cd', 400],
      ['c', 100], ['xc', 90], ['l', 50], ['xl', 40],
      ['x', 10], ['ix', 9], ['v', 5], ['iv', 4], ['i', 1]
    ];
    let roman = '';
    for (const [letter, value] of lookup) {
      while (num >= (value as number)) {
        roman += letter;
        num -= value as number;
      }
    }
    return roman;
  };

  // Helper to conditionally render page number
  const renderPageNumber = ({ pageNumber }: { pageNumber: number }) => {
    if (isUpel) {
      if (pageNumber === 1 && coverPage?.enabled) return ""; // Cover page has no number
      // Assuming TOC takes 1 page (rough estimate)
      // A more robust solution requires custom pagination components, but for now we format as Roman if it's TOC.
      const isPrelim = pageNumber === 2 && generateTOC;
      if (isPrelim) return toRoman(pageNumber);
      
      const offset = (coverPage?.enabled ? 1 : 0) + (generateTOC ? 1 : 0);
      const arabicPage = Math.max(1, pageNumber - offset);
      return String(arabicPage);
    }
    
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
        bodyBlocks.push(<Text key={`h1-${idx}`} break={isUpel} style={{ ...styles.h1, textAlign: getAlign(hNode.format?.alignment) || 'center' }}>{renderInlineNodes(hNode.children, references, formatter, refIndexMap, lang)}</Text>);
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
      const indentStyle = pNode.format?.indent !== undefined ? { textIndent: pNode.format.indent } : {};
      bodyBlocks.push(
        <Text key={`p-${idx}`} style={{ ...styles.paragraph, textAlign: getAlign(pNode.format?.alignment) || 'justify', ...indentStyle }}>
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

    const figures = estimateFigurePages(text, hasCover, true);

    const renderIndexPage = (type: string, title: string, noItemsMsg: string) => {
      const items = figures.filter((f) => f.type === type);
      if (items.length > 0 || isUpel) {
        return (
          <Page size="LETTER" style={styles.page} key={`index-${type}`}>
            <Text style={dynamicPageNumberStyle as any} render={renderPageNumber} fixed />
            <Text style={styles.tocTitle}>{title}</Text>
            {items.length === 0 ? (
              <Text style={styles.paragraph}>{noItemsMsg}</Text>
            ) : (
              items.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', ...styles.tocEntry1 }}>
                  <Text style={{ flex: 1 }}>{item.number ? item.number + '. ' : ''}{item.title}</Text>
                  <Text style={{ marginLeft: 8 }}>{tocPageLabel} {item.page}</Text>
                </View>
              ))
            )}
          </Page>
        );
      }
      return null;
    };

    const extraIndexPages = [
      renderIndexPage('table', lang === 'en' ? 'List of Tables' : 'Índice de Tablas', lang === 'en' ? 'No tables found.' : 'No se encontraron tablas.'),
      renderIndexPage('figure', lang === 'en' ? 'List of Figures' : 'Índice de Figuras', lang === 'en' ? 'No figures found.' : 'No se encontraron figuras.'),
      isUpel ? renderIndexPage('cuadro', 'Índice de Cuadros', 'No se encontraron cuadros.') : null,
    ];

    tocPage = (
      <>
        {tocPage}
        {extraIndexPages}
      </>
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
  formatId?: string,
  documentStyle?: ResolvedDocumentStyle,
) => {
  try {
    const docElement = buildPdfDocument(text, references, formatter, lang, coverPage, pageNumberPosition, startNumberingOnCover, generateTOC, formatId, documentStyle);
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
