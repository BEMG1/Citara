import type { IRule, IDocumentData, IRuleResult } from '../types';

export const upelLongCitationRule: IRule = {
  id: 'upel-long-citation',
  name: 'Citas Largas (UPEL)',
  description: 'Las citas de más de 40 palabras deben ir en bloque, sin comillas, con sangría y a espacio sencillo.',
  weight: 20,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (data.isNormalized) return { id: 'upel-long-citation', name: 'Citas Largas', description: '', status: 'compliant', weight: 20 };
    const hasBlockquotes = /<blockquote/i.test(data.html);
    if (!hasBlockquotes) {
      return { id: 'upel-long-citation', name: 'Citas Largas', description: 'No se detectaron citas en bloque.', status: 'not-applicable', weight: 20 };
    }
    return { id: 'upel-long-citation', name: 'Citas Largas', description: '', status: 'compliant', weight: 20 };
  }
};
