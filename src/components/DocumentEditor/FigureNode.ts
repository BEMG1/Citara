import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FigureComponent } from './FigureComponent';

export const FigureNode = Node.create({
  name: 'figure',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
      number: { default: null },
      imageUrl: { default: null },
      title: { default: null },
      caption: { default: null },
      note: { default: null },
      referenceId: { default: null },
      attributionType: { default: null },
      attributionTitle: { default: null },
      attributionAuthor: { default: null },
      attributionYear: { default: null },
      attributionPublisher: { default: null },
      attributionJournal: { default: null },
      attributionVolume: { default: null },
      attributionIssue: { default: null },
      attributionPages: { default: null },
      attributionDoi: { default: null },
      attributionUrl: { default: null },
      attributionSiteName: { default: null },
      attributionChannel: { default: null },
      attributionLicense: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="figure"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { 'data-type': 'figure' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureComponent);
  },
});
