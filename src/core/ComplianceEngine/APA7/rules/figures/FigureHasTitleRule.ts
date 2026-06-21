import type { IRule, IRuleResult, IDocumentData } from '@/core/ComplianceEngine/types';

export const FigureHasTitleRule: IRule = {
  id: 'apa7-figure-title',
  name: 'Figure with Title',
  description: 'Every figure must have a title defined.',
  weight: 5,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (!data.figures || data.figures.length === 0) {
      return {
        id: 'apa7-figure-title',
        name: 'Figure with Title',
        description: 'Every figure must have a title defined.',
        status: 'not-applicable',
        weight: 5,
      };
    }

    const figuresWithoutTitle = data.figures.filter(f => !f.title || f.title.trim() === '');

    if (figuresWithoutTitle.length > 0) {
      const msgs = figuresWithoutTitle.map(f => `La Figura ${f.number || '?'} no tiene un título definido.`);
      return {
        id: 'apa7-figure-title',
        name: 'Figure with Title',
        description: 'Every figure must have a title defined.',
        status: 'non-compliant',
        message: msgs.join(' '),
        weight: 5,
      };
    }

    return {
      id: 'apa7-figure-title',
      name: 'Figure with Title',
      description: 'Every figure must have a title defined.',
      status: 'compliant',
      weight: 5,
    };
  }
};
