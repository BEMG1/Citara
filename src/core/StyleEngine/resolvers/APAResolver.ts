import type { IStyleResolver, ResolvedDocumentStyle } from '../types';

export class APAResolver implements IStyleResolver {
  resolve(): ResolvedDocumentStyle {
    return {
      page: {
        paperSize: 'letter',
        orientation: 'portrait',
        marginTop: 2.54,
        marginBottom: 2.54,
        marginLeft: 2.54,
        marginRight: 2.54,
        headerDistance: 1.27,
        footerDistance: 1.27,
        pageNumberEnabled: true,
        pageNumberPosition: 'top-right',
      },
      typography: {
        fontFamily: 'Times New Roman',
        fontSize: 12,
        fontColor: '#000000',
      },
      paragraph: {
        textAlignment: 'left',
        lineSpacing: 2,
        paragraphBefore: 0,
        paragraphAfter: 0,
        firstLineIndent: 1.27,
        leftIndent: 0,
        rightIndent: 0,
        hangingIndent: 1.27,
      },
      heading1: {
        size: 12,
        bold: true,
        italic: false,
        alignment: 'center',
      },
      heading2: {
        size: 12,
        bold: true,
        italic: false,
        alignment: 'left',
      },
      heading3: {
        size: 12,
        bold: true,
        italic: true,
        alignment: 'left',
      },
      references: {
        referenceSpacing: 2,
      },
    };
  }
}
