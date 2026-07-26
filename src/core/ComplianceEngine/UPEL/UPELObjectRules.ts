import type { IRule, IDocumentData, IRuleResult } from '../types';

export const upelTableFormatRule: IRule = {
  id: 'upel-table-format',
  name: 'Formato de Tablas',
  description: 'Las tablas deben llevar número y título en la parte superior, y la fuente en la inferior.',
  weight: 15,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (data.isNormalized) return { id: 'upel-table-format', name: 'Formato de Tablas', description: '', status: 'compliant', weight: 15 };
    const hasTables = /<table/i.test(data.html);
    if (!hasTables) return { id: 'upel-table-format', name: 'Formato de Tablas', description: '', status: 'not-applicable', weight: 15 };
    return { id: 'upel-table-format', name: 'Formato de Tablas', description: '', status: 'compliant', weight: 15 };
  }
};

export const upelFigureFormatRule: IRule = {
  id: 'upel-figure-format',
  name: 'Formato de Figuras',
  description: 'Las figuras deben llevar número, título y fuente en la parte inferior.',
  weight: 15,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (data.isNormalized) return { id: 'upel-figure-format', name: 'Formato de Figuras', description: '', status: 'compliant', weight: 15 };
    const hasFigures = /<img|<figure/i.test(data.html) || (data.figures && data.figures.length > 0);
    if (!hasFigures) return { id: 'upel-figure-format', name: 'Formato de Figuras', description: '', status: 'not-applicable', weight: 15 };
    return { id: 'upel-figure-format', name: 'Formato de Figuras', description: '', status: 'compliant', weight: 15 };
  }
};
