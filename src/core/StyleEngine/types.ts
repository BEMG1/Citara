export interface PageStyle {
  paperSize: string;
  orientation: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  headerDistance: number;
  footerDistance: number;
  pageNumberEnabled: boolean;
  pageNumberPosition: string;
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
}

export interface ParagraphStyle {
  textAlignment: string;
  lineSpacing: number;
  paragraphBefore: number;
  paragraphAfter: number;
  firstLineIndent: number;
  leftIndent: number;
  rightIndent: number;
  hangingIndent: number;
}

export interface HeaderStyle {
  size: number;
  bold: boolean;
  italic: boolean;
  alignment: string;
}

export interface ReferencesStyle {
  referenceSpacing: number;
}

export interface ResolvedDocumentStyle {
  page: PageStyle;
  typography: TypographyStyle;
  paragraph: ParagraphStyle;
  heading1: HeaderStyle;
  heading2: HeaderStyle;
  heading3: HeaderStyle;
  references: ReferencesStyle;
}

export interface IStyleResolver {
  resolve(): ResolvedDocumentStyle;
}
