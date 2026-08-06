import { type CitationFormat, type ICitationFormatter } from '@/utils/citationFormats';
import type { CustomCitationFormat } from '@/services/supabase/customFormats';
import type { ResolvedDocumentStyle } from '@/core/StyleEngine/types';

export interface ICitationFormat {
  /** Currently active format id (e.g. 'apa7') */
  citationFormat: CitationFormat;
  /** Changes the active format and persists it to localStorage */
  setCitationFormat: (format: CitationFormat, customId?: string, customConfig?: CustomCitationFormat) => void;
  /** The formatter implementation for the active format */
  formatter: ICitationFormatter;
  /** The ID of the active custom format, if any */
  customFormatId?: string;
  /** The complete configuration object for the active custom format, if any */
  customFormatConfig?: CustomCitationFormat | null;
  /** The fully resolved stylistic configuration for the active format */
  documentStyle: ResolvedDocumentStyle;
}
