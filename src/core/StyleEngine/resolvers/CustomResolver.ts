import type { IStyleResolver, ResolvedDocumentStyle } from '../types';
import type { CustomCitationFormat } from '@/services/supabase/customFormats';

export class CustomResolver implements IStyleResolver {
  private customFormat: CustomCitationFormat;

  constructor(customFormat: CustomCitationFormat) {
    this.customFormat = customFormat;
  }

  resolve(): ResolvedDocumentStyle {
    const f = this.customFormat;
    return {
      page: {
        paperSize: f.paper_size,
        orientation: f.orientation,
        marginTop: f.margin_top,
        marginBottom: f.margin_bottom,
        marginLeft: f.margin_left,
        marginRight: f.margin_right,
        headerDistance: f.header_distance,
        footerDistance: f.footer_distance,
        pageNumberEnabled: f.page_number_enabled,
        pageNumberPosition: f.page_number_position,
      },
      typography: {
        fontFamily: f.font_family,
        fontSize: f.font_size,
        fontColor: f.font_color,
      },
      paragraph: {
        textAlignment: f.text_alignment,
        lineSpacing: f.line_spacing,
        paragraphBefore: f.paragraph_before,
        paragraphAfter: f.paragraph_after,
        firstLineIndent: f.first_line_indent,
        leftIndent: f.left_indent,
        rightIndent: f.right_indent,
        hangingIndent: f.hanging_indent,
      },
      heading1: {
        size: f.heading1_size,
        bold: f.heading1_bold,
        italic: f.heading1_italic,
        alignment: f.heading1_alignment,
      },
      heading2: {
        size: f.heading2_size,
        bold: f.heading2_bold,
        italic: f.heading2_italic,
        alignment: f.heading2_alignment,
      },
      heading3: {
        size: f.heading3_size,
        bold: f.heading3_bold,
        italic: f.heading3_italic,
        alignment: f.heading3_alignment,
      },
      references: {
        referenceSpacing: f.reference_spacing,
      },
    };
  }
}
