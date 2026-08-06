import type { ResolvedDocumentStyle } from './types';
import { APAResolver } from './resolvers/APAResolver';
import { IEEEResolver } from './resolvers/IEEEResolver';
import { UPELResolver } from './resolvers/UPELResolver';
import { CustomResolver } from './resolvers/CustomResolver';
import type { CustomCitationFormat } from '@/services/supabase/customFormats';

export type FormatInput = 'apa7' | 'apa6' | 'ieee' | 'upel' | CustomCitationFormat;

export class StyleEngine {
  static resolve(formatInput: FormatInput): ResolvedDocumentStyle {
    if (typeof formatInput === 'string') {
      switch (formatInput) {
        case 'apa7':
        case 'apa6':
          return new APAResolver().resolve();
        case 'ieee':
          return new IEEEResolver().resolve();
        case 'upel':
          return new UPELResolver().resolve();
        default:
          return new APAResolver().resolve();
      }
    } else {
      return new CustomResolver(formatInput).resolve();
    }
  }
}
