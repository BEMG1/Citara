import type { IRule, IRuleResult, IDocumentData } from '@/core/ComplianceEngine/types';

export const FigureAttributionHasReferenceRule: IRule = {
  id: 'apa7-figure-attribution-ref',
  name: 'Figure Attribution Reference',
  description: 'All APA attributions must have a corresponding bibliographic reference.',
  weight: 10,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (!data.figures || data.figures.length === 0) {
      return {
        id: 'apa7-figure-attribution-ref',
        name: 'Figure Attribution Reference',
        description: 'All APA attributions must have a corresponding bibliographic reference.',
        status: 'not-applicable',
        weight: 10,
      };
    }

    const figuresWithAttribution = data.figures.filter(f => f.copyrightAttribution);
    if (figuresWithAttribution.length === 0) {
      return {
        id: 'apa7-figure-attribution-ref',
        name: 'Figure Attribution Reference',
        description: 'All APA attributions must have a corresponding bibliographic reference.',
        status: 'not-applicable',
        weight: 10,
      };
    }

    const refs = data.references || [];
    const missingRefs = figuresWithAttribution.filter(f => {
      const author = f.copyrightAttribution!.author.toLowerCase();
      // Simple heuristic: check if any reference has the same author or title
      return !refs.some(r => r.author.toLowerCase().includes(author));
    });

    if (missingRefs.length > 0) {
      const msgs = missingRefs.map(f => `La Figura ${f.number || '?'} tiene una atribución pero no existe una referencia bibliográfica que coincida con el autor "${f.copyrightAttribution!.author}".`);
      return {
        id: 'apa7-figure-attribution-ref',
        name: 'Figure Attribution Reference',
        description: 'All APA attributions must have a corresponding bibliographic reference.',
        status: 'non-compliant',
        message: msgs.join(' '),
        weight: 10,
      };
    }

    return {
      id: 'apa7-figure-attribution-ref',
      name: 'Figure Attribution Reference',
      description: 'All APA attributions must have a corresponding bibliographic reference.',
      status: 'compliant',
      weight: 10,
    };
  }
};
