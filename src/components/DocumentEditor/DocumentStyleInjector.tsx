import React from 'react';
import type { ResolvedDocumentStyle } from '@/core/StyleEngine/types';

interface DocumentStyleInjectorProps {
  documentStyle: ResolvedDocumentStyle | null;
}

export const DocumentStyleInjector = React.memo(({ documentStyle }: DocumentStyleInjectorProps) => {
  if (!documentStyle) return null;

  return (
    <style>{`
      div.tiptap.ProseMirror {
        font-family: "${documentStyle.typography.fontFamily}", sans-serif !important;
        font-size: ${documentStyle.typography.fontSize}pt !important;
        line-height: ${documentStyle.paragraph.lineSpacing} !important;
        text-align: ${documentStyle.paragraph.textAlignment} !important;
        padding: ${documentStyle.page.marginTop}cm ${documentStyle.page.marginRight}cm ${documentStyle.page.marginBottom}cm ${documentStyle.page.marginLeft}cm !important;
      }
      div.tiptap.ProseMirror p {
        margin-top: ${documentStyle.paragraph.paragraphBefore}pt !important;
        margin-bottom: ${documentStyle.paragraph.paragraphAfter}pt !important;
        text-indent: ${documentStyle.paragraph.firstLineIndent}cm !important;
        margin-left: ${documentStyle.paragraph.leftIndent}cm !important;
        margin-right: ${documentStyle.paragraph.rightIndent}cm !important;
      }
      div.tiptap.ProseMirror p[data-indent="false"],
      div.tiptap.ProseMirror p.no-indent {
        text-indent: 0 !important;
      }
      div.tiptap.ProseMirror h1 {
        font-size: ${documentStyle.heading1.size}pt !important;
        font-weight: ${documentStyle.heading1.bold ? 'bold' : 'normal'} !important;
        font-style: ${documentStyle.heading1.italic ? 'italic' : 'normal'} !important;
        text-align: ${documentStyle.heading1.alignment} !important;
      }
      div.tiptap.ProseMirror h2 {
        font-size: ${documentStyle.heading2.size}pt !important;
        font-weight: ${documentStyle.heading2.bold ? 'bold' : 'normal'} !important;
        font-style: ${documentStyle.heading2.italic ? 'italic' : 'normal'} !important;
        text-align: ${documentStyle.heading2.alignment} !important;
      }
      div.tiptap.ProseMirror h3 {
        font-size: ${documentStyle.heading3.size}pt !important;
        font-weight: ${documentStyle.heading3.bold ? 'bold' : 'normal'} !important;
        font-style: ${documentStyle.heading3.italic ? 'italic' : 'normal'} !important;
        text-align: ${documentStyle.heading3.alignment} !important;
      }
      div.tiptap.ProseMirror blockquote {
        margin-left: ${documentStyle.paragraph.hangingIndent}cm !important;
      }
    `}</style>
  );
});

DocumentStyleInjector.displayName = 'DocumentStyleInjector';
