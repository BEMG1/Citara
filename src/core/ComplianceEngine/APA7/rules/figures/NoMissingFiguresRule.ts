import type { IRule, IRuleResult, IDocumentData } from '@/core/ComplianceEngine/types';

export const NoMissingFiguresRule: IRule = {
  id: 'apa7-no-missing-figures',
  name: 'No Missing Figures',
  description: 'Verifies that all figures mentioned in the text actually exist in the document.',
  weight: 10,
  evaluate: (data: IDocumentData): IRuleResult => {
    // Regex to find "Figura X" or "figura X"
    const figureRegex = /figura\s+(\d+)/gi;
    const matches = [...data.text.matchAll(figureRegex)];
    
    if (matches.length === 0) {
      return {
        id: 'apa7-no-missing-figures',
        name: 'No Missing Figures',
        description: 'Verifies that all figures mentioned in the text actually exist in the document.',
        status: 'not-applicable',
        weight: 10,
      };
    }

    const mentionedNumbers = new Set(matches.map(m => parseInt(m[1], 10)));
    const existingNumbers = new Set((data.figures || []).map(f => f.number));

    const missingFigures = Array.from(mentionedNumbers).filter(num => !existingNumbers.has(num));

    if (missingFigures.length > 0) {
      const msgs = missingFigures.map(num => `El texto menciona la Figura ${num}, pero no se encuentra en el documento.`);
      return {
        id: 'apa7-no-missing-figures',
        name: 'No Missing Figures',
        description: 'Verifies that all figures mentioned in the text actually exist in the document.',
        status: 'non-compliant',
        message: msgs.join(' '),
        weight: 10,
      };
    }

    return {
      id: 'apa7-no-missing-figures',
      name: 'No Missing Figures',
      description: 'Verifies that all figures mentioned in the text actually exist in the document.',
      status: 'compliant',
      weight: 10,
    };
  }
};
