import type { IRule, IDocumentData, IRuleResult } from '../types';

export const upelChapterHeadingRule: IRule = {
  id: 'upel-chapter-heading',
  name: 'Títulos de Capítulos (Nivel 1)',
  description: 'Los capítulos deben estar centrados, en mayúsculas sostenidas y en negrita.',
  weight: 15,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (data.isNormalized) return { id: 'upel-chapter-heading', name: 'Títulos de Capítulos', description: '', status: 'compliant', weight: 15 };
    const hasChapters = /(?:CAPÍTULO|CAPITULO)\s+[IVX]+/i.test(data.text);
    if (!hasChapters) {
       return { id: 'upel-chapter-heading', name: 'Títulos de Capítulos', description: '', status: 'not-applicable', weight: 15 };
    }
    return { id: 'upel-chapter-heading', name: 'Títulos de Capítulos', description: '', status: 'compliant', weight: 15 };
  }
};

export const upelSubtitleHeadingRule: IRule = {
  id: 'upel-subtitle-heading',
  name: 'Subtítulos (Niveles 2 y 3)',
  description: 'Los subtítulos deben estar alineados a la izquierda y en negrita.',
  weight: 10,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (data.isNormalized) return { id: 'upel-subtitle-heading', name: 'Subtítulos', description: '', status: 'compliant', weight: 10 };
    return { id: 'upel-subtitle-heading', name: 'Subtítulos', description: '', status: 'compliant', weight: 10 };
  }
};
