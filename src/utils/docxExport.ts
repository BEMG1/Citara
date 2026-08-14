import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
  PageBreak,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  VerticalAlign,
  TableOfContents,
  ExternalHyperlink,
  UnderlineType,
} from "docx";

import { saveAs } from "file-saver";
import type { PageNumberPosition } from "../context/DocumentContext";
import type { IReference } from "./referenceUtils";
import { getYear } from "./referenceUtils";
import type { ICitationFormatter } from "./citationFormats/types";
import { apa7Formatter } from "./citationFormats/apa7.tsx";
import type { ICoverPageData } from "../interfaces/ICoverPage";
import { extractHeadings, extractFigures } from "./tocUtils";


import { HtmlParser } from "../core/export/HtmlParser";
import type { InlineNode, BlockNode, ParagraphNode, HeadingNode, ListNode, ImageNode, TextRunNode, HyperlinkNode, CitationNode } from "../core/export/DocumentAST";
import type { ResolvedDocumentStyle } from "../core/StyleEngine/types";

const cmToTwip = (cm: number) => Math.round((cm / 2.54) * 1440);
const ptToHalfPt = (pt: number) => Math.round(pt * 2);
const getLineSpacing = (spacing: number) => Math.round(240 * spacing);

import { es, en } from "../i18n";

const tText = (key: keyof typeof es, lang?: string): string => ((lang === 'en' ? en[key] : es[key]) ?? es[key]) as string;

// ─── Helper: empty lines (spacer) ──────────────────────────────────────────────
const emptyLine = () =>
  new Paragraph({ children: [new TextRun({ text: '' })], spacing: { line: 480 } });

const base64ToUint8Array = (base64Str: string) => {
  try {
    const base64Data = base64Str.split(",")[1];
    const binaryStr = atob(base64Data);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    return null;
  }
};

// ─── Cover page builder ────────────────────────────────────────────────────────
/**
 * Builds the cover page paragraphs following each format's standard.
 * APA 7 / APA 6: centred, double-spaced, upper half for title block.
 * IEEE: centred, compact.
 */
const buildCoverPageChildren = (
  cover: ICoverPageData,
  formatterSortMode: ICitationFormatter['sortMode'],
  formatId?: string
): Paragraph[] => {
  const isIEEE = formatterSortMode === 'appearance';
  const isUpel = formatId === 'upel';
  const bold = (text: string, size = 24) =>
    new TextRun({ text, bold: true, size });
  const normal = (text: string, size = 24) =>
    new TextRun({ text, size });
  const centred = (children: TextRun[], spacingBefore = 0): Paragraph =>
    new Paragraph({
      children,
      alignment: AlignmentType.CENTER,
      spacing: { line: 480, before: spacingBefore },
    });

  if (isUpel) {
    const upelChildren: Paragraph[] = [];
    if (cover.institution) upelChildren.push(centred([bold(cover.institution.toUpperCase(), 24)]));
    if (cover.faculty) upelChildren.push(centred([bold(cover.faculty.toUpperCase(), 24)]));
    upelChildren.push(emptyLine(), emptyLine(), emptyLine(), emptyLine());
    
    if (cover.title) upelChildren.push(centred([bold(cover.title.toUpperCase(), 24)]));
    upelChildren.push(emptyLine(), emptyLine(), emptyLine());
    
    if (cover.authors) {
      const authorLines = cover.authors.split('\n').map((a: string) => a.trim()).filter(Boolean);
      authorLines.forEach((a: string) => upelChildren.push(centred([normal(a, 24)])));
    }
    if (cover.teacher) upelChildren.push(centred([normal(`Tutor: ${cover.teacher}`, 24)]));
    
    upelChildren.push(emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine());
    if (cover.city || cover.date) {
      upelChildren.push(centred([normal([cover.city, cover.date].filter(Boolean).join(', '), 24)]));
    }
    upelChildren.push(new Paragraph({ children: [new PageBreak()] }));
    return upelChildren;
  }

  if (isIEEE) {
    // ── IEEE Cover Page ──────────────────────────────────────────────────────
    const ieeeChildren: Paragraph[] = [
      emptyLine(), emptyLine(), emptyLine(), emptyLine(), emptyLine(),
      emptyLine(), emptyLine(), emptyLine(),
    ];

    ieeeChildren.push(
      centred([bold(cover.title.toUpperCase(), 28)]),
      emptyLine(), emptyLine(),
      ...cover.authors.split('\n').map((a: string) => a.trim()).filter(Boolean).map((a: string) => centred([normal(a)])),
      emptyLine(),
    );

    if (cover.institution) ieeeChildren.push(centred([normal(cover.institution)]));
    if (cover.faculty) ieeeChildren.push(centred([normal(cover.faculty)]));
    ieeeChildren.push(emptyLine());
    if (cover.city) ieeeChildren.push(centred([normal(cover.city)]));
    ieeeChildren.push(
      centred([normal(cover.date)]),
      new Paragraph({ children: [new PageBreak()] })
    );
    return ieeeChildren;
  }

  // ── APA 7 / APA 6 Cover Page ────────────────────────────────────────────────
  // Per APA 7 manual §2.3:
  //   - Title must appear in the UPPER HALF of the page (roughly top third).
  //   - All text centred, double-spaced.
  //   - Page number 1 appears in the header (top-right), added via the section header.
  //
  // (upper half of an 8.5"×11" or A4 page with 1" margins = usable height ~9").
  // We use convertInchesToTwip to push the title block to ~3.5" from the top
  // (upper half of an 8.5"×11" or A4 page with 1" margins = usable height ~9").
  const children: Paragraph[] = [
    // Three double-spaced blank lines ≈ positions title at ~top third
    emptyLine(), emptyLine(), emptyLine(),
  ];

  // Título (y subtítulo opcional)
  children.push(centred([bold(cover.title, 26)]));
  if (cover.subtitle?.trim()) {
    children.push(emptyLine());
    children.push(centred([normal(cover.subtitle, 24)]));
  }

  children.push(emptyLine(), emptyLine());

  // Autor(es)
  if (cover.authors?.trim()) {
    const authorLines = cover.authors.split('\n').map((a: string) => a.trim()).filter(Boolean);
    authorLines.forEach((a: string) => children.push(centred([normal(a)])));
  }

  // Institución y Facultad
  if (cover.institution?.trim()) {
    children.push(centred([normal(cover.institution)]));
  }
  if (cover.faculty?.trim()) {
    children.push(centred([normal(cover.faculty)]));
  }

  children.push(emptyLine());

  // Curso y Docente (APA)
  if (cover.course?.trim()) {
    children.push(centred([normal(cover.course)]));
  }
  if (cover.teacher?.trim()) {
    children.push(centred([normal(cover.teacher)]));
  }

  // Ciudad y Fecha
  if (cover.city?.trim()) {
    const dateText = cover.date?.trim()
      ? `${cover.city}, ${cover.date}`
      : cover.city;
    children.push(centred([normal(dateText)]));
  } else if (cover.date?.trim()) {
    children.push(centred([normal(cover.date)]));
  }

  // Page break at the end
  children.push(new Paragraph({ children: [new PageBreak()] }));

  return children;
};


// ─── Rich reference paragraph builder for DOCX ────────────────────────────────
// Builds a Paragraph with hanging indent and proper italic runs.
const buildRichReferenceParagraph = (
  ref: IReference,
  formatter: ICitationFormatter,
  index: number,
  lang?: string
): Paragraph => {
  const author = ref.author || tText("unknownAuthor", lang);
  const year = getYear(ref.year, lang);
  const title = ref.title || tText("unknownTitle", lang);

  // IEEE uses a plain numbered run
  if (formatter.sortMode === "appearance") {
    return new Paragraph({
      children: [new TextRun({ text: `[${index}] ${formatter.formatReference(ref, lang)}` })],
      indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.5) },
      spacing: { line: 480 },
    });
  }

  // APA (6 or 7): rebuild with italic runs
  let elements: TextRun[];

  switch (ref.type) {
    case "book":
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title}. `, italics: true }),
        new TextRun({ text: `${ref.publisher || `[${tText('publisher', lang)}]`}.` }),
      ];
      break;

    case "article": {
      const journal = ref.journal || `[${tText('journalName', lang)}]`;
      const volume = ref.volume || `[${tText('volume', lang)}]`;
      const issue = ref.issue ? `(${ref.issue})` : "";
      const pages = ref.pages ? `, ${ref.pages}` : "";
      // Derive DOI text from the plain formatter output to respect APA6/7 difference
      let doi = "";
      if (ref.doi) {
        const plain = formatter.formatReference(ref, lang);
        const doiIdx = plain.lastIndexOf(" doi:");
        const urlIdx = plain.lastIndexOf(" https://doi.org/");
        if (doiIdx !== -1) doi = plain.slice(doiIdx);
        else if (urlIdx !== -1) doi = plain.slice(urlIdx);
      }
      elements = [
        new TextRun({ text: `${author} (${year}). ${title}. ` }),
        new TextRun({ text: `${journal}, `, italics: true }),
        new TextRun({ text: volume, italics: true }),
        new TextRun({ text: issue }),
        new TextRun({ text: `${pages}.${doi}` }),
      ];
      break;
    }

    case "website": {
      const plain = formatter.formatReference(ref, lang);
      // Everything after "title." portion
      const afterTitle = plain.slice(plain.indexOf(title) + title.length + 2);
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title}. `, italics: true }),
        new TextRun({ text: afterTitle }),
      ];
      break;
    }

    case "video": {
      const plain = formatter.formatReference(ref, lang);
      const afterTitle = plain.slice(plain.indexOf(title) + title.length + 1);
      elements = [
        new TextRun({ text: `${author} (${year}). ` }),
        new TextRun({ text: `${title} `, italics: true }),
        new TextRun({ text: afterTitle }),
      ];
      break;
    }

    default:
      elements = [new TextRun({ text: formatter.formatReference(ref, lang) })];
  }

  return new Paragraph({
    children: elements,
    indent: {
      left: convertInchesToTwip(0.5),
      hanging: convertInchesToTwip(0.5),
    },
    spacing: { line: 480 },
  });
};

// ─── Main export function ──────────────────────────────────────────────────────

export const exportToDocx = async (
  text: string,
  references: IReference[],
  suggestedName = "File_Normalizate_APA",
  formatter: ICitationFormatter = apa7Formatter,
  lang?: string,
  coverPage?: ICoverPageData,
  pageNumberPosition: PageNumberPosition = null,
  startNumberingOnCover: boolean = true,
  generateTOC: boolean = false,
  formatId?: string,
  documentStyle?: ResolvedDocumentStyle,
) => {
  // ── Sort references according to formatter's sort mode ─────────────────────
  let sortedRefs: IReference[];

  if (formatter.sortMode === "appearance") {
    // IEEE: order references by first appearance in document
    const htmlDoc = new DOMParser().parseFromString(text, "text/html");
    const orderedIds: string[] = [];
    const seen = new Set<string>();
    htmlDoc.querySelectorAll("[data-reference-id]").forEach((el) => {
      const id = el.getAttribute("data-reference-id");
      if (id && !seen.has(id)) {
        seen.add(id);
        orderedIds.push(id);
      }
    });
    const uncited = references.filter((r) => !seen.has(r.id));
    sortedRefs = [
      ...orderedIds.map((id) => references.find((r) => r.id === id)!).filter(Boolean),
      ...uncited,
    ];
  } else {
    sortedRefs = [...references].sort((a, b) =>
      a.author.localeCompare(b.author, "es"),
    );
  }

  // Build lookup: refId → 1-based position (for IEEE [n] citations)
  const refIndexMap = new Map<string, number>(
    sortedRefs.map((ref, i) => [ref.id, i + 1]),
  );

  // ── HTML parsing via Central AST ───────────────────────────────────────────────────

  const ast = HtmlParser.parse(text);

  const getDocxAlignment = (align?: string) => {
    if (!align) return undefined;
    const lower = align.toLowerCase();
    switch (lower) {
      case 'center': return AlignmentType.CENTER;
      case 'right': return AlignmentType.RIGHT;
      case 'left': return AlignmentType.LEFT;
      case 'justify': return AlignmentType.JUSTIFIED;
      default: return undefined;
    }
  };

  // Fallbacks in case documentStyle is somehow not provided
  const baseLineSpacing = documentStyle ? getLineSpacing(documentStyle.paragraph.lineSpacing) : 480;
  const baseIndent = documentStyle ? cmToTwip(documentStyle.paragraph.firstLineIndent) : convertInchesToTwip(0.5);
  const baseAlign = documentStyle ? getDocxAlignment(documentStyle.paragraph.textAlignment) || AlignmentType.JUSTIFIED : AlignmentType.JUSTIFIED;
  const pBefore = documentStyle ? cmToTwip(documentStyle.paragraph.paragraphBefore) : 0;
  const pAfter = documentStyle ? cmToTwip(documentStyle.paragraph.paragraphAfter) : 0;


  const mapInlineNode = (node: InlineNode): any => {
    if (node.type === 'text') {
      const textNode = node as TextRunNode;
      return new TextRun({
        text: textNode.text,
        bold: textNode.format?.bold,
        italics: textNode.format?.italic,
        underline: textNode.format?.underline ? { type: UnderlineType.SINGLE } : undefined,
        color: textNode.format?.highlight ? "000000" : undefined,
      });
    }
    if (node.type === 'hyperlink') {
      const linkNode = node as HyperlinkNode;
      const children = linkNode.children.flatMap(c => mapInlineNode(c));
      return new ExternalHyperlink({ link: linkNode.url, children });
    }
    if (node.type === 'citation') {
      const citationNode = node as CitationNode;
      const ref = references.find(r => r.id === citationNode.refId);
      if (ref) {
        const idx = refIndexMap.get(ref.id);
        const citationText = formatter.formatInTextCitation(ref, idx, lang);
        if (citationText) {
          return [
            new TextRun({ text: citationNode.text || "" }),
            new TextRun({ text: ` ${citationText}` })
          ];
        }
      }
      return new TextRun({ text: citationNode.text || "" });
    }
    return new TextRun({ text: "" });
  };

  const mapBlockNode = (node: BlockNode): Paragraph | Paragraph[] | null => {
    if (node.type === 'paragraph') {
      const pNode = node as ParagraphNode;
      const pAlign = getDocxAlignment(pNode.format?.alignment) || baseAlign;
      return new Paragraph({
        children: pNode.children.flatMap(mapInlineNode),
        alignment: pAlign,
        indent: pNode.format?.indent !== undefined 
          ? { firstLine: pNode.format.indent } 
          : (baseIndent > 0 ? { firstLine: baseIndent } : undefined),
        spacing: { line: baseLineSpacing, before: pBefore, after: pAfter },
      });
    }

    if (node.type === 'heading') {
      const hNode = node as HeadingNode;
      let headingLvl: any = HeadingLevel.HEADING_1;
      let defaultAlign: any = AlignmentType.CENTER;
      let childrenRuns = hNode.children.flatMap(mapInlineNode);

      if (hNode.level === 1) {
        headingLvl = HeadingLevel.HEADING_1;
        defaultAlign = documentStyle ? getDocxAlignment(documentStyle.heading1.alignment) : AlignmentType.CENTER;
      } else if (hNode.level === 2) {
        headingLvl = HeadingLevel.HEADING_2;
        defaultAlign = documentStyle ? getDocxAlignment(documentStyle.heading2.alignment) : AlignmentType.LEFT;
      } else if (hNode.level === 3) {
        headingLvl = HeadingLevel.HEADING_3;
        defaultAlign = documentStyle ? getDocxAlignment(documentStyle.heading3.alignment) : AlignmentType.LEFT;
      }

      return new Paragraph({
        children: childrenRuns,
        heading: headingLvl,
        alignment: getDocxAlignment(hNode.format?.alignment) || defaultAlign || AlignmentType.LEFT,
        spacing: { line: baseLineSpacing, before: pBefore || 240, after: pAfter || 240 },
        pageBreakBefore: (hNode.level === 1 && formatId === 'upel') ? true : undefined,
      });
    }

    if (node.type === 'list') {
      const listNode = node as ListNode;
      return listNode.children.map((item, index) => {
        const bulletText = listNode.ordered ? `${index + 1}. ` : "•  ";
        
        // Flatten all paragraphs inside list item into a single paragraph for now
        const itemChildren: any[] = [new TextRun({ text: bulletText })];
        item.children.forEach(block => {
          if (block.type === 'paragraph') {
            const p = block as ParagraphNode;
            itemChildren.push(...p.children.flatMap(mapInlineNode));
          }
        });

        return new Paragraph({
          children: itemChildren,
          alignment: AlignmentType.LEFT,
          indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) },
          spacing: { line: baseLineSpacing, before: pBefore, after: pAfter },
        });
      });
    }

    if (node.type === 'image') {
      const imgNode = node as ImageNode;
      const figureParagraphs: Paragraph[] = [];

      if (imgNode.src && imgNode.src.startsWith('data:image')) {
        const imageBytes = base64ToUint8Array(imgNode.src);
        const match = imgNode.src.match(/^data:image\/(png|jpeg|jpg);base64,/);
        const imageType = match ? (match[1] === 'jpg' ? 'jpeg' : match[1]) : 'png';
        
        if (imageBytes) {
          figureParagraphs.push(new Paragraph({
            children: [new ImageRun({
              data: imageBytes,
              transformation: { width: 500, height: 300 },
              type: imageType as any,
            })],
            alignment: getDocxAlignment(imgNode.alignment) || AlignmentType.LEFT,
            spacing: { before: 120, after: 120 },
          }));
        }
      }

      if (imgNode.caption) {
        figureParagraphs.push(new Paragraph({
          children: [new TextRun({ text: imgNode.caption })],
          alignment: getDocxAlignment(imgNode.alignment) || AlignmentType.LEFT,
          spacing: { before: 120, after: 120, line: 480 },
        }));
      }

      return figureParagraphs.length > 0 ? figureParagraphs : null;
    }

    return null;
  };

  const paragraphs: Paragraph[] = [];
  ast.children.forEach((node) => {
    const p = mapBlockNode(node);
    if (Array.isArray(p)) {
      paragraphs.push(...p);
    } else if (p) {
      paragraphs.push(p);
    }
  });

  // ── Build DOCX document ────────────────────────────────────────────────────

  // Build cover page section if enabled
  // APA 7 §2.3: page number appears top-right on the cover page itself (page 1).

  const isUpel = formatId === 'upel';
  const defaultPosition = formatter.sortMode === "appearance" ? "bottom-center" : (isUpel ? "bottom-center" : "top-right");
  const position = pageNumberPosition || defaultPosition;

  let align: any = AlignmentType.RIGHT;
  if (position.includes("center")) align = AlignmentType.CENTER;
  if (position.includes("left")) align = AlignmentType.LEFT;

  const pageNumElement = new Paragraph({
    children: [new TextRun({ children: [PageNumber.CURRENT] })],
    alignment: align,
  });

  let documentHeader: Header | undefined = undefined;
  let documentFooter: Footer | undefined = undefined;

  let logoParagraph: Paragraph | null = null;
  if (coverPage?.logo) {
    const logoBytes = base64ToUint8Array(coverPage.logo);
    if (logoBytes) {
      logoParagraph = new Paragraph({
        children: [
          new ImageRun({
            data: logoBytes,
            transformation: { width: 50, height: 50 },
            type: "png",
          }),
        ],
        alignment: AlignmentType.LEFT,
      });
    }
  }

  const isPageNumTop = position.startsWith("top");
  const isPageNumBottom = position.startsWith("bottom");

  if (logoParagraph && isPageNumTop) {
    documentHeader = new Header({
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [logoParagraph], verticalAlign: VerticalAlign.CENTER }),
                new TableCell({ children: [pageNumElement], verticalAlign: VerticalAlign.CENTER }),
              ],
            }),
          ],
        }),
      ],
    });
  } else if (logoParagraph && !isPageNumTop) {
    documentHeader = new Header({ children: [logoParagraph] });
  } else if (!logoParagraph && isPageNumTop) {
    documentHeader = new Header({ children: [pageNumElement] });
  }

  if (isPageNumBottom) {
    documentFooter = new Footer({ children: [pageNumElement] });
  }

  let firstDocumentHeader: Header | undefined = undefined;
  if (logoParagraph) {
    firstDocumentHeader = new Header({ children: [logoParagraph] });
  }

  const getHeaders = (isFirstPageTitle: boolean) => {
    const h: any = {};
    if (documentHeader) h.default = documentHeader;
    if (isFirstPageTitle && firstDocumentHeader) h.first = firstDocumentHeader;
    return Object.keys(h).length > 0 ? h : undefined;
  };

  const getFooters = () => {
    const f: any = {};
    if (documentFooter) f.default = documentFooter;
    // For 'first' page, if we don't want page numbers, we simply don't set f.first (so it's blank)
    return Object.keys(f).length > 0 ? f : undefined;
  };

  // Calculate margins based on style
  const marginTop = documentStyle ? cmToTwip(documentStyle.page.marginTop) : convertInchesToTwip(1);
  const marginBottom = documentStyle ? cmToTwip(documentStyle.page.marginBottom) : convertInchesToTwip(1);
  const marginLeft = documentStyle ? cmToTwip(documentStyle.page.marginLeft) : convertInchesToTwip(1);
  const marginRight = documentStyle ? cmToTwip(documentStyle.page.marginRight) : convertInchesToTwip(1);
  const headerDistance = documentStyle ? cmToTwip(documentStyle.page.headerDistance) : convertInchesToTwip(0.5);
  const footerDistance = documentStyle ? cmToTwip(documentStyle.page.footerDistance) : convertInchesToTwip(0.5);

  const coverSection = coverPage?.enabled
    ? [
        {
          properties: {
            type: "nextPage" as const,
            titlePage: !startNumberingOnCover || isUpel,
            page: {
              margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft, header: headerDistance, footer: footerDistance },
              pageNumbers: { start: 1, formatType: isUpel ? NumberFormat.LOWER_ROMAN : NumberFormat.DECIMAL },
            },
          },        
          footers: getFooters(),
          headers: getHeaders(!startNumberingOnCover || isUpel),
          children: buildCoverPageChildren(coverPage, formatter.sortMode, formatId),
        },
      ]
    : [];

  // ── TOC Section ─────────────────────────────────────────────────────────────
  const tocLabel = lang === 'en' ? 'Table of Contents' : 'Tabla de Contenido';
  const noHeadingsMsg = lang === 'en'
    ? 'No valid headings found. Add headings to generate a table of contents.'
    : 'No se encontraron títulos válidos. Agregue encabezados para generar la tabla de contenido.';

  let tocSection: any[] = [];
  if (generateTOC) {
    const headings = extractHeadings(text);
    const tocChildren: any[] = [
      new Paragraph({
        children: [new TextRun({ text: tocLabel, bold: true })],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 240, line: 480 },
      }),
    ];

    if (headings.length === 0) {
      tocChildren.push(
        new Paragraph({
          children: [new TextRun({ text: noHeadingsMsg, italics: true })],
          spacing: { line: 480 },
        }),
      );
    } else {
      tocChildren.push(
        new TableOfContents(tocLabel, {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
      );
    }
    tocChildren.push(new Paragraph({ children: [new PageBreak()] }));

    const figures = extractFigures(text);
    const renderIndex = (type: string, title: string, noItemsMsg: string) => {
      const items = figures.filter((f) => f.type === type);
      if (items.length > 0 || isUpel) { // In UPEL, we might want to always show the section if required, or only if items exist
        tocChildren.push(
          new Paragraph({
            children: [new TextRun({ text: title, bold: true })],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240, line: 480 },
          })
        );
        if (items.length === 0) {
          tocChildren.push(
            new Paragraph({
              children: [new TextRun({ text: noItemsMsg, italics: true })],
              spacing: { line: 480 },
            })
          );
        } else {
          items.forEach(item => {
            tocChildren.push(
              new Paragraph({
                children: [new TextRun({ text: `${item.number ? item.number + '. ' : ''}${item.title}` })],
                spacing: { line: 480 },
              })
            );
          });
        }
        tocChildren.push(new Paragraph({ children: [new PageBreak()] }));
      }
    };

    renderIndex('table', lang === 'en' ? 'List of Tables' : 'Índice de Tablas', lang === 'en' ? 'No tables found.' : 'No se encontraron tablas.');
    renderIndex('figure', lang === 'en' ? 'List of Figures' : 'Índice de Figuras', lang === 'en' ? 'No figures found.' : 'No se encontraron figuras.');
    
    if (isUpel) {
      renderIndex('cuadro', 'Índice de Cuadros', 'No se encontraron cuadros.');
    }

    tocSection = [
      {
        properties: {
          type: "nextPage" as const,
          page: {
            margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft, header: headerDistance, footer: footerDistance },
            pageNumbers: isUpel ? { formatType: NumberFormat.LOWER_ROMAN } : undefined,
          },
        },
        footers: getFooters(),
        headers: getHeaders(false),
        children: tocChildren,
      },
    ];
  }


  const fontFamily = documentStyle ? documentStyle.typography.fontFamily : "Times New Roman";
  const fontSize = documentStyle ? ptToHalfPt(documentStyle.typography.fontSize) : 24;
  const h1Size = documentStyle ? ptToHalfPt(documentStyle.heading1.size) : 24;
  const h2Size = documentStyle ? ptToHalfPt(documentStyle.heading2.size) : 24;
  const h3Size = documentStyle ? ptToHalfPt(documentStyle.heading3.size) : 24;

  const doc = new Document({
    features: { updateFields: true },
    styles: {
      default: {
        document: {
          run: {
            font: fontFamily,
            size: fontSize,
            color: documentStyle?.typography.fontColor ? documentStyle.typography.fontColor.replace('#', '') : "000000",
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { 
            bold: documentStyle?.heading1.bold ?? true, 
            italics: documentStyle?.heading1.italic ?? false, 
            size: h1Size, 
            color: "000000" 
          },
          paragraph: {
            alignment: documentStyle ? getDocxAlignment(documentStyle.heading1.alignment) : AlignmentType.CENTER,
            spacing: { before: 240, after: 240, line: baseLineSpacing },
            keepNext: true,
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { 
            bold: documentStyle?.heading2.bold ?? true, 
            italics: documentStyle?.heading2.italic ?? false, 
            size: h2Size, 
            color: "000000" 
          },
          paragraph: {
            alignment: documentStyle ? getDocxAlignment(documentStyle.heading2.alignment) : AlignmentType.LEFT,
            spacing: { before: 240, after: 240, line: baseLineSpacing },
            keepNext: true,
          },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { 
            bold: documentStyle?.heading3.bold ?? true, 
            italics: documentStyle?.heading3.italic ?? true, 
            size: h3Size, 
            color: "000000" 
          },
          paragraph: {
            alignment: documentStyle ? getDocxAlignment(documentStyle.heading3.alignment) : AlignmentType.LEFT,
            spacing: { before: 240, after: 240, line: baseLineSpacing },
          },
        },
      ],
    },
    sections: [
      ...coverSection,
      ...tocSection,
      {
        properties: {
          titlePage: (!coverPage?.enabled && !startNumberingOnCover) ? true : undefined,
          page: {
            margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft, header: headerDistance, footer: footerDistance },
            pageNumbers: isUpel 
              ? { start: 1, formatType: NumberFormat.DECIMAL } 
              : (!coverPage?.enabled ? { start: 1, formatType: NumberFormat.DECIMAL } : undefined),
          },
        },
        footers: (!coverPage?.enabled || isUpel) ? getFooters() : undefined,
        headers: (!coverPage?.enabled || isUpel) ? getHeaders(!startNumberingOnCover) : undefined,
        children: [...paragraphs],
      },
      {
        properties: {
          type: "nextPage",
          page: {
            margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft, header: headerDistance, footer: footerDistance },
          },
        },
        footers: undefined,
        headers: undefined,
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: formatter.sectionHeading(lang), bold: true }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),
          ...(sortedRefs.length > 0
            ? sortedRefs.map((ref, i) =>
                buildRichReferenceParagraph(ref, formatter, i + 1, lang),
              )
            : [new Paragraph({ text: tText('noReferences', lang) })]),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = suggestedName.endsWith(".docx")
    ? suggestedName
    : `${suggestedName}.docx`;

  if (typeof window !== "undefined" && "showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "Documento de Word (.docx)",
            accept: {
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("El usuario canceló la exportación.");
        return;
      }
      console.warn("showSaveFilePicker falló, usando fallback saveAs:", err);
    }
  }

  saveAs(blob, filename);
};
