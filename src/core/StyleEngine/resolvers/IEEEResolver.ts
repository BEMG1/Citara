import type { IStyleResolver, ResolvedDocumentStyle } from '../types';

export class IEEEResolver implements IStyleResolver {
  resolve(): ResolvedDocumentStyle {
    return {
      page: {
        paperSize: 'letter',
        orientation: 'portrait',
        marginTop: 1.9,
        marginBottom: 2.54,
        marginLeft: 1.9,
        marginRight: 1.9,
        headerDistance: 1.27,
        footerDistance: 1.27,
        pageNumberEnabled: true,
        pageNumberPosition: 'bottom-center',
      },
      typography: {
        fontFamily: 'Times New Roman',
        fontSize: 10,
        fontColor: '#000000',
      },
      paragraph: {
        textAlignment: 'justify',
        lineSpacing: 1,
        paragraphBefore: 0,
        paragraphAfter: 0,
        firstLineIndent: 0.42,
        leftIndent: 0,
        rightIndent: 0,
        hangingIndent: 0.42,
      },
      heading1: {
        size: 24,
        bold: false,
        italic: false,
        alignment: 'center',
      },
      heading2: {
        size: 10,
        bold: false,
        italic: true,
        alignment: 'left',
      },
      heading3: {
        size: 10,
        bold: false,
        italic: true,
        alignment: 'left',
      },
      references: {
        referenceSpacing: 1,
      },
    };
  }
}
