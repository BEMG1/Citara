import type { DocumentAST, BlockNode, InlineNode, TextRunNode, ParagraphNode, HeadingNode, ListNode, ListItemNode, ImageNode, Alignment, TextFormat, CitationNode } from "./DocumentAST";

export class HtmlParser {
  static parse(html: string): DocumentAST {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const blocks: BlockNode[] = [];

    Array.from(doc.body.children).forEach(child => {
      const parsedBlocks = this.parseBlock(child);
      if (parsedBlocks) {
        if (Array.isArray(parsedBlocks)) {
          blocks.push(...parsedBlocks);
        } else {
          blocks.push(parsedBlocks);
        }
      }
    });

    return {
      type: 'document',
      children: blocks
    };
  }

  private static getAlignment(el: Element): Alignment | undefined {
    const htmlEl = el as HTMLElement;
    if (htmlEl.style.textAlign === 'center') return 'center';
    if (htmlEl.style.textAlign === 'right') return 'right';
    if (htmlEl.style.textAlign === 'left') return 'left';
    if (htmlEl.style.textAlign === 'justify') return 'justify';
    return undefined;
  }

  private static parseInlineNode(node: Node): InlineNode[] {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent?.trim() && node.textContent !== ' ') return [];
      return [{
        type: 'text',
        text: node.textContent || '',
        format: {}
      }];
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const childrenNodes = Array.from(node.childNodes).flatMap(child => this.parseInlineNode(child));
      
      if (el.tagName === "A" && el.hasAttribute("href")) {
        return [{
          type: 'hyperlink',
          url: el.getAttribute("href") || "",
          children: childrenNodes.filter(n => n.type === 'text') as TextRunNode[]
        }];
      }

      // Format applications
      let updatedRuns = childrenNodes;
      
      const applyFormat = (formatKey: keyof TextFormat, value: any) => {
        updatedRuns = updatedRuns.map(run => {
          if (run.type === 'text') {
            return {
              ...run,
              format: { ...(run as TextRunNode).format, [formatKey]: value }
            } as TextRunNode;
          }
          return run;
        });
      };

      if (el.tagName === "MARK" && el.hasAttribute("data-reference-id")) {
        return [{
          type: 'citation',
          refId: el.getAttribute("data-reference-id") || "",
          text: el.textContent || ""
        } as CitationNode];
      }

      if (el.tagName === "STRONG" || el.tagName === "B") applyFormat('bold', true);
      if (el.tagName === "EM" || el.tagName === "I") applyFormat('italic', true);
      if (el.tagName === "U") applyFormat('underline', true);
      if (el.tagName === "MARK" && !el.hasAttribute("data-reference-id")) applyFormat('highlight', 'yellow');

      return updatedRuns;
    }
    
    return [];
  }

  private static parseBlock(element: Element): BlockNode | BlockNode[] | null {
    const tagName = element.tagName.toUpperCase();
    const childrenNodes = Array.from(element.childNodes).flatMap(child => this.parseInlineNode(child));
    const alignment = this.getAlignment(element);

    if (tagName === "H1" || tagName === "H2" || tagName === "H3") {
      const level = parseInt(tagName.charAt(1)) as 1 | 2 | 3;
      return {
        type: 'heading',
        level,
        children: childrenNodes,
        format: { alignment }
      } as HeadingNode;
    }

    if (tagName === "P") {
      const hasNoIndent = element.classList.contains("no-indent") || element.getAttribute("data-indent") === "false";
      return {
        type: 'paragraph',
        children: childrenNodes,
        format: { 
          alignment,
          ...(hasNoIndent ? { indent: 0 } : {})
        }
      } as ParagraphNode;
    }

    if (tagName === "UL" || tagName === "OL") {
      const listItems = Array.from(element.children).filter(child => child.tagName === "LI");
      const items: ListItemNode[] = listItems.map(li => {
        const liBlocks: BlockNode[] = [];
        // A list item might have block children or just text.
        // We'll wrap its inline contents in a paragraph for the AST.
        const liInline = Array.from(li.childNodes).flatMap(child => this.parseInlineNode(child));
        liBlocks.push({
          type: 'paragraph',
          children: liInline
        });
        return {
          type: 'list-item',
          children: liBlocks
        };
      });

      return {
        type: 'list',
        ordered: tagName === "OL",
        level: 0, // Nested list handling can be improved
        children: items
      } as ListNode;
    }

    if (tagName === "FIGURE" || element.getAttribute("data-type") === "figure") {
      return {
        type: 'image',
        src: element.getAttribute("imageurl") || element.getAttribute("imageUrl") || "",
        caption: element.getAttribute("caption") || undefined,
        alignment: alignment
      } as ImageNode;
    }
    
    // Fallback: treat as paragraph if it has content
    if (childrenNodes.length > 0) {
      const hasNoIndent = element.classList?.contains("no-indent") || element.getAttribute?.("data-indent") === "false";
      return {
        type: 'paragraph',
        children: childrenNodes,
        format: { 
          alignment,
          ...(hasNoIndent ? { indent: 0 } : {})
        }
      } as ParagraphNode;
    }

    return null;
  }
}
