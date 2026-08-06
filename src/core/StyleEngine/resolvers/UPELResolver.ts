import type { IStyleResolver, ResolvedDocumentStyle } from '../types';

export class UPELResolver implements IStyleResolver {
  resolve(): ResolvedDocumentStyle {
    return {
      page: {
        paperSize: 'letter',
        orientation: 'portrait',
        marginTop: 3,
        marginBottom: 3,
        marginLeft: 4,
        marginRight: 3,
        headerDistance: 1.5,
        footerDistance: 1.5,
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
        lineSpacing: 1.5,
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
        italic: true,
        alignment: 'left',
      },
      heading3: {
        size: 12,
        bold: false,
        italic: true,
        alignment: 'left',
      },
      references: {
        referenceSpacing: 1.5,
      },
    };
  }
}
