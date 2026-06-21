import type { IRule, IRuleResult, IDocumentData } from '@/core/ComplianceEngine/types';

export const FigureHasNoteRule: IRule = {
  id: 'apa7-figure-note',
  name: 'Figure APA Note',
  description: 'Adapted or reproduced figures must contain an attribution note.',
  weight: 5,
  evaluate: (data: IDocumentData): IRuleResult => {
    if (!data.figures || data.figures.length === 0) {
      return {
        id: 'apa7-figure-note',
        name: 'Figure APA Note',
        description: 'Adapted or reproduced figures must contain an attribution note.',
        status: 'not-applicable',
        weight: 5,
      };
    }

    const figuresWithoutNote = data.figures.filter(f => !f.note && !f.copyrightAttribution);

    if (figuresWithoutNote.length > 0) {
      const msgs = figuresWithoutNote.map(f => `La Figura ${f.number || '?'} no contiene nota ni atribución de derechos de autor.`);
      return {
        id: 'apa7-figure-note',
        name: 'Figure APA Note',
        description: 'Adapted or reproduced figures must contain an attribution note.',
        status: 'warning',
        message: msgs.join(' '),
        weight: 5,
      };
    }

    return {
      id: 'apa7-figure-note',
      name: 'Figure APA Note',
      description: 'Adapted or reproduced figures must contain an attribution note.',
      status: 'compliant',
      weight: 5,
    };
  }
};
