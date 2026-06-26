export type Alignment = 'left' | 'center' | 'right' | 'justify';

export interface TextFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  highlight?: string;
  size?: number; // size in pt
  font?: string;
}

export interface TextRunNode {
  type: 'text';
  text: string;
  format?: TextFormat;
}

export interface HyperlinkNode {
  type: 'hyperlink';
  url: string;
  children: TextRunNode[];
}

export interface CitationNode {
  type: 'citation';
  refId: string;
}

export type InlineNode = TextRunNode | HyperlinkNode | CitationNode;

export interface ParagraphFormat {
  alignment?: Alignment;
  indent?: number; // in some standard unit (e.g. twips or inches)
  spacingBefore?: number;
  spacingAfter?: number;
  lineSpacing?: number;
}

export interface ParagraphNode {
  type: 'paragraph';
  children: InlineNode[];
  format?: ParagraphFormat;
}

export interface HeadingNode {
  type: 'heading';
  level: 1 | 2 | 3;
  children: InlineNode[];
  format?: ParagraphFormat;
}

export interface ImageNode {
  type: 'image';
  src: string; // base64 or URL
  width?: number;
  height?: number;
  caption?: string;
  alignment?: Alignment;
}

export interface TableCellNode {
  type: 'table-cell';
  children: BlockNode[];
}

export interface TableRowNode {
  type: 'table-row';
  children: TableCellNode[];
}

export interface TableNode {
  type: 'table';
  children: TableRowNode[];
  width?: number; // optional table width
}

export interface ListItemNode {
  type: 'list-item';
  children: BlockNode[]; // A list item can contain paragraphs, etc.
}

export interface ListNode {
  type: 'list';
  ordered: boolean;
  level: number;
  children: ListItemNode[];
}

export interface PageBreakNode {
  type: 'page-break';
}

export type BlockNode = 
  | ParagraphNode 
  | HeadingNode 
  | ImageNode 
  | TableNode 
  | ListNode 
  | PageBreakNode;

export interface DocumentAST {
  type: 'document';
  children: BlockNode[];
  // Potential document-level metadata
  metadata?: {
    title?: string;
    author?: string;
  };
}
